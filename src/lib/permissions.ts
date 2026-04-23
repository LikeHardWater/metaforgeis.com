import { SystemRole } from "@prisma/client";

export const ADMIN_ROLES: SystemRole[] = [
  SystemRole.OWNER,
  SystemRole.ADMINISTRATOR,
];

export function canManageUsers(systemRole: string | null): boolean {
  return ADMIN_ROLES.includes(systemRole as SystemRole);
}

export function canViewAuditLog(systemRole: string | null): boolean {
  return ADMIN_ROLES.includes(systemRole as SystemRole);
}
