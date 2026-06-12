import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { loginRateLimiter } from "./ratelimit";

export const authOptions: NextAuthOptions = {
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Proteção contra brute-force
        const ip = (req?.headers as any)?.["x-forwarded-for"]?.split(",")[0] || "127.0.0.1";
        const { success } = await loginRateLimiter.limit(ip);
        if (!success) {
          throw new Error("Muitas tentativas de login. Tente novamente em alguns minutos.");
        }

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
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export async function auth() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("[auth] getServerSession failed:", error);
    // Return null on error to allow unauthenticated access instead of crashing
    return null;
  }
}
