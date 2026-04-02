import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { ReaderLayout } from "@/components/reader-layout";
import { buildReaderStory } from "@/lib/dictionary";
import { getServerSession } from "@/lib/session";
import {
  getAccessibleStoryBySlug,
  getSeriesForAccessibleStory,
  getStoryListForReader,
  listReadStoryIdsForUser,
  markStoryRead,
} from "@/lib/story-service";

type StoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getAccessibleStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story not found",
    };
  }

  return {
    title: `${story.title} | HanziLane`,
    description: story.summary,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const session = await getServerSession();
  const [story, stories, series] = await Promise.all([
    getAccessibleStoryBySlug(slug, session?.user.id),
    getStoryListForReader(session?.user.id),
    getSeriesForAccessibleStory(slug, session?.user.id),
  ]);

  if (!story) {
    notFound();
  }

  if (session) {
    await markStoryRead(session.user.id, story.id);
  }

  const readStoryIds = session
    ? await listReadStoryIdsForUser(session.user.id)
    : [];

  return (
    <div className="min-h-screen">
      <AppHeader active="library" />
      <ReaderLayout
        stories={stories}
        story={buildReaderStory(story)}
        series={series}
        readStoryIds={readStoryIds}
      />
    </div>
  );
}
