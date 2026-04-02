import { AppHeader } from "@/components/app-header";
import { LibraryScreen } from "@/components/library-screen";
import { getServerSession } from "@/lib/session";
import {
  listGeneratedStoriesForUser,
  listPublicStories,
  listPublicSeries,
  listReadStoryIdsForUser,
} from "@/lib/story-service";

export default async function Home() {
  const session = await getServerSession();
  const [publicStories, publicSeries, latestUserStories, readStoryIds] = await Promise.all([
    listPublicStories(),
    listPublicSeries(session?.user.id),
    session ? listGeneratedStoriesForUser(session.user.id) : Promise.resolve([]),
    session ? listReadStoryIdsForUser(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f5,_#f7f0e8_52%,_#f3ede4_100%)] text-[#202020]">
      <AppHeader active="library" />
      <LibraryScreen
        publicStories={publicStories}
        publicSeries={publicSeries}
        latestUserStories={latestUserStories}
        readStoryIds={readStoryIds}
        signedIn={Boolean(session)}
      />
    </main>
  );
}
