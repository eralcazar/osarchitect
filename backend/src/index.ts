import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import architectRoutes from "./routes/architect";
import crmRoutes from "./routes/crm";
import authRoutes from "./routes/auth";
import deployRoutes from "./routes/deploy";

const app = new Hono();

// Middleware
app.use("*", cors());

app.use(async (c, next) => {
  const startTime = Date.now();
  await next();
  const duration = Date.now() - startTime;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${c.req.method} ${c.req.path} - ${duration}ms`);
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/architect", architectRoutes);
app.route("/api/crm", crmRoutes);
app.route("/api/deploy", deployRoutes);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root
app.get("/", (c) => {
  return c.json({
    message: "ERP OS Backend",
    version: "1.0.0",
    endpoints: [
      "/api/auth (signup, login, verify)",
      "/api/architect (chat with AI)",
      "/api/crm (contacts, deals)",
      "/api/deploy (autonomous commit)",
      "/health",
    ],
  });
});

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server starting on port ${port}...`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`✅ Server listening on http://localhost:${info.port}`);
});
