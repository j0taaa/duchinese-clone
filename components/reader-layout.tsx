"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpenText,
  ChevronLeft,
  Languages,
  List,
  NotebookPen,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { DictionaryToken, ReaderStory } from "@/lib/dictionary";
import { getLevelLabel, storyLevelMeta, type AppStory } from "@/lib/stories";

import { StorySidebar } from "@/components/story-sidebar";
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
};

export function ReaderLayout({ stories, story }: ReaderLayoutProps) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showCharacters, setShowCharacters] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const firstInteractiveToken = useMemo(
    () =>
      story.tokenizedSections
        .flatMap((section) => section.tokens)
        .find((token) => token.interactive) ?? null,
    [story.tokenizedSections],
  );

  const [selectedWord, setSelectedWord] =
    useState<DictionaryToken | null>(firstInteractiveToken);
  const [selectedSentence, setSelectedSentence] = useState(
    story.tokenizedSections[0]?.english ?? "",
  );
  const levelMeta = storyLevelMeta[story.level];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fbf7f1,_#f3eee7_55%,_#f1ece5_100%)] text-[#202020]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-8 px-4 py-6 sm:px-6 xl:px-10">
        <StorySidebar
          stories={stories}
          activeSlug={story.slug}
          description="Switch between public lessons and any stories available in your library."
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5 pb-24">
          <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.34)] sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#6e625c]">
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
                  <span className={["size-3 rounded-full", levelMeta.dotClass].join(" ")} />
                  <span>{getLevelLabel(story.level)}</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-reading text-4xl text-[#241815]">
                    {story.title}
                  </h1>
                  <p className="text-lg text-[#5f534d]">{story.titleTranslation}</p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`rounded-full border px-4 py-2 text-sm font-medium ${levelMeta.chipClass}`}
              >
                {levelMeta.hsk}
              </Badge>
            </div>
          </div>

          <div className="sticky top-[92px] z-20 rounded-[28px] border border-white/70 bg-white/95 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.34)] backdrop-blur-sm">
            <div className="border-b border-[#efe2d8] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4 text-sm text-[#877870]">
                <span>Sentence meaning</span>
                <button
                  type="button"
                  onClick={() => setShowEnglish((value) => !value)}
                  className="font-medium text-[#d14f43]"
                >
                  {showEnglish ? "Hide" : "Show"}
                </button>
              </div>
              <div className="min-h-20 pt-3 text-[1rem] leading-8 text-[#4f433d]">
                {showEnglish
                  ? selectedSentence
                  : "Hover or tap a sentence section to reveal its translation."}
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-sm text-[#9b8e87]">Word meaning</p>
                {selectedWord ? (
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pt-2">
                    <span className="font-reading text-[2.15rem] leading-none text-[#3a86ea]">
                      {selectedWord.text}
                    </span>
                    <span className="text-[1.1rem] text-[#ef625a]">
                      {selectedWord.pinyin ?? ""}
                    </span>
                    <span className="text-[1rem] text-[#3e3e3e]">
                      {selectedWord.definition ?? ""}
                    </span>
                  </div>
                ) : (
                  <p className="pt-2 text-sm text-[#6f625c]">
                    Hover a word to inspect it. Click or tap a word to open the
                    study sheet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <Card className="border-white/70 bg-white/92 py-0 shadow-[0_18px_70px_-42px_rgba(80,45,24,0.34)]">
            <CardContent className="px-5 py-8 sm:px-8 xl:px-12">
              <div className="space-y-10">
                {story.tokenizedSections.map((section, index) => (
                  <section
                    key={`${story.id}-${index}`}
                    className="space-y-4"
                    onMouseEnter={() => setSelectedSentence(section.english)}
                  >
                    <div className="leading-none">
                      {renderTokenLine({
                        tokens: section.tokens,
                        showPinyin,
                        showCharacters,
                        selectedWord: selectedWord?.text ?? "",
                        onHoverWord: (token) => {
                          setSelectedWord(token);
                          setSelectedSentence(section.english);
                        },
                        onSelectWord: (token) => {
                          setSelectedWord(token);
                          setSelectedSentence(section.english);
                          setSheetOpen(true);
                        },
                      })}
                    </div>
                    {showEnglish ? (
                      <p className="max-w-5xl text-[1rem] leading-8 text-[#5e514b]">
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

          <footer className="fixed inset-x-0 bottom-0 border-t border-[#ebddd2] bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between xl:px-10">
              <div className="flex items-center gap-3 text-sm text-[#6b5f58]">
                <span className="font-medium text-[#2a1e1a]">
                  {story.titleTranslation}
                </span>
                <span>{getLevelLabel(story.level)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
                <span className="inline-flex h-11 items-center gap-2 rounded-full border border-[#eadcd2] bg-white px-4 text-sm font-medium text-[#443934]">
                  <List className="size-4" />
                  Word sheet on tap
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
            {selectedWord ? (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-reading text-5xl text-[#3a86ea]">
                    {selectedWord.text}
                  </span>
                  <span className="text-xl text-[#ef625a]">
                    {selectedWord.pinyin ?? ""}
                  </span>
                </div>
                <div className="rounded-[24px] border border-[#eadecf] bg-[#fcf8f4] p-4 text-base leading-8 text-[#443934]">
                  {selectedWord.definition ?? "No dictionary definition available."}
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
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[#eadcd2] bg-white px-4 text-sm font-medium text-[#443934] hover:bg-[#faf4ef]"
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full border text-sm",
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

function renderTokenLine({
  tokens,
  showPinyin,
  showCharacters,
  selectedWord,
  onHoverWord,
  onSelectWord,
}: {
  tokens: DictionaryToken[];
  showPinyin: boolean;
  showCharacters: boolean;
  selectedWord: string;
  onHoverWord: (token: DictionaryToken) => void;
  onSelectWord: (token: DictionaryToken) => void;
}) {
  return tokens.map((token, index) => {
    const isSelected = token.text === selectedWord && token.interactive;
    const isPunctuation = !token.interactive && !token.pinyin;

    if (isPunctuation) {
      return (
        <span
          key={`${token.text}-${index}`}
          className="inline-block align-bottom font-reading text-[2.05rem] leading-[1.8] text-[#2d2d2d] sm:text-[2.4rem]"
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
          onFocus={() => token.interactive && onHoverWord(token)}
          onClick={() => token.interactive && onSelectWord(token)}
          className={cn(
            "inline-flex flex-col items-start rounded-[10px] px-1 text-left transition-colors",
            token.interactive && "hover:bg-[#f0f7ff]",
            isSelected && "bg-[#e5f3ff]",
          )}
        >
          <span className="min-h-7 text-[1.02rem] leading-7 text-[#696969] sm:text-[1.12rem]">
            {showPinyin ? token.pinyin ?? "" : ""}
          </span>
          <span
            className={cn(
              "font-reading text-[2.05rem] leading-none text-[#2d2d2d] sm:text-[2.4rem]",
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
