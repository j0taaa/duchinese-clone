import { unstable_noStore as noStore } from "next/cache";

import { AppHeader } from "@/components/app-header";
import { StoryCard } from "@/components/story-card";
import { requireServerSession } from "@/lib/session";
import { listGeneratedStoriesForUser, listReadStoryIdsForUser } from "@/lib/story-service";

export default async function MyLibraryPage() {
  noStore();
  const session = await requireServerSession();
  const [userStories, readStoryIds] = await Promise.all([
    listGeneratedStoriesForUser(session.user.id),
    listReadStoryIdsForUser(session.user.id),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7f3,_#f7f1eb_48%,_#f4efe8_100%)]">
      <AppHeader active="my-library" />

      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-10">
        <Section
          title="Your latest generations"
          description="Private by default. Public if you chose to publish them."
          stories={userStories}
          readStoryIds={readStoryIds}
          emptyMessage="You haven’t generated a story yet. Open the Generate page to create your first lesson."
        />
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  stories,
  readStoryIds,
  emptyMessage,
}: {
  title: string;
  description: string;
  stories: Awaited<ReturnType<typeof listGeneratedStoriesForUser>>;
  readStoryIds: string[];
  emptyMessage?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-[#271d18] sm:text-2xl">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[#6d615b]">{description}</p>
      </div>

      {stories.length ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isRead={readStoryIds.includes(story.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#dfd3ca] bg-white/72 px-5 py-8 text-sm text-[#6f635d] sm:rounded-[28px] sm:px-6 sm:py-10">
          {emptyMessage ?? "No stories here yet."}
        </div>
      )}
    </section>
  );
}
