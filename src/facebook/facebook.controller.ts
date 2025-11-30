import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) { }

  @Get('pages')
async getPages(@Query('userToken') userToken: string) { 
  return this.facebookService.getPages(userToken);
}





  // @Post('stories')
  // async getStories(@Body() body: { page_token: string; pageId: string }) {
  //   const pageToken = await this.facebookService.getPageAccessToken(body.page_token, body.pageId);
  //   return this.facebookService.getStories(pageToken, body.pageId);
  // }


}
