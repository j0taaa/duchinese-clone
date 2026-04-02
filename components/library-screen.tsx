"use client";

import type { ReactNode } from "react";
import { Compass, LibraryBig, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { StoryCard } from "@/components/story-card";
import { type AppStory, getLevelLabel, storyLevelValues } from "@/lib/stories";

const filterOptions = ["all", ...storyLevelValues] as const;

export function LibraryScreen({
  publicStories,
  latestUserStories,
  signedIn,
}: {
  publicStories: AppStory[];
  latestUserStories: AppStory[];
  signedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("all");

  const filteredStories = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return publicStories.filter((story) => {
      const matchesLevel = filter === "all" ? true : story.level === filter;
      const matchesQuery = needle
        ? [story.title, story.titleTranslation, story.summary, story.excerpt]
            .join(" ")
            .toLowerCase()
            .includes(needle)
        : true;

      return matchesLevel && matchesQuery;
    });
  }, [filter, publicStories, query]);

  const starterStories = filteredStories.filter((story) => story.isSeeded);
  const communityStories = filteredStories.filter((story) => !story.isSeeded);

  return (
    <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <section className="grid gap-6 rounded-[34px] border border-white/70 bg-white/86 p-6 shadow-[0_26px_90px_-58px_rgba(92,46,24,0.42)] backdrop-blur xl:grid-cols-[minmax(0,1fr)_360px] xl:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
            <Compass className="size-3.5" />
            Read Chinese naturally
          </div>

          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#241815] sm:text-5xl">
              Public Chinese lessons for reading practice, plus AI-generated stories in your own library
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#6a5b55] sm:text-base">
              Browse the seeded public library right away. Sign in to save your own
              model settings, generate fresh lessons, and keep them synced in
              Postgres across devices.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={
                  filter === option
                    ? "rounded-full bg-[#ea4e47] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_28px_-20px_rgba(234,78,71,0.8)]"
                    : "rounded-full border border-[#ead9cf] bg-white px-4 py-2 text-sm text-[#554842] hover:bg-[#faf4ef]"
                }
              >
                {option === "all" ? "All levels" : getLevelLabel(option)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-[#efe2d8] bg-[#fcf8f4] p-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9e918a]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, summaries, and excerpts…"
              className="h-12 w-full rounded-2xl border border-[#e7d8cf] bg-white pl-11 pr-4 text-sm text-[#241815] outline-none transition-colors placeholder:text-[#a2958e] focus:border-[#d8b1a6]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <QuickStat icon={<LibraryBig className="size-4" />} label="Public stories" value={String(publicStories.length)} />
            <QuickStat icon={<Sparkles className="size-4" />} label="Your recent stories" value={String(latestUserStories.length)} />
            <QuickStat icon={<Compass className="size-4" />} label="Signed in" value={signedIn ? "Yes" : "No"} />
          </div>
        </div>
      </section>

      {signedIn && latestUserStories.length ? (
        <LibrarySection
          title="Your latest stories"
          description="Freshly generated lessons attached to your account."
          stories={latestUserStories}
        />
      ) : null}

      <LibrarySection
        title="Starter library"
        description="Bundled public lessons ready to read without signing in."
        stories={starterStories}
      />

      {communityStories.length ? (
        <LibrarySection
          title="Public community stories"
          description="User-generated lessons that have been published."
          stories={communityStories}
        />
      ) : null}
    </div>
  );
}

function LibrarySection({
  title,
  description,
  stories,
}: {
  title: string;
  description: string;
  stories: AppStory[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-[#271d18]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[#6d615b]">{description}</p>
      </div>
      {stories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#e0d3ca] bg-white/70 px-6 py-10 text-sm text-[#72655e]">
          No stories match this filter yet.
        </div>
      )}
    </section>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadcd2] bg-white px-4 py-4">
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
        {icon}
      </div>
      <p className="text-xl font-semibold text-[#241815]">{value}</p>
      <p className="text-xs tracking-[0.12em] text-[#887b73] uppercase">{label}</p>
    </div>
  );
}
