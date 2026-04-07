"use client";

import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { MouseEvent } from "react";
import { Fragment, useEffect, useRef, useState } from "react";

import type { DictionaryToken, ReaderStory } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { renderTokenLine } from "@/components/reader-token-line";
import { getStoryHskLabel } from "@/lib/hsk";
import { getHskLabel, hskLevelMeta } from "@/lib/stories";
import { cn } from "@/lib/utils";

export type StoryChunk = {
  sectionIndex: number;
  tokenStart: number;
  tokenEnd: number;
  includeEnglish: boolean;
};

export type StoryHorizontalPage = {
  chunks: StoryChunk[];
  showMetadataRow: boolean;
};

type TokenHandlers = {
  selectedWord: string;
  isTouchMode: boolean;
  onHoverWord: (token: DictionaryToken) => void;
  onLeaveWord: () => void;
  onSelectWord: (token: DictionaryToken) => void;
};

function noopHover() {}
function noopLeave() {}
function noopSelect() {}

function SlideMetadataRow({ story }: { story: ReaderStory }) {
  const hskMeta = hskLevelMeta[story.hskLevel];
  const hskLabel = getStoryHskLabel(story);
  return (
    <div className="flex flex-wrap items-center gap-2 pb-3 sm:gap-3">
      <span className={["size-3 rounded-full", hskMeta.dotClass].join(" ")} />
      <span className="text-[0.82rem] text-[#6e625c] sm:text-sm">{getHskLabel(story.hskLevel)}</span>
      <Badge
        variant="outline"
        className={`rounded-full border px-3 py-1 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm ${hskMeta.chipClass}`}
      >
        {hskLabel}
      </Badge>
    </div>
  );
}

function ChunkBlock({
  story,
  chunk,
  showPinyin,
  showEnglish,
  showCharacters,
  handlers,
}: {
  story: ReaderStory;
  chunk: StoryChunk;
  showPinyin: boolean;
  showEnglish: boolean;
  showCharacters: boolean;
  handlers: TokenHandlers;
}) {
  const section = story.tokenizedSections[chunk.sectionIndex]!;
  const slice = section.tokens.slice(chunk.tokenStart, chunk.tokenEnd);
  return (
    <div className="space-y-4">
      <div className="leading-none">
        {renderTokenLine({
          tokens: slice,
          showPinyin,
          showCharacters,
          selectedWord: handlers.selectedWord,
          isTouchMode: handlers.isTouchMode,
          onHoverWord: handlers.onHoverWord,
          onLeaveWord: handlers.onLeaveWord,
          onSelectWord: handlers.onSelectWord,
        })}
      </div>
      {chunk.includeEnglish && showEnglish ? (
        <p className="max-w-5xl text-[0.92rem] leading-7 text-[#5e514b] sm:text-[1rem] sm:leading-8">
          {section.english}
        </p>
      ) : null}
    </div>
  );
}

