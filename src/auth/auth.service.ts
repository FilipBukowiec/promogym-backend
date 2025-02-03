import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload['https://example.com/roles'] || [],
      tenantId: payload['tenant_id'],
    };
  }
}
