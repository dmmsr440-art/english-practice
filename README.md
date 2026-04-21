# 英語学習ハブ

1年後、議論の渦中に立つための英語学習統合アプリ。

## 🎯 このリポジトリについて

木崎さんの個人利用を前提とした英語学習アプリです。

- **設計思想**：ミニマム運用・統合ハブ・挫折しない仕組み
- **関連文書**：
  - `~/Documents/Claude Code/英語学習1年計画_設計記録.md`（全体設計）
  - `~/Documents/Claude Code/英語学習アプリ_仕様書.md`（実装仕様）

## 🚀 開発状況

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 0 | 基盤（Firebase連携・ログイン・トップ画面・設定画面） | ✅ 実装中 |
| Phase 1 | 瞬間英作文の強化 | ⬜ 未着手 |
| Phase 2 | チャンク学習・進捗ダッシュボード | ⬜ 未着手 |
| Phase 3 | ログ系モジュール | ⬜ 未着手 |
| Phase 4 | 早期警報・メール通知・PWA仕上げ | ⬜ 未着手 |

## 🛠️ 技術スタック

- **フロントエンド**：Vanilla HTML/CSS/JavaScript（ESモジュール）
- **バックエンド**：Firebase（Firestore + Authentication）
- **ホスティング**：GitHub Pages
- **AI機能**：Google Gemini API（無料枠・Phase 1以降）

## 📂 ファイル構成

```
english-practice/
├── index.html                # 新アプリのエントリ
├── legacy-index.html         # 旧アプリ（Phase 1で機能移植完了まで保持）
├── manifest.json             # PWA設定
├── service-worker.js         # オフライン対応
├── css/
│   ├── base.css              # 共通スタイル
│   ├── components.css        # UI部品
│   └── screens.css           # 画面別スタイル
├── js/
│   ├── main.js               # エントリポイント
│   ├── config/
│   │   └── firebase-config.js
│   ├── lib/
│   │   ├── firebase.js       # Firebase初期化・認証・Firestore共通
│   │   ├── storage.js        # データアクセス（プロフィール・日次チェック）
│   │   └── ui.js             # 画面遷移・トースト・モーダル
│   ├── components/
│   │   ├── why-toggle.js     # Why展開コンポーネント
│   │   └── daily-check.js    # 日次チェックコンポーネント
│   └── screens/
│       ├── login.js          # ログイン画面
│       ├── home.js           # トップ画面
│       └── settings.js       # 設定画面
└── assets/
    └── icons/
        ├── icon-192.png
        ├── icon-512.png
        └── icon-source.svg
```

## 🖥️ ローカルで動作確認する

Firebase認証はローカルファイル（`file://`）では動作しません。ローカルHTTPサーバーで起動してください。

```bash
cd ~/Documents/english-practice
python3 -m http.server 8080 --bind 0.0.0.0
```

ブラウザで `http://localhost:8080/` を開いてください。

同じWi-Fi内のiPhoneから確認したい場合：
- MacのIPアドレスを調べる：`ipconfig getifaddr en0`
- iPhoneから `http://<そのIP>:8080/` にアクセス
- **ただし、FirebaseのAuthドメイン制限でエラーになる可能性あり** → その場合はFirebaseコンソールで「承認済みドメイン」に追加が必要

## 🌐 GitHub Pages で公開する

`phase-0-redesign` ブランチを main にマージするか、GitHub Pages の設定でこのブランチを公開対象に設定してください。

## 🔒 セキュリティメモ

- Firebase の `apiKey` は公開しても問題なし（Firestoreセキュリティルールで守る）
- Gemini APIキー（Phase 1以降）は各自がアプリの設定画面で入力し、Firestoreの本人データに保存
- 他人からのアクセスはセキュリティルールで完全にブロック

## 📝 旧アプリへのアクセス

Phase 1で機能移植が完了するまで、旧アプリは `legacy-index.html` で残しています：
- `http://localhost:8080/legacy-index.html`
- `https://dmmsr440-art.github.io/english-practice/legacy-index.html`（デプロイ後）
