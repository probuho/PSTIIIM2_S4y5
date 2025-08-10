import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const providers: any[] = [
  Credentials({
    id: "credentials",
    name: "Credenciales",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = String(credentials.email);
      const password = String(credentials.password);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      } as any;
    },
  }),
];

// Proveedores OAuth opcionales (solo si hay credenciales en .env)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

// Nota: Para Microsoft (Azure AD / Entra ID) lo añadiremos luego para evitar fricción de tipos.

export const authConfig: AuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET || "change_me_in_env",
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers,
};

export default authConfig;


