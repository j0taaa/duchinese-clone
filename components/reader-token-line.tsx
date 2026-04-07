import type { ReactNode } from "react";

import type { DictionaryToken } from "@/lib/dictionary";
import { cn } from "@/lib/utils";

export function renderTokenLine({
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
}): ReactNode {
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
            if (!token.interactive) {
              return;
            }
            onSelectWord(token);
          }}
          data-token-button="true"
          data-reader-control="true"
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
