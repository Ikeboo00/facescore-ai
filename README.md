# FaceScore AI - 顔面偏差値AI判定アプリ

## プロジェクト概要

FaceScore AI は、アップロードされた顔写真をAIで分析し、顔面偏差値を算出するWebアプリケーションです。

## 技術スタック

### フロントエンド
- React + TypeScript
- Vite (ビルドツール)
- Tailwind CSS (スタイリング)
- face-api.js (顔検出・特徴抽出)

### バックエンド
- Node.js + Express + TypeScript
- Prisma (ORM)
- SQLite (開発用データベース)
- Sharp (画像処理)
- Multer (ファイルアップロード)

## プロジェクト構造

```
face-score-ai/
├── frontend/          # React フロントエンド
├── backend/           # Express バックエンド
├── shared/           # 共通型定義
└── README.md
```

## 開発手順

1. フロントエンドセットアップ
2. バックエンドセットアップ
3. 基本機能実装
4. AI機能統合

## 機能

- 画像アップロード（ドラッグ&ドロップ対応）
- カメラ撮影
- AI顔検出・分析
- 偏差値算出（対称性、目・鼻・顎の比率、肌質など）
- 改善アドバイス表示
- 分析結果履歴

## セットアップ

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド
cd backend
npm install
npm run dev
```