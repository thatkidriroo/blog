export default function handler(req, res) {
  const client_id = process.env.GITHUB_CLIENT_ID ? "✓ set" : "✗ NOT SET";
  const client_secret = process.env.GITHUB_CLIENT_SECRET ? "✓ set" : "✗ NOT SET";
  const site_url = process.env.SITE_URL || "https://blog.kusekwa.space";
  const vercel_url = process.env.VERCEL_URL || "(not set)";
  const callback_url = `${site_url}/api/auth`;

  res.setHeader("Content-Type", "text/html");
  res.end(`
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OAuth Check</title>
    <style>body{font-family:sans-serif;padding:2em;max-width:600px;margin:0 auto;line-height:1.6}
    .ok{color:green}.bad{color:red}code{background:#eee;padding:2px 6px;border-radius:4px}</style>
    </head>
    <body>
    <h1>OAuth Configuration</h1>
    <p><strong>GITHUB_CLIENT_ID:</strong> <span class="ok">${client_id}</span></p>
    <p><strong>GITHUB_CLIENT_SECRET:</strong> <span class="ok">${client_secret}</span></p>
    <p><strong>SITE_URL:</strong> <code>${process.env.SITE_URL || "(not set)"}</code></p>
    <p><strong>VERCEL_URL:</strong> <code>${vercel_url}</code></p>
    <p><strong>Callback URL used:</strong> <code>${callback_url}</code></p>
    <hr>
    <p>In your <a href="https://github.com/settings/developers" target="_blank">GitHub OAuth App</a>,
    the <strong>Authorization callback URL</strong> must be:</p>
    <p><code>${callback_url}</code></p>
    <p><a href="/admin">Back to admin</a></p>
    </body></html>
  `);
}
