import { ShieldCheck, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { SettingsForm } from "@/components/settings-form";
import { requireServerSession } from "@/lib/session";
import { getAiSettingsSummary } from "@/lib/story-service";

export default async function SettingsPage() {
  const session = await requireServerSession();
  const settings = await getAiSettingsSummary(session.user.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff9f7,_#f7f2ec_52%,_#f4efe8_100%)]">
      <AppHeader active="settings" />

      <div className="mx-auto grid w-full max-w-[1480px] gap-8 px-4 py-8 sm:px-6 xl:grid-cols-[minmax(0,0.9fr)_380px] xl:px-10">
        <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-54px_rgba(92,46,24,0.42)] xl:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
              <Sparkles className="size-3.5" />
              Model Settings
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-[#241815] sm:text-4xl">
                Save your AI provider once, generate anywhere
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[#6a5b55] sm:text-base">
                Your base URL, model, and API key are stored on the server and are
                never exposed to other users. Leave the API key blank to keep the
                one already saved.
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

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-[#efe3db] bg-white/80 p-6">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#241815]">How your keys are used</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[#6f625c]">
              <p>The app reads your saved settings only on the server when you generate a story.</p>
              <p>The API key is not rendered back into the client after it is saved.</p>
              <p>Each generated story is stored in Postgres under your account so it follows you across devices.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
