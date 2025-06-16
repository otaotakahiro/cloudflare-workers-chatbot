# Cloudflare Workers Chatbot

Cloudflare Workers上で動作するダイナミック・ペルソナ型チャットボットエンジンです。
OpenAI API（GPT-4o-mini）を活用し、外部から注入されるペルソナ設定に基づいて動的に応答を変更できる汎用チャットボットシステムです。

## 🎯 プロジェクト概要

このプロジェクトは、Cloudflare Workers上で動作するヘッドレス型チャットボットエンジンです。OpenAI APIを活用し、外部から提供されるペルソナ設定とコンテキストに基づいて、リアルタイムで応答を最適化します。

### 主な特徴

- 🎭 **ダイナミック・ペルソナ**: APIリクエスト時にキャラクター設定を動的に変更
- 🚀 **サーバーレス**: Cloudflare Workersによる高パフォーマンス
- 🔌 **組み込み容易**: APIベースで既存システムへの統合が簡単
- 💾 **会話履歴**: Cloudflare KVによるセッション管理
- 🎨 **モダンUI**: Vue 3 + TypeScriptによるレスポンシブデザイン
- 💰 **コスト最適化**: GPT-4o-miniで70%のコスト削減と性能向上

## 🎭 ペルソナ選択機能の使用方法

このプロジェクトでは、**いつでも外せる**モジュラー設計のペルソナ選択機能を提供しています。

### 📋 機能の概要

- ✅ **簡単有効化**: 設定ファイル1行で機能ON/OFF
- ✅ **選択可能ペルソナの制御**: 表示するペルソナを自由に設定
- ✅ **動的追加・削除**: 利用可能なペルソナをリアルタイムで変更
- ✅ **ヘルパー関数**: 開発・テスト時の切り替えが簡単

### ⚙️ 設定方法

#### 1. 機能の有効化

`src/Client/config/features.ts` で機能を有効にします：

```typescript
export const FEATURES = {
  PERSONA_SWITCHING: true,  // ペルソナ選択機能を有効化
  // ...
} as const;

// 選択可能なペルソナのID一覧（この3つのみが表示される）
export const AVAILABLE_PERSONA_IDS: string[] = [
  'nct-mark',
  'enhypen-sunghoon',
  'kenmochi-touya'
];
```

#### 2. 利用可能ペルソナの変更

**方法1: 設定ファイルを直接編集**
```typescript
// より多くのペルソナを表示
export const AVAILABLE_PERSONA_IDS: string[] = [
  'nct-mark',
  'enhypen-sunghoon',
  'kenmochi-touya',
  'g-dragon',
  'ai-assistant',
  'cat-girl'
];

// 全てのペルソナを表示（空配列にする）
export const AVAILABLE_PERSONA_IDS: string[] = [];
```

**方法2: ヘルパー関数を使用**
```typescript
import { setAvailablePersonas, showAllPersonas } from './config/features';

// 開発中に特定のペルソナのみテスト
setAvailablePersonas(['nct-mark', 'ai-assistant']);

// 全ペルソナを表示
showAllPersonas();
```

#### 3. 機能の無効化

```typescript
// 方法1: 設定ファイル
export const FEATURES = {
  PERSONA_SWITCHING: false,  // 機能を無効化（固定ペルソナ）
  // ...
} as const;

// 方法2: ヘルパー関数
import { disablePersonaSwitching } from './config/features';
disablePersonaSwitching();
```

### 🎨 新しいペルソナの追加

#### 1. ペルソナデータを追加

`src/Client/data/personas.ts` にペルソナを追加：

```typescript
export const personas: Persona[] = [
  // 新しいペルソナを最初に追加するとデフォルトペルソナになる
  {
    id: 'my-character',
    name: 'マイキャラクター',
    role: 'オリジナルキャラクター',
    tone: 'フレンドリーで親しみやすい',
    description: '私のオリジナルキャラクターです！',
    avatar: '/my-character.png',
    backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
    textColor: '#ffffff'
  },
  // ... 既存のペルソナ
];
```

#### 2. 挨拶メッセージを追加

