import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Eye } from "lucide-react";

import { getStoryArtwork } from "@/lib/story-art";
import { type AppStory, getHskLabel, hskLevelMeta } from "@/lib/stories";

import { cn } from "@/lib/utils";

export function SeriesEpisodesList({
  stories,
  readStoryIds,
  viewCounts,
  footer,
}: {
  stories: AppStory[];
  readStoryIds: string[];
  viewCounts: Map<string, number>;
  /** Extra block below the episode list (e.g. owner-only generate next episode). */
  footer?: ReactNode;
}) {
  const readSet = new Set(readStoryIds);

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#ebe2da] bg-[linear-gradient(165deg,rgba(255,255,255,0.97)_0%,rgba(252,248,244,0.96)_45%,rgba(248,242,236,0.94)_100%)] shadow-[0_24px_70px_-48px_rgba(92,46,24,0.35)]">
      <div className="border-b border-[#efe6de] bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#b07f72]">
          Episodes
        </p>
        <p className="mt-1 text-sm leading-6 text-[#6d615b]">
          Read in order, or jump to any lesson. Your place is saved automatically.
        </p>
      </div>

      <ol className="divide-y divide-[#f0e8e2]">
        {stories.map((story, index) => {
          const episode = index + 1;
          const isRead = readSet.has(story.id);
          const hskMeta = hskLevelMeta[story.hskLevel];
          const artwork = getStoryArtwork(story.id || story.slug || story.title);
          const views = viewCounts.get(story.id) ?? 0;

          return (
            <li key={story.id}>
              <Link
                href={`/stories/${story.slug}`}
                prefetch={false}
                className={cn(
                  "group flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-stretch sm:gap-5 sm:p-5 md:p-6",
                  "hover:bg-[#fffdfb]",
                  isRead && "bg-[linear-gradient(90deg,rgba(243,251,243,0.65)_0%,rgba(255,255,255,0)_min(52%,28rem))]",
                )}
              >
                <div className="flex flex-shrink-0 items-start gap-3 sm:items-center sm:gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl border-2 text-center font-semibold tabular-nums shadow-sm transition-colors sm:size-14",
                      isRead
                        ? "border-[#b8dcc0] bg-[#f3fbf3] text-[#2d6b36]"
                        : "border-[#f0cfc1] bg-[#fff7f3] text-[#c66052]",
                    )}
                  >
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#9a8f88]">
                      Ep
                    </span>
                    <span className="text-lg leading-none sm:text-xl">{episode}</span>
                  </div>

                  <div
                    className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-2xl border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:h-[6.25rem] sm:w-[6.25rem]"
                    style={{ backgroundImage: artwork.surface }}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
                    <div className="relative z-10 flex h-full items-center justify-center px-2 text-center">
                      <span className="font-reading text-[1.15rem] leading-none tracking-[0.06em] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.2)] sm:text-[1.35rem]">
                        {story.emojiTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium sm:text-xs",
                        hskMeta.chipClass,
                      )}
                    >
                      {getHskLabel(story.hskLevel)}
                    </span>
                    {story.visibility === "private_user" ? (
                      <span className="rounded-full border border-[#e8dfd6] bg-white/90 px-2.5 py-0.5 text-[0.68rem] font-medium text-[#6f625c] sm:text-xs">
                        Private
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#e8dfd6] bg-white/90 px-2.5 py-0.5 text-[0.68rem] font-medium text-[#6f625c] sm:text-xs">
                        {story.visibility === "public_seeded" ? "Starter" : "Public"}
                      </span>
                    )}
                    {isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#c8e6ca] bg-[#f3fbf3] px-2.5 py-0.5 text-[0.68rem] font-medium text-[#2f6a36] sm:text-xs">
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#f5ddd8] bg-[#fff5f2] px-2.5 py-0.5 text-[0.68rem] font-medium text-[#b25045] sm:text-xs">
                        Not read yet
                      </span>
                    )}
                    {views > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[0.68rem] text-[#8a7d76] sm:text-xs">
                        <Eye className="size-3.5" />
                        {views.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 font-reading text-[1.35rem] leading-tight text-[#241815] transition-colors group-hover:text-[#c04a42] sm:text-[1.55rem]">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#6f625c] sm:text-base">
                    {story.titleTranslation}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[0.82rem] leading-6 text-[#7a6e67] sm:text-sm sm:leading-7">
                    {story.summary}
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-end sm:flex-col sm:items-end sm:justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#eadcd2] bg-white px-3 py-2 text-sm font-medium text-[#5a4d47] shadow-sm transition-all group-hover:border-[#f0cfc1] group-hover:bg-[#fff7f3] group-hover:text-[#b25045]">
                    Open
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      {footer}
    </div>
  );
}
