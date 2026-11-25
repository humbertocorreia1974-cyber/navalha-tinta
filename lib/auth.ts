import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? undefined, email: user.email , role: (user as any).role };
      },
    }),
    // 🩹 2026-10-20 (achado real de auditoria: landing promete "Autenticação
    // OAuth" mas o gerador só produzia CredentialsProvider) - login social só
    // entra na lista se o deploy configurar GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET
    // (Google Cloud Console); sem isso o app continua igual a antes, só com
    // Credentials.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Sem adapter de banco (sessão é JWT) - o NextAuth não persiste sozinho o
    // usuário logado via Google. No primeiro login social, cria (ou reaproveita
    // pelo e-mail) a linha real em User, com senha aleatória que o dono nunca
    // vai usar (login social sempre passa pelo Google, não por Credentials).
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
          const created = await prisma.user.create({
            data: { email: user.email, name: user.name ?? undefined, passwordHash: randomHash },
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) { if (user) (token as any).role = (user as any).role;
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) { if (session.user) (session.user as any).role = (token as any).role;
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
