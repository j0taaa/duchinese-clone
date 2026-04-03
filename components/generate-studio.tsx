"use client";

import Link from "next/link";
import {
  BookOpenText,
  Layers3,
  Loader2,
  MessageCircleMore,
  NotebookPen,
  ScanSearch,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type AppStory, getHskLabel, type HskLevel } from "@/lib/stories";

const promptSuggestions = [
  "Two classmates trying to find a quiet cafe to study in.",
  "A neighborhood morning where someone buys breakfast before work.",
  "A journal entry about taking the subway home after Chinese class.",
  "Three friends planning a weekend walk by the river.",
];

const creationModes = [
  {
    value: "story",
    label: "Story",
    description: "One standalone lesson to read right away.",
    icon: BookOpenText,
  },
  {
    value: "series",
    label: "Series",
    description: "A collection around one subject. Multi-part generation comes next.",
    icon: Layers3,
  },
] as const;

const lessonTypes = [
  {
    value: "dialogue",
    label: "Dialogue",
    description: "Natural back-and-forth conversation.",
    icon: MessageCircleMore,
  },
  {
    value: "story",
    label: "Narrative",
    description: "A short scene or event with flow.",
    icon: TextCursorInput,
  },
  {
    value: "journal",
    label: "Journal",
    description: "First-person and reflective.",
    icon: NotebookPen,
  },
] as const satisfies ReadonlyArray<{
  value: AppStory["type"];
  label: string;
  description: string;
  icon: typeof MessageCircleMore;
}>;

const hskOptions = [
  { value: "1", label: "HSK 1" },
  { value: "2", label: "HSK 2" },
  { value: "3", label: "HSK 3" },
  { value: "4", label: "HSK 4" },
  { value: "5", label: "HSK 5" },
  { value: "6", label: "HSK 6" },
] as const satisfies ReadonlyArray<{
  value: HskLevel;
  label: string;
}>;

const lengthOptions = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

const visibilityOptions = [
  { value: "private_user", label: "Private" },
  { value: "public_user", label: "Public" },
] as const satisfies ReadonlyArray<{
  value: AppStory["visibility"];
  label: string;
}>;

