import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const otp = String(credentials.otp).trim();

        const otpRecord = await prisma.oTPCode.findFirst({
          where: {
            email,
            code: otp,
            used: false,
            expires: { gt: new Date() },
          },
        });

        if (!otpRecord) return null;

        // Max 5 attempts
        if (otpRecord.attempts >= 5) return null;

        await prisma.oTPCode.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
});
