import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function callerRole(email, password) {
  const em = String(email || "").toLowerCase().trim();
  const rows = await sql`select role, password from staff where email = ${em} limit 1`;
  if (rows.length && rows[0].password === password) return rows[0].role;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const adminEmail = String(b.adminEmail || "").toLowerCase().trim();
    const role = await callerRole(adminEmail, b.adminPassword);
    if (!role) return res.status(403).json({ ok: false, error: "not authorized" });
    const isSuper = role === "superadmin";

    switch (b.action) {
      case "list_employees": {
        const data = await sql`select email, added_by from allowed_emails order by created_at desc`;
        return res.json({ ok: true, data });
      }
      case "usage": {
        const data = await sql`select email, count(*)::int as opens, max(created_at) as last_seen from usage_events group by email order by count(*) desc`;
        return res.json({ ok: true, data });
      }
      case "add_employees": {
        const emails = (b.emails || []).map((e) => String(e).toLowerCase().trim()).filter((e) => RX.test(e));
        let c = 0;
        for (const e of emails) {
          const st = await sql`select 1 from staff where email = ${e} limit 1`;
          if (st.length) continue;
          await sql`insert into allowed_emails(email, added_by) values (${e}, ${adminEmail}) on conflict do nothing`;
          c++;
        }
        return res.json({ ok: true, count: c });
      }
      case "remove_employee": {
        await sql`delete from allowed_emails where email = ${String(b.target).toLowerCase().trim()}`;
        return res.json({ ok: true });
      }
      case "list_staff": {
        if (!isSuper) return res.status(403).json({ ok: false, error: "not authorized" });
        const data = await sql`select email, role, password, added_by from staff order by role desc, created_at desc`;
        return res.json({ ok: true, data });
      }
      case "add_staff": {
        if (!isSuper) return res.status(403).json({ ok: false, error: "not authorized" });
        const ne = String(b.newEmail || "").toLowerCase().trim();
        const np = String(b.newPassword || "").trim();
        const r = b.role;
        if (!RX.test(ne)) return res.json({ ok: false, error: "invalid email" });
        if (np.length < 4) return res.json({ ok: false, error: "password too short" });
        if (!["admin", "superadmin"].includes(r)) return res.json({ ok: false, error: "invalid role" });
        await sql`insert into staff(email, role, password, added_by) values (${ne}, ${r}, ${np}, ${adminEmail})
                  on conflict (email) do update set role = excluded.role, password = excluded.password`;
        await sql`delete from allowed_emails where email = ${ne}`;
        return res.json({ ok: true });
      }
      case "remove_staff": {
        if (!isSuper) return res.status(403).json({ ok: false, error: "not authorized" });
        const t = String(b.target).toLowerCase().trim();
        if (t === adminEmail) return res.json({ ok: false, error: "cannot remove yourself" });
        await sql`delete from staff where email = ${t}`;
        return res.json({ ok: true });
      }
      default:
        return res.status(400).json({ ok: false, error: "unknown action" });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}
