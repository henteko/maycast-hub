# Maycast Hub

社内Podcastツール。リスナー向けWebプレイヤーと管理者向けCMSを提供する。

## 技術スタック

- **Frontend:** React + Vite (TypeScript, CSS Modules, TanStack Query)
- **Backend:** Express (TypeScript)
- **Database:** PostgreSQL 16
- **Media Storage:** Cloudflare R2 (本番) / MinIO (ローカル)
- **構成:** pnpm workspaces モノレポ

## 前提条件

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9

## 起動方法

```bash
# 1. リポジトリをクローン
git clone <repo-url>
cd maycast-hub

# 2. 依存パッケージをインストール
pnpm install

# 3. 全サービスを起動（PostgreSQL, MinIO, Backend, Frontend）
docker compose up --build
```

初回起動時にDBマイグレーションが自動で適用される。

### アクセス先

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:5173 |
| バックエンドAPI | http://localhost:3001 |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |
| PostgreSQL | localhost:5432 (maycast / maycast) |

## 開発

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

## プロジェクト構成

```
packages/
├── shared/          # @maycast/shared - 共有型定義
├── backend/         # @maycast/backend - Express API サーバー
└── frontend/        # @maycast/frontend - React SPA
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
# DB・ストレージを含めて完全リセット
docker compose down -v
docker compose up --build
```
