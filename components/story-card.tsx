import Link from "next/link";
import { Globe2, LockKeyhole, Sparkles } from "lucide-react";

import { getStoryHskLabel } from "@/lib/hsk";
import { type AppStory, getLevelLabel, storyLevelMeta } from "@/lib/stories";

const palettes = {
  beginner: {
    surface: "from-[#ffd4bd] via-[#f4ac73] to-[#d9734e]",
    glow: "from-white/55 via-white/10 to-transparent",
  },
  elementary: {
    surface: "from-[#a8c7ed] via-[#6b93c5] to-[#435f89]",
    glow: "from-white/45 via-white/10 to-transparent",
  },
  intermediate: {
    surface: "from-[#d8e5f1] via-[#a5b6c8] to-[#7d8fa4]",
    glow: "from-white/55 via-white/15 to-transparent",
  },
} as const;

export function StoryCard({
  story,
  showAuthor = true,
}: {
  story: AppStory;
  showAuthor?: boolean;
}) {
  const palette = palettes[story.level];
  const level = storyLevelMeta[story.level];
  const hskLabel = getStoryHskLabel(story);
  const createdAt = new Date(story.createdAt);
  const visibilityIcon =
    story.visibility === "private_user" ? (
      <LockKeyhole className="size-3.5" />
    ) : story.isSeeded ? (
      <Sparkles className="size-3.5" />
    ) : (
      <Globe2 className="size-3.5" />
    );

  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch={false}
      className="group flex min-w-0 flex-col rounded-[28px] border border-[#ebddd2] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.34)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.44)]"
    >
      <div
        className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${palette.surface} p-4`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${palette.glow}`} />
        <div className="absolute -right-2 -bottom-5 font-reading text-[6rem] leading-none text-white/22">
          {Array.from(story.title)[0] ?? "汉"}
        </div>
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[0.72rem] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm">
            <span className={["size-2.5 rounded-full", level.dotClass].join(" ")} />
            {getLevelLabel(story.level)}
          </span>
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
            {visibilityIcon}
          </span>
        </div>
        <div className="relative z-10 mt-12 space-y-2">
          <p className="font-reading text-3xl leading-none text-white sm:text-[2.15rem]">
            {story.title}
          </p>
          <p className="max-w-[14rem] text-sm text-white/85">{story.titleTranslation}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#786b64]">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 ${level.chipClass}`}
          >
            {hskLabel}
          </span>
          <span>
            {createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {showAuthor && story.authorName ? <span>by {story.authorName}</span> : null}
        </div>
        <p className="line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-[#211814]">
          {story.titleTranslation}
        </p>
        <p className="line-clamp-3 text-sm leading-6 text-[#6f625c]">{story.summary}</p>
      </div>
    </Link>
  );
}
