import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function getSessionToken(cookieValue: string | undefined) {
  if (!cookieValue) {
    return null;
  }

  const [token] = cookieValue.split(".");
  return token || null;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const signedToken =
    cookieStore.get("better-auth.session_token")?.value ??
    cookieStore.get("__Secure-better-auth.session_token")?.value;

  const token = getSessionToken(signedToken);

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

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