export function GenerateStudio({
  settingsSummary,
  recentStories,
}: {
  settingsSummary: {
    baseUrl: string;
    model: string;
    hasApiKey: boolean;
    apiKeyHint: string | null;
  } | null;
  recentStories: AppStory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [hskLevel, setHskLevel] = useState<HskLevel>("2");
  const [type, setType] = useState<AppStory["type"]>("dialogue");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const [visibility, setVisibility] =
    useState<AppStory["visibility"]>("private_user");
  const [creationMode, setCreationMode] =
    useState<(typeof creationModes)[number]["value"]>("story");

  const helperCopy = useMemo(() => {
    if (creationMode === "series") {
      return "Choose the tone and difficulty for the first lesson in a new series direction.";
    }

    return "Set the lesson style, length, and difficulty. If you leave the topic empty, HanziLane will pick a random idea.";
  }, [creationMode]);

  function submitGeneration() {
    setError(null);
    setSuccess(null);

    if (creationMode === "series") {
      setError("Series generation UI is ready, but the backend still generates a single lesson for now.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: useCustomTopic ? topic : "",
          hskLevel,
          type,
          length,
          visibility,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        story?: { slug: string; titleTranslation: string };
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to generate a story.");
        return;
      }

      setSuccess(`Saved "${data.story?.titleTranslation ?? "your story"}".`);
      router.push(`/stories/${data.story?.slug}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {!settingsSummary ? (
        <section className="rounded-[24px] border border-[#f0d6ce] bg-[#fff6f3] p-5 text-sm leading-7 text-[#7b5951] shadow-[0_24px_80px_-56px_rgba(92,46,24,0.34)] sm:rounded-[32px] sm:p-7">
          <p className="font-semibold text-[#9f4339]">Model settings missing</p>
          <p className="mt-2">
            Save your `Model URL`, `API key`, and `Model` in your profile before generating.
          </p>
          <Link
            href="/profile"
            prefetch={false}
            className="mt-5 inline-flex rounded-full bg-[#ea4e47] px-4 py-2 font-medium text-white"
          >
            Open profile
          </Link>
        </section>
      ) : (
        <section className="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] sm:rounded-[34px] sm:p-7 xl:p-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#edd8cf] bg-[#fff7f3] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#c66052] uppercase">
                  <Sparkles className="size-3.5" />
                  AI lesson builder
                </p>
                <h1 className="text-[1.45rem] font-semibold tracking-tight text-[#241815] sm:text-4xl">
                  Generate something new to read
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-[#6d615b] sm:leading-7">
                  {helperCopy}
                </p>
              </div>

              <div className="self-start rounded-full border border-[#eadcd2] bg-[#fcf8f4] px-4 py-2 text-sm text-[#6c5f58]">
                {recentStories.length} saved {recentStories.length === 1 ? "lesson" : "lessons"}
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
              {creationModes.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCreationMode(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition-all sm:gap-4 sm:rounded-[28px] sm:px-5 sm:py-5",
                      creationMode === option.value
                        ? "border-[#f0cfc1] bg-[#fff7f3] shadow-[0_16px_40px_-28px_rgba(92,46,24,0.28)]"
                        : "border-[#ecdfd5] bg-[#fcfaf7] hover:border-[#e3d2c7] hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-2xl sm:size-11",
                        creationMode === option.value
                          ? "bg-[#ea4e47] text-white"
                          : "bg-white text-[#715f57]",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-[0.95rem] font-semibold text-[#241815] sm:text-lg">
                        {option.label}
                      </span>
                      <span className="block text-sm leading-5 text-[#6d615b] sm:leading-6">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 rounded-[22px] border border-[#ece0d7] bg-[#fcfaf7] p-4 sm:rounded-[30px] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-[#4f433d]">
                    <ScanSearch className="size-4" />
                    Topic or direction
                  </p>
                  <p className="text-sm leading-5 text-[#6d615b] sm:leading-6">
                    Leave this off for a random idea, or turn it on to guide the generation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUseCustomTopic((current) => !current)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    useCustomTopic
                      ? "border-[#f0cfc1] bg-[#fff0ea] text-[#b25045]"
                      : "border-[#e5d8cf] bg-white text-[#5f534d] hover:bg-[#faf4ef]",
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      useCustomTopic ? "bg-[#ea4e47]" : "bg-[#d4c5bc]",
                    )}
                  />
                  {useCustomTopic ? "Using custom topic" : "Use random topic"}
                </button>
              </div>

              {useCustomTopic ? (
                <>
                  <textarea
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Describe the scene, setting, or subject you want."
                    className="min-h-36 w-full rounded-[20px] border border-[#e4d8cf] bg-white px-4 py-4 text-sm leading-6 text-[#241815] outline-none transition-colors placeholder:text-[#a2958e] focus:border-[#d8b1a6] sm:min-h-44 sm:rounded-[28px] sm:px-5 sm:leading-7"
                  />

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {promptSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTopic(item)}
                        className="rounded-full border border-[#e8dacf] bg-white px-4 py-2 text-sm text-[#564943] hover:bg-[#faf4ef]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.25fr_0.95fr]">
              <div className="space-y-4 rounded-[22px] border border-[#ece0d7] bg-[#fcfaf7] p-4 sm:rounded-[30px] sm:p-5">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#4f433d]">Lesson format</p>
                  <p className="text-sm leading-5 text-[#6d615b] sm:leading-6">
                    Pick the style that best matches the reading experience you want.
                  </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {lessonTypes.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value)}
                        className={cn(
                          "rounded-[18px] border px-3.5 py-3.5 text-left transition-all sm:rounded-[24px] sm:px-4 sm:py-4",
                          type === option.value
                            ? "border-[#f0cfc1] bg-[#fff7f3]"
                            : "border-[#eadcd2] bg-white hover:bg-[#fffdfa]",
                        )}
                      >
                        <span
                          className={cn(
                            "mb-3 inline-flex size-10 items-center justify-center rounded-2xl",
                            type === option.value
                              ? "bg-[#ea4e47] text-white"
                              : "bg-[#f8f2ec] text-[#6b5950]",
                          )}
                        >
                          <Icon className="size-4.5" />
                        </span>
                        <p className="text-sm font-semibold text-[#241815] sm:text-base">
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-[#6d615b] sm:leading-6">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 rounded-[22px] border border-[#ece0d7] bg-[#fcfaf7] p-4 sm:rounded-[30px] sm:p-5">
                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  <SelectPills
                    label="HSK level"
                    value={hskLevel}
                    onChange={setHskLevel}
                    options={hskOptions}
                  />
                  <SelectPills
                    label="Length"
                    value={length}
                    onChange={setLength}
                    options={lengthOptions}
                  />
                  <SelectPills
                    label="Visibility"
                    value={visibility}
                    onChange={setVisibility}
                    options={visibilityOptions}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-[20px] border border-[#f2c2bc] bg-[#fff2f0] px-4 py-3 text-sm text-[#a03d34]">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-[20px] border border-[#d6efe7] bg-[#f4fcf8] px-4 py-3 text-sm text-[#2f7a65]">
                {success}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-2xl bg-[#ea4e47] px-6 text-white hover:bg-[#dd433d] sm:h-13 sm:px-7"
                onClick={submitGeneration}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : creationMode === "series" ? (
                  <Layers3 className="size-4" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {creationMode === "series" ? "Generate series" : "Generate story"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl border-[#e4d8cf] bg-white px-5 text-[#473b35] hover:bg-[#faf4ef] sm:h-13 sm:px-6"
                onClick={() => {
                  setTopic("");
                  setUseCustomTopic(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_-56px_rgba(92,46,24,0.32)] sm:rounded-[32px] sm:p-7">
        <div className="space-y-1">
          <h2 className="text-[1rem] font-semibold tracking-tight text-[#241815] sm:text-2xl">
            Recent generated stories
          </h2>
          <p className="text-sm leading-6 text-[#6f625c]">
            Everything generated here is saved on the server for your account.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {recentStories.length ? (
            recentStories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                prefetch={false}
                className="block rounded-[20px] border border-[#eadcd2] bg-[#fcf8f4] px-4 py-4 transition-colors hover:bg-white sm:rounded-[24px] sm:px-5 sm:py-5"
              >
                <p className="text-sm font-semibold text-[#241815]">
                  {story.titleTranslation}
                </p>
                <p className="mt-2 font-reading text-[1.5rem] text-[#3a2c27] sm:text-3xl">
                  {story.title}
                </p>
                <p className="mt-3 text-xs text-[#7b6f69]">
                  {getHskLabel(story.hskLevel)} •{" "}
                  {story.visibility === "public_user" ? "Public" : "Private"}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-[#e0d3ca] bg-[#fcf8f4] px-4 py-8 text-sm text-[#72655e] sm:rounded-[24px] sm:px-5 sm:py-10">
              No generated stories yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SelectPills<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#4f433d]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              value === option.value
                ? "border-[#f0cfc1] bg-[#fff0ea] text-[#b25045]"
                : "border-[#e5d8cf] bg-white text-[#5f534d] hover:bg-[#faf4ef]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
