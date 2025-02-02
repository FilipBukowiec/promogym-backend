import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard('jwt')) // Użycie guardu dla JWT
  @Get()
  getProfile(@Request() req) {
    return req.user; // Zwracamy dane zwrócone przez JwtStrategy
  }
} 