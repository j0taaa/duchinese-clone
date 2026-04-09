import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export function getSessionToken(cookieValue: string | undefined) {
  if (!cookieValue) {
    return null;
  }

  const [token] = cookieValue.split(".");
  return token || null;
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const index = entry.indexOf("=");
        if (index === -1) {
          return [entry, ""];
        }
        return [entry.slice(0, index), entry.slice(index + 1)];
      }),
  );
}

export async function getSessionByToken(token: string | null) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const signedToken =
    cookieStore.get("better-auth.session_token")?.value ??
    cookieStore.get("__Secure-better-auth.session_token")?.value;

  return getSessionByToken(getSessionToken(signedToken));
}

export async function getRequestSession(request: Request) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const explicitToken =
    request.headers.get("x-mobile-session-token")?.trim() || null;

  if (bearerToken || explicitToken) {
    return getSessionByToken(bearerToken || explicitToken);
  }

  const cookieMap = parseCookieHeader(request.headers.get("cookie"));
  const signedToken =
    cookieMap.get("better-auth.session_token") ??
    cookieMap.get("__Secure-better-auth.session_token");

  return getSessionByToken(getSessionToken(signedToken));
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
