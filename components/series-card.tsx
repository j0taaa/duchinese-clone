import Link from "next/link";
import { CheckCircle2, Layers3 } from "lucide-react";

import { type AppSeries } from "@/lib/series";
import { getStoryArtwork } from "@/lib/story-art";
import { getHskLabel, hskLevelMeta } from "@/lib/stories";

export function SeriesCard({
  series,
  readCount = 0,
}: {
  series: AppSeries;
  readCount?: number;
}) {
  const artwork = getStoryArtwork(series.slug || series.title);
  const hskMeta = hskLevelMeta[series.hskLevel];

  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch={false}
      className="group flex min-w-0 flex-col rounded-[18px] border border-[#e7ddd4] bg-[#fffdfa] p-2.5 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.38)] sm:rounded-[20px] sm:p-3"
    >
      <div
        className="relative overflow-hidden rounded-[14px] border border-white/40 p-2.5 sm:rounded-[16px] sm:p-3"
        style={{ backgroundImage: artwork.surface }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
        <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0))]" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-white/35 bg-white/18 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop-blur-sm">
            Series
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
            <Layers3 className="size-3.5" />
          </span>
        </div>
        <div className="relative z-10 flex min-h-[78px] items-center justify-center px-2 text-center sm:min-h-[88px]">
          <p className="text-[1rem] leading-none tracking-[0.08em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:text-[1.5rem] sm:tracking-[0.12em]">
            {series.emojiTitle}
          </p>
        </div>
      </div>

      <div className="mt-2.5 space-y-2 sm:mt-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[0.66rem] text-[#786b64] sm:gap-2 sm:text-[0.72rem]">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 ${hskMeta.chipClass}`}
          >
            {getHskLabel(series.hskLevel)}
          </span>
          <span>{series.stories.length} lessons</span>
          {readCount ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2 py-0.5 text-[#4f8454]">
              <CheckCircle2 className="size-3" />
              {readCount}/{series.stories.length} read
            </span>
          ) : null}
        </div>
        <div className="space-y-0.5">
          <p className="line-clamp-1 text-[0.82rem] font-semibold leading-5 tracking-tight text-[#211814] sm:text-[0.95rem] sm:leading-6">
            {series.title}
          </p>
          <p className="line-clamp-1 text-[0.69rem] font-medium text-[#6f625c] sm:text-[0.76rem]">
            {series.titleTranslation}
          </p>
        </div>
        <p className="line-clamp-2 text-[0.71rem] leading-5 text-[#6f625c] sm:text-[0.76rem] sm:leading-5">
          {series.summary}
        </p>
      </div>
    </Link>
  );
}
