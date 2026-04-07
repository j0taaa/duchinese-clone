-- Drop per-user BYOK settings (replaced by server OPENROUTER_API_KEY)
DROP TABLE IF EXISTS "user_ai_settings";

-- Track OpenRouter usage per user (and optional link to generated story)
CREATE TABLE "ai_usage_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "costCredits" DECIMAL(18,8),
    "providerRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_usage_event_userId_createdAt_idx" ON "ai_usage_event"("userId", "createdAt" DESC);
CREATE INDEX "ai_usage_event_storyId_idx" ON "ai_usage_event"("storyId");

ALTER TABLE "ai_usage_event" ADD CONSTRAINT "ai_usage_event_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_usage_event" ADD CONSTRAINT "ai_usage_event_storyId_story_id_fk" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
