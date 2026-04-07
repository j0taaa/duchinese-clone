import { z } from "zod";

import {
  getOpenRouterAppHeaders,
  getOpenRouterChatUrl,
  getOpenRouterIdeaModel,
  getOpenRouterModel,
  requireOpenRouterApiKey,
} from "@/lib/openrouter-config";
import {
  countCjkHanziInSections,
  getSeriesEpisodeLengthBriefWithMinimum,
  getStandaloneLengthBriefWithMinimum,
  SERIES_EPISODE_MIN_HANZI,
  STANDALONE_LESSON_MIN_HANZI,
} from "@/lib/story-length-standards";
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

const generatedSeriesSchema = z.object({
  seriesTitle: z.string().min(1),
  seriesTitleTranslation: z.string().min(1),
  seriesSummary: z.string().min(1),
  episodes: z.array(generatedStorySchema).length(3),
});

export type GeneratedSeriesPayload = z.infer<typeof generatedSeriesSchema>;

export type OpenRouterUsageSnapshot = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costCredits: number | null;
  providerRequestId: string | null;
};

export type GeneratedStoryWithUsage = {
  story: GeneratedStoryPayload & {
    excerpt: string;
    hanziText: string;
    pinyinText: string;
    englishTranslation: string;
  };
  usage: OpenRouterUsageSnapshot;
  model: string;
};

export type GeneratedSeriesEpisode = GeneratedStoryPayload & {
  excerpt: string;
  hanziText: string;
  pinyinText: string;
  englishTranslation: string;
};

export type GeneratedSeriesWithUsage = {
  seriesTitle: string;
  seriesTitleTranslation: string;
  seriesSummary: string;
  episodes: GeneratedSeriesEpisode[];
  usage: OpenRouterUsageSnapshot;
  model: string;
};

const storyIdeaResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("idea"), text: z.string().min(1) }),
  z.object({ kind: z.literal("new_words") }),
]);

export type StoryIdeaCallResult =
  | { status: "idea"; text: string; model: string; usage: OpenRouterUsageSnapshot }
  | { status: "new_words"; model: string; usage: OpenRouterUsageSnapshot }
  | { status: "invalid"; model: string; usage: OpenRouterUsageSnapshot };

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

/** Full format rules — used in initial prompts, revisions, and system prompt so the model cannot drift into narrative when dialogue was chosen (etc.). */
function getLessonFormatRequirements(type: StoryType): string {
  if (type === "dialogue") {
    return `MANDATORY FORMAT — DIALOGUE (对话体). This overrides any instinct to write a plain story paragraph:
- The Chinese in the "hanzi" fields must read as spoken conversation between people, not as a single narrator describing events in third person.
- Use at least two speakers with clear turn-taking: attribute lines with names or roles (e.g. 小明："……" 丽丽："……"), or 甲/乙, or lines introduced with 他说／她说／问道／回答 followed by speech. The reader must always know who is speaking.
- Include real back-and-forth (questions, answers, reactions). Do not write the whole lesson as one uninterrupted narrative summary with no speaker changes.
- When you add length or new sections, add more dialogue exchanges — do not "help" by switching to essay-style narration.`;
  }
  if (type === "journal") {
    return `MANDATORY FORMAT — JOURNAL / DIARY (日记体). This overrides dialogue- or news-style prose:
- Write in consistent first person (我…), as a personal diary or journal entry. Openings like 今天…… / 这几天…… / 我觉得…… are appropriate.
- Keep a reflective, subjective voice (feelings, plans, impressions). Avoid neutral third-person reporting ("他做了…" as the default voice for the whole text).
- Do not format the piece primarily as a script of quoted speakers unless the diary quotes someone briefly; the main voice is the diarist.
- When expanding, add more diary-style paragraphs — stay in 我.`;
  }
  return `MANDATORY FORMAT — NARRATIVE STORY (记叙文／小故事):
- Write as narrative prose: scenes, characters, and events with a storyteller or third-person (or consistent narrative "I" that is not diary-meta) voice.
- This is not a dialogue script: do not make the majority of the text only alternating quoted lines with speaker labels.
- This is not a diary unless the topic explicitly calls for it: avoid dated diary framing (今天我觉得…) as the dominant structure.
- When expanding, add narrative detail, action, and description — keep story-like flow.`;
}

