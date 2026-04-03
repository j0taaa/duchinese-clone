import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/session";
import { getSuggestedReviewCharactersForUser } from "@/lib/story-service";
import { hskLevelValues } from "@/lib/stories";

const querySchema = z.object({
  hskLevel: z.enum(hskLevelValues),
});

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    hskLevel: new URL(request.url).searchParams.get("hskLevel"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid HSK level." },
      { status: 400 },
    );
  }

  const characters = await getSuggestedReviewCharactersForUser(
    session.user.id,
    parsed.data.hskLevel,
  );

  return NextResponse.json({
    characters: characters.map((entry) => ({
      ...entry,
      lastReadAt: entry.lastReadAt?.toISOString() ?? null,
    })),
  });
}
