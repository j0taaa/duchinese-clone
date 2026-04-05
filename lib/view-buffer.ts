import { prisma } from "./prisma";

const FLUSH_INTERVAL_MS = 60_000;
const SHUTDOWN_FLUSH_DELAY_MS = 5_000;

const viewBuffer = new Map<string, number>();

let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushToDatabase() {
  if (viewBuffer.size === 0) return;

  const viewsToFlush = new Map(viewBuffer);
  viewBuffer.clear();

  try {
    const queries = [...viewsToFlush.entries()].map(
      ([storyId, count]: [string, number]) =>
        prisma.$executeRaw`
          INSERT INTO "story_view" (id, "storyId", "viewCount", "updatedAt")
          VALUES (gen_random_uuid()::text, ${storyId}, ${count}, NOW())
          ON CONFLICT ("storyId")
          DO UPDATE SET "viewCount" = "story_view"."viewCount" + EXCLUDED."viewCount", "updatedAt" = NOW()
        `
    );
    await prisma.$transaction(queries);
  } catch (error) {
    viewBuffer.forEach((count, storyId) => {
      viewBuffer.set(storyId, (viewBuffer.get(storyId) ?? 0) + count);
    });
    console.error("[view-buffer] Failed to flush views, restored to buffer:", error);
  }
}

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(flushToDatabase, FLUSH_INTERVAL_MS);
}

export function trackView(storyId: string) {
  viewBuffer.set(storyId, (viewBuffer.get(storyId) ?? 0) + 1);
  startFlushTimer();
}

export async function getViewCount(storyId: string): Promise<number> {
  const buffered = viewBuffer.get(storyId) ?? 0;
  const record = await prisma.storyView.findUnique({
    where: { storyId },
    select: { viewCount: true },
  });
  return (record?.viewCount ?? 0) + buffered;
}

export async function getViewCounts(storyIds: string[]): Promise<Map<string, number>> {
  const bufferedCounts = new Map<string, number>();
  for (const id of storyIds) {
    const buffered = viewBuffer.get(id) ?? 0;
    if (buffered > 0) {
      bufferedCounts.set(id, buffered);
    }
  }

  const records = await prisma.storyView.findMany({
    where: { storyId: { in: storyIds } },
    select: { storyId: true, viewCount: true },
  });

  const result = new Map<string, number>();
  for (const id of storyIds) {
    const dbCount = records.find((r: { storyId: string; viewCount: number }) => r.storyId === id)?.viewCount ?? 0;
    const buffered = bufferedCounts.get(id) ?? 0;
    result.set(id, dbCount + buffered);
  }
  return result;
}

async function gracefulShutdown() {
  console.log("[view-buffer] Shutting down, flushing remaining views...");
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  const timeout = new Promise((resolve) => setTimeout(resolve, SHUTDOWN_FLUSH_DELAY_MS));
  await Promise.race([flushToDatabase(), timeout]);
  console.log("[view-buffer] Shutdown complete");
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

if (process.env.NODE_ENV !== "production") {
  globalThis.__viewBuffer = viewBuffer;
}

declare global {
  var __viewBuffer: Map<string, number> | undefined;
}
