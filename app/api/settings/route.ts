import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/session";
import { getAiSettingsForGeneration, upsertAiSettings } from "@/lib/story-service";

const settingsSchema = z.object({
  baseUrl: z.string().url(),
  model: z.string().min(1),
  apiKey: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = settingsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid settings." },
      { status: 400 },
    );
  }

  const existing = await getAiSettingsForGeneration(session.user.id);
  const apiKey = parsed.data.apiKey.trim() || existing?.apiKey;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Add an API key to save your model settings." },
      { status: 400 },
    );
  }

  await upsertAiSettings({
    userId: session.user.id,
    baseUrl: parsed.data.baseUrl.trim(),
    model: parsed.data.model.trim(),
    apiKey,
  });

  return NextResponse.json({ ok: true });
}
