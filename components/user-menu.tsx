"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

export function UserMenu({ name }: { name: string }) {
  return (
    <Link
      href="/profile"
      prefetch={false}
      className="inline-flex h-12 items-center gap-3 rounded-full border border-[#eadcd2] bg-white/92 px-4 text-[#2b201c] shadow-sm transition-colors hover:bg-[#f9f4ef]"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
        <UserRound className="size-4" />
      </span>
      <span className="max-w-[11rem] truncate text-sm font-semibold">{name}</span>
    </Link>
  );
}
