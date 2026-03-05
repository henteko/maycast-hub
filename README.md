# Maycast Hub

社内Podcastツール。リスナー向けWebプレイヤーと管理者向けCMSを提供する。
Google Workspaceアカウントによる認証で、許可されたドメインのユーザーのみアクセス可能。

## アーキテクチャ

```
[ブラウザ]
    |
  Nginx (:80/:443)
    ├── /              → Frontend (React SPA)
    ├── /api/          → Backend (Express API)
    ├── /media/        → MinIO (メディア配信)
    ├── /storage/      → MinIO (Presigned URL アップロード)
    └── /oauth2/       → 認証 (OAuth2 Proxy / fake-auth)
         └── auth_request で全リクエストを認証
```

- **認証:** Nginx `auth_request` → OAuth2 Proxy (本番) / fake-auth (開発)
- **メディア:** S3互換ストレージ (MinIO) へのアクセスはすべてNginx経由
- **DB:** objectKey (`shows/uuid.webp` 等) を保存し、フロントエンドで `/media/` プレフィックスを付与

## 技術スタック

- **Frontend:** React + Vite (TypeScript, Tailwind CSS, TanStack Query)
- **Backend:** Express (TypeScript)
- **Database:** PostgreSQL 16
- **Media Storage:** MinIO (S3互換)
- **認証:** OAuth2 Proxy + Google OAuth2 (本番) / fake-auth (開発)
- **リバースプロキシ:** Nginx
- **構成:** pnpm workspaces モノレポ

## 前提条件

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

## 開発環境

### 起動

```bash
# 1. リポジトリをクローン
git clone <repo-url>
cd maycast-hub

# 2. 全サービスを起動
docker compose up --build
```

初回起動時にDBマイグレーションが自動で適用される。

### アクセス

http://localhost にアクセスすると、メールアドレス入力画面（fake-auth）が表示される。
任意のメールアドレスを入力してログインする。

| サービス | URL |
|---------|-----|
| アプリケーション | http://localhost |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |
| PostgreSQL | localhost:5432 (maycast / maycast) |

### 開発

ソースコードの変更はホットリロードで即座に反映される。

- **Backend:** `tsx --watch` によるファイル監視
- **Frontend:** Vite dev server によるHMR

```bash
# バックグラウンドで起動
docker compose up -d

# ログを確認
docker compose logs -f backend
docker compose logs -f frontend

# 停止
docker compose down
```

### Docker を使わずにローカルで開発する場合

PostgreSQL と MinIO を別途用意した上で:

```bash
cp .env.example .env
# .env を環境に合わせて編集

# Backend
pnpm install
pnpm --filter @maycast/backend run dev

# Frontend (別ターミナル)
pnpm --filter @maycast/frontend run dev
```

### マイグレーション

Docker 起動時に自動適用されるが、手動で実行する場合:

```bash
pnpm run migrate
```

マイグレーションファイルは `packages/backend/src/db/migrations/` に配置する。ファイル名順に適用される。

## 本番環境デプロイ (AWS EC2)

### 1. EC2 インスタンスの準備

```bash
# Amazon Linux 2023 / Ubuntu 推奨
# インスタンスタイプ: t3.small 以上

# Docker & Docker Compose をインストール
# Amazon Linux 2023:
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### 2. セキュリティグループ

以下のポートを開放:

| ポート | 用途 |
|-------|------|
| 80 | HTTP (HTTPS リダイレクト & Let's Encrypt) |
| 443 | HTTPS |
| 22 | SSH |

### 3. DNS 設定

ドメインのAレコードをEC2のElastic IPに向ける。

### 4. Google OAuth の設定

[Google Cloud Console](https://console.cloud.google.com/) で:

1. プロジェクトを作成（または既存のものを使用）
2. **APIとサービス** → **認証情報** → **OAuth 2.0 クライアント ID** を作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みリダイレクト URI: `https://your-domain.com/oauth2/callback`
3. **OAuth 同意画面** を設定
   - ユーザーの種類: 内部（Google Workspace の場合）

### 5. SSL 証明書の取得

```bash
# 初回のみ: certbot で証明書を取得
sudo docker run --rm -it -p 80:80 \
  -v letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone -d your-domain.com 
```

### 6. 環境変数の設定

```bash
# リポジトリをクローン
git clone <repo-url>
cd maycast-hub

# .env を作成
cp .env.example .env
```

`.env` を編集:

```env
# Database
DB_USER=maycast
DB_PASSWORD=<強力なパスワード>
DB_NAME=maycast

# MinIO
S3_ACCESS_KEY=<ランダムな文字列>
S3_SECRET_KEY=<ランダムな文字列>
S3_BUCKET=maycast-media
S3_REGION=us-east-1

# Domain
DOMAIN=your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
# COOKIE_SECRET は以下のコマンドで生成した値を設定 (base64エンコードされた32バイト):
#   python3 -c 'import os,base64; print(base64.b64encode(os.urandom(32)).decode())'
COOKIE_SECRET=<生成した値を貼り付け>
ALLOWED_EMAIL_DOMAIN=yourcompany.com
```

### 7. 起動

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 8. 動作確認

```bash
# ログを確認
docker compose -f docker-compose.prod.yml logs -f

# ヘルスチェック (認証不要)
curl https://your-domain.com/api/health
```

`https://your-domain.com` にアクセスし、Googleログイン画面が表示されればOK。

### 更新

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## プロジェクト構成

```
packages/
├── shared/          # @maycast/shared - 共有型定義
├── backend/         # @maycast/backend - Express API サーバー
├── frontend/        # @maycast/frontend - React SPA
└── fake-auth/       # 開発用認証サービス (OAuth2 Proxy 互換)
nginx/
├── default.dev.conf   # 開発用 Nginx 設定
└── default.prod.conf  # 本番用 Nginx 設定 (HTTPS + OAuth2 Proxy)
```

## API

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック |
| GET / POST | `/api/shows` | 番組一覧 / 作成 |
| GET / PUT / DELETE | `/api/shows/:id` | 番組取得 / 更新 / 削除 |
| GET | `/api/shows/:showId/episodes` | エピソード一覧 |
| GET / POST | `/api/episodes` | エピソード取得 / 作成 |
| PUT / DELETE | `/api/episodes/:id` | エピソード更新 / 削除 |
| PATCH | `/api/episodes/:id/publish` | 公開 |
| PATCH | `/api/episodes/:id/unpublish` | 非公開 |
| POST | `/api/upload/presigned-url` | アップロード用 Presigned URL 取得 |
| POST | `/api/upload/confirm` | アップロード確認 |
| POST | `/api/analytics/play` | 再生イベント記録 |
| GET | `/api/analytics/episodes/:id` | エピソード統計 |
| GET | `/api/analytics/shows/:id` | 番組統計 |

## データリセット

```bash
# 開発環境: DB・ストレージを含めて完全リセット
docker compose down -v
docker compose up --build

# 本番環境
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```