function PageBody({
  story,
  chunks,
  showMetadataRow,
  showPinyin,
  showEnglish,
  showCharacters,
  handlers,
}: {
  story: ReaderStory;
  chunks: StoryChunk[];
  showMetadataRow: boolean;
  showPinyin: boolean;
  showEnglish: boolean;
  showCharacters: boolean;
  handlers: TokenHandlers;
}) {
  return (
    <div className="space-y-8 sm:space-y-10">
      {showMetadataRow ? <SlideMetadataRow story={story} /> : null}
      {chunks.map((chunk, index) => {
        const prev = index > 0 ? chunks[index - 1]! : null;
        const needsSep =
          prev !== null &&
          chunk.sectionIndex !== prev.sectionIndex &&
          prev.tokenEnd >= story.tokenizedSections[prev.sectionIndex]!.tokens.length;
        return (
          <Fragment key={`${chunk.sectionIndex}-${chunk.tokenStart}-${chunk.tokenEnd}-${index}`}>
            {needsSep ? <Separator className="bg-[#efe3d9]" /> : null}
            <ChunkBlock
              story={story}
              chunk={chunk}
              showPinyin={showPinyin}
              showEnglish={showEnglish}
              showCharacters={showCharacters}
              handlers={handlers}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Off-DOM measurement. Must run outside React commit/render (e.g. after setTimeout(0)),
 * otherwise flushSync / root.unmount trigger runtime errors.
 */
function measureNodeHeight(width: number, node: ReactNode): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const host = document.createElement("div");
  host.style.cssText = `position:absolute;left:-100000px;top:0;width:${width}px;visibility:hidden;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(<div className="px-0">{node}</div>);
    });
    return host.offsetHeight;
  } finally {
    root.unmount();
    host.remove();
  }
}

const measureHandlers: TokenHandlers = {
  selectedWord: "",
  isTouchMode: false,
  onHoverWord: noopHover,
  onLeaveWord: noopLeave,
  onSelectWord: noopSelect,
};

function measurePageHeight(
  width: number,
  story: ReaderStory,
  chunks: StoryChunk[],
  showMetadataRow: boolean,
  showPinyin: boolean,
  showEnglish: boolean,
  showCharacters: boolean,
): number {
  return measureNodeHeight(
    width,
    <PageBody
      story={story}
      chunks={chunks}
      showMetadataRow={showMetadataRow}
      showPinyin={showPinyin}
      showEnglish={showEnglish}
      showCharacters={showCharacters}
      handlers={measureHandlers}
    />,
  );
}

function measureChunkOnlyHeight(
  width: number,
  story: ReaderStory,
  chunk: StoryChunk,
  showPinyin: boolean,
  showEnglish: boolean,
  showCharacters: boolean,
): number {
  return measureNodeHeight(
    width,
    <ChunkBlock
      story={story}
      chunk={chunk}
      showPinyin={showPinyin}
      showEnglish={showEnglish}
      showCharacters={showCharacters}
      handlers={measureHandlers}
    />,
  );
}

function maxTokenEndThatFits(
  width: number,
  maxHeight: number,
  story: ReaderStory,
  sectionIndex: number,
  tokenStart: number,
  showPinyin: boolean,
  showEnglish: boolean,
  showCharacters: boolean,
): number {
  const section = story.tokenizedSections[sectionIndex]!;
  const len = section.tokens.length;
  if (tokenStart >= len) {
    return len;
  }

  let lo = tokenStart + 1;
  let hi = len;
  let best = tokenStart;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const chunk: StoryChunk = {
      sectionIndex,
      tokenStart,
      tokenEnd: mid,
      includeEnglish: mid === len,
    };
    const h = measureChunkOnlyHeight(width, story, chunk, showPinyin, showEnglish, showCharacters);
    if (h <= maxHeight) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return Math.max(tokenStart + 1, best);
}

function buildHorizontalPages(
  story: ReaderStory,
  width: number,
  maxHeight: number,
  showPinyin: boolean,
  showEnglish: boolean,
  showCharacters: boolean,
): StoryHorizontalPage[] {
  if (width <= 8 || maxHeight <= 48) {
    const chunks: StoryChunk[] = story.tokenizedSections.map((sec, sectionIndex) => ({
      sectionIndex,
      tokenStart: 0,
      tokenEnd: sec.tokens.length,
      includeEnglish: true,
    }));
    return [{ chunks, showMetadataRow: true }];
  }

  const result: StoryHorizontalPage[] = [];
  let current: StoryChunk[] = [];
  let storyFirstPage = true;

  const heightOf = (chunks: StoryChunk[], withMeta: boolean) =>
    measurePageHeight(width, story, chunks, withMeta, showPinyin, showEnglish, showCharacters);

  const flush = () => {
    if (current.length === 0) {
      return;
    }
    result.push({
      chunks: [...current],
      showMetadataRow: storyFirstPage,
    });
    storyFirstPage = false;
    current = [];
  };

  for (let si = 0; si < story.tokenizedSections.length; si += 1) {
    const section = story.tokenizedSections[si]!;
    let ts = 0;

    while (ts < section.tokens.length) {
      const metaFlag = storyFirstPage && current.length === 0;
      const used = heightOf(current, metaFlag);
      const remaining = maxHeight - used;

      if (remaining < 72 && current.length > 0) {
        flush();
        continue;
      }

      const te = maxTokenEndThatFits(
        width,
        Math.max(72, remaining),
        story,
        si,
        ts,
        showPinyin,
        showEnglish,
        showCharacters,
      );

      const chunk: StoryChunk = {
        sectionIndex: si,
        tokenStart: ts,
        tokenEnd: te,
        includeEnglish: te === section.tokens.length,
      };

      const merged = [...current, chunk];
      const nextH = heightOf(merged, metaFlag);

      if (nextH > maxHeight) {
        if (current.length > 0) {
          flush();
          continue;
        }
        current.push(chunk);
        ts = te;
        if (ts < section.tokens.length) {
          flush();
        }
        continue;
      }

      current.push(chunk);
      ts = te;

      if (ts < section.tokens.length) {
        flush();
      }
    }
  }

  flush();

  if (result.length === 0) {
    return [
      {
        chunks: story.tokenizedSections.map((sec, sectionIndex) => ({
          sectionIndex,
          tokenStart: 0,
          tokenEnd: sec.tokens.length,
          includeEnglish: true,
        })),
        showMetadataRow: true,
      },
    ];
  }

  return result;
}

export function SlideStoryHorizontalPages({
  story,
  showPinyin,
  showEnglish,
  showCharacters,
  handlers,
  onClickCapture,
}: {
  story: ReaderStory;
  showPinyin: boolean;
  showEnglish: boolean;
  showCharacters: boolean;
  handlers: TokenHandlers;
  onClickCapture?: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<StoryHorizontalPage[]>(() => [
    {
      chunks: story.tokenizedSections.map((sec, sectionIndex) => ({
        sectionIndex,
        tokenStart: 0,
        tokenEnd: sec.tokens.length,
        includeEnglish: true,
      })),
      showMetadataRow: true,
    },
  ]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }

    let cancelled = false;
    let timeoutId = 0;

    const scheduleRecompute = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        const target = containerRef.current;
        if (!target) {
          return;
        }
        const { width, height } = target.getBoundingClientRect();
        setPages(
          buildHorizontalPages(story, width, height, showPinyin, showEnglish, showCharacters),
        );
      }, 0);
    };

    scheduleRecompute();

    const ro = new ResizeObserver(() => {
      scheduleRecompute();
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, [showCharacters, showEnglish, showPinyin, story]);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        data-slide-horizontal-pages="true"
        onClickCapture={onClickCapture}
        className={cn(
          "min-h-0 flex-1 overflow-y-hidden overflow-x-auto overscroll-x-contain",
          "flex flex-row snap-x snap-mandatory",
          "[touch-action:pan-x]",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={`p-${pageIndex}-${page.chunks.map((c) => `${c.sectionIndex}-${c.tokenStart}`).join("|")}`}
            className={cn(
              "h-full min-h-0 w-full min-w-full shrink-0 snap-start snap-always",
              "overflow-y-hidden px-0",
            )}
          >
            <div className="flex h-full max-h-full flex-col overflow-hidden">
              <CardShell>
                <PageBody
                  story={story}
                  chunks={page.chunks}
                  showMetadataRow={page.showMetadataRow}
                  showPinyin={showPinyin}
                  showEnglish={showEnglish}
                  showCharacters={showCharacters}
                  handlers={handlers}
                />
              </CardShell>
            </div>
          </div>
        ))}
      </div>
      {pages.length > 1 ? (
        <p className="shrink-0 py-1.5 text-center text-[0.65rem] font-medium tracking-wide text-[#9a8e87]">
          Swipe sideways · {pages.length} pages
        </p>
      ) : null}
    </div>
  );
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-none border-0 bg-transparent py-0 shadow-none ring-0">
      <div className="px-0 py-0">{children}</div>
    </div>
  );
}
