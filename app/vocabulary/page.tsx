import { AppHeader } from "@/components/app-header";
import { getServerSession } from "@/lib/session";
import { getVocabularyReadStatsForUser } from "@/lib/story-service";
import { getVocabularyLevelGroups, mergeVocabularyReadStats } from "@/lib/vocabulary";

type VocabularyPageProps = {
  searchParams?: Promise<{
    level?: string;
  }>;
};

const validLevels = new Set(["all", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"]);

export default async function VocabularyPage({ searchParams }: VocabularyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedLevel = validLevels.has(resolvedSearchParams?.level ?? "")
    ? (resolvedSearchParams?.level as string)
    : "all";
  const session = await getServerSession();
  const baseLevels = getVocabularyLevelGroups();
  const readStats = session
    ? await getVocabularyReadStatsForUser(session.user.id)
    : new Map();
  const levels = mergeVocabularyReadStats(baseLevels, readStats);
  const visibleLevels =
    selectedLevel === "all"
      ? levels
      : levels.filter((level) => level.key === selectedLevel);
  const filters = [
    { key: "all", title: "All" },
    ...levels.map((level) => ({ key: level.key, title: level.title })),
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f4,_#f7f1e9_52%,_#f2ece4_100%)]">
      <AppHeader active="vocabulary" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 xl:px-10">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {filters.map((level) => (
            <a
              key={level.key}
              href={level.key === "all" ? "/vocabulary" : `/vocabulary?level=${level.key}`}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                selectedLevel === level.key
                  ? "border-[#ea4e47] bg-[#ea4e47] text-white shadow-[0_14px_28px_-18px_rgba(234,78,71,0.8)]"
                  : "border-[#ead9cf] bg-white text-[#554842] hover:bg-[#faf4ef]",
              ].join(" ")}
            >
              {level.title}
            </a>
          ))}
        </div>

        <div className="space-y-8">
          {visibleLevels.map((level) => (
            <section
              key={level.key}
              id={level.key}
              className="space-y-4 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_70px_-52px_rgba(92,46,24,0.34)] sm:rounded-[32px] sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl font-semibold tracking-tight text-[#241815] sm:text-3xl">
                  {level.title}
                </h1>
                <span className="rounded-full border border-[#eadcd2] bg-[#fcf8f4] px-3 py-1 text-sm text-[#6c5f58]">
                  {level.characters.length} characters
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {level.characters.map((entry) => (
                  <article
                    key={`${level.key}-${entry.hanzi}`}
                    className="rounded-[20px] border border-[#ebddd2] bg-[#fffdfa] px-4 py-4 shadow-[0_12px_36px_-34px_rgba(80,45,24,0.3)] sm:rounded-[24px] sm:px-5"
                  >
                    <p className="font-reading text-[2rem] leading-none text-[#241815] sm:text-4xl">
                      {entry.hanzi}
                    </p>
                    <p className="mt-2 text-sm text-[#ef625a] sm:mt-3 sm:text-base">
                      {entry.pinyin ?? "No pinyin"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#645852]">
                      {entry.definition ?? "No definition available."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7b6f68]">
                      <span className="rounded-full border border-[#eadcd2] bg-[#fcf8f4] px-2.5 py-1">
                        {entry.readCount} reads
                      </span>
                      <span className="rounded-full border border-[#eadcd2] bg-[#fcf8f4] px-2.5 py-1">
                        {entry.lastReadAt
                          ? `Last read ${new Date(entry.lastReadAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : "Not read yet"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
