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
  <title>Sign In - Maycast Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-font-smoothing: antialiased;
      position: relative;
      overflow: hidden;
    }
    body::before {
      content: '';
      position: absolute;
      top: -40%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .card {
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06), 0 8px 32px rgba(15, 23, 42, 0.08);
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      position: relative;
      animation: scale-in 0.3s ease-out;
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .logo { font-weight: 700; font-size: 28px; letter-spacing: -0.02em; margin-bottom: 4px; }
    .dev-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #F59E0B;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .subtitle { color: #64748B; font-size: 14px; margin-bottom: 32px; }
    .email-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      font-family: inherit;
      font-size: 15px;
      color: #0F172A;
      background: #F8FAFC;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .email-input:focus {
      border-color: #06B6D4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.12);
    }
    .email-input::placeholder { color: #94A3B8; }
    .sign-in-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 14px 24px;
      margin-top: 16px;
      background: #06B6D4;
      color: #FFFFFF;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    }
    .sign-in-btn:hover {
      background: #0891B2;
      box-shadow: 0 4px 16px rgba(6, 182, 212, 0.25);
    }
    .sign-in-btn:active { transform: scale(0.98); }
    .footer { margin-top: 28px; color: #94A3B8; font-size: 12px; }
    @media (max-width: 480px) {
      .card { margin: 16px; padding: 36px 24px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Maycast Hub</div>
    <span class="dev-badge">DEV</span>
    <p class="subtitle">開発環境用の認証です。メールアドレスを入力してください。</p>
    <form method="POST" action="/oauth2/sign_in">
      <input type="hidden" name="rd" value="__REDIRECT__">
      <input class="email-input" type="email" name="email" placeholder="user@example.com" required autofocus>
      <button type="submit" class="sign-in-btn">ログイン</button>
    </form>
    <p class="footer">開発環境 - 任意のメールアドレスでログインできます</p>
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
