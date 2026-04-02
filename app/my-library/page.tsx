import { AppHeader } from "@/components/app-header";
import { StoryCard } from "@/components/story-card";
import { requireServerSession } from "@/lib/session";
import { listGeneratedStoriesForUser } from "@/lib/story-service";

export default async function MyLibraryPage() {
  const session = await requireServerSession();
  const userStories = await listGeneratedStoriesForUser(session.user.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7f3,_#f7f1eb_48%,_#f4efe8_100%)]">
      <AppHeader active="my-library" />

      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <Section
          title="Your latest generations"
          description="Private by default. Public if you chose to publish them."
          stories={userStories}
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
  emptyMessage,
}: {
  title: string;
  description: string;
  stories: Awaited<ReturnType<typeof listGeneratedStoriesForUser>>;
  emptyMessage?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-[#271d18]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[#6d615b]">{description}</p>
      </div>

      {stories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#dfd3ca] bg-white/72 px-6 py-10 text-sm text-[#6f635d]">
          {emptyMessage ?? "No stories here yet."}
        </div>
      )}
    </section>
  );
}
