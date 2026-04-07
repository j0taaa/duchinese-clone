import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";

import { Prisma } from "@/lib/generated/prisma/client";
import {
  DEFAULT_OPENROUTER_CHAT_URL,
  DEFAULT_OPENROUTER_MODEL,
  getOpenRouterChatUrl,
  getOpenRouterModel,
} from "@/lib/openrouter-config";
import type { AiUsageProfileRow, AiUsageProfileSummary } from "@/lib/story-service";

function formatInt(n: number) {
  return n.toLocaleString();
}

function formatCredits(value: Prisma.Decimal | null) {
  if (value === null) {
    return "—";
  }
  return value.toString();
}

function formatRowCredits(value: AiUsageProfileRow["costCredits"]) {
  if (value === null) {
    return "—";
  }
  return value.toString();
}

export function ProfileAiUsage({
  summary,
  recent,
}: {
  summary: AiUsageProfileSummary;
  recent: AiUsageProfileRow[];
}) {
  const model = getOpenRouterModel();
  const chatUrl = getOpenRouterChatUrl();
  const showDefaultsHint =
    model === DEFAULT_OPENROUTER_MODEL && chatUrl === DEFAULT_OPENROUTER_CHAT_URL;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#edd8cf] bg-[#fff7f3] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#c66052] uppercase">
          <Sparkles className="size-3.5" />
          AI generation
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-[#241815] sm:text-2xl">
          Model &amp; usage
        </h2>
        <p className="text-sm leading-6 text-[#6f625c]">
          Lessons are generated with the app&apos;s OpenRouter key. Usage below is billed to the
          project; we record OpenRouter-reported tokens and cost per account for transparency.
        </p>
      </div>

      <div className="rounded-[22px] border border-[#ebe2da] bg-[#fcfaf7] p-5 sm:rounded-[28px] sm:p-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#8a7b73] uppercase">
          Active model
        </p>
        <p className="mt-2 font-mono text-sm text-[#241815]">{model}</p>
        <p className="mt-1 break-all font-mono text-xs text-[#7a6d66]">{chatUrl}</p>
        {showDefaultsHint ? (
          <p className="mt-3 text-xs text-[#8a7b73]">
            Defaults: <span className="font-mono">{DEFAULT_OPENROUTER_MODEL}</span> via OpenRouter.
            Override with <span className="font-mono">OPENROUTER_MODEL</span> /{" "}
            <span className="font-mono">OPENROUTER_CHAT_URL</span> in server env.
          </p>
        ) : null}
      </div>

      <div className="rounded-[22px] border border-[#ebe2da] bg-white p-5 sm:rounded-[28px] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-full bg-[#fff3ef] text-[#d14f43]">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#241815]">Your generation totals</p>
            <p className="text-xs text-[#8a7b73]">
              OpenRouter cost is shown in credits as returned by the API (not a charge to you in the
              app).
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#f0e8e2] bg-[#fffcfa] px-4 py-3">
            <dt className="text-xs font-medium text-[#8a7b73]">Generations</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[#241815]">
              {formatInt(summary.generationCount)}
            </dd>
          </div>
          <div className="rounded-2xl border border-[#f0e8e2] bg-[#fffcfa] px-4 py-3">
            <dt className="text-xs font-medium text-[#8a7b73]">Total tokens</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[#241815]">
              {formatInt(summary.totalTokens)}
            </dd>
          </div>
          <div className="rounded-2xl border border-[#f0e8e2] bg-[#fffcfa] px-4 py-3">
            <dt className="text-xs font-medium text-[#8a7b73]">Prompt / completion</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-[#241815]">
              {formatInt(summary.totalPromptTokens)} / {formatInt(summary.totalCompletionTokens)}
            </dd>
          </div>
          <div className="rounded-2xl border border-[#f0e8e2] bg-[#fffcfa] px-4 py-3">
            <dt className="text-xs font-medium text-[#8a7b73]">OpenRouter cost (credits)</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[#241815]">
              {formatCredits(summary.totalCostCredits)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#4f433d]">Recent activity</h3>
        {recent.length === 0 ? (
          <p className="rounded-[20px] border border-[#ebe2da] bg-[#fcfaf7] px-4 py-4 text-sm text-[#6f625c]">
            No generations recorded yet.{" "}
            <Link href="/generate" className="font-medium text-[#c66052] underline-offset-2 hover:underline">
              Generate a lesson
            </Link>{" "}
            to see usage here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[22px] border border-[#ebe2da] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#f0e8e2] bg-[#fcfaf7] text-xs font-semibold tracking-wide text-[#8a7b73] uppercase">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Cost (credits)</th>
                  <th className="px-4 py-3">Tokens</th>
                  <th className="px-4 py-3">Lesson</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5eeea]">
                {recent.map((row) => (
                  <tr key={row.id} className="text-[#4f433d]">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#6f625c]">
                      {row.createdAt.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {formatRowCredits(row.costCredits)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-xs">
                      {row.totalTokens != null ? formatInt(row.totalTokens) : "—"}
                      <span className="block text-[10px] font-normal text-[#9a8f88]">
                        p {row.promptTokens != null ? formatInt(row.promptTokens) : "—"} / c{" "}
                        {row.completionTokens != null ? formatInt(row.completionTokens) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.story ? (
                        <Link
                          href={`/stories/${row.story.slug}`}
                          className="font-medium text-[#c66052] underline-offset-2 hover:underline"
                        >
                          {row.story.titleTranslation}
                        </Link>
                      ) : (
                        <span className="text-[#9a8f88]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
