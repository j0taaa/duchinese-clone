"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { SeriesCard } from "@/components/series-card";
import { StoryCard } from "@/components/story-card";
import { type AppSeries } from "@/lib/series";
import { type AppStory, getLevelLabel, storyLevelValues } from "@/lib/stories";

const filterOptions = ["all", ...storyLevelValues] as const;

export function LibraryScreen({
  publicStories,
  publicSeries,
  latestUserStories,
  readStoryIds,
  signedIn,
}: {
  publicStories: AppStory[];
  publicSeries: AppSeries[];
  latestUserStories: AppStory[];
  readStoryIds: string[];
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

  const filteredSeries = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return publicSeries.filter((series) => {
      const matchesLevel = filter === "all" ? true : series.level === filter;
      const matchesQuery = needle
        ? [
            series.title,
            series.titleTranslation,
            series.summary,
            ...series.stories.flatMap((story) => [
              story.title,
              story.titleTranslation,
              story.summary,
            ]),
          ]
            .join(" ")
            .toLowerCase()
            .includes(needle)
        : true;

      return matchesLevel && matchesQuery;
    });
  }, [filter, publicSeries, query]);

  const starterStories = filteredStories.filter((story) => story.isSeeded);
  const communityStories = filteredStories.filter((story) => !story.isSeeded);

  return (
    <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <section className="space-y-4 rounded-[30px] border border-white/70 bg-white/86 p-5 shadow-[0_24px_80px_-56px_rgba(92,46,24,0.38)] backdrop-blur sm:p-6">
        <div className="max-w-xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9e918a]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, summaries, and excerpts…"
              className="h-12 w-full rounded-2xl border border-[#e7d8cf] bg-white pl-11 pr-4 text-sm text-[#241815] outline-none transition-colors placeholder:text-[#a2958e] focus:border-[#d8b1a6]"
            />
          </label>
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
      </section>

      {signedIn && latestUserStories.length ? (
        <LibrarySection
          title="Your latest stories"
          description="Freshly generated lessons attached to your account."
          stories={latestUserStories}
          readStoryIds={readStoryIds}
        />
      ) : null}

      {filteredSeries.length ? (
        <SeriesSection
          title="Series"
          description="Collections of lessons around the same subject."
          series={filteredSeries}
          readStoryIds={readStoryIds}
        />
      ) : null}

      <LibrarySection
        title="Starter library"
        description="Bundled public lessons ready to read without signing in."
        stories={starterStories}
        readStoryIds={readStoryIds}
      />

      {communityStories.length ? (
        <LibrarySection
          title="Public community stories"
          description="User-generated lessons that have been published."
          stories={communityStories}
          readStoryIds={readStoryIds}
        />
      ) : null}
    </div>
  );
}

function SeriesSection({
  title,
  description,
  series,
  readStoryIds,
}: {
  title: string;
  description: string;
  series: AppSeries[];
  readStoryIds: string[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-[#271d18]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[#6d615b]">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {series.map((entry) => (
          <SeriesCard
            key={entry.slug}
            series={entry}
            readCount={entry.stories.filter((story) => readStoryIds.includes(story.id)).length}
          />
        ))}
      </div>
    </section>
  );
}

function LibrarySection({
  title,
  description,
  stories,
  readStoryIds,
}: {
  title: string;
  description: string;
  stories: AppStory[];
  readStoryIds: string[];
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
            <StoryCard
              key={story.id}
              story={story}
              isRead={readStoryIds.includes(story.id)}
            />
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