function buildLessonFormatSystemClause(type: StoryType): string {
  if (type === "dialogue") {
    return " The user-selected format is DIALOGUE: the Chinese text must be predominantly spoken lines between at least two speakers, not plain third-person summary.";
  }
  if (type === "journal") {
    return " The user-selected format is JOURNAL: the Chinese text must be first-person diary-style (我…), not third-person news prose or a dialogue script.";
  }
  return " The user-selected format is STORY: the Chinese text must be narrative prose, not primarily a dialogue transcript or diary entry.";
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

function stringifyField(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value == null) {
    return "";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

/**
 * Models sometimes omit keys, use alternate names, or leave holes in `sections`.
 * Normalize so Zod validation matches what we persist.
 */
function sectionFromUnknown(entry: unknown): { hanzi: string; pinyin: string; english: string } | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const o = entry as Record<string, unknown>;
  const hanzi =
    stringifyField(o.hanzi) ||
    stringifyField(o.chinese) ||
    stringifyField(o.zh) ||
    stringifyField(o.text) ||
    stringifyField(o.simplified);
  const pinyin =
    stringifyField(o.pinyin) ||
    stringifyField(o.py) ||
    stringifyField(o.romanization);
  const english =
    stringifyField(o.english) ||
    stringifyField(o.en) ||
    stringifyField(o.translation);

  if (!hanzi) {
    return null;
  }

  const placeholder = "—";
  return {
    hanzi,
    pinyin: pinyin || placeholder,
    english: english || placeholder,
  };
}

function normalizeLessonJsonForSchema(lesson: unknown): unknown {
  if (!lesson || typeof lesson !== "object") {
    return lesson;
  }

  const o = lesson as Record<string, unknown>;
  const raw = o.sections;

  if (!Array.isArray(raw)) {
    return lesson;
  }

  const sections = raw
    .map((entry) => sectionFromUnknown(entry))
    .filter((section): section is NonNullable<typeof section> => section !== null);

  return { ...o, sections };
}

function normalizeSeriesJsonForSchema(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const o = raw as Record<string, unknown>;
  const episodes = o.episodes;

  if (!Array.isArray(episodes)) {
    return raw;
  }

  return {
    ...o,
    episodes: episodes.map((episode) => normalizeLessonJsonForSchema(episode)),
  };
}

function formatFocusCharacters(characters: FocusCharacter[]) {
  return characters
    .map((entry) => {
      const details = [entry.pinyin, entry.definition].filter(Boolean).join(" - ");

      return details ? `${entry.hanzi} (${details})` : entry.hanzi;
    })
    .join(", ");
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function parseOpenRouterUsage(
  responseJson: unknown,
  providerRequestId: string | null,
): OpenRouterUsageSnapshot {
  if (!responseJson || typeof responseJson !== "object") {
    return {
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costCredits: null,
      providerRequestId,
    };
  }

  const root = responseJson as Record<string, unknown>;
  const usage = root.usage;

  if (!usage || typeof usage !== "object") {
    return {
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costCredits: null,
      providerRequestId,
    };
  }

  const u = usage as Record<string, unknown>;

  return {
    promptTokens: readFiniteNumber(u.prompt_tokens),
    completionTokens: readFiniteNumber(u.completion_tokens),
    totalTokens: readFiniteNumber(u.total_tokens),
    costCredits: readFiniteNumber(u.cost),
    providerRequestId,
  };
}

/** Always appended so infinite + studio paths share the same rules (no random omission). */
const POP_CULTURE_GUIDANCE_PREMISE = `
- Familiar media or meme flavor is optional: add it only when it clearly fits the seeds and the scene you are proposing; if a plain everyday premise is stronger, skip pop culture entirely. Never make the core idea revolve around specific real celebrities or performers unless the seeds or scenario obviously call for that; prefer fictional or unnamed people.`;

const POP_CULTURE_GUIDANCE_LESSON = `
- Pop culture (films, TV, games, books, memes): include only when it clearly fits the stated topic or plot and helps the learner—omit it when the story reads better without it. Do not build the lesson around specific real celebrities; use generic roles, fictional characters, or unnamed figures unless the topic text itself explicitly frames a scenario that requires a named reference. When you must use a foreign title or name, prefer natural Chinese transliteration and keep it brief.`;

function buildGradedLessonSystemPrompt(
  kind: "story" | "series",
  lessonTextFormat: StoryType,
): string {
  const subject = kind === "story" ? "reading lessons" : "reading series";
  return `You create polished graded Chinese ${subject} for learners. Return ONLY valid JSON. Pinyin must align section-by-section with the Chinese text. Use tone marks rather than tone numbers. Avoid foreign names when possible; use Chinese transliterations only when a recognizable foreign title or name is clearly required by the scenario described in the user message.${buildLessonFormatSystemClause(lessonTextFormat)} When the user asks for longer text or more sections, keep the same format — never switch genre to hit a length target.`;
}

const LENGTH_RETRY_MAX = 5;

function mergeOpenRouterUsage(
  a: OpenRouterUsageSnapshot,
  b: OpenRouterUsageSnapshot,
): OpenRouterUsageSnapshot {
  const sum = (x: number | null, y: number | null) =>
    x == null && y == null ? null : (x ?? 0) + (y ?? 0);
  return {
    promptTokens: sum(a.promptTokens, b.promptTokens),
    completionTokens: sum(a.completionTokens, b.completionTokens),
    totalTokens: sum(a.totalTokens, b.totalTokens),
    costCredits: sum(a.costCredits, b.costCredits),
    providerRequestId: b.providerRequestId ?? a.providerRequestId,
  };
}

async function openRouterLessonChat(
  kind: "story" | "series",
  userContent: string,
  lessonTextFormat: StoryType,
  temperature = 0.8,
): Promise<{
  rawText: string;
  usage: OpenRouterUsageSnapshot;
  model: string;
}> {
  const apiKey = requireOpenRouterApiKey();
  const baseUrl = getOpenRouterChatUrl();
  const model = getOpenRouterModel();
  const appHeaders = getOpenRouterAppHeaders();

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...appHeaders,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: buildGradedLessonSystemPrompt(kind, lessonTextFormat) },
        { role: "user", content: userContent },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model request failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    id?: string;
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string }>;
      };
    }>;
  };

  const providerRequestId = typeof json.id === "string" ? json.id : null;
  const usage = parseOpenRouterUsage(json, providerRequestId);

  const rawContent = json.choices?.[0]?.message?.content;
  const rawText =
    typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((part) => part.text ?? "").join("")
        : "";

  return { rawText, usage, model };
}

