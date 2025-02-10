import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwksUri = configService.get<string>('JWT_SECRET_KEY_PROVIDER_URI');
    const audience = configService.get<string>('JWT_AUDIENCE');
    const issuer = configService.get<string>('JWT_ISSUER');

    if (!jwksUri || !audience || !issuer) {
      throw new HttpException('Missing environment variables', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        jwksUri: jwksUri,  // Teraz mamy pewność, że jest to string
      }),
      algorithms: ['RS256'],
      audience: audience,  // Przekazujemy odpowiednią wartość
      issuer: issuer,  // Przekazujemy odpowiednią wartość
    });
  }

  async validate(payload: any) {
    const validAudiences = [
      this.configService.get<string>('JWT_AUDIENCE'),
      this.configService.get<string>('JWT_USERINFO_URL'),,
    ];
    const expectedIssuer = this.configService.get<string>('JWT_ISSUER');
  
    // Sprawdzamy, czy token ma odpowiednią audience
    if (!validAudiences.includes(payload.aud[0])) {  // Zakładam, że aud jest tablicą
      console.error('Audience mismatch');
      throw new HttpException('Invalid token audience', HttpStatus.UNAUTHORIZED);
    }
  
    // Sprawdzamy, czy issuer jest poprawny
    if (payload.iss !== expectedIssuer) {
      console.error('Issuer mismatch');
      throw new HttpException('Invalid token issuer', HttpStatus.UNAUTHORIZED);
    }
  
    console.log('JWT token valid:', payload);
    return { userId: payload.sub, username: payload.name };
  }
}