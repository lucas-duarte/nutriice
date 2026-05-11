import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

async function main() {
  const url = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No database URL");

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

  const hash = await bcrypt.hash("nutriplanner123", 10);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", ["lucasduarte647@gmail.com"]);
  if (existing.rows.length > 0) {
    console.log("Usuário já existe! userId:", existing.rows[0].id);
    await pool.end();
    return;
  }

  const r = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
    ["Nutricionista", "lucasduarte647@gmail.com", hash, "nutritionist"]
  );
  const userId = r.rows[0].id;

  await pool.query(
    "INSERT INTO nutritionists (user_id, crn) VALUES ($1, $2)",
    [userId, "12321321321"]
  );

  console.log("Usuário da nutricionista criado com sucesso! userId:", userId);
  await pool.end();
}

main().catch(e => { console.error("Erro:", e.message); process.exit(1); });