async function fetchSingleLessonPayloadFromModel(
  userContent: string,
  lessonTextFormat: StoryType,
): Promise<{
  payload: GeneratedStoryPayload;
  usage: OpenRouterUsageSnapshot;
  model: string;
}> {
  const { rawText, usage, model } = await openRouterLessonChat(
    "story",
    userContent,
    lessonTextFormat,
    0.8,
  );
  const rawJson = JSON.parse(extractJson(rawText));
  const payload = generatedStorySchema.parse(normalizeLessonJsonForSchema(rawJson));
  return { payload, usage, model };
}

async function fetchSingleSeriesPayloadFromModel(
  userContent: string,
  lessonTextFormat: StoryType,
): Promise<{
  payload: GeneratedSeriesPayload;
  usage: OpenRouterUsageSnapshot;
  model: string;
}> {
  const { rawText, usage, model } = await openRouterLessonChat(
    "series",
    userContent,
    lessonTextFormat,
    0.8,
  );
  const rawJson = JSON.parse(extractJson(rawText));
  const payload = generatedSeriesSchema.parse(normalizeSeriesJsonForSchema(rawJson));
  return { payload, usage, model };
}

async function reviseLessonToMeetMinCjk(input: {
  payload: GeneratedStoryPayload;
  minCjk: number;
  actualCjk: number;
  hskLevel: HskLevel;
  type: StoryType;
  framingLines: string;
}): Promise<{ payload: GeneratedStoryPayload; usage: OpenRouterUsageSnapshot; model: string }> {
  const deficit = input.minCjk - input.actualCjk;
  const serialized = JSON.stringify(
    {
      title: input.payload.title,
      titleTranslation: input.payload.titleTranslation,
      summary: input.payload.summary,
      sections: input.payload.sections,
    },
    null,
    0,
  );

  const userContent = `Your previous Chinese lesson JSON was too short.

We count ONLY Chinese characters (CJK unified: U+4E00–U+9FFF and extension A) inside every section's "hanzi" string — ignore punctuation, Latin letters, digits, and whitespace. Your lesson had about ${input.actualCjk} such characters; the HARD MINIMUM is ${input.minCjk}. Add at least ${deficit} more Chinese characters across the hanzi text (new or longer sections).

Framing:
${input.framingLines}

HSK ${input.hskLevel}.

${getLessonFormatRequirements(input.type)}

Return a COMPLETE replacement JSON object with keys "title", "titleTranslation", "summary", "sections". Keep the same premise and titles when possible, but you must expand so total CJK count in all "hanzi" fields is >= ${input.minCjk}. When expanding, you MUST keep the mandatory format above (e.g. dialogue stays dialogue; do not convert to narrative to add words). Each section needs accurate pinyin and English aligned with the Chinese.${POP_CULTURE_GUIDANCE_LESSON}

Previous JSON (expand this; do not return a shorter lesson):
${serialized}`;

  return fetchSingleLessonPayloadFromModel(userContent, input.type);
}