`src/Client/composables/usePersonaManager.ts` の挨拶メッセージに追加：

```typescript
const getPersonaGreeting = (persona: Persona): string => {
  const greetings: Record<string, string> = {
    'my-character': 'こんにちは！マイキャラクターです。よろしくお願いします！',
    // ... 既存の挨拶
  };

  return greetings[persona.id] || `${persona.name}です。よろしくお願いします！`;
};
```

#### 3. 利用可能ペルソナに追加

```typescript
export const AVAILABLE_PERSONA_IDS: string[] = [
  'my-character',  // 新しいペルソナを追加
  'nct-mark',
  'enhypen-sunghoon',
  'kenmochi-touya'
];
```

### 🛠️ 開発時の便利な使い方

#### 開発中のテスト

```typescript
// 開発中は特定のペルソナだけテスト
setAvailablePersonas(['my-character', 'ai-assistant']);

// リリース前に全ペルソナをテスト
showAllPersonas();

// 機能を一時的に無効化してテスト
disablePersonaSwitching();
```

#### 動的な制御

```typescript
// 条件に応じてペルソナを制限
if (userType === 'premium') {
  setAvailablePersonas(['nct-mark', 'enhypen-sunghoon', 'g-dragon']);
} else {
  setAvailablePersonas(['ai-assistant']);
}
```

### 📱 UI表示の制御

**機能が有効な場合**:
- ✅ アバターがクリック可能
- ✅ 「キャラクター変更」ボタンが表示
- ✅ ペルソナ選択モーダルが開く
- ✅ 変更時に通知メッセージが表示

**機能が無効な場合**:
- ❌ アバターはクリック不可
- ❌ 変更ボタンは非表示
- ❌ 固定ペルソナで動作
- ✅ シンプルなチャット体験

### 🎯 実際の使用例

#### 例1: プロダクション環境では3つのペルソナのみ
```typescript
export const AVAILABLE_PERSONA_IDS: string[] = [
  'nct-mark',
  'enhypen-sunghoon',
  'kenmochi-touya'
];
```

#### 例2: 開発環境では全ペルソナ利用可能
```typescript
export const AVAILABLE_PERSONA_IDS: string[] = []; // 空 = 全て表示
```

#### 例3: 特定用途向けに1つのペルソナのみ
```typescript
export const AVAILABLE_PERSONA_IDS: string[] = [
  'ai-assistant'  // ビジネス用途など
];
```

### 🔄 いつでも外せる設計

この機能は完全にモジュラー設計されており、以下の利点があります：

- **1行での無効化**: `PERSONA_SWITCHING: false` だけで完全に機能を無効化
- **コンポーネント分離**: 関連コンポーネントは独立しており影響なし
- **パフォーマンス**: 無効時はコンポーネントが読み込まれない
- **メンテナンス性**: 機能が分離されているため保守が容易

## 🎨 機能管理システム

このプロジェクトでは、機能を簡単に有効/無効にできるモジュラー設計を採用しています。

### 機能の有効/無効切り替え

`src/Client/config/features.ts` で各機能の有効/無効を設定できます：

```typescript
export const FEATURES = {
  // ペルソナ変更機能
  PERSONA_SWITCHING: true,  // true: 有効, false: 無効

  // 会話履歴機能
  CONVERSATION_HISTORY: true,

  // デバッグモード
  DEBUG_MODE: false,
} as const;
```

### 分離されたコンポーネント

機能は以下のファイルに分離されており、必要に応じて再利用できます：

- `src/Client/composables/usePersonaManager.ts` - ペルソナ管理ロジック
- `src/Client/components/PersonaSelector.vue` - ペルソナ選択UI
- `src/Client/data/personas.ts` - ペルソナデータ定義
- `src/Client/config/features.ts` - 機能設定

## 🛠 技術スタック

### フロントエンド
- **Vue 3** - リアクティブなUI構築
- **TypeScript** - 型安全性の確保
- **Vite** - 高速な開発環境

### バックエンド
- **Cloudflare Workers** - サーバーレス実行環境
- **Cloudflare KV** - 会話履歴の永続化
- **OpenAI API** - AI応答生成 (GPT-4o-mini)

