import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { allowAdminLogin, resetAdminLoginThrottle } from "@/lib/contact-rate-limit";
import { logSecurityEvent } from "@/lib/observability/log";

const adminEmail =
  process.env.ADMIN_EMAIL?.trim().toLowerCase();

const adminPasswordHash =
  process.env.ADMIN_PASSWORD_HASH;

if (!adminEmail) {
  throw new Error("ADMIN_EMAIL is not defined");
}

if (!adminPasswordHash) {
  throw new Error(
    "ADMIN_PASSWORD_HASH is not defined",
  );
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "Admin credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        if (!await allowAdminLogin()) return null;

        const email =
          credentials.email
            .trim()
            .toLowerCase();

        if (email !== adminEmail) {
          logSecurityEvent("admin_login_failed");
          return null;
        }

        const passwordMatches =
          await bcrypt.compare(
            credentials.password,
            adminPasswordHash,
          );

        if (!passwordMatches) {
          logSecurityEvent("admin_login_failed");
          return null;
        }

        await resetAdminLoginThrottle();
        logSecurityEvent("admin_login_succeeded");

        return {
          id: "admin",
          email: adminEmail,
          name: "Administrator",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  secret: process.env.AUTH_SECRET,
  events: {
    signOut() {
      logSecurityEvent("admin_logout");
    },
  },
});