async function ensureLessonMeetsMinCjk(input: {
  payload: GeneratedStoryPayload;
  minCjk: number;
  hskLevel: HskLevel;
  type: StoryType;
  framingLines: string;
  baseUsage: OpenRouterUsageSnapshot;
  baseModel: string;
}): Promise<{ payload: GeneratedStoryPayload; usage: OpenRouterUsageSnapshot; model: string }> {
  let payload = input.payload;
  let usage = input.baseUsage;
  let model = input.baseModel;
  let count = countCjkHanziInSections(payload.sections);
  let lastCount = -1;
  let sameCountStreak = 0;

  for (let attempt = 0; attempt < LENGTH_RETRY_MAX && count < input.minCjk; attempt += 1) {
    if (count === lastCount) {
      sameCountStreak += 1;
      if (sameCountStreak >= 2) {
        break;
      }
    } else {
      sameCountStreak = 0;
    }
    lastCount = count;

    const rev = await reviseLessonToMeetMinCjk({
      payload,
      minCjk: input.minCjk,
      actualCjk: count,
      hskLevel: input.hskLevel,
      type: input.type,
      framingLines: input.framingLines,
    });
    payload = rev.payload;
    usage = mergeOpenRouterUsage(usage, rev.usage);
    model = rev.model;
    count = countCjkHanziInSections(payload.sections);
  }

  return { payload, usage, model };
}

async function ensureSeriesEpisodesMeetMinCjk(input: {
  episodes: GeneratedStoryPayload[];
  minCjkPerEpisode: number;
  hskLevel: HskLevel;
  type: StoryType;
  seriesTitleTranslation: string;
  baseUsage: OpenRouterUsageSnapshot;
  baseModel: string;
}): Promise<{ episodes: GeneratedStoryPayload[]; usage: OpenRouterUsageSnapshot; model: string }> {
  let usage = input.baseUsage;
  let model = input.baseModel;
  const out: GeneratedStoryPayload[] = [];

  for (let ei = 0; ei < input.episodes.length; ei += 1) {
    const ep = input.episodes[ei]!;
    const framingLines = `This is episode ${ei + 1} of ${input.episodes.length} in the series "${input.seriesTitleTranslation}". Mandatory text format for the whole series: ${input.type}. It should read well on its own and fit the three-episode arc (intro → develop → close).`;
    const ensured = await ensureLessonMeetsMinCjk({
      payload: ep,
      minCjk: input.minCjkPerEpisode,
      hskLevel: input.hskLevel,
      type: input.type,
      framingLines,
      baseUsage: usage,
      baseModel: model,
    });
    out.push(ensured.payload);
    usage = ensured.usage;
    model = ensured.model;
  }

  return { episodes: out, usage, model };
}

function normalizeStoryIdeaJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const o = raw as Record<string, unknown>;
  const kindRaw = o.kind;
  const kind = typeof kindRaw === "string" ? kindRaw.trim().toLowerCase() : "";

  if (kind === "new_words" || kind === "newwords" || kind === "reshuffle") {
    return { kind: "new_words" };
  }

  if (kind === "idea") {
    const text =
      stringifyField(o.text) ||
      stringifyField(o.idea) ||
      stringifyField(o.topic) ||
      stringifyField(o.description);
    return { kind: "idea", text };
  }

  return raw;
}

export async function generateStoryIdeaWithModel(input: {
  hskLevel: HskLevel;
  seedWords: string[];
}): Promise<StoryIdeaCallResult> {
  const apiKey = requireOpenRouterApiKey();
  const baseUrl = getOpenRouterChatUrl();
  const model = getOpenRouterIdeaModel();
  const appHeaders = getOpenRouterAppHeaders();
  const wordList = input.seedWords.length
    ? input.seedWords.join(", ")
    : "(no seed list — invent a fresh everyday premise)";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...appHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: 0.85,
      max_tokens: 380,
      messages: [
        {
          role: "system",
          content:
            'You invent short English premises for Chinese graded readers. Reply with ONE JSON object only, no markdown. Allowed shapes: {"kind":"idea","text":"..."} OR {"kind":"new_words"}. The "text" field is 1–3 sentences in English describing a concrete scene or situation suitable as a story topic.',
        },
        {
          role: "user",
          content: `HSK level (for vocabulary spirit only): ${input.hskLevel}

Seed words (optional background flavor only — NOT the plot engine): ${wordList}

Rules:
- The story can be about anything plausible; seeds may appear only as passing detail, or not at all if they would derail the premise.
- Example: a historical warrior tale may mention a mountain in one clause without making the whole story "about climbing".
- If the five seeds are too awkward to combine naturally, respond with {"kind":"new_words"} so we can draw a new batch.
- "text" must be English only, specific, and learner-friendly (no graphic violence, no sexual content).${POP_CULTURE_GUIDANCE_PREMISE}`,
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
    id?: string;
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string }>;
      };
    }>;
  };

  const providerRequestId = typeof json.id === "string" ? json.id : null;
  const usage = parseOpenRouterUsage(json, providerRequestId);

  const rawContent = json.choices?.[0]?.message?.content;
  const content =
    typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((part) => part.text ?? "").join("")
        : "";

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(content));
  } catch {
    return { status: "invalid", model, usage };
  }

  const normalized = normalizeStoryIdeaJson(parsedJson);
  const checked = storyIdeaResponseSchema.safeParse(normalized);

  if (!checked.success) {
    return { status: "invalid", model, usage };
  }

  if (checked.data.kind === "new_words") {
    return { status: "new_words", model, usage };
  }

  const text = checked.data.text.trim();
  if (!text) {
    return { status: "invalid", model, usage };
  }

  return { status: "idea", text, model, usage };
}

