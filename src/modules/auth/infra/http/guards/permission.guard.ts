import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  hasPermission,
  Permission,
} from 'src/modules/auth/domain/permissions/role-permissions';
import { UserRole } from 'src/modules/accounts/@types/users';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

interface RequestWithUser {
  user?: {
    role: UserRole;
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<Permission>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    if (!hasPermission(user.role, requiredPermission)) {
      throw new ForbiddenException(
        `Acesso negado. Permissão requerida: ${requiredPermission}`,
      );
    }

    return true;
  }
}
