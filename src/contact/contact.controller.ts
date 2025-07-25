import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ContactService } from './contact.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UsePipes(new ValidationPipe({whitelist: true}))
  async handleContactForm(@Body() body: { subject: string; message: string }) {
    const { subject, message } = body;
    return this.contactService.sendContactEmail(subject, message);
  }
}
