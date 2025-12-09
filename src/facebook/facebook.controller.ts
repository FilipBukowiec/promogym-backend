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

    console.log('Odebrano krótki UserToken. Rozpoczynam wymianę na długotrwały...');

    // 1. WYMIANA TOKENU
    // Zamień krótkotrwały token użytkownika na Długotrwały Token Użytkownika (60 dni)
    const longLivedUserToken = await this.facebookService.exchangeToken(
      body.userToken,
    );

    console.log('✅ Token wymieniony. Pobieram strony...');

    // 2. POBRANIE STRON
    // Użyj Długotrwałego Tokenu Użytkownika do pobrania stron.
    // Zwrócone Tokeny Stron (Page Tokens) również będą długotrwałe.
    return this.facebookService.getPages(longLivedUserToken);
  }

  @Post('stories')
  async getStories(@Body() body: { pageToken: string; pageId: string }) {
    console.log('Odebrano pageId:', body.pageId);
    console.log(
      'Odebrano pageToken:',
      body.pageToken ? 'Jest token' : 'Brak tokenu!',
    );
    // Używasz tutaj Page Token, który jest teraz Długotrwały (z 'getPages').
    return this.facebookService.getStories(body.pageToken, body.pageId);
  }

  @Post('stories/random')
  async getRandomStory(@Body() body: { pageToken: string; pageId: string }) {
    console.log('Odebrano pageId dla losowej Story:', body.pageId);
    // Używasz Page Token, który jest teraz Długotrwały.
    return this.facebookService.getRandomStory(body.pageToken, body.pageId);
  }
}