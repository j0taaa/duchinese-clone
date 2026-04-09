import { z } from "zod";

import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import { getRequestSession } from "@/lib/session";
import { getSuggestedReviewCharactersForUser } from "@/lib/story-service";
import { hskLevelValues } from "@/lib/stories";

const querySchema = z.object({
  hskLevel: z.enum(hskLevelValues),
});

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    return mobileJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    hskLevel: new URL(request.url).searchParams.get("hskLevel"),
  });

  if (!parsed.success) {
    return mobileJson(
      request,
      { error: parsed.error.issues[0]?.message ?? "Invalid HSK level." },
      { status: 400 },
    );
  }

  const characters = await getSuggestedReviewCharactersForUser(
    session.user.id,
    parsed.data.hskLevel,
  );

  return mobileJson(request, {
    characters: characters.map((entry) => ({
      ...entry,
      lastReadAt: entry.lastReadAt?.toISOString() ?? null,
    })),
  });
}
