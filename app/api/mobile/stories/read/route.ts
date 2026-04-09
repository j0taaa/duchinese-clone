import { z } from "zod";

import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import { getRequestSession } from "@/lib/session";
import { markStoryRead } from "@/lib/story-service";

const bodySchema = z.object({
  storyId: z.string().min(1),
});

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return mobileJson(request, { ok: true, skipped: true });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return mobileJson(
      request,
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid body." },
      { status: 400 },
    );
  }

  await markStoryRead(session.user.id, parsed.data.storyId);
  return mobileJson(request, { ok: true });
}
