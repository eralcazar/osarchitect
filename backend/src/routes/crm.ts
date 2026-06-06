import { Hono } from "hono";
import { query, execute } from "../lib/db";

const router = new Hono();

// Get contacts
router.get("/contacts/:orgId", async (c) => {
  try {
    const { orgId } = c.req.param();
    const contacts = await query(
      `SELECT * FROM crm_contacts WHERE org_id = $1 ORDER BY created_at DESC`,
      [orgId]
    );
    return c.json(contacts);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Create contact
router.post("/contacts", async (c) => {
  try {
    const body = await c.req.json();
    const { org_id, name, email, phone } = body;

    const [contact] = await query(
      `INSERT INTO crm_contacts (org_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [org_id, name, email, phone]
    );

    return c.json(contact);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Get deals
router.get("/deals/:orgId", async (c) => {
  try {
    const { orgId } = c.req.param();
    const deals = await query(
      `SELECT * FROM crm_deals WHERE org_id = $1 ORDER BY created_at DESC`,
      [orgId]
    );
    return c.json(deals);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Create deal
router.post("/deals", async (c) => {
  try {
    const body = await c.req.json();
    const { org_id, contact_id, name, amount, stage } = body;

    const [deal] = await query(
      `INSERT INTO crm_deals (org_id, contact_id, name, amount, stage)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [org_id, contact_id, name, amount, stage]
    );

    return c.json(deal);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
