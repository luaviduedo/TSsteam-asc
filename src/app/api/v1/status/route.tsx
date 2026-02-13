import db from "@/src/drizzle/db";
import { QueryResultRow } from "@neondatabase/serverless";

export async function GET() {
  const updatedAt = new Date().toISOString();

  const usersResult = await db.query.usersTable.findMany();

  const databaseVersionResult = await db.execute("SHOW server_version");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult: QueryResultRow = await db.execute(
    "SHOW max_connections",
  );

  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await db.execute(
    `SELECT count(*)::int FROM pg_stat_activity WHERE datname = ${databaseName};`,
  );

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  return Response.json(
    {
      users: usersResult,
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          openedConnections: databaseOpenedConnectionsValue,
        },
      },
    },
    { status: 200 },
  );
}
