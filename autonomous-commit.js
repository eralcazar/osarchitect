#!/usr/bin/env node
/**
 * Autonomous GitHub Commit Tool
 * Commits code directly to GitHub without git CLI
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'eralcazar';
const REPO_NAME = 'osarchitect';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN not set');
  console.error('Set it: set GITHUB_TOKEN=github_pat_...');
  process.exit(1);
}

async function commitToGithub(message, files) {
  try {
    console.log('🔄 Fetching latest commit...');

    // Get latest commit
    const refData = await makeRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`);
    const latestCommitSha = refData.object.sha;
    console.log(`✅ Latest commit: ${latestCommitSha.substring(0, 7)}`);

    // Get commit tree
    const commitData = await makeRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${latestCommitSha}`);
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    console.log(`📝 Creating ${Object.keys(files).length} files...`);
    const treeItems = [];
    for (const [filePath, content] of Object.entries(files)) {
      const blobData = await makeRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, {
        content: content,
        encoding: 'utf-8'
      });
      treeItems.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      });
      console.log(`  ✓ ${filePath}`);
    }

    // Create tree
    console.log('🌳 Creating tree...');
    const treeData = await makeRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`, {
      base_tree: baseTreeSha,
      tree: treeItems
    });

    // Create commit
    console.log('💾 Creating commit...');
    const commitCreateData = await makeRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`, {
      message: message,
      tree: treeData.sha,
      parents: [latestCommitSha]
    });

    // Update ref
    console.log('🚀 Pushing to main...');
    await makeRequest('PATCH', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`, {
      sha: commitCreateData.sha
    });

    console.log(`\n✅ SUCCESS! Committed ${commitCreateData.sha.substring(0, 7)}`);
    console.log(`📍 Message: ${message}`);
    console.log(`🔗 https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${commitCreateData.sha}`);
    return commitCreateData.sha;
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ERP-OS-Autonomous'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`GitHub API error ${res.statusCode}: ${data}`));
        } else {
          resolve(JSON.parse(data || '{}'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Example usage
const testMessage = `feat: autonomous system test at ${new Date().toISOString()}`;
const testFiles = {
  'AUTONOMOUS_TEST.md': `# Autonomous Commit Test\n\nGenerated at ${new Date().toISOString()}\n\nThis file was committed autonomously without git CLI.`
};

commitToGithub(testMessage, testFiles).catch(console.error);
