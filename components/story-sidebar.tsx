import Link from "next/link";
import { CheckCircle2, Layers3, Menu, PlayCircle } from "lucide-react";

import { type AppSeries } from "@/lib/series";
import { type AppStory, getHskLabel, hskLevelMeta } from "@/lib/stories";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type StorySidebarProps = {
  stories: AppStory[];
  activeSlug?: string;
  hideDesktop?: boolean;
};

export function StorySidebar({
  stories,
  activeSlug,
  hideDesktop = false,
}: StorySidebarProps) {
  return (
    <>
      <div className="fixed right-4 top-24 z-30 xl:hidden">
        <Sheet>
          <SheetTrigger className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#eadcd2] bg-white px-4 text-sm font-medium text-[#2a2a2a] shadow-sm transition-colors hover:bg-[#f9f4ef]">
            <Menu className="size-4" />
            Stories
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[88vw] max-w-sm border-r-[#e3d9d0] bg-[#faf5ef] p-0"
          >
            <SheetTitle className="sr-only">Stories</SheetTitle>
            <SidebarContent
              stories={stories}
              activeSlug={activeSlug}
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={
          hideDesktop
            ? "hidden"
            : "hidden"
        }
      >
        <div className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/86 shadow-[0_18px_60px_-46px_rgba(80,45,24,0.3)] backdrop-blur">
          <SidebarContent
            stories={stories}
            activeSlug={activeSlug}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarContent({
  stories,
  activeSlug,
}: StorySidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#efe3d9] px-6 py-6">
        <p className="text-[1.3rem] font-semibold tracking-tight text-[#1f1b18] sm:text-[1.55rem]">
          Lessons
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              prefetch={false}
              className={[
                "block rounded-[22px] border px-4 py-4 transition-colors",
                activeSlug === story.slug
                  ? "border-[#efd8cf] bg-[#fff7f4]"
                  : "border-transparent bg-transparent hover:bg-[#f7f1ea]",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center gap-2 text-sm text-[#666]">
                <span
                  className={[
                    "size-3 rounded-full",
                    hskLevelMeta[story.hskLevel].dotClass,
                  ].join(" ")}
                />
                <span>{getHskLabel(story.hskLevel)}</span>
              </div>
              <p className="text-base font-medium leading-6 text-[#202020] sm:text-lg sm:leading-7">
                {story.titleTranslation}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#757575]">
                {story.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SeriesEpisodesSidebar({
  series,
  activeSlug,
  readStoryIds = [],
}: {
  series: AppSeries;
  activeSlug: string;
  readStoryIds?: string[];
}) {
  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-[92px] rounded-[30px] border border-white/70 bg-white/90 shadow-[0_18px_60px_-46px_rgba(80,45,24,0.3)] backdrop-blur">
        <div className="border-b border-[#efe3d9] px-6 py-6">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[#8b6759]">
            <Layers3 className="size-4" />
            Series episodes
          </p>
          <p className="mt-2 text-[1.2rem] font-semibold tracking-tight text-[#1f1b18] sm:text-[1.45rem]">
            {series.titleTranslation}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6b615c]">
            Read through the full sequence in order.
          </p>
        </div>

        <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {series.stories.map((story, index) => {
              const isActive = activeSlug === story.slug;
              const isRead = readStoryIds.includes(story.id);

              return (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  prefetch={false}
                  className={[
                    "block rounded-[22px] border px-4 py-4 transition-colors",
                    isActive
                      ? "border-[#efd8cf] bg-[#fff7f4]"
                      : "border-[#efe3d9] bg-[#fcf8f4] hover:bg-white",
                  ].join(" ")}
                >
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                    <span className="rounded-full border border-[#ead9cf] bg-white px-2.5 py-1 text-xs font-medium text-[#7d6b61]">
                      Episode {index + 1}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#f0d8cd] bg-[#fff1ea] px-2.5 py-1 text-xs text-[#ba5a4d]">
                        <PlayCircle className="size-3.5" />
                        Current
                      </span>
                    ) : isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2.5 py-1 text-xs text-[#4f8454]">
                        <CheckCircle2 className="size-3.5" />
                        Read
                      </span>
                    ) : null}
                  </div>

                  <p className="text-base font-medium leading-6 text-[#202020] sm:text-lg sm:leading-7">
                    {story.titleTranslation}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#757575]">
                    {story.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function RecommendedLessons({
  stories,
  activeSlug,
  series,
  readStoryIds = [],
}: Pick<StorySidebarProps, "stories" | "activeSlug"> & {
  series?: AppSeries | null;
  readStoryIds?: string[];
}) {
  return (
    <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.28)] sm:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-[#241815] sm:text-2xl">
          Recommended lessons
        </h2>
        <p className="text-sm leading-6 text-[#6c625d]">
          Keep reading with another lesson from your library.
        </p>
      </div>

      {series ? <SeriesCallout series={series} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.slug}`}
            prefetch={false}
            className={[
              "block rounded-[22px] border px-4 py-4 transition-colors",
              activeSlug === story.slug
                ? "border-[#efd8cf] bg-[#fff7f4]"
                : "border-[#efe3d9] bg-[#fcf8f4] hover:bg-white",
            ].join(" ")}
          >
            <div className="mb-3 flex items-center gap-2 text-sm text-[#666]">
              <span
                className={[
                  "size-3 rounded-full",
                  hskLevelMeta[story.hskLevel].dotClass,
                ].join(" ")}
              />
              <span>{getHskLabel(story.hskLevel)}</span>
              {readStoryIds.includes(story.id) ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2 py-0.5 text-xs text-[#4f8454]">
                  <CheckCircle2 className="size-3" />
                  Read
                </span>
              ) : null}
            </div>
            <p className="text-base font-medium leading-6 text-[#202020] sm:text-lg sm:leading-7">
              {story.titleTranslation}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#757575]">{story.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SeriesCallout({ series }: { series: AppSeries }) {
  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch={false}
      className="flex items-start justify-between gap-4 rounded-[24px] border border-[#eadcd2] bg-[#fff8f3] px-5 py-4 transition-colors hover:bg-white"
    >
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-[#8b6759]">
          <Layers3 className="size-4" />
          Part of a series
        </p>
        <p className="text-base font-semibold tracking-tight text-[#241815] sm:text-lg">
          {series.titleTranslation}
        </p>
        <p className="text-sm leading-6 text-[#6c625d]">{series.summary}</p>
      </div>
      <span className="shrink-0 rounded-full border border-[#ead6cb] bg-white px-3 py-1 text-xs font-medium text-[#7a5a4f]">
        {series.stories.length} lessons
      </span>
    </Link>
  );
}
