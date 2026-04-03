import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";

import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const host = "127.0.0.1";
const port = 55432;
const database = "hanzilane_dev";
const user = "postgres";
const password = "postgres";
const databaseDir = path.join(process.cwd(), ".local-postgres");
const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

function runCommand(
  command: string,
  args: string[],
  extraEnv?: NodeJS.ProcessEnv,
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...extraEnv,
      },
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`,
        ),
      );
    });

    child.on("error", reject);
  });
}

async function canConnect() {
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function ensureDatabaseServer() {
  const server = new EmbeddedPostgres({
    databaseDir,
    port,
    user,
    password,
    persistent: true,
    onLog: () => undefined,
    onError: (message) => {
      if (typeof message === "string" && message.includes("already running")) {
        return;
      }

      console.error(message);
    },
  });

  if (await canConnect()) {
    return server;
  }

  const versionFile = path.join(databaseDir, "PG_VERSION");

  try {
    await fs.access(versionFile);
  } catch {
    await fs.mkdir(databaseDir, { recursive: true });
    await server.initialise();
  }

  await server.start();

  const admin = server.getPgClient("postgres", host);

  try {
    await admin.connect();
    const exists = await admin.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [database],
    );

    if (!exists.rows[0]?.exists) {
      await admin.query(`CREATE DATABASE "${database}"`);
    }
  } finally {
    await admin.end();
  }

  return server;
}

async function main() {
  const useBun = process.argv.includes("--bun");
  const server = await ensureDatabaseServer();

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

  await runCommand("npx", ["prisma", "migrate", "deploy"], env);
  await runCommand("node", ["--import", "tsx", "prisma/seed.ts"], env);

  const command = useBun ? "bun" : "npx";
  const args = useBun
    ? ["--bun", "./node_modules/next/dist/bin/next", "dev", "--hostname", "0.0.0.0", "--turbopack"]
    : ["next", "dev", "--hostname", "0.0.0.0", "--turbopack"];

  const child = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  });

  const shutdown = async (signal?: NodeJS.Signals) => {
    if (signal && child.exitCode === null) {
      child.kill(signal);
    }

    await server.stop().catch(() => undefined);
  };

  process.on("SIGINT", () => {
    shutdown("SIGINT").finally(() => process.exit(130));
  });

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").finally(() => process.exit(143));
  });

  child.on("exit", async (code) => {
    await shutdown();
    process.exit(code ?? 0);
  });

  child.on("error", async (error) => {
    console.error(error);
    await shutdown();
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
