import "dotenv/config";

import { rebuildAllStoryHanziIndexes } from "@/lib/story-hanzi-index";

async function main() {
  await rebuildAllStoryHanziIndexes();
  console.log("Rebuilt story_hanzi_term index for all stories.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