export async function generateStoryWithModel(input: {
  topic: string;
  hskLevel: HskLevel;
  type: StoryType;
  length: "short" | "medium" | "long";
  focusCharacters?: FocusCharacter[];
}): Promise<GeneratedStoryWithUsage> {
  const focusCharactersBrief =
    input.focusCharacters && input.focusCharacters.length
      ? `- Naturally include each of these focus characters at least once: ${formatFocusCharacters(input.focusCharacters)}
- Prefer common, learner-friendly words built around those characters.
- Keep the use of those characters natural rather than forced.`
      : "";

  const minCjk = STANDALONE_LESSON_MIN_HANZI[input.length];
  const userContent = `Create one HSK ${input.hskLevel} graded Chinese reading lesson.

Topic / situation: ${input.topic}

${getLessonFormatRequirements(input.type)}

Other requirements:
- ${getHskBrief(input.hskLevel)}
- Length: ${getStandaloneLengthBriefWithMinimum(input.length)}
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
- Every section MUST include non-empty string values for "hanzi", "pinyin", and "english" (no nulls, no missing keys).
- Make the lesson pleasant to read and useful for study.${POP_CULTURE_GUIDANCE_LESSON}`;

  const first = await fetchSingleLessonPayloadFromModel(userContent, input.type);
  const framingLines = `Topic: ${input.topic}. Keep the same text format (${input.type}) when expanding.`;
  const ensured = await ensureLessonMeetsMinCjk({
    payload: first.payload,
    minCjk,
    hskLevel: input.hskLevel,
    type: input.type,
    framingLines,
    baseUsage: first.usage,
    baseModel: first.model,
  });
  const parsed = ensured.payload;

  const hanziText = parsed.sections.map((section) => section.hanzi).join("\n");
  const pinyinText = parsed.sections.map((section) => section.pinyin).join("\n");
  const englishTranslation = parsed.sections
    .map((section) => section.english)
    .join("\n\n");

  return {
    model: ensured.model,
    usage: ensured.usage,
    story: {
      ...parsed,
      excerpt: parsed.sections[0]?.hanzi.slice(0, 72) ?? parsed.title,
      hanziText,
      pinyinText,
      englishTranslation,
    },
  };
}

function mapEpisodeToGenerated(episode: GeneratedStoryPayload): GeneratedSeriesEpisode {
  const hanziText = episode.sections.map((section) => section.hanzi).join("\n");
  const pinyinText = episode.sections.map((section) => section.pinyin).join("\n");
  const englishTranslation = episode.sections
    .map((section) => section.english)
    .join("\n\n");

  return {
    ...episode,
    excerpt: episode.sections[0]?.hanzi.slice(0, 72) ?? episode.title,
    hanziText,
    pinyinText,
    englishTranslation,
  };
}

export async function generateSeriesWithModel(input: {
  topic: string;
  hskLevel: HskLevel;
  type: StoryType;
  length: "short" | "medium" | "long";
  focusCharacters?: FocusCharacter[];
}): Promise<GeneratedSeriesWithUsage> {
  const focusCharactersBrief =
    input.focusCharacters && input.focusCharacters.length
      ? `- Naturally include each of these focus characters at least once across the three episodes: ${formatFocusCharacters(input.focusCharacters)}
- Spread them across episodes when it feels natural; do not force every character into every episode.`
      : "";

  const minPerEp = SERIES_EPISODE_MIN_HANZI[input.length];
  const userContent = `Create a THREE-EPISODE HSK ${input.hskLevel} Chinese graded-reader series.

Topic / arc: ${input.topic}

Each of the three episodes must obey the SAME text format (this is mandatory for every episode):
${getLessonFormatRequirements(input.type)}

Overall requirements:
- ${getHskBrief(input.hskLevel)}
- Per-episode length: ${getSeriesEpisodeLengthBriefWithMinimum(input.length)}
- Episodes should connect as a light arc (same setting or characters when natural) while each episode still reads well on its own.
- Episode 1 introduces the situation; episode 2 develops it; episode 3 brings a satisfying close or reflection.
${focusCharactersBrief}

Return JSON with this exact shape:
{
  "seriesTitle": "Chinese series title",
  "seriesTitleTranslation": "Natural English series title for the library",
  "seriesSummary": "One or two English sentences describing the whole series for a library card",
  "episodes": [
    {
      "title": "Chinese title episode 1",
      "titleTranslation": "English lesson title episode 1",
      "summary": "English summary for episode 1 library card",
      "sections": [
        {
          "hanzi": "Chinese text for one section",
          "pinyin": "Matching pinyin for that section",
          "english": "Natural English translation for that section"
        }
      ]
    },
    { "title": "...", "titleTranslation": "...", "summary": "...", "sections": [...] },
    { "title": "...", "titleTranslation": "...", "summary": "...", "sections": [...] }
  ]
}

- "episodes" must contain exactly 3 objects in order (episodes 1, 2, and 3).
- Each episode needs the same section structure as a standalone lesson.
- Every section MUST be an object with non-empty string values for "hanzi", "pinyin", and "english" (no nulls, no missing keys).${POP_CULTURE_GUIDANCE_LESSON}`;

  const first = await fetchSingleSeriesPayloadFromModel(userContent, input.type);
  const withLengths = await ensureSeriesEpisodesMeetMinCjk({
    episodes: first.payload.episodes,
    minCjkPerEpisode: minPerEp,
    hskLevel: input.hskLevel,
    type: input.type,
    seriesTitleTranslation: first.payload.seriesTitleTranslation,
    baseUsage: first.usage,
    baseModel: first.model,
  });

  const parsed = {
    ...first.payload,
    episodes: withLengths.episodes,
  };

  return {
    model: withLengths.model,
    usage: withLengths.usage,
    seriesTitle: parsed.seriesTitle,
    seriesTitleTranslation: parsed.seriesTitleTranslation,
    seriesSummary: parsed.seriesSummary,
    episodes: parsed.episodes.map(mapEpisodeToGenerated),
  };
}

