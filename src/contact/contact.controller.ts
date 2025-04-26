import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ContactService } from './contact.service';

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
