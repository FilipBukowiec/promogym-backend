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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        jwksUri: 'https://dev-yaku6y1r82y6pb0p.us.auth0.com/.well-known/jwks.json',
      }),
      algorithms: ['RS256'],
      audience: 'https://promogym.com/api', // Twój API Audience
      issuer: 'https://dev-yaku6y1r82y6pb0p.us.auth0.com/', // Twoja domena Auth0
    });
  }

  async validate(payload: any) {
    const validAudiences = ['https://promogym.com/api', 'https://dev-yaku6y1r82y6pb0p.us.auth0.com/userinfo'];
    const expectedIssuer = 'https://dev-yaku6y1r82y6pb0p.us.auth0.com/';
  
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
