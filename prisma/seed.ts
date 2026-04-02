import "dotenv/config";

import { seedStories } from "@/lib/stories";
import { seedStarterStories } from "@/lib/story-service";

async function main() {
  await seedStarterStories(seedStories);
  console.log(`Seeded ${seedStories.length} starter stories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
