import Link from "next/link";
import { BookOpenText, LibraryBig, Settings2, Sparkles } from "lucide-react";

import { getServerSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

type AppHeaderProps = {
  active: "library" | "my-library" | "generate" | "settings" | "auth";
};

export async function AppHeader({ active }: AppHeaderProps) {
  const session = await getServerSession();

  const navItems = [
    { href: "/", label: "Library", key: "library", icon: LibraryBig },
    ...(session
      ? [
          {
            href: "/my-library",
            label: "My Stories",
            key: "my-library",
            icon: BookOpenText,
          },
          {
            href: "/generate",
            label: "Generate",
            key: "generate",
            icon: Sparkles,
          },
          {
            href: "/settings",
            label: "Settings",
            key: "settings",
            icon: Settings2,
          },
        ]
      : []),
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-[#ebddd2] bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full border border-[#eadad0] bg-white px-3 py-2 shadow-sm"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[#ea4e47] text-white shadow-[0_12px_30px_-18px_rgba(234,78,71,0.8)]">
              <BookOpenText className="size-5" />
            </span>
            <span className="text-[1.45rem] font-semibold tracking-tight text-[#251915]">
              HanziLane
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    active === item.key
                      ? "bg-[#ea4e47] text-white shadow-[0_14px_28px_-18px_rgba(234,78,71,0.8)]"
                      : "text-[#4e433d] hover:bg-[#f8f1eb]",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <UserMenu name={session.user.name} email={session.user.email} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-[#473b35] hover:bg-[#f8f1eb]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center rounded-full bg-[#ea4e47] px-5 text-sm font-medium text-white shadow-[0_16px_32px_-20px_rgba(234,78,71,0.8)]"
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
