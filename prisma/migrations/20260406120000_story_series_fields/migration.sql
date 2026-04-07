-- User-generated series: episodes share seriesGroupSlug + seriesEpisode; series metadata duplicated on each row
ALTER TABLE "story" ADD COLUMN "seriesGroupSlug" TEXT;
ALTER TABLE "story" ADD COLUMN "seriesEpisode" INTEGER;
ALTER TABLE "story" ADD COLUMN "seriesTitle" TEXT;
ALTER TABLE "story" ADD COLUMN "seriesTitleTranslation" TEXT;
ALTER TABLE "story" ADD COLUMN "seriesSummary" TEXT;

CREATE INDEX "story_seriesGroupSlug_seriesEpisode_idx" ON "story"("seriesGroupSlug", "seriesEpisode");
