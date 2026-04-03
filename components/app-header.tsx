import Link from "next/link";
import { BookOpenText, LibraryBig, Sparkles } from "lucide-react";

import { getServerSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

type AppHeaderProps = {
  active: "library" | "vocabulary" | "my-library" | "generate" | "profile" | "auth";
};

function HanziIcon() {
  return (
    <span className="font-reading text-[0.74rem] leading-none sm:text-sm" aria-hidden="true">
      汉
    </span>
  );
}

export async function AppHeader({ active }: AppHeaderProps) {
  const session = await getServerSession();

  const navItems = [
    {
      href: "/",
      label: "Library",
      key: "library",
      icon: <LibraryBig className="size-4" />,
    },
    {
      href: "/vocabulary",
      label: "Vocabulary",
      key: "vocabulary",
      icon: <HanziIcon />,
    },
    ...(session
      ? [
          {
            href: "/my-library",
            label: "My Stories",
            key: "my-library",
            icon: <BookOpenText className="size-4" />,
          },
          {
            href: "/generate",
            label: "Generate",
            key: "generate",
            icon: <Sparkles className="size-4" />,
          },
        ]
      : []),
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-[#ebddd2] bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-4 py-2 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-3 xl:px-6">
        <div className="flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-start lg:gap-3">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadad0] bg-white px-2 py-1.5 shadow-sm sm:px-2.5 sm:py-1.5"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[#ea4e47] text-white shadow-[0_12px_30px_-18px_rgba(234,78,71,0.8)] sm:size-8.5">
              <BookOpenText className="size-3 sm:size-4" />
            </span>
            <span className="text-[0.88rem] font-semibold tracking-tight text-[#251915] sm:text-[1.1rem]">
              HanziLane
            </span>
          </Link>

          <div className="shrink-0 lg:hidden">
            {session ? (
              <UserMenu name={session.user.name} compact />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/sign-in"
                  prefetch={false}
                  className="inline-flex h-8 items-center rounded-full px-2 text-[0.7rem] font-medium text-[#473b35] hover:bg-[#f8f1eb] sm:h-9 sm:px-3 sm:text-xs"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  prefetch={false}
                  className="inline-flex h-8 items-center rounded-full bg-[#ea4e47] px-2.5 text-[0.7rem] font-medium text-white shadow-[0_16px_32px_-20px_rgba(234,78,71,0.8)] sm:h-9 sm:px-4 sm:text-xs"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="-mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:w-auto lg:flex-none lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
          {navItems.map((item) => {
            return (
              <Link
                key={item.key}
                href={item.href}
                prefetch={false}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-medium transition-colors sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs",
                  active === item.key
                    ? "bg-[#ea4e47] text-white shadow-[0_14px_28px_-18px_rgba(234,78,71,0.8)]"
                    : "bg-white text-[#4e433d] hover:bg-[#f8f1eb] lg:bg-transparent",
                )}
              >
                <span className="inline-flex items-center justify-center">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <UserMenu name={session.user.name} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                prefetch={false}
                className="inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-[#473b35] hover:bg-[#f8f1eb]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                prefetch={false}
                className="inline-flex h-9 items-center rounded-full bg-[#ea4e47] px-4 text-xs font-medium text-white shadow-[0_16px_32px_-20px_rgba(234,78,71,0.8)]"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
