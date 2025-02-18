import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './create-news.dto';
import { AuthGuard } from '@nestjs/passport';
import { News } from './news.model';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Tylko metoda POST z ochroną
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createNewsDto: CreateNewsDto, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.create(createNewsDto, tenant_id); 
  }


  @Get()
  async findAll(@Headers('tenant-id') tenant_id: string): Promise<News[]> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.findByTenant(tenant_id);  
  }

 
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: string, @Body('content') content: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.updateNews(id, content, tenant_id); 
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.deleteNews(id, tenant_id); 
  }


  @UseGuards(AuthGuard('jwt'))
  @Put(':id/move-up')
  async moveUp(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.moveUp(id, tenant_id); 
  }

 
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/move-down')
  async moveDown(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.newsService.moveDown(id, tenant_id); 
  }
}
