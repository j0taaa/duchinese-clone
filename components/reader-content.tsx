"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { BookOpenText, Languages, List, NotebookPen, XIcon } from "lucide-react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DictionaryToken, ReaderStory } from "@/lib/dictionary";
import { getStoryHskLabel } from "@/lib/hsk";
import { getHskLabel, hskLevelMeta } from "@/lib/stories";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { renderTokenLine } from "@/components/reader-token-line";
import { SlideStoryHorizontalPages } from "@/components/slide-story-horizontal-pages";
import { cn } from "@/lib/utils";

export const READER_PREFERENCES_KEY = "hanzilane-reader-preferences";

export type ReaderDisplayPreferences = {
  showPinyin: boolean;
  showEnglish: boolean;
  showCharacters: boolean;
  setShowPinyin: Dispatch<SetStateAction<boolean>>;
  setShowEnglish: Dispatch<SetStateAction<boolean>>;
  setShowCharacters: Dispatch<SetStateAction<boolean>>;
};

export type ReaderContentProps = {
  story: ReaderStory;
  /** `page` uses a fixed bottom toolbar; `slide` is for infinite feed (toolbar may be rendered by the parent). */
  variant?: "page" | "slide";
  /** When set (e.g. infinite mode), toggles sync to this shared state so one fixed toolbar controls all slides. */
  externalDisplayState?: ReaderDisplayPreferences;
  /** Hide the embedded toolbar (infinite feed renders `ReaderBottomToolbar` fixed to the viewport). */
  suppressToolbar?: boolean;
};

