import { UserRound } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { SettingsForm } from "@/components/settings-form";
import { SignOutButton } from "@/components/sign-out-button";
import { requireServerSession } from "@/lib/session";
import { getAiSettingsSummary } from "@/lib/story-service";

export default async function ProfilePage() {
  const session = await requireServerSession();
  const settings = await getAiSettingsSummary(session.user.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff9f7,_#f7f2ec_52%,_#f4efe8_100%)]">
      <AppHeader active="profile" />

      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:px-10">
        <aside className="space-y-4">
          <section className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] sm:rounded-[32px] sm:p-6">
            <div className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
              <UserRound className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#241815] sm:text-3xl">
              {session.user.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6f625c]">
              {session.user.email}
            </p>

            <div className="mt-6">
              <SignOutButton />
            </div>
          </section>
        </aside>

        <section className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] sm:rounded-[32px] sm:p-6 xl:p-8">
          <SettingsForm
            initialBaseUrl={settings?.baseUrl ?? ""}
            initialModel={settings?.model ?? ""}
            hasApiKey={settings?.hasApiKey ?? false}
            apiKeyHint={settings?.apiKeyHint ?? null}
          />
        </section>
      </div>
    </main>
  );
}
