import { Body, Controller, Post } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('pages')
  async getPages(@Body() body: { userToken: string }) {
    if (!body.userToken) {
      console.log('Brak tokenu użytkownika!');
      return [];
    }

    console.log('Odebrano krótki UserToken. Rozpoczynam wymianę...');
    const longLivedUserToken = await this.facebookService.exchangeToken(body.userToken);

    console.log('✅ Token wymieniony. Pobieram strony...');
    return this.facebookService.getPages(longLivedUserToken);
  }

  @Post('stories')
  async getStories(@Body() body: { pageToken: string; pageId: string; includeShared?: boolean }) {
    console.log('Odebrano pageId:', body.pageId);
    
    // Pobieramy wartość z body, jeśli jej nie ma (np. stary frontend) - domyślnie true
    const includeShared = body.includeShared !== false; 

    console.log(`Pobieram stories (includeShared: ${includeShared})`);
    
    return this.facebookService.getStories(
      body.pageToken, 
      body.pageId, 
      includeShared // Przekazujemy 3 argument do serwisu
    );
  }

  @Post('stories/random')
  async getRandomStory(@Body() body: { pageToken: string; pageId: string; includeShared?: boolean }) {
    console.log('Odebrano pageId dla losowej Story:', body.pageId);

    // Podobnie jak wyżej, obsługujemy opcjonalny parametr
    const includeShared = body.includeShared !== false;

    return this.facebookService.getRandomStory(
      body.pageToken, 
      body.pageId, 
      includeShared // Przekazujemy 3 argument do serwisu
    );
  }
}