export function readStoredReaderPreferences() {
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

export function ReaderContent({
  story,
  variant = "page",
  externalDisplayState,
  suppressToolbar = false,
}: ReaderContentProps) {
  const [localPinyin, setLocalPinyin] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showPinyin ?? true;
  });
  const [localEnglish, setLocalEnglish] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showEnglish ?? true;
  });
  const [localCharacters, setLocalCharacters] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showCharacters ?? true;
  });

  const showPinyin = externalDisplayState?.showPinyin ?? localPinyin;
  const showEnglish = externalDisplayState?.showEnglish ?? localEnglish;
  const showCharacters = externalDisplayState?.showCharacters ?? localCharacters;
  const setShowPinyin = externalDisplayState?.setShowPinyin ?? setLocalPinyin;
  const setShowEnglish = externalDisplayState?.setShowEnglish ?? setLocalEnglish;
  const setShowCharacters = externalDisplayState?.setShowCharacters ?? setLocalCharacters;
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
  const isSlide = variant === "slide";

  const meaningPanelHoveredRef = useRef(false);
  const hoverClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverClear = () => {
    if (hoverClearTimerRef.current !== null) {
      clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
  };

  const scheduleClearActiveWord = () => {
    cancelHoverClear();
    hoverClearTimerRef.current = setTimeout(() => {
      hoverClearTimerRef.current = null;
      if (!meaningPanelHoveredRef.current) {
        setActiveWord(null);
      }
    }, 220);
  };

  const wordMeaningHoverHandlers =
    !isTouchMode
      ? {
          onMouseEnter: () => {
            meaningPanelHoveredRef.current = true;
            cancelHoverClear();
          },
          onMouseLeave: () => {
            meaningPanelHoveredRef.current = false;
            scheduleClearActiveWord();
          },
        }
      : {};

  useEffect(() => {
    return () => {
      cancelHoverClear();
    };
  }, []);

  useEffect(() => {
    cancelHoverClear();
    meaningPanelHoveredRef.current = false;
    setActiveWord(null);
    setSheetOpen(false);
    setSheetWord(firstInteractiveToken);
  }, [story.id, firstInteractiveToken]);

  useEffect(() => {
    if (externalDisplayState) {
      return;
    }
    window.localStorage.setItem(
      READER_PREFERENCES_KEY,
      JSON.stringify({
        showPinyin,
        showEnglish,
        showCharacters,
      }),
    );
  }, [externalDisplayState, showCharacters, showEnglish, showPinyin]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");

    const syncTouchMode = () => {
      setIsTouchMode(mediaQuery.matches);
    };

    syncTouchMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncTouchMode);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(syncTouchMode);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", syncTouchMode);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(syncTouchMode);
      }
    };
  }, []);

  const handleTouchDismiss = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isTouchMode) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest("[data-token-button='true']") ||
        target?.closest("[data-reader-control='true']")
      ) {
        return;
      }

      setActiveWord(null);
    },
    [isTouchMode],
  );

  const tokenInteractionHandlers = {
    onHoverWord: (token: DictionaryToken) => {
      if (!isTouchMode) {
        cancelHoverClear();
        setActiveWord(token);
      }
    },
    onLeaveWord: () => {
      if (!isTouchMode) {
        scheduleClearActiveWord();
      }
    },
    onSelectWord: (token: DictionaryToken) => {
      if (isTouchMode) {
        setActiveWord(token);
        return;
      }

      setSheetWord(token);
      setSheetOpen(true);
    },
  };

  const scrollArea =
    isSlide && suppressToolbar ? (
      <SlideStoryHorizontalPages
        key={story.id}
        story={story}
        showPinyin={showPinyin}
        showEnglish={showEnglish}
        showCharacters={showCharacters}
        handlers={{
          selectedWord: activeWord?.text ?? "",
          isTouchMode,
          ...tokenInteractionHandlers,
        }}
        onClickCapture={handleTouchDismiss}
      />
    ) : (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        isSlide
          ? cn(
              "min-h-0 flex-1 overflow-y-auto",
              suppressToolbar && "pb-[5.5rem] sm:pb-24",
            )
          : "pb-20 md:pb-24",
      )}
      onClickCapture={handleTouchDismiss}
    >
      {activeWord && !isSlide ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-2 z-[45] hidden md:block"
          aria-live="polite"
        >
          <div className="pointer-events-auto mx-auto max-w-[1600px] px-4 sm:px-6 xl:px-10">
            <div
              className="rounded-[28px] border border-white/80 bg-white/96 shadow-[0_2px_8px_rgba(92,46,24,0.06),0_12px_28px_-6px_rgba(80,45,24,0.18),0_28px_56px_-12px_rgba(80,45,24,0.26),0_48px_90px_-24px_rgba(80,45,24,0.18)] backdrop-blur-sm"
              {...wordMeaningHoverHandlers}
            >
              <div className="px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm text-[#9b8e87]">Word meaning</p>
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pt-2">
                    <span className="font-reading text-[2.15rem] leading-none text-[#3a86ea]">
                      {activeWord.text}
                    </span>
                    <span className="text-[1.1rem] text-[#ef625a]">
                      {activeWord.pinyin ?? ""}
                    </span>
                    <span className="text-[1rem] text-[#3e3e3e]">
                      {activeWord.definition ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeWord && !isSlide ? (
        <div
          className="sticky top-3 z-20 rounded-[24px] border border-white/70 bg-white/95 shadow-[0_2px_8px_rgba(92,46,24,0.06),0_10px_24px_-6px_rgba(80,45,24,0.16),0_22px_48px_-10px_rgba(80,45,24,0.22)] backdrop-blur-sm md:hidden"
          {...wordMeaningHoverHandlers}
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-sm text-[#9b8e87]">Word meaning</p>
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
            </div>
          </div>
        </div>
      ) : null}

      <Card
        className={cn(
          "rounded-none border-0 bg-transparent py-0 shadow-none ring-0",
          !isSlide && "md:rounded-xl md:border md:border-white/70 md:bg-white/92 md:ring-1 md:ring-foreground/10 md:shadow-[0_18px_70px_-42px_rgba(80,45,24,0.34)]",
        )}
      >
        <CardContent
          className={cn("px-0 py-0", !isSlide && "sm:px-8 sm:py-8 md:px-8 xl:px-12")}
        >
          {isSlide ? (
            <div className="flex flex-wrap items-center gap-2 pb-3 sm:gap-3">
              <span className={["size-3 rounded-full", hskMeta.dotClass].join(" ")} />
              <span className="text-[0.82rem] text-[#6e625c] sm:text-sm">
                {getHskLabel(story.hskLevel)}
              </span>
              <Badge
                variant="outline"
                className={`rounded-full border px-3 py-1 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm ${hskMeta.chipClass}`}
              >
                {hskLabel}
              </Badge>
            </div>
          ) : null}
          <div className="space-y-8 sm:space-y-10">
            {story.tokenizedSections.map((section, index) => (
              <section key={`${story.id}-${index}`} className="space-y-4">
                <div className="leading-none">
                  {renderTokenLine({
                    tokens: section.tokens,
                    showPinyin,
                    showCharacters,
                    selectedWord: activeWord?.text ?? "",
                    isTouchMode,
                    onHoverWord: tokenInteractionHandlers.onHoverWord,
                    onLeaveWord: tokenInteractionHandlers.onLeaveWord,
                    onSelectWord: tokenInteractionHandlers.onSelectWord,
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
    </div>
    );

  const toolbar =
    suppressToolbar ? null : (
      <ReaderBottomToolbar
        story={story}
        placement={isSlide ? "static" : "fixed"}
        showPinyin={showPinyin}
        showEnglish={showEnglish}
        showCharacters={showCharacters}
        setShowPinyin={setShowPinyin}
        setShowEnglish={setShowEnglish}
        setShowCharacters={setShowCharacters}
      />
    );

  const sheet = (
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
  );

  const slideWordMeaningOverlay =
    activeWord && isSlide ? (
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-[48] px-2 sm:px-4"
        style={{
          top: "calc(5.75rem + 2.75rem + env(safe-area-inset-top, 0px))",
        }}
      >
        <div
          className="pointer-events-auto mx-auto max-h-[min(38vh,14rem)] w-full max-w-xl overflow-y-auto rounded-[24px] border border-white/70 bg-white/95 shadow-[0_2px_8px_rgba(92,46,24,0.06),0_10px_24px_-6px_rgba(80,45,24,0.16),0_22px_48px_-10px_rgba(80,45,24,0.22)] backdrop-blur-sm"
          {...wordMeaningHoverHandlers}
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-sm text-[#9b8e87]">Word meaning</p>
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
            </div>
          </div>
        </div>
      </div>
    ) : null;

  if (isSlide) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {slideWordMeaningOverlay}
        {scrollArea}
        {toolbar}
        {sheet}
      </div>
    );
  }

  return (
    <>
      {scrollArea}
      {toolbar}
      {sheet}
    </>
  );
}

export function ReaderBottomToolbar({
  story,
  placement,
  showPinyin,
  showEnglish,
  showCharacters,
  setShowPinyin,
  setShowEnglish,
  setShowCharacters,
  roundedTop = false,
}: {
  story: ReaderStory;
  placement: "fixed" | "static";
  showPinyin: boolean;
  showEnglish: boolean;
  showCharacters: boolean;
  setShowPinyin: Dispatch<SetStateAction<boolean>>;
  setShowEnglish: Dispatch<SetStateAction<boolean>>;
  setShowCharacters: Dispatch<SetStateAction<boolean>>;
  /** Floating “card” bar (infinite mode); story pages stay edge-to-edge. */
  roundedTop?: boolean;
}) {
  const isFixed = placement === "fixed";

  return (
    <div
      className={cn(
        "border-t border-[#ebddd2] bg-white/95 backdrop-blur-xl",
        isFixed
          ? cn(
              "fixed inset-x-0 bottom-0 z-[35] pb-[max(0.35rem,env(safe-area-inset-bottom))]",
              roundedTop
                ? "rounded-t-2xl border-x border-[#ebe5e1] shadow-[0_-6px_28px_-8px_rgba(60,40,28,0.12)]"
                : "",
            )
          : "shrink-0",
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-row items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5 xl:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[0.78rem] text-[#6b5f58] sm:gap-3 sm:text-sm">
          <span className="truncate font-medium text-[#2a1e1a]">
            {story.titleTranslation}
          </span>
          <span className="shrink-0 text-[#9a8e87]">{getHskLabel(story.hskLevel)}</span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
          <ToolbarToggle
            icon={<BookOpenText className="size-4" />}
            label="Characters"
            active={showCharacters}
            onClick={() => setShowCharacters((value) => !value)}
          />
          <ToolbarToggle
            icon={<Languages className="size-4" />}
            label="Pinyin"
            active={showPinyin}
            onClick={() => setShowPinyin((value) => !value)}
          />
          <ToolbarToggle
            icon={<NotebookPen className="size-4" />}
            label="English"
            active={showEnglish}
            onClick={() => setShowEnglish((value) => !value)}
          />
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-white px-2 text-[0.72rem] font-medium text-[#443934] sm:h-11 sm:gap-2 sm:px-4 sm:text-sm">
            <List className="size-4 shrink-0" />
            <span className="sm:hidden">Sheet</span>
            <span className="hidden sm:inline">Word sheet on tap</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ToolbarToggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-reader-control="true"
      onClick={onClick}
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
