import { KeyRound, UserRound } from "lucide-react";

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

      <div className="mx-auto grid w-full max-w-[1480px] gap-8 px-4 py-8 sm:px-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:px-10">
        <aside className="space-y-4">
          <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)]">
            <div className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
              <UserRound className="size-6" />
            </div>
            <p className="text-sm tracking-[0.16em] text-[#9e8073] uppercase">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#241815]">
              {session.user.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6f625c]">
              {session.user.email}
            </p>

            <div className="mt-6 rounded-[24px] border border-[#efe3db] bg-[#fcf8f4] px-4 py-4 text-sm leading-7 text-[#6f625c]">
              Your account settings, saved model credentials, and sign-out action
              all live here now.
            </div>

            <div className="mt-6">
              <SignOutButton />
            </div>
          </section>
        </aside>

        <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] xl:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
              <KeyRound className="size-3.5" />
              Model Settings
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-[#241815] sm:text-4xl">
                Manage your AI provider
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[#6a5b55] sm:text-base">
                Save your model URL, model name, and API key here. The API key
                stays on the server and is only used when you generate stories.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <SettingsForm
              initialBaseUrl={settings?.baseUrl ?? ""}
              initialModel={settings?.model ?? ""}
              hasApiKey={settings?.hasApiKey ?? false}
              apiKeyHint={settings?.apiKeyHint ?? null}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
