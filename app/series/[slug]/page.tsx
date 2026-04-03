import Link from "next/link";
import { ChevronLeft, Layers3 } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { StoryCard } from "@/components/story-card";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "@/lib/session";
import { getAccessibleSeriesBySlug, listReadStoryIdsForUser } from "@/lib/story-service";

type SeriesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = await getAccessibleSeriesBySlug(slug);

  if (!series) {
    return {
      title: "Series not found",
    };
  }

  return {
    title: `${series.titleTranslation} | HanziLane`,
    description: series.summary,
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  noStore();
  const { slug } = await params;
  const session = await getServerSession();
  const [series, readStoryIds] = await Promise.all([
    getAccessibleSeriesBySlug(slug, session?.user.id),
    session ? listReadStoryIdsForUser(session.user.id) : Promise.resolve<string[]>([]),
  ]);

  if (!series) {
    notFound();
  }

  const seriesReadCount = readStoryIds.filter((id: string) =>
    series.stories.some((story) => story.id === id),
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f5,_#f7f0e8_52%,_#f3ede4_100%)] text-[#202020]">
      <AppHeader active="library" />

      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-10">
        <section className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_-56px_rgba(92,46,24,0.38)] backdrop-blur sm:rounded-[30px] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-[#6e625c] sm:gap-3 sm:text-sm">
                <Link
                  href="/"
                  prefetch={false}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-[#eadcd2] bg-white px-3 text-sm font-medium text-[#5a4d47] hover:bg-[#faf4ef]"
                >
                  <ChevronLeft className="size-4" />
                  Library
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#eadcd2] bg-[#fff8f3] px-3 py-1 text-[#72584b]">
                  <Layers3 className="size-4" />
                  Series
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="font-reading text-[1.7rem] text-[#241815] sm:text-4xl">
                  {series.title}
                </h1>
                <p className="text-[0.92rem] text-[#5f534d] sm:text-lg">{series.titleTranslation}</p>
                <p className="max-w-3xl text-sm leading-6 text-[#6b5e58] sm:text-base sm:leading-7">
                  {series.summary}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-[#ead9cf] bg-[#fff9f5] px-4 py-2 text-sm font-medium text-[#72584b]"
            >
              {seriesReadCount}/{series.stories.length} read
            </Badge>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[#271d18] sm:text-2xl">
              Stories in this series
            </h2>
            <p className="text-sm leading-6 text-[#6d615b]">
              Open any lesson below to keep reading around the same subject.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
            {series.stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isRead={readStoryIds.includes(story.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
