"use client";

import type React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ReaderStory } from "@/lib/dictionary";
import {
  ReaderBottomToolbar,
  ReaderContent,
  READER_PREFERENCES_KEY,
  readStoredReaderPreferences,
  type ReaderDisplayPreferences,
} from "@/components/reader-content";
import { buttonVariants } from "@/components/ui/button";
import { getHskLabel, hskLevelValues, type HskLevel } from "@/lib/stories";
import { cn } from "@/lib/utils";

const INFINITE_HSK_STORAGE_KEY = "hanzilane:infinite-hsk-level";
const INFINITE_HSK_PICKER_SESSION_KEY = "hanzilane:infinite-hsk-picker";

function readStoredInfiniteHsk(): HskLevel | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(INFINITE_HSK_STORAGE_KEY);
    if (raw && (hskLevelValues as readonly string[]).includes(raw)) {
      return raw as HskLevel;
    }
  } catch {
    /* ignore quota / private mode */
  }
  return null;
}

function persistInfiniteHsk(level: HskLevel) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(INFINITE_HSK_STORAGE_KEY, level);
  } catch {
    /* ignore */
  }
}

function isInfinitePickerSessionActive(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return sessionStorage.getItem(INFINITE_HSK_PICKER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function setInfinitePickerSession(active: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (active) {
      sessionStorage.setItem(INFINITE_HSK_PICKER_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(INFINITE_HSK_PICKER_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

type InfiniteMode = "vocab" | "random" | "generated";

type Slide = {
  storyId: string;
  slug: string;
  mode: InfiniteMode;
  targetHanzi?: string;
  readerStory: ReaderStory;
};

type InfiniteFeedProps = {
  initialHsk: HskLevel | null;
  signedIn: boolean;
};

function reviveReaderStory(raw: unknown): ReaderStory {
  const o = raw as Record<string, unknown> & ReaderStory;
  return {
    ...o,
    createdAt: new Date(String(o.createdAt)),
    updatedAt: new Date(String(o.updatedAt)),
  };
}

async function fetchNextSlide(hskLevel: HskLevel): Promise<Slide> {
  const res = await fetch("/api/infinite/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hskLevel }),
  });
  const data = (await res.json()) as {
    ok: boolean;
    error?: string;
    code?: string;
    mode?: InfiniteMode;
    targetHanzi?: string;
    storyId?: string;
    readerStory?: unknown;
  };

  if (!res.ok || !data.ok || !data.readerStory || !data.storyId || !data.mode) {
    throw new Error(data.error ?? "Could not load the next lesson.");
  }

  const readerStory = reviveReaderStory(data.readerStory);

  return {
    storyId: data.storyId,
    slug: readerStory.slug,
    mode: data.mode,
    targetHanzi: data.targetHanzi,
    readerStory,
  };
}

async function fetchNextDistinctSlide(
  hskLevel: HskLevel,
  excludeIds: Set<string>,
  maxAttempts = 8,
): Promise<Slide | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slide = await fetchNextSlide(hskLevel);
    if (!excludeIds.has(slide.storyId)) {
      return slide;
    }
  }
  return null;
}

function SlideChrome({
  hskLevel,
  slide,
  slideIndex,
  onChangeLevel,
  scrollRootRef,
  onSlideDominant,
  displayPreferences,
}: {
  hskLevel: HskLevel;
  slide: Slide;
  slideIndex: number;
  onChangeLevel: () => void;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  onSlideDominant: (index: number) => void;
  displayPreferences: ReaderDisplayPreferences;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markedRead = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    const root = scrollRootRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio >= 0.55,
        );
        if (hit) {
          onSlideDominant(slideIndex);
        }
        if (!hit || markedRead.current) {
          return;
        }
        markedRead.current = true;

        fetch("/api/stories/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId: slide.storyId }),
        }).catch(() => {});

        fetch("/api/views/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId: slide.storyId }),
        }).catch(() => {});
      },
      { root: root ?? undefined, rootMargin: "0px", threshold: [0.55, 0.75, 1] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onSlideDominant, scrollRootRef, slide.storyId, slideIndex]);

  return (
    <div
      ref={containerRef}
      className="flex h-[calc(100svh-5.75rem)] min-h-[280px] snap-start snap-always flex-col border-b border-[#e8dcd3] bg-[radial-gradient(circle_at_top,_#fbf7f1,_#f3eee7_55%,_#f1ece5_100%)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#eadcd2] bg-white/90 px-3 py-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={onChangeLevel}
          className="text-[0.72rem] font-medium text-[#6b5f58] underline-offset-2 hover:text-[#ea4e47] hover:underline sm:text-xs"
        >
          Change HSK
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#b07f72]">
            Infinite · {getHskLabel(hskLevel)}
          </span>
          {slide.mode === "vocab" && slide.targetHanzi ? (
            <span className="truncate text-[0.7rem] text-[#5a4d47] sm:text-xs">
              Practicing{" "}
              <span className="font-reading text-[0.95rem] text-[#241815]">
                {slide.targetHanzi}
              </span>
            </span>
          ) : slide.mode === "generated" ? (
            <span className="text-[0.7rem] text-[#5a4d47] sm:text-xs">New lesson for you</span>
          ) : null}
        </div>
        <Link
          href={`/stories/${slide.slug}`}
          prefetch={false}
          className="shrink-0 text-[0.72rem] font-medium text-[#6b5f58] underline-offset-2 hover:text-[#ea4e47] hover:underline sm:text-xs"
        >
          Open full
        </Link>
      </div>
      <div className="min-h-0 flex-1 px-2 py-2 pb-[5.5rem] sm:px-4 sm:pb-24">
        <ReaderContent
          story={slide.readerStory}
          variant="slide"
          externalDisplayState={displayPreferences}
          suppressToolbar
        />
      </div>
    </div>
  );
}

