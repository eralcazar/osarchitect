import { Hono } from "hono";
import { z } from "zod";
import { commitToGitHub } from "../lib/github-api";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { requireOrgContext } from "../integrations/supabase/org-middleware";

const router = new Hono();

const DeploySchema = z.object({
  files: z.record(z.string(), z.string()),
  message: z.string().min(1),
});

// Autonomous deployment endpoint
// Called by Architect to commit code automatically
router.post("/commit", async (c) => {
  try {
    const body = await c.req.json();
    const { files, message } = DeploySchema.parse(body);

    // Convert string file contents to GitHub API format
    const githubFiles: { [key: string]: { content: string } } = {};
    Object.entries(files).forEach(([path, content]) => {
      githubFiles[path] = { content };
    });

    const commitSha = await commitToGitHub({
      message,
      files: githubFiles,
    });

    return c.json(
      {
        success: true,
        commitSha,
        message: `Committed ${Object.keys(files).length} files to main`,
      },
      201
    );
  } catch (err: any) {
    console.error("Deploy error:", err);
    return c.json(
      {
        error: err.message || "Deployment failed",
      },
      500
    );
  }
});

// Health check
router.get("/health", (c) => {
  return c.json({ status: "deployment service ready" });
});

export default router;
