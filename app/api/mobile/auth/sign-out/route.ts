import { prisma } from "@/lib/prisma";
import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import { getRequestSession } from "@/lib/session";

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (session) {
    await prisma.session.deleteMany({
      where: {
        token: session.token,
      },
    });
  }

  return mobileJson(request, { ok: true });
}
