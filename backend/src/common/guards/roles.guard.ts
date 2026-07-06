import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Role hierarchy: higher index = more privilege. A user with a higher role
// automatically satisfies requirements for lower roles.
const HIERARCHY: Role[] = ['SUPPORT', 'USER', 'RESELLER', 'ADMIN', 'SUPER_ADMIN'] as Role[];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    const userLevel = HIERARCHY.indexOf(user.role);
    const minRequiredLevel = Math.min(...required.map((r) => HIERARCHY.indexOf(r)));

    if (userLevel < minRequiredLevel) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
