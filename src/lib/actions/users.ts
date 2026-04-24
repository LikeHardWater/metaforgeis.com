"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { auditLog } from "@/src/lib/audit";
import { canManageUsers } from "@/src/lib/permissions";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");
  if (!canManageUsers(session.user.systemRole))
    throw new Error("Unauthorized");
  return session;
}

export async function createUser(formData: FormData) {
  const session = await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name  = (formData.get("name") as string)?.trim() || null;
  const roleId = formData.get("roleId") as string;

  if (!email || !roleId) throw new Error("Email and role are required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("A user with that email already exists");

  const password = (formData.get("password") as string)?.trim();
  const passwordHash = password && password.length >= 8 ? await bcrypt.hash(password, 12) : undefined;

  const user = await prisma.user.create({
    data: { email, name, roleId, isActive: true, ...(passwordHash ? { passwordHash } : {}) },
  });

  await auditLog({
    action: "USER_CREATED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
    entity: "User",
    entityId: user.id,
    after: { email, roleId },
  });

  redirect("/app/admin/users?notify=invited");
}

export async function assignRole(userId: string, roleId: string) {
  const session = await requireAdmin();

  const [user, role] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { role: true } }),
    prisma.role.findUnique({ where: { id: roleId } }),
  ]);

  if (!user || !role) throw new Error("User or role not found");

  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });

  await auditLog({
    action: "USER_ROLE_CHANGED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
    entity: "User",
    entityId: userId,
    before: { role: user.role.name },
    after: { role: role.name },
  });

  revalidatePath("/app/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await auditLog({
    action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
    entity: "User",
    entityId: userId,
  });

  revalidatePath("/app/admin/users");
}

export async function unlockUser(userId: string) {
  const session = await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { lockedAt: null, lockedByAdmin: false, failedLoginCount: 0 },
  });

  await auditLog({
    action: "USER_UNLOCKED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
    entity: "User",
    entityId: userId,
  });

  revalidatePath("/app/admin/users");
}

export async function setUserPassword(userId: string, password: string) {
  await requireAdmin();
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters");

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  revalidatePath("/app/admin/users");
}

export async function changeOwnPassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");
  if (!newPassword || newPassword.length < 8) throw new Error("Password must be at least 8 characters");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");

  if (user.passwordHash) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
}
