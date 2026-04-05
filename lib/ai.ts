import { z } from "zod";

import { type HskLevel, storySectionsSchema, type StoryType } from "@/lib/stories";

type FocusCharacter = {
  hanzi: string;
  pinyin: string | null;
  definition: string | null;
};

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

function getHskBrief(hskLevel: HskLevel) {
  if (hskLevel === "6") {
    return "Target HSK 6. Use advanced but readable Chinese with richer vocabulary, varied sentence structure, and clear flow. Keep it learner-friendly rather than literary.";
  }

  if (hskLevel === "5") {
    return "Target HSK 5. Use upper-intermediate Chinese with broader everyday vocabulary and moderately complex sentences.";
  }

  if (hskLevel === "4") {
    return "Target HSK 4. Use intermediate Chinese with practical vocabulary, connected ideas, and manageable sentence variety.";
  }

  if (hskLevel === "3") {
    return "Target HSK 3. Use lower-intermediate Chinese with common daily vocabulary and clear sentence patterns.";
  }

  if (hskLevel === "2") {
    return "Target HSK 2. Use simple everyday Chinese with short sentences, common grammar, and familiar vocabulary.";
  }

  return "Target HSK 1. Use very simple Chinese with short, clear sentences, frequent repetition, and very common vocabulary.";
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

function formatFocusCharacters(characters: FocusCharacter[]) {
  return characters
    .map((entry) => {
      const details = [entry.pinyin, entry.definition].filter(Boolean).join(" - ");

      return details ? `${entry.hanzi} (${details})` : entry.hanzi;
    })
    .join(", ");
}

export async function generateStoryWithModel(input: {
  apiKey: string;
  baseUrl: string;
  model: string;
  topic: string;
  hskLevel: HskLevel;
  type: StoryType;
  length: "short" | "medium" | "long";
  focusCharacters?: FocusCharacter[];
}) {
  const focusCharactersBrief =
    input.focusCharacters && input.focusCharacters.length
      ? `- Naturally include each of these focus characters at least once: ${formatFocusCharacters(input.focusCharacters)}
- Prefer common, learner-friendly words built around those characters.
- Keep the use of those characters natural rather than forced.`
      : "";

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
          content: `Create an HSK ${input.hskLevel} Chinese ${input.type} about: ${input.topic}

Requirements:
- ${getTypeBrief(input.type)}
- ${getHskBrief(input.hskLevel)}
- Length: ${getLengthBrief(input.length)}
${focusCharactersBrief}
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
    if (
      errorText.includes("does not support image input") ||
      errorText.includes("image") ||
      errorText.includes("image input")
    ) {
      throw new Error(
        `Model "${input.model}" appears to be an image model and does not support text generation. Please use a text model like gpt-4o-mini, gpt-4o, or similar.`,
      );
    }
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
