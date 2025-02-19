import { Controller, Get, Post, Delete, Put, Param, UseGuards, Headers, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('tenant-id') tenant_id: string,
  ) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }

    return this.mediaService.upload({
      tenant_id,
      fileName: file.originalname,
      filePath: `uploads/media/${file.filename}`,
      fileType: file.mimetype,
    });
  }

  @Get()
  async findAll(@Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaService.findByTenant(tenant_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaService.deleteMedia(id, tenant_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/move-up')
  async moveUp(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaService.moveUp(id, tenant_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/move-down')
  async moveDown(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaService.moveDown(id, tenant_id);
  }
}
