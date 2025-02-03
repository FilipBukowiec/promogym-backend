// src/news/news.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { NewsService } from './news.service';
import { News } from './news.schema';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Tworzenie nowej wiadomości
  @Post()
  async create(@Body() createNewsDto: { order: number; content: string; tenantId: string }): Promise<News> {
    return this.newsService.createNews(createNewsDto.order, createNewsDto.content, createNewsDto.tenantId);
  }

  // Pobieranie wszystkich wiadomości
  @Get()
  async findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  // Pobieranie wiadomości na podstawie tenantId
  @Get('by-tenant/:tenantId')
  async findByTenantId(@Body('tenantId') tenantId: string): Promise<News[]> {
    return this.newsService.findByTenantId(tenantId);
  }
}
