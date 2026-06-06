import { Hono } from "hono";
import { z } from "zod";
import { signToken, verifyToken } from "../lib/auth";
import { query, execute } from "../lib/db";
import { v4 as uuid } from "uuid";

const router = new Hono();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  org_name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Signup
router.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, full_name, org_name } = SignupSchema.parse(body);

    // Simulate password hashing (use bcrypt in production)
    const hashedPassword = Buffer.from(password).toString("base64");
    const userId = uuid();
    const orgId = uuid();

    // Create profile
    await execute(
      `INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3)`,
      [userId, email, full_name]
    );

    // Create organization
    await execute(
      `INSERT INTO organizations (id, name, slug, owner_id) VALUES ($1, $2, $3, $4)`,
      [orgId, org_name, org_name.toLowerCase().replace(/\s+/g, "-"), userId]
    );

    // Add user to org
    await execute(
      `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, $3)`,
      [orgId, userId, "admin"]
    );

    const token = signToken({ userId, orgId, email });

    return c.json(
      {
        token,
        user: { id: userId, email, full_name },
        organization: { id: orgId, name: org_name },
      },
      201
    );
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 400);
  }
});

// Login
router.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = LoginSchema.parse(body);

    // TODO: Implement proper password verification
    // For now, just check if user exists
    const [user] = await query<any>(
      `SELECT id, email, full_name FROM profiles WHERE email = $1`,
      [email]
    );

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Get user's org
    const [orgMember] = await query<any>(
      `SELECT org_id FROM org_members WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );

    const token = signToken({
      userId: user.id,
      orgId: orgMember?.org_id || "unknown",
      email: user.email,
    });

    return c.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name },
    });
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 400);
  }
});

// Verify token
router.post("/verify", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return c.json({ error: "Invalid token" }, 401);
    }

    return c.json({ valid: true, payload });
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 400);
  }
});

export default router;
