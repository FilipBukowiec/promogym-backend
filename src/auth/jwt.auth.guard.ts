import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('Checking JWT Token...');

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (token) {
      this.logger.debug(`Received Token: ${token}`);
    } else {
      this.logger.warn('No authorization token found in request headers.');
    }

    const canActivate = await super.canActivate(context); // Zwraca Promise<boolean> lub Observable<boolean>

    // Jeśli wynik to Observable<boolean>, zamień go na boolean
    if (canActivate instanceof Observable) {
      this.logger.debug('canActivate is an Observable, resolving...');
      return new Promise<boolean>((resolve) =>
        canActivate.subscribe((value) => resolve(value))
      );
    }

    // Logowanie rezultatu weryfikacji tokenu
    this.logger.debug('Token verification result: ' + canActivate);

    if (canActivate === true) {
      this.logger.log('Token verified successfully');
    } else {
      this.logger.error('Token verification failed');
    }

    return canActivate; // Zwracamy wynik (boolean)
  }
}
