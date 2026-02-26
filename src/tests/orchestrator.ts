import { exec } from "child_process";
import retry from "async-retry";
import db from "@/drizzle/db";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function migrateDatabase() {
  try {
    exec("npx drizzle-kit push", () => {});
  } catch (error) {
    console.log(`exec error: ${error}`);
  }
}

async function cleanDatabase() {
  await db.execute("drop schema public cascade; create schema public;");
  await db.$client.end();
}

const orchestrator = {
  cleanDatabase,
  migrateDatabase,
  waitForAllServices,
};

export default orchestrator;
