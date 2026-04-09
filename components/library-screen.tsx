"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { SeriesCard } from "@/components/series-card";
import { StoryCard } from "@/components/story-card";
import { partitionStoriesIntoSeriesAndStandalone, type AppSeries } from "@/lib/series";
import { type AppStory, getHskLabel, hskLevelValues } from "@/lib/stories";
import {
  filterSeriesByQueryAndHsk,
  filterStoriesByQueryAndHsk,
} from "@/shared/content-utils";

const filterOptions = ["all", ...hskLevelValues] as const;

export function filterStoriesByLibraryControls(input: {
  stories: AppStory[];
  filter: (typeof filterOptions)[number];
  query: string;
}) {
  return filterStoriesByQueryAndHsk(input.stories, input.query, input.filter);
}

export function LibraryScreen({
  publicStories,
  publicSeries,
  latestUserStories,
  readStoryIds,
  signedIn,
  storyViewCounts,
}: {
  publicStories: AppStory[];
  publicSeries: AppSeries[];
  latestUserStories: AppStory[];
  readStoryIds: string[];
  signedIn: boolean;
  storyViewCounts?: Map<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("all");

  const filteredStories = useMemo(() => {
    return filterStoriesByLibraryControls({
      stories: publicStories,
      filter,
      query,
    });
  }, [filter, publicStories, query]);

  const { series: latestUserSeriesRaw, standalone: latestStandaloneRaw } = useMemo(
    () => partitionStoriesIntoSeriesAndStandalone(latestUserStories),
    [latestUserStories],
  );

  const filteredLatestUserSeries = useMemo(() => {
    return filterSeriesByQueryAndHsk(latestUserSeriesRaw, query, filter);
  }, [filter, latestUserSeriesRaw, query]);

  const filteredLatestStandalone = useMemo(() => {
    return filterStoriesByLibraryControls({
      stories: latestStandaloneRaw,
      filter,
      query,
    });
  }, [filter, latestStandaloneRaw, query]);

  const showLatestUserSection =
    signedIn &&
    (filteredLatestUserSeries.length > 0 || filteredLatestStandalone.length > 0);

  const filteredSeries = useMemo(() => {
    return filterSeriesByQueryAndHsk(publicSeries, query, filter);
  }, [filter, publicSeries, query]);

  const starterStories = filteredStories.filter((story) => story.isSeeded);
  const communityStories = filteredStories.filter((story) => !story.isSeeded);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-5 sm:py-6 xl:px-6">
      <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,247,243,0.94))] p-4 shadow-[0_20px_60px_-50px_rgba(92,46,24,0.35)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#b07f72]">
                Browse Library
              </span>
              <span className="hidden h-px flex-1 bg-[#ead9cf] sm:block" />
            </div>

            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9e918a]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, summaries, and excerpts…"
                className="h-11 w-full rounded-2xl border border-[#e7d8cf] bg-white pl-11 pr-4 text-sm text-[#241815] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a2958e] focus:border-[#d8b1a6] focus:bg-[#fffdfa] focus:shadow-[0_0_0_4px_rgba(234,78,71,0.08)]"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-[#ede0d6] bg-white/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] lg:max-w-[38rem]">
            <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 sm:flex-wrap sm:overflow-visible">
              {filterOptions.map((option) => {
                const active = filter === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={[
                      "shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-all",
                      active
                        ? "bg-[#ea4e47] text-white shadow-[0_12px_24px_-18px_rgba(234,78,71,0.9)]"
                        : "bg-transparent text-[#5a4d47] hover:bg-[#f8f1eb]",
                    ].join(" ")}
                  >
                    {option === "all" ? "All levels" : getHskLabel(option)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showLatestUserSection ? (
        <div className="space-y-8 sm:space-y-10">
          {filteredLatestUserSeries.length ? (
            <SeriesSection
              title="Your latest series"
              description="Multi-part lessons you generated, shown as one collection each."
              series={filteredLatestUserSeries}
              readStoryIds={readStoryIds}
              storyViewCounts={storyViewCounts}
            />
          ) : null}
          {filteredLatestStandalone.length ? (
            <LibrarySection
              title={
                filteredLatestUserSeries.length
                  ? "Your latest single lessons"
                  : "Your latest stories"
              }
              description={
                filteredLatestUserSeries.length
                  ? "Stand-alone generations not grouped into a series above."
                  : "Freshly generated lessons attached to your account."
              }
              stories={filteredLatestStandalone}
              readStoryIds={readStoryIds}
              storyViewCounts={storyViewCounts}
            />
          ) : null}
        </div>
      ) : null}

      {filteredSeries.length ? (
        <SeriesSection
          title="Series"
          description="Collections of lessons around the same subject."
          series={filteredSeries}
          readStoryIds={readStoryIds}
          storyViewCounts={storyViewCounts}
        />
      ) : null}

      <LibrarySection
        title="Starter library"
        description="Bundled public lessons ready to read without signing in."
        stories={starterStories}
        readStoryIds={readStoryIds}
        storyViewCounts={storyViewCounts}
      />

      {communityStories.length ? (
        <LibrarySection
          title="Public community stories"
          description="User-generated lessons that have been published."
          stories={communityStories}
          readStoryIds={readStoryIds}
          storyViewCounts={storyViewCounts}
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
  storyViewCounts,
}: {
  title: string;
  description: string;
  series: AppSeries[];
  readStoryIds: string[];
  storyViewCounts?: Map<string, number>;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-[#271d18] sm:text-xl">
          {title}
        </h2>
        <p className="text-xs leading-5 text-[#6d615b]">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {series.map((entry) => {
          const totalViews = entry.stories.reduce(
            (sum, story) => sum + (storyViewCounts?.get(story.id) ?? 0),
            0
          );
          return (
            <SeriesCard
              key={entry.slug}
              series={entry}
              readCount={entry.stories.filter((story) => readStoryIds.includes(story.id)).length}
              totalViews={totalViews}
            />
          );
        })}
      </div>
    </section>
  );
}

function LibrarySection({
  title,
  description,
  stories,
  readStoryIds,
  storyViewCounts,
}: {
  title: string;
  description: string;
  stories: AppStory[];
  readStoryIds: string[];
  storyViewCounts?: Map<string, number>;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-[#271d18] sm:text-xl">
          {title}
        </h2>
        <p className="text-xs leading-5 text-[#6d615b]">{description}</p>
      </div>
      {stories.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isRead={readStoryIds.includes(story.id)}
              viewCount={storyViewCounts?.get(story.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#e0d3ca] bg-white/70 px-4 py-6 text-xs text-[#72655e] sm:rounded-[24px] sm:px-5 sm:py-8">
          No stories match this filter yet.
        </div>
      )}
    </section>
  );
}
