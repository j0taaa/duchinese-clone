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
        compact ? "h-10 gap-2 px-3" : "h-12 gap-3 px-4",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]",
          compact ? "size-7" : "size-8",
        ].join(" ")}
      >
        <UserRound className={compact ? "size-3.5" : "size-4"} />
      </span>
      <span
        className={[
          "truncate text-sm font-semibold",
          compact ? "max-w-[7rem]" : "max-w-[11rem]",
        ].join(" ")}
      >
        {name}
      </span>
    </Link>
  );
}