### 開発ツール
- **ESLint** - コード品質管理
- **Prettier** - コードフォーマット
- **Stylelint** - CSSスタイル管理

## 🤖 AI モデル選択

### 現在使用中: GPT-4o-mini ⭐
- **料金**: 入力$0.15/1M、出力$0.60/1M（GPT-3.5-turboより70%安い）
- **性能**: MMLU 82%、HumanEval 87.2%
- **コンテキスト**: 128Kトークン（約25万〜38万文字）
- **速度**: 高速レスポンス

### コンテキストサイズの目安
- **ブログ記事**: 50-190記事
- **普通の会話**: 500-1,900回の対話
- **チャット履歴**: 2,500-7,600回の短いやりとり

## 🚀 セットアップ

### 必要な環境
- Node.js 18+
- npm または yarn
- Cloudflare アカウント
- OpenAI APIキー

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd cloudflare-workers-chatbot

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env ファイルにOpenAI APIキーを設定
```

### 環境変数設定

`.env` ファイルを作成し、以下を設定：

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 開発サーバー起動

```bash
# フロントエンド開発サーバー
npm run dev

# Cloudflare Workers開発（ローカル）
npx wrangler dev
```

### Cloudflareデプロイ設定

1. **KVネームスペース作成**:
```bash
npx wrangler kv:namespace create "CHAT_HISTORY"
```

2. **シークレット設定**:
```bash
npx wrangler secret put OPENAI_API_KEY
```

3. **デプロイ**:
```bash
npm run deploy
```

## 📱 スマホ最適化

このチャットボットはスマホでの使用を主目的として最適化されています：

- レスポンシブデザイン
- タッチ操作対応
- iOS Safari対応（安全領域、ズーム防止）
- 横向き表示対応
- 軽量なアニメーション

## 🎨 ペルソナカスタマイズ

新しいペルソナを追加するには、`src/Client/data/personas.ts` を編集してください：

```typescript
{
  id: 'custom-character',
  name: 'カスタムキャラクター',
  role: '役割',
  tone: '話し方・トーン',
  description: '説明',
  avatar: '/custom-avatar.png',
  backgroundColor: 'linear-gradient(135deg, #color1, #color2)',
  textColor: '#ffffff'
}
```

## 📖 使用方法

### 基本的なチャット
1. 開発サーバーを起動
2. ブラウザでアクセス
3. メッセージを入力して送信

### ペルソナ変更方法

#### **方法1: 既存ペルソナの編集**
`src/Client/data/personas.ts` でデフォルトのG-Dragonを編集：

```typescript
{
  id: 'g-dragon', // IDは変更しない
  name: '新しいキャラクター名',
  role: '新しい役割',
  tone: '新しい話し方',
  description: '新しい説明',
  avatar: '/new-avatar.png',
  backgroundColor: 'linear-gradient(135deg, #新色1, #新色2)',
  textColor: '#ffffff'
}
```

#### **方法2: 新ペルソナを追加**

1. `src/Client/data/personas.ts` の配列の最初に新ペルソナを追加
2. `src/Worker/index.ts` の `getDefaultPersona()` 関数を更新
3. `src/Client/composables/usePersonaManager.ts` の挨拶メッセージを追加

### API使用例
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'こんにちは！',
    sessionId: 'unique-session-id',
    persona: {
      name: 'G-Dragon',
      role: 'K-POPアーティスト、ラッパー、プロデューサー',
      tone: 'クールでカリスマ的、時々優しい'
    }
  })
});

const data = await response.json();
console.log(data.response); // AI応答
```

## 🏗 プロジェクト構造

```
src/
├── Client/          # 🖥️ フロントエンド層
│   ├── components/  # Vue.jsコンポーネント
│   ├── composables/ # Vue Composition API関数
│   ├── config/      # フロントエンド設定（機能フラグ）
│   ├── data/        # 静的データ（ペルソナ定義など）
│   ├── App.vue      # メインコンポーネント
│   └── main.ts      # エントリーポイント
├── Worker/          # ⚙️ バックエンド層（Cloudflare Workers）
│   ├── index.ts     # Worker実装
│   └── images/      # 静的アセット
├── Database/        # 🗄️ データベース層
│   ├── kvStorage.ts # KVストレージ操作
│   └── index.ts     # Database層エクスポート
└── Shared/          # 🔗 共通層
    └── types.ts     # 共通型定義
```

