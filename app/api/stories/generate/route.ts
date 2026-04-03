import { NextResponse } from "next/server";
import { z } from "zod";

import { generateStoryWithModel } from "@/lib/ai";
import { getServerSession } from "@/lib/session";
import {
  createGeneratedStory,
  getAiSettingsForGeneration,
} from "@/lib/story-service";
import {
  hskLevelValues,
  mapHskLevelToStoryLevel,
  storyTypeValues,
  storyVisibilityValues,
} from "@/lib/stories";

const generateSchema = z.object({
  topic: z.string().trim().optional().default(""),
  hskLevel: z.enum(hskLevelValues),
  type: z.enum(storyTypeValues),
  length: z.enum(["short", "medium", "long"]),
  visibility: z.enum(storyVisibilityValues).refine(
    (value) => value !== "public_seeded",
    "Seed visibility is reserved for starter stories.",
  ),
});

const randomTopics = [
  "A quiet evening in a city bookstore",
  "Two friends trying a new breakfast place before class",
  "A small misunderstanding while buying fruit at a market",
  "A rainy subway ride home after work",
  "Planning a weekend walk in the park",
  "A first visit to a neighborhood tea shop",
];

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = generateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid story request." },
      { status: 400 },
    );
  }

  const settings = await getAiSettingsForGeneration(session.user.id);

  if (!settings) {
    return NextResponse.json(
      { error: "Save your model URL, API key, and model before generating." },
      { status: 400 },
    );
  }

  try {
    const topic = parsed.data.topic || randomTopics[Math.floor(Math.random() * randomTopics.length)];
    const storyLevel = mapHskLevelToStoryLevel(parsed.data.hskLevel);

    const generated = await generateStoryWithModel({
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl,
      model: settings.model,
      topic,
      hskLevel: parsed.data.hskLevel,
      type: parsed.data.type,
      length: parsed.data.length,
    });

    const baseSlug =
      slugify(generated.titleTranslation) ||
      slugify(generated.title) ||
      `story-${Date.now()}`;

    const story = await createGeneratedStory({
      userId: session.user.id,
      slug: `${baseSlug}-${Date.now().toString().slice(-5)}`,
      title: generated.title,
      titleTranslation: generated.titleTranslation,
      summary: generated.summary,
      excerpt: generated.excerpt,
      hanziText: generated.hanziText,
      pinyinText: generated.pinyinText,
      englishTranslation: generated.englishTranslation,
      sections: generated.sections,
      type: parsed.data.type,
      hskLevel: parsed.data.hskLevel,
      level: storyLevel,
      visibility: parsed.data.visibility,
    });

    return NextResponse.json({
      ok: true,
      story: {
        id: story.id,
        slug: story.slug,
        title: story.title,
        titleTranslation: story.titleTranslation,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate a story.",
      },
      { status: 500 },
    );
  }
}
