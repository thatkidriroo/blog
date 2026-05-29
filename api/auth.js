export default async function handler(req, res) {
  const { code } = req.query;

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const site_url = process.env.SITE_URL || `https://${process.env.VERCEL_URL}`;
  const redirect_uri = `${site_url}/api/auth`;

  if (!code) {
    const authorizeUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${client_id}&redirect_uri=${redirect_uri}&scope=repo,user`;
    res.redirect(authorizeUrl);
    return;
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id, client_secret, code, redirect_uri }),
  });

  const { access_token, scope } = await tokenRes.json();

  res.setHeader("Content-Type", "text/html");
  res.end(`
    <html><body><script>
      (function() {
        function receiveMessage(msg) {
          if (msg.data === 'authorizing:github') {
            window.opener.postMessage(
              'authorization:github:${access_token}:${scope || ""}',
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
}
