"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

export function UserMenu({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/profile"
      prefetch={false}
      className={[
        "inline-flex items-center rounded-full border border-[#eadcd2] bg-white/92 text-[#2b201c] shadow-sm transition-colors hover:bg-[#f9f4ef]",
        compact ? "h-8.5 gap-1.5 px-2.5 sm:h-10 sm:gap-2 sm:px-3" : "h-12 gap-3 px-4",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]",
          compact ? "size-6 sm:size-7" : "size-8",
        ].join(" ")}
      >
        <UserRound className={compact ? "size-3 sm:size-3.5" : "size-4"} />
      </span>
      <span
        className={[
          "truncate font-semibold",
          compact ? "max-w-[6rem] text-[0.8rem] sm:max-w-[7rem] sm:text-sm" : "max-w-[11rem] text-sm",
        ].join(" ")}
      >
        {name}
      </span>
    </Link>
  );
}
