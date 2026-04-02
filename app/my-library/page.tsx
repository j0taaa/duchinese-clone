import type { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { StoryCard } from "@/components/story-card";
import { requireServerSession } from "@/lib/session";
import { listGeneratedStoriesForUser } from "@/lib/story-service";

export default async function MyLibraryPage() {
  const session = await requireServerSession();
  const userStories = await listGeneratedStoriesForUser(session.user.id);

  const privateStories = userStories.filter(
    (story) => story.visibility === "private_user",
  );
  const publicStories = userStories.filter(
    (story) => story.visibility === "public_user",
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7f3,_#f7f1eb_48%,_#f4efe8_100%)]">
      <AppHeader active="my-library" />

      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <section className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_22px_70px_-50px_rgba(92,46,24,0.35)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
                <Sparkles className="size-3.5" />
                Personal Library
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#241815] sm:text-4xl">
                  Your saved stories, synced to your account
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-[#6a5b55] sm:text-base">
                  Every story you generate is saved server-side so you can reopen
                  it from any device after signing in.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                icon={<Lock className="size-4" />}
                label="Private stories"
                value={String(privateStories.length)}
              />
              <StatCard
                icon={<Sparkles className="size-4" />}
                label="Public stories"
                value={String(publicStories.length)}
              />
            </div>
          </div>
        </section>

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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#efe2d9] bg-[#fcf8f4] px-4 py-4">
      <div className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-white text-[#b04e42] shadow-sm">
        {icon}
      </div>
      <p className="text-xl font-semibold text-[#241815]">{value}</p>
      <p className="text-xs tracking-[0.12em] text-[#87776f] uppercase">{label}</p>
    </div>
  );
}
