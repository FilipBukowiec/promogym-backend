import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('pages')
  async getPages(@Body() body: { userToken: string }) {
    console.log(
      'Odebrano UserToken:',
      body.userToken ? 'Jest token' : 'Brak tokenu!',
    );
    return this.facebookService.getPages(body.userToken);
  }

  @Post('stories')
  async getStories(@Body() body: { pageToken: string; pageId: string }) {
    console.log('Odebrano pageId:', body.pageId);
    console.log(
      'Odebrano pageToken:',
      body.pageToken ? 'Jest token' : 'Brak tokenu!',
    );
    return this.facebookService.getStories(body.pageToken, body.pageId);
  }
}
