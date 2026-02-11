import db from "@/src/drizzle/db";
import { usersTable } from "@/src/drizzle/schema";
import { QueryResultRow } from "@neondatabase/serverless";
import { PgTable } from "drizzle-orm/pg-core";

export async function GET() {
  const updatedAt = new Date().toISOString();

  const users = await db.query.usersTable.findMany();

  const databaseVersionResult = await db.execute("SHOW server_version");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult: QueryResultRow = await db.execute(
    "SHOW max_connections",
  );

  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  return Response.json(
    {
      users: users,
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
        },
      },
    },
    { status: 200 },
  );
}

export async function POST() {
  await db
    .insert(usersTable)
    .values({ name: "bancoNeon", age: 18, email: "bancoonline@gmail.com" });
}
