import { ROLES_KEY } from './../decorators/roles.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class RoleGuards implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('inside role.guards');
    console.log('requiredRoles');
    console.log(requiredRoles);
    if (!requiredRoles) {
      return true;
    }
    console.log('has passed if ');

    const { user } = context.switchToHttp().getRequest();

    const rolesFiltered = requiredRoles.filter((role) => role === user.role);

    return rolesFiltered.length > 0; // true or false
  }
}
