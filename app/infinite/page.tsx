import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

import { AppHeader } from "@/components/app-header";
import { InfiniteFeed } from "@/components/infinite-feed";
import { getServerSession } from "@/lib/session";
import { hskLevelValues, type HskLevel } from "@/lib/stories";

type InfinitePageProps = {
  searchParams?: Promise<{
    hsk?: string;
  }>;
};

function parseHsk(raw: string | undefined): HskLevel | null {
  if (!raw || !(hskLevelValues as readonly string[]).includes(raw)) {
    return null;
  }
  return raw as HskLevel;
}

export default async function InfinitePage({ searchParams }: InfinitePageProps) {
  noStore();
  const resolved = searchParams ? await searchParams : undefined;
  const initialHsk = parseHsk(resolved?.hsk);
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f4,_#f7f1e9_52%,_#f2ece4_100%)]">
      <AppHeader active="infinite" />
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-[#6d615b]">Loading Infinite…</div>
        }
      >
        <InfiniteFeed initialHsk={initialHsk} signedIn={Boolean(session)} />
      </Suspense>
    </main>
  );
}
