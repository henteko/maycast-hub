const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const PORT = 4180;
const COOKIE_NAME = 'fake_auth_email';
const COOKIE_SECRET = 'dev-secret-key';

function sign(email) {
  const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
  hmac.update(email);
  return `${email}:${hmac.digest('hex')}`;
}

function verify(cookieValue) {
  const idx = cookieValue.lastIndexOf(':');
  if (idx < 0) return null;
  const email = cookieValue.substring(0, idx);
  if (sign(email) === cookieValue) return email;
  return null;
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=');
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Login</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
    h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    p { color: #666; font-size: 0.875rem; margin: 0 0 1.5rem; }
    input[type=email] { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
    button { width: 100%; padding: 0.5rem; margin-top: 1rem; background: #4285f4; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #3367d6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Dev Login</h1>
    <p>開発環境用の認証です。メールアドレスを入力してください。</p>
    <form method="POST" action="/oauth2/sign_in">
      <input type="hidden" name="rd" value="__REDIRECT__">
      <input type="email" name="email" placeholder="user@example.com" required autofocus>
      <button type="submit">ログイン</button>
    </form>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // GET /oauth2/auth - Nginx auth_request endpoint
  if (parsed.pathname === '/oauth2/auth' && req.method === 'GET') {
    const cookies = parseCookies(req.headers.cookie);
    const cookieValue = cookies[COOKIE_NAME];
    if (cookieValue) {
      const email = verify(cookieValue);
      if (email) {
        res.writeHead(202, {
          'X-Forwarded-Email': email,
          'X-Forwarded-User': email,
        });
        res.end();
        return;
      }
    }
    res.writeHead(401);
    res.end();
    return;
  }

  // GET /oauth2/sign_in - Show login form
  if (parsed.pathname === '/oauth2/sign_in' && req.method === 'GET') {
    const rd = parsed.query.rd || '/';
    const html = LOGIN_HTML.replace('__REDIRECT__', rd);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // POST /oauth2/sign_in - Handle login
  if (parsed.pathname === '/oauth2/sign_in' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const params = querystring.parse(body);
      const email = params.email;
      const rd = params.rd || '/';
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Email is required');
        return;
      }
      const cookieValue = sign(email);
      res.writeHead(302, {
        Location: rd,
        'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly`,
      });
      res.end();
    });
    return;
  }

  // GET /oauth2/sign_out - Logout
  if (parsed.pathname === '/oauth2/sign_out') {
    res.writeHead(302, {
      Location: '/',
      'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`,
    });
    res.end();
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`fake-auth server listening on port ${PORT}`);
});
