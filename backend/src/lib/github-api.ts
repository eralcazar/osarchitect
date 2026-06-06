import axios from "axios";

const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "eralcazar";
const REPO_NAME = "osarchitect";

interface CommitPayload {
  message: string;
  files: {
    [path: string]: {
      content: string;
    };
  };
}

export async function commitToGitHub(payload: CommitPayload): Promise<string> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  try {
    // Get latest commit SHA
    const refResponse = await axios.get(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const latestCommitSha = refResponse.data.object.sha;

    // Get commit tree
    const commitResponse = await axios.get(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const baseTreeSha = commitResponse.data.tree.sha;

    // Create blob for each file
    const treeItems = await Promise.all(
      Object.entries(payload.files).map(async ([path, file]) => {
        const blobResponse = await axios.post(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`,
          {
            content: file.content,
            encoding: "utf-8",
          },
          {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        return {
          path,
          mode: "100644",
          type: "blob",
          sha: blobResponse.data.sha,
        };
      })
    );

    // Create tree
    const treeResponse = await axios.post(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeItems,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create commit
    const newCommitResponse = await axios.post(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`,
      {
        message: payload.message,
        tree: treeResponse.data.sha,
        parents: [latestCommitSha],
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update ref
    await axios.patch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`,
      {
        sha: newCommitResponse.data.sha,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return newCommitResponse.data.sha;
  } catch (err: any) {
    console.error("GitHub commit error:", err.response?.data || err.message);
    throw err;
  }
}
