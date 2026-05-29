export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return res.status(500).json({ error: "GITHUB_PAT not configured on server" });
  }

  const { title, description, tags, content } = req.body;

  if (!title || !description || !content) {
    return res.status(400).json({ error: "title, description, and content are required" });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const pubDate = new Date().toISOString();

  const tagsYaml = tags && tags.length > 0
    ? `tags: [${tags.map(t => `"${t}"`).join(", ")}]`
    : "tags: []";

  const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
${tagsYaml}
---

${content}
`;

  const owner = "thatkidriroo";
  const repo = "blog";
  const path = `src/content/blog/${slug}.md`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const headers = {
    Authorization: `Bearer ${pat}`,
    "Content-Type": "application/json",
    "User-Agent": "blog-admin",
  };

  const body = {
    message: `Publish: ${title}`,
    content: Buffer.from(fileContent).toString("base64"),
    branch: "master",
  };

  const commitResp = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  const data = await commitResp.json();

  if (!commitResp.ok) {
    console.error("GitHub API error:", data);
    return res.status(500).json({
      error: data.message || "Failed to publish post",
      details: data,
    });
  }

  return res.json({
    success: true,
    slug,
    url: `/blog/${slug}/`,
    message: "Post published!",
  });
}
