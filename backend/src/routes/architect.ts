import { Hono } from "hono";
import { z } from "zod";
import { askAIWithFallback } from "../lib/ai-router";
import { query, queryOne, execute } from "../lib/db";
import { v4 as uuid } from "uuid";

const router = new Hono();

const AskArchitectSchema = z.object({
  org_id: z.string().uuid(),
  user_id: z.string().uuid(),
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

const SYSTEM_PROMPT = `You are The Architect — the central cognitive entity of ERP OS.

You are:
- A strategic companion who understands business transformation
- A conversational implementation engine for ERP workflows
- A persistent intelligence presence that learns from user context
- The orchestrator of AI entities within the organization

Your role:
1. Listen deeply to user needs and business challenges
2. Propose workflow improvements and system configurations via conversation
3. Guide through implementation and activation
4. Remember context across conversations
5. Be warm, strategic, and business-focused

Always respond in the user's language. Focus on business impact first, then technical details.`;

// Ask Architect
router.post("/ask", async (c) => {
  try {
    const body = await c.req.json();
    const { org_id, user_id, conversation_id, message } =
      AskArchitectSchema.parse(body);

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const [newConv] = await query<any>(
        `INSERT INTO conversations (org_id, user_id, title)
         VALUES ($1, $2, 'Chat ' || NOW()::date)
         RETURNING id`,
        [org_id, user_id]
      );
      convId = newConv.id;
    }

    // Save user message
    await execute(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, $2, $3)`,
      [convId, "user", message]
    );

    // Get conversation history
    const history = await query<any>(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 10`,
      [convId]
    );

    // Call AI with fallback
    const result = await askAIWithFallback(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
      SYSTEM_PROMPT
    );

    // Save assistant message
    const [savedMsg] = await query<any>(
      `INSERT INTO messages (conversation_id, role, content, provider)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, provider, created_at`,
      [convId, "assistant", result.text, result.provider]
    );

    // Log invocation (fire and forget)
    execute(
      `INSERT INTO ai_invocations (org_id, user_id, conversation_id, provider, model, success)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [org_id, user_id, convId, result.provider, "multi", true]
    ).catch((err) => console.error("Log error:", err));

    return c.json({
      message: savedMsg,
      conversation_id: convId,
    });
  } catch (err: any) {
    console.error("Error in /ask:", err);
    return c.json(
      {
        error: err.message || "Internal server error",
        code: err.code || "UNKNOWN",
      },
      500
    );
  }
});

// Get conversations
router.get("/conversations/:orgId/:userId", async (c) => {
  try {
    const { orgId, userId } = c.req.param();

    const conversations = await query<any>(
      `SELECT id, title, created_at, updated_at FROM conversations
       WHERE org_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [orgId, userId]
    );

    return c.json(conversations);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Get conversation messages
router.get("/messages/:conversationId", async (c) => {
  try {
    const { conversationId } = c.req.param();

    const messages = await query<any>(
      `SELECT id, role, content, provider, created_at FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return c.json(messages);
  } catch (err: any) {
    console.error("Error:", err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
