import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { getStoryArtwork } from "@/lib/story-art";
import { getStoryHskLabel } from "@/lib/hsk";
import { type AppStory, hskLevelMeta } from "@/lib/stories";

export function StoryCard({
  story,
  showAuthor = true,
  isRead = false,
}: {
  story: AppStory;
  showAuthor?: boolean;
  isRead?: boolean;
}) {
  const artwork = getStoryArtwork(story.id || story.slug || story.title);
  const hskMeta = hskLevelMeta[story.hskLevel];
  const hskLabel = getStoryHskLabel(story);
  const createdAt = new Date(story.createdAt);

  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch={false}
      className="group flex min-w-0 flex-col rounded-[20px] border border-[#ebddd2] bg-white/92 p-2.5 shadow-[0_18px_50px_-42px_rgba(80,45,24,0.34)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(80,45,24,0.44)] sm:rounded-[22px] sm:p-3"
    >
      <div
        className="relative overflow-hidden rounded-[16px] p-2.5 sm:rounded-[18px] sm:p-3"
        style={{ backgroundImage: artwork.surface }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: artwork.glow }} />
        <div className="relative z-10 flex min-h-[90px] items-center justify-center px-2 text-center sm:min-h-[112px] sm:px-4">
          <p className="text-[1.1rem] leading-none tracking-[0.04em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:text-[1.85rem] sm:tracking-[0.12em]">
            {story.emojiTitle}
          </p>
        </div>
      </div>

      <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[0.66rem] text-[#786b64] sm:gap-2 sm:text-[0.72rem]">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 ${hskMeta.chipClass}`}
          >
            {hskLabel}
          </span>
          {isRead ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d6ead6] bg-[#f3fbf3] px-2 py-0.5 text-[#4f8454]">
              <CheckCircle2 className="size-3" />
              Read
            </span>
          ) : null}
          <span>
            {createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {showAuthor && story.authorName ? <span>by {story.authorName}</span> : null}
        </div>
        <p className="line-clamp-2 text-[0.8rem] font-semibold leading-5 tracking-tight text-[#211814] sm:text-[0.96rem] sm:leading-6">
          {story.title}
        </p>
        <p className="text-[0.69rem] font-medium text-[#6f625c] sm:text-[0.78rem]">{story.titleTranslation}</p>
        <p className="line-clamp-3 text-[0.72rem] leading-5 text-[#6f625c] sm:text-[0.78rem] sm:leading-5">{story.summary}</p>
      </div>
    </Link>
  );
}
