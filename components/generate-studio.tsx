"use client";

import Link from "next/link";
import { Loader2, Sparkles, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { type AppStory, getLevelLabel } from "@/lib/stories";

const promptSuggestions = [
  "Two coworkers deciding where to eat after work in Shanghai.",
  "A beginner story about shopping for fruit at a neighborhood market.",
  "A diary entry about studying Chinese on the subway ride home.",
];

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
  const [level, setLevel] = useState<AppStory["level"]>("elementary");
  const [type, setType] = useState<AppStory["type"]>("dialogue");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const [visibility, setVisibility] =
    useState<AppStory["visibility"]>("private_user");

  function submitGeneration() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          level,
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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] xl:p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
            <WandSparkles className="size-3.5" />
            AI Story Generator
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#241815] sm:text-4xl">
              Generate a new Chinese lesson from your own model settings
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#6a5b55] sm:text-base">
              Choose a topic, difficulty, lesson shape, and privacy level. The app
              will call your saved OpenAI-compatible endpoint, validate the JSON
              response, and store the result in Postgres under your account.
            </p>
          </div>
        </div>

        {!settingsSummary ? (
          <div className="mt-6 rounded-[24px] border border-[#f0d6ce] bg-[#fff6f3] p-5 text-sm leading-7 text-[#7b5951]">
            <p className="font-semibold text-[#9f4339]">Model settings missing</p>
            <p className="mt-2">
              Save your `Model URL`, `API key`, and `Model` first.
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex rounded-full bg-[#ea4e47] px-4 py-2 font-medium text-white"
            >
              Open settings
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#4f433d]">
                  Topic or prompt
                </span>
                <textarea
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Example: Two friends meeting after work and trying to decide whether to get noodles or dumplings."
                  className="min-h-40 w-full rounded-[24px] border border-[#e4d8cf] bg-[#fcfaf7] px-5 py-4 text-sm leading-7 text-[#241815] outline-none transition-colors placeholder:text-[#a2958e] focus:border-[#d8b1a6]"
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-4">
                <Select
                  label="Level"
                  value={level}
                  onChange={setLevel}
                  options={[
                    { value: "beginner", label: "Beginner" },
                    { value: "elementary", label: "Elementary" },
                    { value: "intermediate", label: "Intermediate" },
                  ]}
                />
                <Select
                  label="Lesson type"
                  value={type}
                  onChange={setType}
                  options={[
                    { value: "dialogue", label: "Dialogue" },
                    { value: "story", label: "Story" },
                    { value: "journal", label: "Journal" },
                  ]}
                />
                <Select
                  label="Length"
                  value={length}
                  onChange={setLength}
                  options={[
                    { value: "short", label: "Short" },
                    { value: "medium", label: "Medium" },
                    { value: "long", label: "Long" },
                  ]}
                />
                <Select
                  label="Visibility"
                  value={visibility}
                  onChange={setVisibility}
                  options={[
                    { value: "private_user", label: "Private" },
                    { value: "public_user", label: "Public" },
                  ]}
                />
              </div>

              <div className="flex flex-wrap gap-3">
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

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-2xl bg-[#ea4e47] px-6 text-white hover:bg-[#dd433d]"
                  onClick={submitGeneration}
                  disabled={isPending || !topic.trim()}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Generate story
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-2xl border-[#e4d8cf] bg-white px-6 text-[#473b35] hover:bg-[#faf4ef]"
                  onClick={() => {
                    setTopic("");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-8 rounded-[26px] border border-[#efe3d9] bg-[#fcf8f4] p-5">
              <p className="text-sm font-semibold text-[#241815]">
                Current server-side model settings
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <InfoTile label="Model URL" value={settingsSummary.baseUrl} />
                <InfoTile label="Model" value={settingsSummary.model} />
                <InfoTile
                  label="API key"
                  value={settingsSummary.apiKeyHint ?? "Saved"}
                />
              </div>
            </div>
          </>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-[28px] border border-[#efe3db] bg-white/86 p-6">
          <h2 className="text-xl font-semibold text-[#241815]">
            Recent generated stories
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f625c]">
            Every successful generation is stored on the server for your account.
          </p>
          <div className="mt-4 space-y-3">
            {recentStories.length ? (
              recentStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="block rounded-[20px] border border-[#eadcd2] bg-[#fcf8f4] px-4 py-4 transition-colors hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#241815]">
                    {story.titleTranslation}
                  </p>
                  <p className="mt-1 font-reading text-2xl text-[#3a2c27]">
                    {story.title}
                  </p>
                  <p className="mt-2 text-xs text-[#7b6f69]">
                    {getLevelLabel(story.level)} •{" "}
                    {story.visibility === "public_user" ? "Public" : "Private"}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#e0d3ca] bg-[#fcf8f4] px-4 py-8 text-sm text-[#72655e]">
                No generated stories yet.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#4f433d]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-12 w-full rounded-2xl border border-[#e4d8cf] bg-[#fcfaf7] px-4 text-sm text-[#241815] outline-none transition-colors focus:border-[#d8b1a6]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadcd2] bg-white px-4 py-4">
      <p className="text-xs tracking-[0.12em] text-[#84766e] uppercase">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-[#241815]">
        {value}
      </p>
    </div>
  );
}
