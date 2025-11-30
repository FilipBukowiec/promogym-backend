import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Page } from './page.model';

@Injectable()
export class FacebookService {
  private GRAPH_URL = 'https://graph.facebook.com/v24.0';

  constructor(private readonly httpService: HttpService) {}





  async getPages(userToken: string): Promise<Page[]> {
    const url = `${this.GRAPH_URL}/me/accounts`;
    try {
      return await lastValueFrom(
        this.httpService.get(url, { params: { access_token: userToken } }).pipe(
          map((res) => {
            const pagesArray: any[] = res.data.data || [];
            if (!Array.isArray(pagesArray) || pagesArray.length === 0)
              return [];
            return pagesArray.map((page: any) => ({
              id: page.id,
              name: page.name,
              page_token: page.access_token,
              category: page.category,
            })) as Page[];
          }),
          catchError(() => {
            throw new HttpException(
              'Błąd pobierania kont FB.',
              HttpStatus.UNAUTHORIZED,
            );
          }),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async getStories(pageToken: string, pageId: string) {
    const storiesRes = await lastValueFrom(
      this.httpService.get(
        `https://graph.facebook.com/v24.0/${pageId}/stories`,
        {
          params: { access_token: pageToken, status: 'PUBLISHED' },
        },
      ),
    );
    const stories = storiesRes.data.data;

    const storiesWithMedia = await Promise.all(
      stories.map(async (story) => {
        const mediaRes = await lastValueFrom(
          this.httpService.get(
            `https://graph.facebook.com/v24.0/${story.media_id}`,
            {
              params: { fields: 'source,images', access_token: pageToken },
            },
          ),
        );

        return {
          postId: story.post_id,
          status: story.status,
          mediaType: story.media_type,
          mediaUrl:
            story.media_type === 'video'
              ? mediaRes.data.source
              : mediaRes.data.images[0].source,
          storyUrl: story.url,
        };
      }),
    );

    return storiesWithMedia;
  }
}
