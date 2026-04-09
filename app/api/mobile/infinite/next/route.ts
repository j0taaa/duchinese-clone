import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveNextInfiniteStory } from "@/lib/infinite-feed";
import { mobileOptions, withMobileCors } from "@/lib/mobile-api";
import { serializeStory } from "@/lib/mobile-serialization";
import { getRequestSession } from "@/lib/session";
import { hskLevelValues } from "@/lib/stories";

const bodySchema = z.object({
  hskLevel: z.enum(hskLevelValues),
});

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return withMobileCors(
      request,
      NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid body." },
        { status: 400 },
      ),
    );
  }

  const session = await getRequestSession(request);
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
    return withMobileCors(
      request,
      NextResponse.json(
        { ok: false, error: result.error, code: result.code },
        { status },
      ),
    );
  }

  return withMobileCors(
    request,
    NextResponse.json({
      ok: true,
      mode: result.mode,
      targetHanzi: result.targetHanzi,
      story: serializeStory(result.story),
    }),
  );
}
