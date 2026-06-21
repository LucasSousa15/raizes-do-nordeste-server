import { UserRole } from 'src/modules/accounts/domain/@types/users';

export const PERMISSIONS = [
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  'list:users',

  'read:own-profile',
  'update:own-profile',

  'create:customer',
  'read:customer',
  'update:customer',
  'delete:customer',
  'list:customers',

  'create:product',
  'read:product',
  'update:product',
  'delete:product',
  'list:products',

  'create:store',
  'read:store',
  'update:store',
  'delete:store',
  'list:stores',

  'create:stock',
  'read:stock',
  'update:stock',
  'delete:stock',
  'list:stocks',

  'create:order',
  'read:order',
  'update:order',
  'cancel:order',
  'list:orders',
  'read:own-orders',
  'cancel:own-orders',

  'create:payment',
  'read:payment',
  'update:payment',
  'cancel:payment',
  'list:payments',
  'read:own-payments',

  'read:loyalty',
  'read:own-loyalty',
  'redeem:loyalty',
  'redeem:own-loyalty',

  'read:reports',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.ADMIN]: [
    'create:user',
    'read:user',
    'update:user',
    'delete:user',
    'list:users',

    'read:own-profile',
    'update:own-profile',

    'create:customer',
    'read:customer',
    'update:customer',
    'delete:customer',
    'list:customers',

    'create:product',
    'read:product',
    'update:product',
    'delete:product',
    'list:products',

    'create:store',
    'read:store',
    'update:store',
    'delete:store',
    'list:stores',

    'create:stock',
    'read:stock',
    'update:stock',
    'delete:stock',
    'list:stocks',

    'create:order',
    'read:order',
    'update:order',
    'cancel:order',
    'list:orders',
    'read:own-orders',
    'cancel:own-orders',

    'create:payment',
    'read:payment',
    'update:payment',
    'cancel:payment',
    'list:payments',
    'read:own-payments',

    'read:loyalty',
    'read:own-loyalty',
    'redeem:loyalty',
    'redeem:own-loyalty',

    'read:reports',
  ],

  [UserRole.STAFF]: [
    'read:own-profile',
    'update:own-profile',

    'read:customer',
    'list:customers',

    'read:product',
    'list:products',

    'read:store',
    'list:stores',

    'read:stock',
    'update:stock',
    'list:stocks',

    'create:order',
    'read:order',
    'update:order',
    'cancel:order',
    'list:orders',

    'create:payment',
    'read:payment',
    'update:payment',
    'cancel:payment',
    'list:payments',
  ],

  [UserRole.CUSTOMER]: [
    'read:own-profile',
    'update:own-profile',

    'read:product',
    'list:products',

    'read:store',
    'list:stores',

    'create:order',
    'read:own-orders',
    'cancel:own-orders',

    'create:payment',
    'read:own-payments',

    'read:own-loyalty',
    'redeem:own-loyalty',
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
