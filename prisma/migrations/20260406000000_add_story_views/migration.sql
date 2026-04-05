-- Create story_view table for tracking view counts
CREATE TABLE "story_view" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "story_view_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "story_view_storyId_key" UNIQUE ("storyId")
);

-- Add relationship to story table
ALTER TABLE "story_view" ADD CONSTRAINT "story_view_storyId_story_id_fk" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create index
CREATE INDEX "story_view_storyId_idx" ON "story_view"("storyId");
