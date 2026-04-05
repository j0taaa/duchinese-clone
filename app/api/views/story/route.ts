import { NextResponse } from "next/server";
import { z } from "zod";

import { trackView } from "@/lib/view-buffer";

const trackViewSchema = z.object({
  storyId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = trackViewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  trackView(parsed.data.storyId);

  return NextResponse.json({ ok: true });
}
