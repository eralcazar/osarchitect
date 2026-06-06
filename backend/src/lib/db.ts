import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export const db = pool;

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await db.query(sql, params);
    return result.rows as T[];
  } catch (err) {
    console.error("DB Error:", err);
    throw err;
  }
}

export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(sql: string, params?: any[]): Promise<number> {
  try {
    const result = await db.query(sql, params);
    return result.rowCount || 0;
  } catch (err) {
    console.error("DB Error:", err);
    throw err;
  }
}
