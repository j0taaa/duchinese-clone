import { z } from "zod";

import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import { getSessionByToken, getSessionToken } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function extractSessionCookie(setCookie: string | null) {
  if (!setCookie) {
    return null;
  }

  const match =
    setCookie.match(/(?:^|,\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/) ??
    setCookie.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);

  return match?.[1] ?? null;
}

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return mobileJson(
      request,
      { error: parsed.error.issues[0]?.message ?? "Invalid credentials." },
      { status: 400 },
    );
  }

  const response = await fetch(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "mobile-app",
    },
    body: JSON.stringify({
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: true,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };
  const cookie = extractSessionCookie(response.headers.get("set-cookie"));
  const token = getSessionToken(cookie ?? undefined);
  const session = await getSessionByToken(token);

  if (!response.ok || !session) {
    return mobileJson(
      request,
      { error: data.message ?? "Authentication failed." },
      { status: response.status || 401 },
    );
  }

  return mobileJson(request, {
    ok: true,
    token,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
    },
  });
}
