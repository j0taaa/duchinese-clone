import { unstable_noStore as noStore } from "next/cache";

import { AppHeader } from "@/components/app-header";
import { LibraryScreen } from "@/components/library-screen";
import { hydrateSeries } from "@/lib/series";
import { getServerSession } from "@/lib/session";
import {
  listGeneratedStoriesForUser,
  listPublicStories,
  listReadStoryIdsForUser,
} from "@/lib/story-service";

export default async function Home() {
  noStore();
  const session = await getServerSession();
  const [publicStories, latestUserStories, readStoryIds] = await Promise.all([
    listPublicStories(),
    session ? listGeneratedStoriesForUser(session.user.id) : Promise.resolve([]),
    session ? listReadStoryIdsForUser(session.user.id) : Promise.resolve([]),
  ]);
  const publicSeries = hydrateSeries(publicStories);

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
