import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) { }

  @Get('pages')
  async getPages(@Query('userToken') userToken: string) {
    return this.facebookService.getPages(userToken);
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
