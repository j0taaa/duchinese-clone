import Link from "next/link";
import { CheckCircle2, Layers3 } from "lucide-react";

import { getStoryHskLabel } from "@/lib/hsk";
import { type AppSeries } from "@/lib/series";
import { getStoryArtwork } from "@/lib/story-art";
import { getLevelLabel, storyLevelMeta } from "@/lib/stories";

export function SeriesCard({
  series,
  readCount = 0,
}: {
  series: AppSeries;
  readCount?: number;
}) {
  const artwork = getStoryArtwork(series.slug || series.title);
  const levelMeta = storyLevelMeta[series.level];
  const highestHsk = series.stories.reduce(
    (highest, story) => {
      const current = Number.parseInt(getStoryHskLabel(story).replace("HSK", ""), 10);
      return Number.isNaN(current) ? highest : Math.max(highest, current);
    },
    1,
  );

  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch={false}
      className="group flex min-w-0 flex-col rounded-[28px] border border-[#ebddd2] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.34)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.44)]"
    >
      <div
        className="relative overflow-hidden rounded-[24px] p-4"
        style={{ backgroundImage: artwork.surface }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
        <div className="absolute -right-2 -bottom-5 font-reading text-[6rem] leading-none text-white/22">
          {series.coverHanzi}
        </div>
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[0.72rem] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm">
            <span className={["size-2.5 rounded-full", levelMeta.dotClass].join(" ")} />
            {getLevelLabel(series.level)}
          </span>
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
            <Layers3 className="size-4" />
          </span>
        </div>
        <div className="relative z-10 mt-12 space-y-2">
          <p className="font-reading text-3xl leading-none text-white sm:text-[2.15rem]">
            {series.title}
          </p>
          <p className="max-w-[14rem] text-sm text-white/85">
            {series.titleTranslation}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#786b64]">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 ${levelMeta.chipClass}`}
          >
            HSK{highestHsk}
          </span>
          <span>{series.stories.length} lessons</span>
          {readCount ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2.5 py-1 text-[#4f8454]">
              <CheckCircle2 className="size-3.5" />
              {readCount}/{series.stories.length} read
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-[#211814]">
          {series.titleTranslation}
        </p>
        <p className="line-clamp-3 text-sm leading-6 text-[#6f625c]">{series.summary}</p>
      </div>
    </Link>
  );
}
