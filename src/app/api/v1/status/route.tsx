import db from "@/src/drizzle/db";

export async function GET() {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await db.execute("SHOW server_version");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await db.execute("SHOW max_connections");

  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  return Response.json(
    {
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
