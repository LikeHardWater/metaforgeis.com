import { prisma } from "./prisma";

interface AuditLogParams {
  action: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  entity?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: unknown;
}

export async function auditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId ?? null,
        userEmail: params.userEmail ?? null,
        userRole: params.userRole ?? null,
        entity: params.entity ?? null,
        entityId: params.entityId ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        before: params.before !== undefined ? (params.before as any) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        after: params.after !== undefined ? (params.after as any) : undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: params.metadata !== undefined ? (params.metadata as any) : undefined,
      },
    });
  } catch (err) {
    // Audit log must never crash the caller
    console.error("[audit] failed to write log entry:", err);
  }
}
