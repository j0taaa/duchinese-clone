import { NextRequest, NextResponse } from "next/server";

import { lookupWord, lookupWordWithPinyin } from "@/lib/dictionary";

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get("word")?.trim();
  const pinyin = request.nextUrl.searchParams.get("pinyin")?.trim() ?? null;

  if (!word) {
    return NextResponse.json(
      { error: "Missing word parameter." },
      { status: 400 },
    );
  }

  return NextResponse.json(pinyin ? lookupWordWithPinyin(word, pinyin) : lookupWord(word));
}
