export default async function handler(req, res) {
  const { code } = req.query;
  const site_url = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://blog.kusekwa.space");
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${site_url}/api/auth`;

  if (!client_id || !client_secret) {
    res.setHeader("Content-Type", "text/html");
    return res.status(500).end(`
      <html><body><h2>OAuth not configured</h2>
      <p>GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in Vercel environment variables.</p>
      <p>Get them from <a href="https://github.com/settings/developers" target="_blank">GitHub OAuth Apps</a></p>
      <p>Callback URL must be: <code>${redirect_uri}</code></p>
      </body></html>`);
  }

  if (!code) {
    const params = new URLSearchParams({
      client_id,
      redirect_uri,
      scope: "repo,user",
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id, client_secret, code, redirect_uri }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      res.setHeader("Content-Type", "text/html");
      return res.status(400).end(`
        <html><body><h2>GitHub OAuth Error</h2>
        <p>Error: ${data.error}</p>
        <p>${data.error_description || ""}</p>
        <p>Check that your callback URL in GitHub OAuth App matches: <code>${redirect_uri}</code></p>
        <p><a href="/admin">Try again</a></p>
        </body></html>`);
    }

    res.setHeader("Content-Type", "text/html");
    res.end(`
      <html><body><script>
        (function() {
          function receiveMessage(msg) {
            if (msg.data === 'authorizing:github') {
              window.opener.postMessage(
                'authorization:github:${data.access_token}:${data.scope || ""}',
                msg.origin
              );
              window.close();
            }
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>
    `);
  } catch (err) {
    res.setHeader("Content-Type", "text/html");
    res.status(500).end(`
      <html><body><h2>Error</h2>
      <p>${err.message}</p>
      <p><a href="/admin">Try again</a></p>
      </body></html>`);
  }
}
