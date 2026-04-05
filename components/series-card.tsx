import Link from "next/link";
import { CheckCircle2, Eye, Layers3 } from "lucide-react";

import { type AppSeries } from "@/lib/series";
import { getStoryArtwork } from "@/lib/story-art";
import { getHskLabel, hskLevelMeta } from "@/lib/stories";

export function SeriesCard({
  series,
  readCount = 0,
  totalViews = 0,
}: {
  series: AppSeries;
  readCount?: number;
  totalViews?: number;
}) {
  const artwork = getStoryArtwork(series.slug || series.title);
  const hskMeta = hskLevelMeta[series.hskLevel];
  const totalStories = series.stories.length;
  const progress = totalStories ? Math.min(100, (readCount / totalStories) * 100) : 0;

  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch={false}
      className="group flex min-w-0 flex-col rounded-[18px] border border-[#e7ddd4] bg-[#fffdfa] p-2.5 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.38)] sm:rounded-[20px] sm:p-3"
    >
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-3">
        <div
          className="relative overflow-hidden rounded-[14px] border border-white/40 p-2.5 sm:rounded-[16px] sm:p-3"
          style={{ backgroundImage: artwork.surface }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
          <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0))]" />
          <div className="relative z-10 flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-full border border-white/35 bg-white/18 px-1.5 py-0.5 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop-blur-sm">
              Series
            </span>
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
              <Layers3 className="size-3" />
            </span>
          </div>
          <div className="relative z-10 flex min-h-[84px] items-center justify-center text-center sm:min-h-[96px]">
            <p className="text-[0.95rem] leading-none tracking-[0.08em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:text-[1.25rem] sm:tracking-[0.12em]">
              {series.emojiTitle}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-[14px] border border-[#efe4db] bg-[#fcf8f4] p-3 sm:rounded-[16px]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[#786b64] sm:text-[0.68rem]">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 ${hskMeta.chipClass}`}
              >
                {getHskLabel(series.hskLevel)}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#eadfd6] bg-white px-2 py-0.5">
                {series.stories.length} episodes
              </span>
              {totalViews > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e0d8d0] bg-[#f9f5f2] px-2 py-0.5">
                  <Eye className="size-3" />
                  {totalViews.toLocaleString()}
                </span>
              ) : null}
            </div>

            <div className="space-y-0.5">
              <p className="line-clamp-1 text-[0.82rem] font-semibold leading-5 tracking-tight text-[#211814] sm:text-[0.94rem]">
                {series.title}
              </p>
              <p className="line-clamp-1 text-[0.69rem] font-medium text-[#6f625c] sm:text-[0.75rem]">
                {series.titleTranslation}
              </p>
            </div>

            <p className="line-clamp-3 text-[0.71rem] leading-5 text-[#6f625c] sm:text-[0.75rem]">
              {series.summary}
            </p>
          </div>

          <div className="mt-3 space-y-2 border-t border-[#eadfd6] pt-2.5 text-[0.66rem] text-[#786b64]">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-medium text-[#5f534d]">
                <span className="size-1.5 rounded-full bg-[#b6927c]" />
                Collection
              </span>
              {readCount ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2 py-0.5 text-[#4f8454]">
                  <CheckCircle2 className="size-3" />
                  {readCount}/{totalStories} read
                </span>
              ) : (
                <span className="text-[#8b7d75]">Start series</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#efe5dd]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6bc6b6_0%,#4f8454_100%)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.61rem] text-[#877a73]">
                <span>{readCount ? "In progress" : "Not started"}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
