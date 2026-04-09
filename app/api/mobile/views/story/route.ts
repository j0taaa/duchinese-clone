import { z } from "zod";

import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import { trackView } from "@/lib/view-buffer";

const bodySchema = z.object({
  storyId: z.string().min(1),
});

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return mobileJson(request, { error: "Invalid request." }, { status: 400 });
  }

  trackView(parsed.data.storyId);
  return mobileJson(request, { ok: true });
}
