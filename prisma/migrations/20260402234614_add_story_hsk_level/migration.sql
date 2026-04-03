-- AlterTable
ALTER TABLE "story" ADD COLUMN "hskLevel" TEXT;

UPDATE "story"
SET "hskLevel" = CASE
  WHEN "level" = 'beginner' THEN '1'
  WHEN "level" = 'elementary' THEN '2'
  ELSE '3'
END
WHERE "hskLevel" IS NULL;

ALTER TABLE "story"
ALTER COLUMN "hskLevel" SET NOT NULL;
