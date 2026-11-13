import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const email = String(b.email || "").toLowerCase().trim();
    const message = String(b.message || "").trim();
    if (!message) return res.json({ ok: false, error: "empty" });
    await sql`insert into feedback(email, message) values (${email}, ${message.slice(0, 4000)})`;
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}
