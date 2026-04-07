import { NextResponse } from "next/server";
import { z } from "zod";

import { buildReaderStory } from "@/lib/dictionary";
import { resolveNextInfiniteStory } from "@/lib/infinite-feed";
import { getServerSession } from "@/lib/session";
import { hskLevelValues } from "@/lib/stories";

const bodySchema = z.object({
  hskLevel: z.enum(hskLevelValues),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid body." },
      { status: 400 },
    );
  }

  const session = await getServerSession();
  const result = await resolveNextInfiniteStory({
    userId: session?.user.id ?? null,
    hskLevel: parsed.data.hskLevel,
  });

  if (!result.ok) {
    const status =
      result.code === "NO_STORIES"
        ? 404
        : result.code === "INVALID_HSK"
          ? 400
          : 503;
    return NextResponse.json(
      { ok: false, error: result.error, code: result.code },
      { status },
    );
  }

  const readerStory = buildReaderStory(result.story);

  return NextResponse.json({
    ok: true,
    mode: result.mode,
    targetHanzi: result.targetHanzi,
    storyId: result.story.id,
    readerStory: JSON.parse(JSON.stringify(readerStory)) as unknown,
  });
}
