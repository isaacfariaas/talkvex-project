import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-export';

let authInstance: ReturnType<typeof NextAuth> | undefined;

try {
  authInstance = NextAuth({
    // Skip Prisma adapter during build when DB isn't available
    ...(isBuildTime ? {} : { adapter: PrismaAdapter(prisma) }),
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Senha", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!passwordMatch) return null;

          return { id: user.id, email: user.email, name: user.name };
        },
      }),
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) token.id = user.id;
        return token;
      },
      session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  });
} catch (error) {
  console.error('[auth.ts] Failed to initialize NextAuth:', error);
}

// Provide safe exports even if initialization failed
export const handlers = authInstance?.handlers ?? {
  GET: async (req: NextRequest) => new Response('Auth not initialized', { status: 503 }),
  POST: async (req: NextRequest) => new Response('Auth not initialized', { status: 503 }),
};

export const auth = authInstance?.auth ?? (async () => null);
export const signIn = authInstance?.signIn ?? (async () => { throw new Error('Auth not initialized'); });
export const signOut = authInstance?.signOut ?? (async () => { throw new Error('Auth not initialized'); });
