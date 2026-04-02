import Link from "next/link";
import { Menu } from "lucide-react";

import { type AppStory, getLevelLabel, storyLevelMeta } from "@/lib/stories";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type StorySidebarProps = {
  stories: AppStory[];
  activeSlug?: string;
  description: string;
  hideDesktop?: boolean;
};

export function StorySidebar({
  stories,
  activeSlug,
  description,
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
              description={description}
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={
          hideDesktop
            ? "hidden"
            : "sticky top-28 hidden h-[calc(100vh-8rem)] w-[310px] shrink-0 xl:block"
        }
      >
        <div className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/86 shadow-[0_18px_60px_-46px_rgba(80,45,24,0.3)] backdrop-blur">
          <SidebarContent
            stories={stories}
            activeSlug={activeSlug}
            description={description}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarContent({
  stories,
  activeSlug,
  description,
}: StorySidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#efe3d9] px-6 py-6">
        <p className="text-[1.55rem] font-semibold tracking-tight text-[#1f1b18]">
          Lessons
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6c625d]">{description}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
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
                    storyLevelMeta[story.level].dotClass,
                  ].join(" ")}
                />
                <span>{getLevelLabel(story.level)}</span>
              </div>
              <p className="text-lg font-medium leading-7 text-[#202020]">
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
