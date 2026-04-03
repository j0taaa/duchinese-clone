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
      className="group flex min-w-0 flex-col rounded-[20px] border border-[#ebddd2] bg-white/92 p-2.5 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.34)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.44)] sm:rounded-[22px] sm:p-3"
    >
      <div
        className="relative overflow-hidden rounded-[16px] p-2.5 sm:rounded-[18px] sm:p-3"
        style={{ backgroundImage: artwork.surface }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
        <div className="absolute -right-1 -bottom-3 font-reading text-[2.7rem] leading-none text-white/18 sm:text-[4.1rem]">
          {series.coverHanzi}
        </div>
        <div className="relative z-10 flex items-start justify-end gap-3">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
            <Layers3 className="size-3.5" />
          </span>
        </div>
        <div className="relative z-10 mt-4 space-y-1 sm:mt-7 sm:space-y-1.5">
          <p className="font-reading text-[1.1rem] leading-none text-white sm:text-[1.45rem]">
            {series.title}
          </p>
          <p className="max-w-[11rem] text-[0.66rem] text-white/85 sm:text-[0.78rem]">
            {series.titleTranslation}
          </p>
        </div>
      </div>

      <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
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
        <p className="line-clamp-2 text-[0.8rem] font-semibold leading-5 tracking-tight text-[#211814] sm:text-[0.96rem] sm:leading-6">
          {series.titleTranslation}
        </p>
        <p className="line-clamp-3 text-[0.72rem] leading-5 text-[#6f625c] sm:text-[0.78rem] sm:leading-5">{series.summary}</p>
      </div>
    </Link>
  );
}
