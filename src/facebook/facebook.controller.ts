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
  async getStories(
    @Body() body: { pageToken: string; pageId: string; includeSharedStories?: boolean }
  ) {
    console.log('Odebrano pageId:', body.pageId);
    
    // POPRAWKA: Używamy dokładnej nazwy pola z frontendu (includeSharedStories)
    // oraz bezpiecznego porównania. Tylko jawne 'true' włączy tę opcję.
    const includeShared = body.includeSharedStories === true; 

    console.log(`Pobieram stories (includeShared: ${includeShared})`);
    
    return this.facebookService.getStories(
      body.pageToken, 
      body.pageId, 
      includeShared 
    );
  }

  @Post('stories/random')
  async getRandomStory(
    @Body() body: { pageToken: string; pageId: string; includeSharedStories?: boolean }
  ) {
    console.log('Odebrano pageId dla losowej Story:', body.pageId);

    // POPRAWKA: To samo co wyżej - bezpieczne przypisanie
    const includeShared = body.includeSharedStories === true;

    console.log(`Losuję story (includeShared: ${includeShared})`);

    return this.facebookService.getRandomStory(
      body.pageToken, 
      body.pageId, 
      includeShared 
    );
  }
}