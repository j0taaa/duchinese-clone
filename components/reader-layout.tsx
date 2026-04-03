"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Languages,
  List,
  NotebookPen,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { DictionaryToken, ReaderStory } from "@/lib/dictionary";
import { getStoryHskLabel } from "@/lib/hsk";
import { type AppSeries } from "@/lib/series";
import { getHskLabel, hskLevelMeta, type AppStory } from "@/lib/stories";

import {
  RecommendedLessons,
  SeriesEpisodesSidebar,
  StorySidebar,
} from "@/components/story-sidebar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ReaderLayoutProps = {
  stories: AppStory[];
  story: ReaderStory;
  series?: AppSeries | null;
  readStoryIds?: string[];
};

const READER_PREFERENCES_KEY = "hanzilane-reader-preferences";

function getStoredReaderPreferences() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(READER_PREFERENCES_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as {
      showPinyin?: boolean;
      showEnglish?: boolean;
      showCharacters?: boolean;
    };
  } catch {
    return null;
  }
}

export function ReaderLayout({
  stories,
  story,
  series,
  readStoryIds = [],
}: ReaderLayoutProps) {
  const [showPinyin, setShowPinyin] = useState(() => {
    const stored = getStoredReaderPreferences();
    return stored?.showPinyin ?? true;
  });
  const [showEnglish, setShowEnglish] = useState(() => {
    const stored = getStoredReaderPreferences();
    return stored?.showEnglish ?? true;
  });
  const [showCharacters, setShowCharacters] = useState(() => {
    const stored = getStoredReaderPreferences();
    return stored?.showCharacters ?? true;
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isTouchMode, setIsTouchMode] = useState(false);

  const firstInteractiveToken = useMemo(
    () =>
      story.tokenizedSections
        .flatMap((section) => section.tokens)
        .find((token) => token.interactive) ?? null,
    [story.tokenizedSections],
  );

  const [activeWord, setActiveWord] = useState<DictionaryToken | null>(null);
  const [sheetWord, setSheetWord] =
    useState<DictionaryToken | null>(firstInteractiveToken);
  const hskMeta = hskLevelMeta[story.hskLevel];
  const hskLabel = getStoryHskLabel(story);
  const currentSeriesIndex = series
    ? series.stories.findIndex((seriesStory) => seriesStory.slug === story.slug)
    : -1;
  const previousSeriesStory =
    series && currentSeriesIndex > 0 ? series.stories[currentSeriesIndex - 1] : null;
  const nextSeriesStory =
    series && currentSeriesIndex >= 0 && currentSeriesIndex < series.stories.length - 1
      ? series.stories[currentSeriesIndex + 1]
      : null;

  useEffect(() => {
    window.localStorage.setItem(
      READER_PREFERENCES_KEY,
      JSON.stringify({
        showPinyin,
        showEnglish,
        showCharacters,
      }),
    );
  }, [showCharacters, showEnglish, showPinyin]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");

    const syncTouchMode = () => {
      setIsTouchMode(mediaQuery.matches);
    };

    syncTouchMode();
    mediaQuery.addEventListener("change", syncTouchMode);

    return () => {
      mediaQuery.removeEventListener("change", syncTouchMode);
    };
  }, []);

  return (
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#fbf7f1,_#f3eee7_55%,_#f1ece5_100%)] text-[#202020]"
      onClickCapture={(event) => {
        if (!isTouchMode) {
          return;
        }

        const target = event.target as HTMLElement | null;

        if (target?.closest("[data-token-button='true']")) {
          return;
        }

        setActiveWord(null);
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 xl:px-10">
        <div className="hidden md:block">
          <StorySidebar
            stories={stories}
            activeSlug={story.slug}
            hideDesktop
          />
        </div>

        {series ? (
          <SeriesEpisodesSidebar
            series={series}
            activeSlug={story.slug}
            readStoryIds={readStoryIds}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-20 md:gap-5 md:pb-24">
          <div className="hidden rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.34)] sm:rounded-[28px] sm:p-6 md:block">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-[#6e625c] sm:gap-3 sm:text-sm">
                  <Link
                    href="/"
                    prefetch={false}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        className:
                          "h-9 rounded-full border border-[#eadcd2] bg-white px-3 text-[#5a4d47] hover:bg-[#faf4ef]",
                      }),
                    )}
                  >
                    <ChevronLeft className="size-4" />
                    Library
                  </Link>
                  <span className={["size-3 rounded-full", hskMeta.dotClass].join(" ")} />
                  <span>{getHskLabel(story.hskLevel)}</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-reading text-[1.7rem] text-[#241815] sm:text-4xl">
                    {story.title}
                  </h1>
                  <p className="text-[0.92rem] text-[#5f534d] sm:text-lg">{story.titleTranslation}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {series ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <SeriesStepButton
                      direction="previous"
                      story={previousSeriesStory}
                    />
                    <SeriesStepButton
                      direction="next"
                      story={nextSeriesStory}
                    />
                  </div>
                ) : null}

                <Badge
                  variant="outline"
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${hskMeta.chipClass}`}
                >
                  {hskLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="sticky top-3 z-20 rounded-[24px] border border-white/70 bg-white/95 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.34)] backdrop-blur-sm md:top-[92px] md:rounded-[28px]">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-h-[88px] min-w-0 sm:min-h-[104px]">
                <p className="text-sm text-[#9b8e87]">Word meaning</p>
                {activeWord ? (
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pt-2">
                    <span className="font-reading text-[1.8rem] leading-none text-[#3a86ea] sm:text-[2.15rem]">
                      {activeWord.text}
                    </span>
                    <span className="text-[0.95rem] text-[#ef625a] sm:text-[1.1rem]">
                      {activeWord.pinyin ?? ""}
                    </span>
                    <span className="text-[0.92rem] text-[#3e3e3e] sm:text-[1rem]">
                      {activeWord.definition ?? ""}
                    </span>
                  </div>
                ) : (
                  <p className="pt-2 text-sm text-[#6f625c]">
                    {isTouchMode
                      ? "Tap a word to inspect it. Tap outside the text to clear it."
                      : "Hover a word to inspect it. Click a word to open the study sheet."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Card className="border-0 bg-transparent py-0 shadow-none md:border md:border-white/70 md:bg-white/92 md:shadow-[0_18px_70px_-42px_rgba(80,45,24,0.34)]">
            <CardContent className="px-0 py-2 sm:px-8 sm:py-8 md:px-8 xl:px-12">
              <div className="space-y-8 sm:space-y-10">
                {story.tokenizedSections.map((section, index) => (
                  <section
                    key={`${story.id}-${index}`}
                    className="space-y-4"
                  >
                    <div className="leading-none">
                      {renderTokenLine({
                        tokens: section.tokens,
                        showPinyin,
                        showCharacters,
                        selectedWord: activeWord?.text ?? "",
                        isTouchMode,
                        onHoverWord: (token) => {
                          if (!isTouchMode) {
                            setActiveWord(token);
                          }
                        },
                        onLeaveWord: () => {
                          if (!isTouchMode) {
                            setActiveWord(null);
                          }
                        },
                        onSelectWord: (token) => {
                          if (isTouchMode) {
                            setActiveWord(token);
                            return;
                          }

                          setSheetWord(token);
                          setSheetOpen(true);
                        },
                      })}
                    </div>
                    {showEnglish ? (
                      <p className="max-w-5xl text-[0.92rem] leading-7 text-[#5e514b] sm:text-[1rem] sm:leading-8">
                        {section.english}
                      </p>
                    ) : null}
                    {index < story.tokenizedSections.length - 1 ? (
                      <Separator className="bg-[#efe3d9]" />
                    ) : null}
                  </section>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="hidden md:block">
            <RecommendedLessons
              stories={stories}
              activeSlug={story.slug}
              series={series}
              readStoryIds={readStoryIds}
            />
          </div>

          <footer className="fixed inset-x-0 bottom-0 border-t border-[#ebddd2] bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2.5 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between xl:px-10">
              <div className="hidden items-center gap-2 text-[0.8rem] text-[#6b5f58] sm:gap-3 sm:text-sm md:flex">
                <span className="truncate font-medium text-[#2a1e1a]">
                  {story.titleTranslation}
                </span>
                <span>{getHskLabel(story.hskLevel)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 md:justify-start">
                <ToolbarToggle
                  icon={<BookOpenText className="size-4" />}
                  label="Characters"
                  active={showCharacters}
                  isTouchMode={isTouchMode}
                  onClick={() => setShowCharacters((value) => !value)}
                />
                <ToolbarToggle
                  icon={<Languages className="size-4" />}
                  label="Pinyin"
                  active={showPinyin}
                  isTouchMode={isTouchMode}
                  onClick={() => setShowPinyin((value) => !value)}
                />
                <ToolbarToggle
                  icon={<NotebookPen className="size-4" />}
                  label="English"
                  active={showEnglish}
                  isTouchMode={isTouchMode}
                  onClick={() => setShowEnglish((value) => !value)}
                />
                <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-white px-3 text-[0.78rem] font-medium text-[#443934] sm:h-11 sm:gap-2 sm:px-4 sm:text-sm">
                  <List className="size-4" />
                  <span className="sm:hidden">Sheet</span>
                  <span className="hidden sm:inline">Word sheet on tap</span>
                </span>
              </div>
            </div>
          </footer>
        </div>

      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[72vh] rounded-t-[28px] border-t-[#eadcd2] bg-white p-0"
        >
          <SheetHeader className="border-b border-[#efe2d8] pb-4">
            <SheetTitle className="flex items-center gap-2 text-[#241815]">
              <BookOpenText className="size-4 text-[#d14f43]" />
              Study this word
            </SheetTitle>
            <SheetDescription className="text-[#7a6e67]">
              Tap different words in the lesson to inspect vocabulary.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-5">
            {sheetWord ? (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-reading text-5xl text-[#3a86ea]">
                    {sheetWord.text}
                  </span>
                  <span className="text-xl text-[#ef625a]">
                    {sheetWord.pinyin ?? ""}
                  </span>
                </div>
                <div className="rounded-[24px] border border-[#eadecf] bg-[#fcf8f4] p-4 text-base leading-8 text-[#443934]">
                  {sheetWord.definition ?? "No dictionary definition available."}
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#eadcd2] bg-white px-4 text-sm font-medium text-[#443934]"
                  onClick={() => setSheetOpen(false)}
                >
                  <XIcon className="size-4" />
                  Close
                </button>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}

function ToolbarToggle({
  icon,
  label,
  active,
  isTouchMode,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  isTouchMode: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (isTouchMode) {
          return;
        }
        onClick();
      }}
      onPointerUp={(event) => {
        if (!isTouchMode || event.pointerType === "mouse") {
          return;
        }

        event.preventDefault();
        onClick();
      }}
      className="touch-manipulation select-none inline-flex h-8 items-center gap-1 rounded-full border border-[#eadcd2] bg-white px-2 text-[0.72rem] font-medium text-[#443934] hover:bg-[#faf4ef] sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
    >
      {icon}
      <span className="sm:hidden">
        {label === "Characters" ? "字" : label === "Pinyin" ? "拼" : "英"}
      </span>
      <span className="hidden sm:inline">{label}</span>
      <span
        className={cn(
          "flex min-w-6 items-center justify-center rounded-full border px-1.5 py-0.5 text-[0.65rem] leading-none sm:size-9 sm:px-0 sm:py-0 sm:text-sm",
          active
            ? "border-[#8aaed7] bg-white text-[#507db3]"
            : "border-[#cfcfcf] bg-white text-[#7a7a7a]",
        )}
      >
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}

function SeriesStepButton({
  direction,
  story,
}: {
  direction: "previous" | "next";
  story: AppStory | null;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Previous" : "Next";

  if (!story) {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-[#f7f1eb] px-3 text-[0.82rem] font-medium text-[#b7aba4] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
        <Icon className="size-4" />
        {label}
      </span>
    );
  }

  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch={false}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-white px-3 text-[0.82rem] font-medium text-[#4b4039] hover:bg-[#faf4ef] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function renderTokenLine({
  tokens,
  showPinyin,
  showCharacters,
  selectedWord,
  isTouchMode,
  onHoverWord,
  onLeaveWord,
  onSelectWord,
}: {
  tokens: DictionaryToken[];
  showPinyin: boolean;
  showCharacters: boolean;
  selectedWord: string;
  isTouchMode: boolean;
  onHoverWord: (token: DictionaryToken) => void;
  onLeaveWord: () => void;
  onSelectWord: (token: DictionaryToken) => void;
}) {
  return tokens.map((token, index) => {
    const isSelected = token.text === selectedWord && token.interactive;
    const isPunctuation = !token.interactive && !token.pinyin;

    if (isPunctuation) {
      return (
        <span
          key={`${token.text}-${index}`}
          className="inline-block align-bottom font-reading text-[1.75rem] leading-[1.8] text-[#2d2d2d] sm:text-[2.4rem]"
        >
          {showCharacters ? token.text : ""}
        </span>
      );
    }

    return (
      <span key={`${token.text}-${index}`} className="mb-3 mr-3 inline-flex align-top">
        <button
          type="button"
          onMouseEnter={() => token.interactive && onHoverWord(token)}
          onMouseLeave={() => token.interactive && onLeaveWord()}
          onFocus={() => token.interactive && onHoverWord(token)}
          onClick={() => {
            if (!token.interactive || isTouchMode) {
              return;
            }
            onSelectWord(token);
          }}
          onPointerUp={(event) => {
            if (!token.interactive || !isTouchMode || event.pointerType === "mouse") {
              return;
            }

            event.preventDefault();
            onSelectWord(token);
          }}
          data-token-button="true"
          className={cn(
            "touch-manipulation select-none inline-flex flex-col items-start rounded-[10px] px-1 text-left transition-colors",
            token.interactive && "hover:bg-[#f0f7ff]",
            isSelected && !isTouchMode && "bg-[#e5f3ff]",
            isSelected && isTouchMode && "bg-[#eef6ff]",
          )}
        >
          <span className="min-h-6 text-[0.88rem] leading-6 text-[#696969] sm:min-h-7 sm:text-[1.12rem] sm:leading-7">
            {showPinyin ? token.pinyin ?? "" : ""}
          </span>
          <span
            className={cn(
              "font-reading text-[1.75rem] leading-none text-[#2d2d2d] sm:text-[2.4rem]",
              token.interactive && "border-b-2 border-[#f1a39e]",
              isSelected && "border-[#8bd3cf]",
            )}
          >
            {showCharacters ? token.text : ""}
          </span>
        </button>
      </span>
    );
  });
}
