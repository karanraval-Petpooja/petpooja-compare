import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

function genPassword(email) {
  const local = String(email).split("@")[0].toLowerCase().trim();
  const parts = local.split(".");
  const first = ((parts[0] || "user").replace(/[^a-z]/g, "").slice(0, 3)) || "usr";
  const secondRaw = parts[1] || "";
  const secondLetter = (secondRaw.replace(/[^a-z]/g, "").charAt(0)) || "x";
  const digits = (secondRaw.match(/\d+$/) || [""])[0];
  return `${first}.${secondLetter}${digits}@123`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    if (!email) return res.json({ ok: false, reason: "not_allowed" });

    const staff = await sql`select role, password from staff where email = ${email} limit 1`;
    if (staff.length) {
      if (staff[0].password !== password) return res.json({ ok: false, reason: "bad_password" });
      await sql`insert into usage_events(email) values (${email})`;
      return res.json({ ok: true, role: staff[0].role });
    }
    const allowed = await sql`select 1 from allowed_emails where email = ${email} limit 1`;
    if (allowed.length) {
      if (password !== genPassword(email)) return res.json({ ok: false, reason: "bad_password" });
      await sql`insert into usage_events(email) values (${email})`;
      return res.json({ ok: true, role: "user" });
    }
    return res.json({ ok: false, reason: "not_allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}
