// news.controller.ts
import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { userInfo } from 'node:os';
import { CreateNewsDto } from './create-news.dto';
import { News } from './news.schema';


@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

@UseGuards(JwtAuthGuard)  
@Get()
getAllNews(){
  console.log("getAllNews method was called");
    return this.newsService.getAllNews();
}

@UseGuards(JwtAuthGuard)
@Post()
  async create(@Body() createNewsDto: CreateNewsDto): Promise<News> {
    const { content, order } = createNewsDto;
    try {
      const newNews = await this.newsService.createNews(content, order);
      return newNews;
    } catch (error) {
      throw new HttpException('Unable to create news', HttpStatus.BAD_REQUEST);
    }
  }

}
