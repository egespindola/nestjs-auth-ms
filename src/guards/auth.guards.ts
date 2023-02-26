import { UsersService } from './../users/users.service';
import { AuthService } from './../auth/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuards implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = context.switchToHttp().getRequest().headers;

    try {
      const data = this.authService.checkToken(
        (authorization ?? '').split(' ')[1],
      );

      const user = await this.usersService.show(data.id);

      request.tokenPayload = data;
      request.user = user;

      return true;
    } catch (e) {
      return false;
    }

    // return this.authService.isValidToken((authorization ?? '').split(' ')[1]);
  }
}
