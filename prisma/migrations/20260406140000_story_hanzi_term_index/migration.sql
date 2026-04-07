-- CreateTable
CREATE TABLE "story_hanzi_term" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "term" VARCHAR(128) NOT NULL,

    CONSTRAINT "story_hanzi_term_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "story_hanzi_term_term_idx" ON "story_hanzi_term"("term");

-- CreateIndex
CREATE UNIQUE INDEX "story_hanzi_term_storyId_term_key" ON "story_hanzi_term"("storyId", "term");

-- AddForeignKey
ALTER TABLE "story_hanzi_term" ADD CONSTRAINT "story_hanzi_term_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
