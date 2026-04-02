-- CreateTable
CREATE TABLE "story_read" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_read_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "story_read_userId_readAt_idx" ON "story_read"("userId", "readAt" DESC);

-- CreateIndex
CREATE INDEX "story_read_storyId_idx" ON "story_read"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "story_read_userId_storyId_key" ON "story_read"("userId", "storyId");

-- AddForeignKey
ALTER TABLE "story_read" ADD CONSTRAINT "story_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_read" ADD CONSTRAINT "story_read_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
