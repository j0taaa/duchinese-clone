import { AppHeader } from "@/components/app-header";
import { getVocabularyLevelGroups } from "@/lib/vocabulary";

export default function VocabularyPage() {
  const levels = getVocabularyLevelGroups();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f4,_#f7f1e9_52%,_#f2ece4_100%)]">
      <AppHeader active="vocabulary" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-8 sm:px-6 xl:px-10">
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <a
              key={level.key}
              href={`#${level.key}`}
              className="rounded-full border border-[#ead9cf] bg-white px-4 py-2 text-sm text-[#554842] hover:bg-[#faf4ef]"
            >
              {level.title}
            </a>
          ))}
        </div>

        <div className="space-y-8">
          {levels.map((level) => (
            <section
              key={level.key}
              id={level.key}
              className="space-y-4 rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-52px_rgba(92,46,24,0.34)] sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-[#241815] sm:text-3xl">
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
                    className="rounded-[24px] border border-[#ebddd2] bg-[#fffdfa] px-5 py-4 shadow-[0_12px_36px_-34px_rgba(80,45,24,0.3)]"
                  >
                    <p className="font-reading text-4xl leading-none text-[#241815]">
                      {entry.hanzi}
                    </p>
                    <p className="mt-3 text-base text-[#ef625a]">
                      {entry.pinyin ?? "No pinyin"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#645852]">
                      {entry.definition ?? "No definition available."}
                    </p>
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
