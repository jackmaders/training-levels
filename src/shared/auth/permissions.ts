import type { UserRole } from "../db/schema";

const ALL_PERMISSIONS = [
  "todos:read",
  "todos:create",
  "todos:update",
  "todos:delete",
  "curriculum:read",
  "progress:update",
] as const;

type Permission = (typeof ALL_PERMISSIONS)[number];

const ROLE_PERMISSIONS = new Map<UserRole, readonly Permission[]>([
  ["admin", ALL_PERMISSIONS],
  ["user", ALL_PERMISSIONS],
]);

function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS.get(role)?.includes(permission) ?? false;
}

export { hasPermission, type Permission };