export type GeneratedNextSeriesEpisodeWithUsage = {
  episode: GeneratedSeriesEpisode;
  model: string;
  usage: OpenRouterUsageSnapshot;
};

export async function generateSeriesNextEpisodeWithModel(input: {
  hskLevel: HskLevel;
  type: StoryType;
  length: "short" | "medium" | "long";
  nextEpisodeNumber: number;
  seriesTitle: string;
  seriesTitleTranslation: string;
  seriesSummary: string;
  priorEpisodesContext: string;
}): Promise<GeneratedNextSeriesEpisodeWithUsage> {
  const minCjk = SERIES_EPISODE_MIN_HANZI[input.length];
  const userContent = `You are writing the NEXT episode of an existing Chinese graded-reader series (episode ${input.nextEpisodeNumber} in order). Continue the same story world, voice, and learner level. Do not summarize earlier episodes as a recap lesson — advance the plot or emotional arc naturally.

Series title (Chinese): ${input.seriesTitle}
Series title (English): ${input.seriesTitleTranslation}
Series summary: ${input.seriesSummary}

--- Prior episodes (for continuity; match characters, setting, and tone) ---
${input.priorEpisodesContext}
---

Write ONLY episode ${input.nextEpisodeNumber}.

${getLessonFormatRequirements(input.type)}

Other requirements:
- ${getHskBrief(input.hskLevel)}
- Length: ${getSeriesEpisodeLengthBriefWithMinimum(input.length)}
- Return JSON for a single lesson object with this exact shape:
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
- Every section MUST include non-empty string values for "hanzi", "pinyin", and "english" (no nulls, no missing keys).
- Make the lesson pleasant to read and useful for study.${POP_CULTURE_GUIDANCE_LESSON}`;

  const first = await fetchSingleLessonPayloadFromModel(userContent, input.type);
  const framingLines = `Series: "${input.seriesTitleTranslation}". Episode ${input.nextEpisodeNumber}. Keep text format (${input.type}) when expanding. Continue the arc from the prior episodes excerpt above.`;
  const ensured = await ensureLessonMeetsMinCjk({
    payload: first.payload,
    minCjk,
    hskLevel: input.hskLevel,
    type: input.type,
    framingLines,
    baseUsage: first.usage,
    baseModel: first.model,
  });

  return {
    model: ensured.model,
    usage: ensured.usage,
    episode: mapEpisodeToGenerated(ensured.payload),
  };
}
