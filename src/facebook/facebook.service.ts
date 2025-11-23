import { HttpService } from '@nestjs/axios';
import { Injectable} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FacebookService {
    constructor(private readonly httpService: HttpService) { }


    async getPageAccessToken(userToken: string, pageId: string) {
        const res = await lastValueFrom(
            this.httpService.get(`https://graph.facebook.com/v24.0/me/accounts`, {
                params: { acces_token: userToken },
            }),
        );
        const page = res.data.data.find((p) => p.id === pageId);
        if (!page) throw new Error('User has no access to this page');
        return page.access_token;
    }

    async getStories(pageToken: string, pageId: string) {
        const storiesRes = await lastValueFrom(
            this.httpService.get(`https://graph.facebook.com/v24.0/${pageId}/stories`, {
                params: { access_token: pageToken, status: 'PUBLISHED' },
            }),
        );
        const stories = storiesRes.data.data;

        const storiesWithMedia = await Promise.all(
            stories.map(async (story) => {
                const mediaRes = await lastValueFrom(
                    this.httpService.get(`https://graph.facebook.com/v24.0/${story.media_id}`, {
                        params: { fields: 'source,images', access_token: pageToken },
                    }),
                );

                return {
                    postId: story.post_id,
                    status: story.status,
                    mediaType: story.media_type,
                    mediaUrl: story.media_type === 'video' ? mediaRes.data.source : mediaRes.data.images[0].source,
                    storyUrl: story.url,
                };
            }),
        );

        return storiesWithMedia;
    }
}