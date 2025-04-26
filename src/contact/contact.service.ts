import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false, // <<< TO DODAJ ale to tymczasowe tylko na test
      },
    });
  }
  async sendContactEmail(subject: string, message: string): Promise<any> {
    const mailOpions = {
      from: 'filipbukowiec92@gmail.com',
      to: 'filipbukowiec92@gmail.com',
      subject,
      text: message,
    };
    return await this.transporter.sendMail(mailOpions);
  }
}