### 各層の責務

#### 🖥️ Client層（フロントエンド）
- **役割**: ユーザーインターフェース、ユーザー体験
- **技術**: Vue 3, TypeScript, CSS
- **責務**:
  - UI/UXの提供
  - ユーザー入力の処理
  - 状態管理
  - API通信

#### ⚙️ Worker層（バックエンド）
- **役割**: ビジネスロジック、API処理
- **技術**: Cloudflare Workers, TypeScript
- **責務**:
  - HTTP リクエスト処理
  - OpenAI API連携
  - CORS設定
  - エラーハンドリング

#### 🗄️ Database層
- **役割**: データ永続化、データ操作
- **技術**: Cloudflare KV, TypeScript
- **責務**:
  - 会話履歴管理
  - セッション管理
  - データの保存・取得・削除

#### 🔗 Shared層
- **役割**: 共通定義、型安全性
- **技術**: TypeScript
- **責務**:
  - 型定義の共有
  - インターフェース定義
  - 共通ユーティリティ

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# デプロイ
npm run deploy

# Workerローカル開発
npx wrangler dev

# ログ監視
npx wrangler tail

# リント
npm run lint

# フォーマット
npm run lint:format
```

## 📋 API仕様

### POST /api/chat

チャットメッセージを送信します。

```typescript
interface ChatRequest {
  message: string;
  sessionId: string;
  persona?: Persona;
}

interface ChatResponse {
  response: string;
}
```

### OpenAI APIバージョン設定

- **URL**: `https://api.openai.com/v1/chat/completions`
- **バージョン指定**: URLパスの `v1` で指定済み
- **ヘッダー**: バージョンヘッダーは不要（通常のOpenAI API）
- **設定場所**: `src/Worker/index.ts`

**注意**: `OpenAI-Version`ヘッダーはAzure OpenAI専用です。通常のOpenAI APIでは使用しません。

## 📱 スマホ最適化

このチャットボットはスマホでの使用を主目的として最適化されています：

- レスポンシブデザイン
- タッチ操作対応
- iOS Safari対応（安全領域、ズーム防止）
- 横向き表示対応
- 軽量なアニメーション

## 🔍 トラブルシューティング

### よくある問題

1. **OpenAI APIエラー**
   - APIキーが正しく設定されているか確認
   - `npx wrangler secret put OPENAI_API_KEY` でシークレット設定

2. **KVエラー**
   - KVネームスペースが作成されているか確認
   - `wrangler.jsonc` のKVバインディング設定を確認

3. **デプロイエラー**
   - `wrangler.jsonc` のアカウントIDが正しいか確認
   - Cloudflareの権限設定を確認

### ログ確認

```bash
# リアルタイムログ監視
npx wrangler tail

# 特定の時間範囲のログ
npx wrangler tail --since 1h
```

## 🎨 カスタマイズ

### ペルソナの変更
詳細は「使用方法」セクションの「ペルソナ変更方法」を参照してください。

### UIのカスタマイズ
CSSスタイルは各Vueコンポーネント内の`<style scoped>`セクションで管理されています。

## 📚 ドキュメント

- [プロジェクト仕様書](./PROJECT_SPECIFICATION.md) - 詳細な技術仕様
- [開発タスクとルール](./TASKS_AND_RULES.md) - 開発ガイドライン
- [Cursor Rules](./.cursorrules) - AI開発ルール

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [OpenAI](https://openai.com/) - AI応答生成
- [Cloudflare](https://cloudflare.com/) - インフラストラクチャ
- [Vue.js](https://vuejs.org/) - フロントエンドフレームワーク

---

**注意**: このプロジェクトは開発中です。本番環境での使用前に十分なテストを行ってください。

## 🆘 サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。
