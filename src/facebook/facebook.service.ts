import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Page } from './page.model';
import { Story } from './story.model';
import axios from 'axios';
import * as mime from 'mime-types';

@Injectable()
export class FacebookService {
  private GRAPH_URL = 'https://graph.facebook.com/v24.0';

  private readonly APP_ID = process.env.FB_APP_ID;
  private readonly APP_SECRET = process.env.FB_APP_SECRET;

  constructor(private readonly httpService: HttpService) {}

  // 0. WYMIANA TOKENU
  async exchangeToken(shortLivedToken: string): Promise<string> {
    try {
      const url = `${this.GRAPH_URL}/oauth/access_token`;
      const response = await axios.get(url, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.APP_ID,
          client_secret: this.APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      });
      if (!response.data.access_token) throw new Error('Brak access_token.');
      return response.data.access_token;
    } catch (error) {
      throw new UnauthorizedException('Nie udało się wymienić tokenu.');
    }
  }

  // 1. POBIERANIE STRON
  async getPages(userToken: string): Promise<Page[]> {
    const url = `${this.GRAPH_URL}/me/accounts`;
    return await lastValueFrom(
      this.httpService
        .get(url, {
          params: { access_token: userToken, fields: 'id,name,access_token,category,link' },
        })
        .pipe(
          map((res) => {
            const pagesArray = res.data.data || [];
            return pagesArray.map((page: any) => ({
              id: page.id,
              name: page.name,
              page_token: page.access_token,
              link: page.link,
            })) as Page[];
          }),
          catchError(() => {
            throw new HttpException('Błąd pobierania kont FB.', HttpStatus.UNAUTHORIZED);
          }),
        ),
    );
  }

  // 2. POMOCNICZA: FB STORIES
  private async getFacebookStories(
    pageId: string,
    pageToken: string,
    includeShared: boolean = false, // Argument sterujący
  ): Promise<Story[]> {
    try {
      const storiesRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${pageId}/stories`, {
          params: {
            access_token: pageToken,
            status: 'PUBLISHED',
            fields: 'id,media_id,media_type,is_shared_post', // Pobieramy flagę udostępnienia
          },
        }),
      );

      let stories = storiesRes.data.data || [];

      // --- LOGIKA CHECKBOXA ---
      // Jeśli checkbox "includeShared" jest ODZNACZONY (false), filtrujemy
      if (!includeShared) {
        stories = stories.filter((s: any) => s.is_shared_post !== true);
      }

      const storiesToProcess = stories.filter((s) => s.media_id);

      const mediaPromises = storiesToProcess.map(async (story) => {
        const isVideo = story.media_type === 'video';
        const fieldsToFetch = isVideo ? 'source' : 'images';

        try {
          const mediaRes = await lastValueFrom(
            this.httpService.get(`${this.GRAPH_URL}/${story.media_id}`, {
              params: { fields: fieldsToFetch, access_token: pageToken },
            }),
          );

          const media = mediaRes.data;
          let filePath: string | undefined;

          if (isVideo) {
            filePath = media.source;
          } else if (Array.isArray(media.images) && media.images.length > 0) {
            filePath = media.images[0].source;
          }

          if (filePath) {
            return {
              fileType: isVideo ? 'video/mp4' : (mime.lookup(filePath) || 'image/jpeg'),
              filePath: filePath,
              source: 'facebook',
            } as Story;
          }
        } catch (error) {
          console.error(`❌ Błąd media FB (${story.media_id}):`, error.message);
        }
        return null;
      });

      const processed = await Promise.all(mediaPromises);
      return processed.filter((s): s is Story => s !== null);
    } catch (error) {
      console.error('❌ FB Error:', error.message);
      return [];
    }
  }

  // 3. POMOCNICZA: IG STORIES
  private async getInstagramStories(pageId: string, pageToken: string): Promise<Story[]> {
    try {
      const igRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${pageId}`, {
          params: { fields: 'instagram_business_account', access_token: pageToken },
        }),
      );

      const igAccountId = igRes.data.instagram_business_account?.id;
      if (!igAccountId) return [];

      const storiesRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${igAccountId}/stories`, {
          params: { fields: 'id,media_type,media_url', access_token: pageToken },
        }),
      );

      return (storiesRes.data.data || [])
        .map((story) => {
          if (!story.media_url) return null;
          const isVideo = story.media_type === 'VIDEO';
          return {
            fileType: isVideo ? 'video/mp4' : (mime.lookup(story.media_url) || 'image/jpeg'),
            filePath: story.media_url,
            source: 'instagram',
          } as Story;
        })
        .filter((s): s is Story => s !== null);
    } catch (error) {
      console.error('❌ IG Error:', error.message);
      return [];
    }
  }

  // 4. METODA GŁÓWNA
  async getStories(pageToken: string, pageId: string, includeSharedStories: boolean = false): Promise<Story[]> {
    if (!pageToken || !pageId) {
      throw new UnauthorizedException('Brak Page Token lub ID strony.');
    }

    try {
      const [fbStories, igStories] = await Promise.all([
        this.getFacebookStories(pageId, pageToken, includeSharedStories),
        this.getInstagramStories(pageId, pageToken),
      ]);

      return [...fbStories, ...igStories];
    } catch (e) {
      throw new InternalServerErrorException('Błąd łączenia Stories.');
    }
  }

  // 5. LOSOWANIE
  async getRandomStory(pageToken: string, pageId: string, includeSharedStories: boolean = false): Promise<Story | null> {
    const allStories = await this.getStories(pageToken, pageId, includeSharedStories);
    if (!allStories || allStories.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allStories.length);
    return allStories[randomIndex];
  }
}