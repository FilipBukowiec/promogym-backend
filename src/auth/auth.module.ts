import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // Konfiguracja JWT będzie w strategii
  ],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
