import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { auditLog } from "./audit";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  systemRole: string | null;
  mfaEnabled: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      systemRole: string | null;
      mfaEnabled: boolean;
      mfaVerified: boolean;
    };
  }

  interface JWT {
    userId?: string;
    role?: string;
    systemRole?: string | null;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
  }
}

// PrismaAdapter.createUser only sends standard NextAuth fields (email, name, image).
// Our User model requires roleId, so we override createUser to inject a default role.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter: any = {
  ...PrismaAdapter(prisma),
  async createUser(user: { email: string; name?: string | null; image?: string | null; emailVerified: Date | null }) {
    const defaultRole = await prisma.role.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!defaultRole) throw new Error('No roles configured — add at least one role in admin settings');
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        roleId: defaultRole.id,
      },
    });
    return { ...created, emailVerified: null };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip =
          request?.headers?.get("x-forwarded-for") ??
          request?.headers?.get("x-real-ip") ??
          "unknown";

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (!user || !user.passwordHash) {
          await auditLog({
            action: "LOGIN_FAILED",
            userEmail: credentials.email as string,
            ipAddress: ip,
            metadata: { reason: "user_not_found" },
          });
          return null;
        }

        if (user.lockedAt) {
          await auditLog({
            action: "LOGIN_FAILED",
            userId: user.id,
            userEmail: user.email,
            ipAddress: ip,
            metadata: { reason: "account_locked" },
          });
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!valid) {
          const failedCount = user.failedLoginCount + 1;
          const maxFails = user.role.maxFailedLogins;
          const shouldLock = failedCount >= maxFails;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: failedCount,
              ...(shouldLock ? { lockedAt: new Date() } : {}),
            },
          });

          await auditLog({
            action: "LOGIN_FAILED",
            userId: user.id,
            userEmail: user.email,
            ipAddress: ip,
            metadata: { reason: "invalid_password", failedCount, locked: shouldLock },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });

        await auditLog({
          action: "LOGIN_SUCCESS",
          userId: user.id,
          userEmail: user.email,
          userRole: user.role.name,
          ipAddress: ip,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role.name,
          systemRole: user.role.systemRole,
          mfaEnabled: user.mfaEnabled,
        } as AuthUser;
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.userId = u.id;
        token.role = u.role;
        token.systemRole = u.systemRole;
        token.mfaEnabled = u.mfaEnabled;
        token.mfaVerified = false;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      session.user.systemRole = token.systemRole as string | null;
      session.user.mfaEnabled = token.mfaEnabled as boolean;
      session.user.mfaVerified = token.mfaVerified as boolean;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});
