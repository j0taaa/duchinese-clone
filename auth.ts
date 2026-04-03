import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.*.*.*:3000",
    "http://192.168.*.*:3000",
    "http://172.16.*.*:3000",
    "http://172.17.*.*:3000",
    "http://172.18.*.*:3000",
    "http://172.19.*.*:3000",
    "http://172.20.*.*:3000",
    "http://172.21.*.*:3000",
    "http://172.22.*.*:3000",
    "http://172.23.*.*:3000",
    "http://172.24.*.*:3000",
    "http://172.25.*.*:3000",
    "http://172.26.*.*:3000",
    "http://172.27.*.*:3000",
    "http://172.28.*.*:3000",
    "http://172.29.*.*:3000",
    "http://172.30.*.*:3000",
    "http://172.31.*.*:3000",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});
