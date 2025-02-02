import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true, // Cache'owanie kluczy publicznych
        rateLimit: true, // Ograniczenie liczby żądań do Auth0
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`, // Ładowanie publicznych kluczy
      }),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Logowanie payload dla debugowania
    return {
      userId: payload.sub, // Unikalny identyfikator użytkownika
      email: payload.email, // Email użytkownika
      roles: payload['https://example.com/roles'] || [], // Role, jeśli są w tokenie
      tenantId: payload['tenant_id'], // Identyfikator najemcy (dla multi-tenant)
    };
  }
}
