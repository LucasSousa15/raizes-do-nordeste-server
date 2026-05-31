import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/modules/auth/domain/permissions/role-permissions';

export const REQUIRE_PERMISSION_KEY = 'require-permission';

export const RequirePermission = (permission: Permission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
