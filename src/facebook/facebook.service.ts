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

@Injectable()
export class FacebookService {
  private GRAPH_URL = 'https://graph.facebook.com/v24.0';

  // --- ZMIENNE KONFIGURACYJNE (PAMIĘTAJ O ZASTĄPIENIU LUB UŻYCIU ConfigService) ---
  private readonly APP_ID =process.env.FB_APP_ID
  private readonly APP_SECRET = process.env.FB_APP_SECRET
  // ---------------------------------------------------------------------------------

  constructor(private readonly httpService: HttpService) {}

  // -------------------------------------------------------------------------
  // 0. METODA WYMIANY TOKENU (NOWA)
  // -------------------------------------------------------------------------
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

      if (!response.data.access_token) {
        throw new Error('Brak access_token w odpowiedzi.');
      }
      return response.data.access_token;
    } catch (error) {
      console.error(
        '❌ Błąd wymiany tokenu Facebooka:',
        error.response?.data?.error?.message || error.message,
      );
      throw new UnauthorizedException(
        'Nie udało się wymienić tokenu użytkownika na długotrwały.',
      );
    }
  }

  // -------------------------------------------------------------------------
  // 1. POBIERANIE STRON (KORZYSTA Z DŁUGOTRWAŁEGO TOKENU UŻYTKOWNIKA)
  // -------------------------------------------------------------------------
  async getPages(userToken: string): Promise<Page[]> {
    const url = `${this.GRAPH_URL}/me/accounts`;
    try {
      return await lastValueFrom(
        this.httpService
          .get(url, {
            params: {
              access_token: userToken,
              fields: 'id,name,access_token,category,link',
            },
          })
          .pipe(
            map((res) => {
              const pagesArray: any[] = res.data.data || [];
              if (!Array.isArray(pagesArray) || pagesArray.length === 0)
                return [];
              return pagesArray.map((page: any) => ({
                id: page.id,
                name: page.name,
                // Ten token jest DŁUGOTRWAŁY, jeśli userToken był DŁUGOTRWAŁY.
                page_token: page.access_token,
                category: page.category,
                link: page.link,
              })) as Page[];
            }),
            catchError(() => {
              throw new HttpException(
                'Błąd pobierania kont FB. Sprawdź, czy używasz długotrwałego tokenu.',
                HttpStatus.UNAUTHORIZED,
              );
            }),
          ),
      );
    } catch (error) {
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // 2. METODA POMOCNICZA: POBIERANIE STORIES Z FACEBOOKA (TYLKO WIDEO)
  // -------------------------------------------------------------------------
  private async getFacebookStories(
    pageId: string,
    pageToken: string,
  ): Promise<Story[]> {
    const token = pageToken;
    try {
      const storiesRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${pageId}/stories`, {
          params: {
            access_token: token,
            status: 'PUBLISHED',
            fields: 'id,media_id,media_type',
          },
        }),
      );

      const stories = storiesRes.data.data;
      if (!stories || stories.length === 0) return [];

      const videoStories = stories.filter(
        (s) => s.media_type === 'video' && s.media_id,
      );

      const mediaPromises = videoStories.map(async (story) => {
        try {
          const mediaRes = await lastValueFrom(
            this.httpService.get(`${this.GRAPH_URL}/${story.media_id}`, {
              params: {
                fields: 'source',
                access_token: token,
              },
            }),
          );

          const media = mediaRes.data;

          if (media.source) {
            return {
              mediaType: 'video',
              mediaUrl: media.source,
              source: 'facebook',
            } as Story;
          }
        } catch (error) {
          console.error(
            `❌ Błąd FB media (video) dla ${story.media_id}:`,
            error.response?.data?.error?.message || error.message,
          );
        }
        return null;
      });

      const processed = await Promise.all(mediaPromises);
      return processed.filter((s): s is Story => s !== null);
    } catch (error) {
      console.error(
        '❌ FB Error getFacebookStories (główne zapytanie):',
        error.response?.data?.error?.message || error.message,
      );
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // 3. METODA POMOCNICZA: POBIERANIE STORIES Z INSTAGRAMA (ZDJĘCIA + WIDEO)
  // -------------------------------------------------------------------------
  private async getInstagramStories(
    pageId: string,
    pageToken: string,
  ): Promise<Story[]> {
    const token = pageToken;
    try {
      // Krok 1: Znajdź ID konta Instagram Business powiązanego ze stroną FB
      const igRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${pageId}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: token,
          },
        }),
      );

      const igAccountId = igRes.data.instagram_business_account?.id;
      if (!igAccountId) return [];

      // Krok 2: Pobierz Story z konta Instagram Business
      const storiesRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${igAccountId}/stories`, {
          params: {
            fields: 'id,media_type,media_url,thumbnail_url',
            access_token: token,
          },
        }),
      );

      return (storiesRes.data.data || [])
        .map((story) => {
          if (!story.media_url) return null;

          const mediaType = story.media_type === 'VIDEO' ? 'video' : 'photo';

          return {
            mediaType: mediaType,
            mediaUrl: story.media_url,
            source: 'instagram',
          } as Story;
        })
        .filter((s): s is Story => s !== null);
    } catch (error) {
      console.error(
        '❌ IG Error getInstagramStories:',
        error.response?.data?.error?.message || error.message,
      );
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // 4. METODA GŁÓWNA: ŁĄCZENIE FB + IG
  // -------------------------------------------------------------------------
  async getStories(pageToken: string, pageId: string): Promise<Story[]> {
    if (!pageToken || !pageId) {
      throw new UnauthorizedException('Brak Page Token lub ID strony.');
    }

    try {
      const [fbStories, igStories] = await Promise.all([
        this.getFacebookStories(pageId, pageToken),
        this.getInstagramStories(pageId, pageToken),
      ]);

      const allStories = [...fbStories, ...igStories];

      console.log(
        `✅ Pobrano: ${fbStories.length} z FB, ${igStories.length} z IG. Razem: ${allStories.length}`,
      );

      return allStories;
    } catch (e) {
      throw new InternalServerErrorException('Błąd łączenia Stories.');
    }
  }

  // -------------------------------------------------------------------------
  // 5. METODA POBIERANIA LOSOWEGO STORIES
  // -------------------------------------------------------------------------
  async getRandomStory(pageToken: string, pageId: string): Promise<Story | null> {
    const allStories = await this.getStories(pageToken, pageId);
    if (!allStories || allStories.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allStories.length);
    return allStories[randomIndex];
  }
}