export function InfiniteFeed({ initialHsk, signedIn }: InfiniteFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlHsk = searchParams.get("hsk");
  const resolvedInitial =
    initialHsk ??
    ((hskLevelValues as readonly string[]).includes(urlHsk ?? "")
      ? (urlHsk as HskLevel)
      : null);

  const [hskLevel, setHskLevel] = useState<HskLevel | null>(resolvedInitial);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [dominantSlideIndex, setDominantSlideIndex] = useState(0);
  const [showPinyin, setShowPinyin] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showPinyin ?? true;
  });
  const [showEnglish, setShowEnglish] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showEnglish ?? true;
  });
  const [showCharacters, setShowCharacters] = useState(() => {
    const stored = readStoredReaderPreferences();
    return stored?.showCharacters ?? true;
  });
  const [bootError, setBootError] = useState<string | null>(null);
  const [loadingBoot, setLoadingBoot] = useState(false);
  const loadingMore = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<Slide[]>([]);
  slidesRef.current = slides;

  const appendIfNeeded = useCallback(
    (activeIndex: number) => {
      const totalSlides = slidesRef.current.length;
      if (!hskLevel || loadingMore.current || totalSlides === 0) {
        return;
      }
      if (activeIndex < totalSlides - 2) {
        return;
      }
      loadingMore.current = true;
      const excludeIds = new Set(slidesRef.current.map((s) => s.storyId));
      fetchNextDistinctSlide(hskLevel, excludeIds)
        .then((next) => {
          if (!next) {
            return;
          }
          setSlides((prev) => {
            if (prev.some((s) => s.storyId === next.storyId)) {
              return prev;
            }
            return [...prev, next];
          });
        })
        .catch(() => {})
        .finally(() => {
          loadingMore.current = false;
        });
    },
    [hskLevel],
  );

  const onSlideDominant = useCallback(
    (index: number) => {
      setDominantSlideIndex(index);
      appendIfNeeded(index);
    },
    [appendIfNeeded],
  );

  const displayPreferences = useMemo<ReaderDisplayPreferences>(
    () => ({
      showPinyin,
      showEnglish,
      showCharacters,
      setShowPinyin,
      setShowEnglish,
      setShowCharacters,
    }),
    [showCharacters, showEnglish, showPinyin],
  );

  useEffect(() => {
    setDominantSlideIndex(0);
  }, [hskLevel]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        READER_PREFERENCES_KEY,
        JSON.stringify({
          showPinyin,
          showEnglish,
          showCharacters,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [showCharacters, showEnglish, showPinyin]);

  const syncUrl = useCallback(
    (level: HskLevel | null) => {
      if (level) {
        router.replace(`/infinite?hsk=${level}`, { scroll: false });
      } else {
        router.replace("/infinite", { scroll: false });
      }
    },
    [router],
  );

  const chooseLevel = (level: HskLevel) => {
    setInfinitePickerSession(false);
    persistInfiniteHsk(level);
    setHskLevel(level);
    setSlides([]);
    setBootError(null);
    syncUrl(level);
  };

  const changeLevel = () => {
    setInfinitePickerSession(true);
    setHskLevel(null);
    setSlides([]);
    setBootError(null);
    syncUrl(null);
  };

  useEffect(() => {
    const urlLevel =
      initialHsk ??
      (urlHsk && (hskLevelValues as readonly string[]).includes(urlHsk)
        ? (urlHsk as HskLevel)
        : null);

    if (urlLevel) {
      persistInfiniteHsk(urlLevel);
      setInfinitePickerSession(false);
      return;
    }

    if (isInfinitePickerSessionActive()) {
      return;
    }

    const stored = readStoredInfiniteHsk();
    if (stored) {
      setHskLevel(stored);
      syncUrl(stored);
    }
  }, [initialHsk, urlHsk, syncUrl]);

  useEffect(() => {
    if (!hskLevel) {
      return;
    }

    let cancelled = false;
    setLoadingBoot(true);
    setBootError(null);

    (async () => {
      try {
        const first = await fetchNextSlide(hskLevel);
        if (cancelled) {
          return;
        }
        setSlides([first]);

        const excludeAfterFirst = new Set([first.storyId]);
        fetchNextDistinctSlide(hskLevel, excludeAfterFirst)
          .then((second) => {
            if (cancelled || !second) {
              return;
            }
            setSlides((prev) => {
              if (prev.length !== 1 || prev[0]?.storyId !== first.storyId) {
                return prev;
              }
              if (prev.some((s) => s.storyId === second.storyId)) {
                return prev;
              }
              return [...prev, second];
            });
          })
          .catch(() => {});
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : "Something went wrong.");
          setSlides([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBoot(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hskLevel]);

  if (!hskLevel) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <h1 className="text-center font-reading text-2xl text-[#241815]">Infinite</h1>
        <p className="mt-2 text-center text-sm text-[#6d615b]">
          Choose an HSK level. We surface standalone public lessons
          {signedIn
            ? " that reinforce vocabulary you have not practiced recently."
            : " at random."}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {hskLevelValues.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => chooseLevel(level)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 rounded-2xl border-[#e7d8cf] text-sm font-semibold text-[#4a3f39] hover:border-[#ea4e47]/40 hover:bg-[#fff7f5]",
              )}
            >
              {getHskLabel(level)}
            </button>
          ))}
        </div>
        {!signedIn ? (
          <p className="mt-6 text-center text-xs text-[#8a7d76]">
            <Link href="/sign-in" className="font-medium text-[#ea4e47] hover:underline">
              Sign in
            </Link>{" "}
            for vocabulary-aware picks and auto-generated lessons when nothing matches.
          </p>
        ) : null}
      </div>
    );
  }

  if (loadingBoot && slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sm text-[#6d615b]">
        <span className="inline-block size-8 animate-pulse rounded-full bg-[#eadcd2]" />
        <p className="mt-4">Loading your first lesson…</p>
      </div>
    );
  }

  if (bootError && slides.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-[#6d615b]">{bootError}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => chooseLevel(hskLevel)}
            className={cn(
              buttonVariants(),
              "rounded-full bg-[#ea4e47] text-white hover:bg-[#d63f38]",
            )}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={changeLevel}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            Change HSK
          </button>
        </div>
        {!signedIn ? (
          <p className="mt-6 text-xs text-[#8a7d76]">
            <Link href="/sign-in" className="font-medium text-[#ea4e47] hover:underline">
              Sign in
            </Link>{" "}
            to unlock more lessons when the library runs dry at this level.
          </p>
        ) : null}
      </div>
    );
  }

  const dominantStory =
    slides.length > 0
      ? slides[Math.min(dominantSlideIndex, slides.length - 1)]!
      : null;

  return (
    <>
      <div
        ref={scrollRef}
        className="h-[calc(100svh-5.75rem)] min-h-[280px] snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      >
        {slides.map((slide, index) => (
          <SlideChrome
            key={`${slide.storyId}-${index}`}
            hskLevel={hskLevel}
            slide={slide}
            slideIndex={index}
            onChangeLevel={changeLevel}
            scrollRootRef={scrollRef}
            onSlideDominant={onSlideDominant}
            displayPreferences={displayPreferences}
          />
        ))}
      </div>
      {dominantStory ? (
        <ReaderBottomToolbar
          story={dominantStory.readerStory}
          placement="fixed"
          roundedTop
          showPinyin={showPinyin}
          showEnglish={showEnglish}
          showCharacters={showCharacters}
          setShowPinyin={setShowPinyin}
          setShowEnglish={setShowEnglish}
          setShowCharacters={setShowCharacters}
        />
      ) : null}
    </>
  );
}
