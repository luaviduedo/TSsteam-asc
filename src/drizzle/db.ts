import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "@/src/drizzle/schema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : false,
  },
  schema: schema,
});

export default db;
