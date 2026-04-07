"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SeriesAppendNextEpisode({ seriesSlug }: { seriesSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/series/${encodeURIComponent(seriesSlug)}/append-episode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not generate the episode.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-[#f0e8e2] bg-[linear-gradient(180deg,rgba(255,252,249,0.9)_0%,rgba(255,255,255,0.96)_100%)] px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#b07f72]">
            Continue the series
          </p>
          <p className="text-sm leading-6 text-[#6d615b]">
            Generate a new episode that follows the same story, using all existing episodes as
            context.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void onGenerate()}
          className={cn(
            buttonVariants(),
            "shrink-0 rounded-full bg-[#ea4e47] px-5 text-white hover:bg-[#d63f38] disabled:opacity-60",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              Generate next episode
            </>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-[#b25045]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
