import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production" ? true : false,
});
const db = drizzle({ client: pool, schema: schema });

export default db;

// import { drizzle } from "drizzle-orm/node-postgres";

// import * as schema from "@/src/drizzle/schema";

// const db = drizzle({
//   connection: {
//     connectionString: process.env.DATABASE_URL,
//     ssl: process.env.NODE_ENV === "production" ? true : false,
//   },
//   schema: schema,
// });

// export default db;
