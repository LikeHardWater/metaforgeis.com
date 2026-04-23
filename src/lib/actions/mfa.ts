"use server";

import { generateSecret, generateURI, verify as totpVerify } from "otplib";
import qrcode from "qrcode";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { auditLog } from "@/src/lib/audit";
import crypto from "crypto";

export async function generateMfaSecret(): Promise<{ secret: string; qrDataUrl: string; backupCodes: string[] }> {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const secret = generateSecret();

  const otpAuthUrl = generateURI({
    secret,
    issuer: "MetaForge Platform",
    label: session.user.email,
  });

  const qrDataUrl = await qrcode.toDataURL(otpAuthUrl);

  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaSecret: secret, mfaBackupCodes: backupCodes },
  });

  return { secret, qrDataUrl, backupCodes };
}

async function checkTotp(token: string, secret: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await totpVerify({ secret, token });
    return result === true || result?.valid === true;
  } catch {
    return false;
  }
}

export async function verifyAndEnableMfa(token: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.mfaSecret) return { success: false, error: "No MFA setup in progress." };

  const valid = await checkTotp(token, user.mfaSecret);
  if (!valid) return { success: false, error: "Invalid code. Try again." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaEnabled: true },
  });

  await auditLog({
    action: "MFA_ENABLED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
  });

  return { success: true };
}

export async function disableMfa(token: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.mfaEnabled || !user.mfaSecret)
    return { success: false, error: "MFA is not enabled." };

  const valid = await checkTotp(token, user.mfaSecret);
  if (!valid) return { success: false, error: "Invalid code." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: [] },
  });

  await auditLog({
    action: "MFA_DISABLED",
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
  });

  return { success: true };
}

export async function verifyMfaToken(token: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.mfaSecret) return { success: false, error: "MFA not configured." };

  const validTotp = await checkTotp(token, user.mfaSecret);
  if (validTotp) return { success: true };

  const normalised = token.toUpperCase().replace(/\s/g, "");
  const codeIndex = user.mfaBackupCodes.indexOf(normalised);
  if (codeIndex !== -1) {
    const remaining = user.mfaBackupCodes.filter((_, i) => i !== codeIndex);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaBackupCodes: remaining },
    });
    await auditLog({
      action: "MFA_BACKUP_CODE_USED",
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      metadata: { codesRemaining: remaining.length },
    });
    return { success: true };
  }

  return { success: false, error: "Invalid code." };
}
