import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import architectRoutes from "./routes/architect";
import crmRoutes from "./routes/crm";

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
app.route("/api/architect", architectRoutes);
app.route("/api/crm", crmRoutes);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root
app.get("/", (c) => {
  return c.json({
    message: "ERP OS Backend",
    version: "1.0.0",
    endpoints: ["/api/architect", "/api/crm", "/health"],
  });
});

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server starting on port ${port}...`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`✅ Server listening on http://localhost:${info.port}`);
});
