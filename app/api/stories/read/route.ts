import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/session";
import { markStoryRead } from "@/lib/story-service";

const bodySchema = z.object({
  storyId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid body." },
      { status: 400 },
    );
  }

  await markStoryRead(session.user.id, parsed.data.storyId);

  return NextResponse.json({ ok: true });
}
