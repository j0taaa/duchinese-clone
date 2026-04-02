import { z } from "zod";

import { type StoryLevel, storySectionsSchema, type StoryType } from "@/lib/stories";

const generatedStorySchema = z.object({
  title: z.string().min(1),
  titleTranslation: z.string().min(1),
  summary: z.string().min(1),
  sections: storySectionsSchema,
});

export type GeneratedStoryPayload = z.infer<typeof generatedStorySchema>;

function getLengthBrief(length: string) {
  if (length === "long") return "6 to 7 short sections, around 260 to 380 Chinese characters total";
  if (length === "medium") return "4 to 5 short sections, around 170 to 260 Chinese characters total";
  return "3 to 4 short sections, around 90 to 150 Chinese characters total";
}

function getLevelBrief(level: StoryLevel) {
  if (level === "intermediate") {
    return "Use intermediate Chinese with natural but still learner-friendly sentence patterns. Avoid highly literary language.";
  }

  if (level === "elementary") {
    return "Use everyday elementary Chinese with short sentences and common grammar.";
  }

  return "Use very simple beginner Chinese with short, clear sentences, frequent repetition, and common vocabulary.";
}

function getTypeBrief(type: StoryType) {
  if (type === "dialogue") return "Write it as a natural dialogue.";
  if (type === "journal") return "Write it as a first-person diary or journal entry.";
  return "Write it as a short story.";
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

export async function generateStoryWithModel(input: {
  apiKey: string;
  baseUrl: string;
  model: string;
  topic: string;
  level: StoryLevel;
  type: StoryType;
  length: "short" | "medium" | "long";
}) {
  const response = await fetch(input.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "You create polished graded Chinese reading lessons for learners. Return ONLY valid JSON. Avoid foreign names when possible. Pinyin must align section-by-section with the Chinese text. Use tone marks rather than tone numbers.",
        },
        {
          role: "user",
          content: `Create a ${input.level} Chinese ${input.type} about: ${input.topic}

Requirements:
- ${getTypeBrief(input.type)}
- ${getLevelBrief(input.level)}
- Length: ${getLengthBrief(input.length)}
- Return JSON with this exact shape:
{
  "title": "Chinese title",
  "titleTranslation": "Natural English lesson title",
  "summary": "1-2 sentence English summary for the library card",
  "sections": [
    {
      "hanzi": "Chinese text for one section",
      "pinyin": "Matching pinyin for that section",
      "english": "Natural English translation for that section"
    }
  ]
}
- Each section should be a coherent chunk, not a single word.
- Make the lesson pleasant to read and useful for study.`,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model request failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string }>;
      };
    }>;
  };

  const rawContent = json.choices?.[0]?.message?.content;
  const content =
    typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((part) => part.text ?? "").join("")
        : "";

  const parsed = generatedStorySchema.parse(JSON.parse(extractJson(content)));

  const hanziText = parsed.sections.map((section) => section.hanzi).join("\n");
  const pinyinText = parsed.sections.map((section) => section.pinyin).join("\n");
  const englishTranslation = parsed.sections
    .map((section) => section.english)
    .join("\n\n");

  return {
    ...parsed,
    excerpt: parsed.sections[0]?.hanzi.slice(0, 72) ?? parsed.title,
    hanziText,
    pinyinText,
    englishTranslation,
  };
}
