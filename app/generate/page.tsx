import { AppHeader } from "@/components/app-header";
import { GenerateStudio } from "@/components/generate-studio";
import { requireServerSession } from "@/lib/session";
import {
  getAiSettingsSummary,
  listGeneratedStoriesForUser,
} from "@/lib/story-service";

export default async function GeneratePage() {
  const session = await requireServerSession();
  const [settingsSummary, recentStories] = await Promise.all([
    getAiSettingsSummary(session.user.id),
    listGeneratedStoriesForUser(session.user.id),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff9f7,_#f7f2ec_52%,_#f4efe8_100%)] text-[#202020]">
      <AppHeader active="generate" />

      <div className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 xl:px-10">
        <GenerateStudio
          settingsSummary={settingsSummary}
          recentStories={recentStories}
        />
      </div>
    </main>
  );
}
