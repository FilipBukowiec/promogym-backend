import { Body, Controller, Post } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
      constructor(private readonly facebookService: FacebookService) {}

  @Post('stories')
  async getStories(@Body() body: { userToken: string; pageId: string }) {
    const pageToken = await this.facebookService.getPageAccessToken(body.userToken, body.pageId);
    return this.facebookService.getStories(pageToken, body.pageId);
  }
}
