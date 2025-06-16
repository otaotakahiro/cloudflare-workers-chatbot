# Cloudflare Workers Chatbot - 技術仕様書

> **注意**: 基本的な使用方法やセットアップ手順は [README.md](./README.md) をご参照ください。
> この仕様書は詳細な技術仕様とアーキテクチャ設計について記載しています。

## 1. システムアーキテクチャ

### 1.1 全体構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │  Cloudflare     │    │   OpenAI API    │
│   (Vue.js)      │◄──►│   Workers       │◄──►│  (GPT-4o-mini)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Cloudflare KV   │
                       │ (会話履歴保存)   │
                       └─────────────────┘
```

### 1.2 レイヤードアーキテクチャ

#### 🖥️ Client層（プレゼンテーション層）
```typescript
src/Client/
├── components/     # UIコンポーネント
├── composables/    # ビジネスロジック
├── config/         # 設定（機能フラグ）
└── data/          # 静的データ
```

**責務:**
- UI/UX の提供
- ユーザー入力の処理
- 状態管理
- Worker層とのAPI通信

#### ⚙️ Worker層（アプリケーション層）
```typescript
src/Worker/
└── index.ts       # HTTP ハンドラー、ビジネスロジック
```

**責務:**
- HTTP リクエスト処理
- ペルソナシステムプロンプト生成
- OpenAI API連携
- CORS設定
- エラーハンドリング

#### 🗄️ Database層（データアクセス層）
```typescript
src/Database/
├── kvStorage.ts   # KV操作の抽象化
└── index.ts       # Database層エクスポート
```

**責務:**
- 会話履歴の永続化
- セッション管理
- データの保存・取得・削除

#### 🔗 Shared層（共通層）
```typescript
src/Shared/
└── types.ts       # 型定義
```

**責務:**
- インターフェース定義
- 型安全性の確保
- レイヤー間の結合度低減

## 2. API設計仕様

### 2.1 RESTful API エンドポイント

#### POST /api/chat
チャットメッセージの処理

**Request:**
```typescript
interface ChatRequest {
  message: string;        // ユーザーメッセージ（必須）
  sessionId: string;      // セッション識別子（必須）
  persona?: Persona;      // ペルソナ設定（オプション）
}

interface Persona {
  id: string;
  name: string;          // キャラクター名
  role: string;          // 役割・職業
  tone: string;          // 口調・話し方
  description?: string;  // 説明（UI用）
  avatar?: string;       // アバター画像（UI用）
  backgroundColor?: string; // 背景色（UI用）
  textColor?: string;    // テキスト色（UI用）
}
```

**Response:**
```typescript
interface ChatResponse {
  response: string;      // AI応答メッセージ
}
```

**HTTPステータス:**
- `200`: 正常応答
- `400`: リクエスト形式エラー
- `500`: サーバーエラー

### 2.2 CORS設定

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};
```

## 3. データモデル設計

### 3.1 会話履歴データ構造

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ConversationHistory = ChatMessage[];
```

**KVストレージ仕様:**
- **キー**: セッションID（UUID v4形式）
- **値**: JSON形式の会話配列
- **TTL**: 24時間（自動削除）

### 3.2 ペルソナデータ構造

```typescript
interface Persona {
  id: string;                    // 一意識別子
  name: string;                  // 表示名
  role: string;                  // 役割・職業
  tone: string;                  // 話し方・性格
  description: string;           // 説明文
  avatar: string;                // アバター画像パス
  backgroundColor: string;        // CSS グラデーション
  textColor: string;             // テキスト色
}
```

**ペルソナ管理:**
- `src/Client/data/personas.ts` で定義
- 配列の最初の要素がデフォルトペルソナ
- IDによる一意識別

## 4. OpenAI API連携設計

### 4.1 モデル選択: GPT-4o-mini

**選択理由:**
- **コスト効率**: GPT-3.5-turboより70%安い
- **性能向上**: MMLU 82%、HumanEval 87.2%
- **大容量コンテキスト**: 128K トークン
- **高速レスポンス**: チャットボット用途に最適

### 4.2 API設定

```typescript
const openaiConfig = {
  url: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  max_tokens: 500,
  temperature: 0.8
};
```

**重要な設定ポイント:**
- **バージョン**: URLパスの `/v1/` で指定
- **ヘッダー**: `OpenAI-Version` は**使用しない**（Azure専用）
- **認証**: `Authorization: Bearer ${OPENAI_API_KEY}`

### 4.3 プロンプト設計

```typescript
const systemPrompt = `あなたは${persona.name}として振る舞ってください。

【キャラクター設定】
- 名前: ${persona.name}
- 役割: ${persona.role}
- 話し方: ${persona.tone}

このキャラクターになりきって、自然で魅力的な応答をしてください。`;
```

**設計原則:**
- ペルソナ情報の動的注入
- 一貫性のあるキャラクター維持
- 自然な会話フロー

## 5. 機能フラグシステム

### 5.1 設計思想

モジュラー設計により、機能の有効/無効を設定で制御可能。

```typescript
// src/Client/config/features.ts
export const FEATURES = {
  PERSONA_SWITCHING: false,    // ペルソナ変更機能
  CONVERSATION_HISTORY: true,  // 会話履歴機能
  DEBUG_MODE: false,           // デバッグモード
} as const;
```

### 5.2 実装パターン

```typescript
// 条件付きレンダリング
<template>
  <button
    v-if="FEATURES.PERSONA_SWITCHING"
    @click="showPersonaSelector"
  >
    ペルソナ変更
  </button>
</template>

// 条件付き処理
if (FEATURES.CONVERSATION_HISTORY) {
  await saveConversation(sessionId, messages);
}
```

## 6. パフォーマンス最適化

### 6.1 Cloudflare Workers制限

| 項目 | 制限値 | 対策 |
|------|--------|------|
| CPU時間 | 50ms～30秒 | 非同期処理の最適化 |
| メモリ | 128MB | 軽量なデータ構造 |
| リクエストサイズ | 100MB | 適切なペイロード設計 |
| KV操作 | 1000回/分 | バッチ処理・キャッシュ |

### 6.2 最適化手法

#### フロントエンド
```typescript
// 遅延ローディング
const PersonaSelector = defineAsyncComponent(
  () => import('./PersonaSelector.vue')
);

// デバウンス処理
const debouncedSend = debounce(sendMessage, 300);
```

#### バックエンド
```typescript
// ストリーミング応答（将来実装）
const stream = openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: messages,
  stream: true
});
```

## 7. セキュリティ仕様

### 7.1 認証・認可

**現在の実装:**
- APIキー認証なし（公開API）
- CORS設定による Origin 制御

**将来の拡張:**
```typescript
interface AuthRequest extends ChatRequest {
  apiKey?: string;        // API認証キー
  userId?: string;        // ユーザー識別子
}
```

### 7.2 データ保護

| 項目 | 現在の実装 | 将来の拡張 |
|------|------------|------------|
| データ暗号化 | KVの標準暗号化 | E2E暗号化 |
| データ保持 | 24時間TTL | ユーザー設定可能 |
| ログ管理 | Cloudflare標準 | 構造化ログ |

### 7.3 入力検証

```typescript
// メッセージ長制限
const MAX_MESSAGE_LENGTH = 4000;

// 不正文字列フィルタリング
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script/gi, '&lt;script')
    .replace(/javascript:/gi, '')
    .trim();
};
```

## 8. エラーハンドリング設計

### 8.1 エラー分類

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  KV_STORAGE_ERROR = 'KV_STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### 8.2 エラーレスポンス形式

```typescript
interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    details?: any;
  };
}
```

### 8.3 フォールバック戦略

```typescript
// OpenAI API障害時のフォールバック
const getFallbackResponse = (persona: Persona): string => {
  return `申し訳ありません。${persona.name}は今少し調子が悪いようです。しばらく待ってからもう一度お試しください。`;
};
```

## 9. 監視・ログ仕様

### 9.1 ログレベル

```typescript
enum LogLevel {
  ERROR = 'ERROR',     // エラー情報
  WARN = 'WARN',       // 警告情報
  INFO = 'INFO',       // 一般情報
  DEBUG = 'DEBUG'      // デバッグ情報
}
```

### 9.2 重要メトリクス

| メトリクス | 説明 | 閾値 |
|-----------|------|------|
| 応答時間 | OpenAI API応答時間 | <3秒 |
| エラー率 | HTTP 5xx エラーの割合 | <1% |
| KV操作時間 | データベース応答時間 | <100ms |
| 同時接続数 | アクティブセッション数 | 監視のみ |

## 10. デプロイメント設計

### 10.1 環境構成

| 環境 | ブランチ | ドメイン | 用途 |
|------|----------|----------|------|
| 本番 | `main` | `*.workers.dev` | 本番運用 |
| 開発 | `develop` | `*-dev.workers.dev` | 検証環境 |
| ローカル | - | `localhost:8787` | 開発環境 |

### 10.2 環境変数管理

```typescript
interface Env {
  OPENAI_API_KEY: string;           // OpenAI APIキー
  CHAT_HISTORY: KVNamespace;        // KVネームスペース
  ENVIRONMENT?: 'production' | 'development'; // 環境識別
}
```

### 10.3 CI/CDパイプライン（将来実装）

```yaml
# .github/workflows/deploy.yml（例）
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

## 11. テスト戦略

### 11.1 テスト分類

| テストタイプ | 対象 | ツール（候補） |
|-------------|------|---------------|
| 単体テスト | 個別関数・コンポーネント | Vitest, Vue Test Utils |
| 統合テスト | API エンドポイント | Supertest |
| E2Eテスト | ユーザーフロー | Playwright |
| パフォーマンステスト | 応答時間・負荷 | Artillery |

### 11.2 テストデータ設計

```typescript
// テスト用ペルソナ
const testPersona: Persona = {
  id: 'test-persona',
  name: 'テストキャラクター',
  role: 'テスト用',
  tone: 'テスト口調',
  description: 'テスト用のペルソナです',
  avatar: '/test-avatar.png',
  backgroundColor: '#000000',
  textColor: '#ffffff'
};
```

## 12. 将来の拡張設計

### 12.1 アーキテクチャ拡張

```typescript
// RAG機能の追加（例）
interface RAGConfig {
  vectorStore: 'pinecone' | 'weaviate';
  embeddingModel: 'text-embedding-ada-002';
  maxRetrievals: number;
}

// 多言語対応
interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  translations: Record<string, Record<string, string>>;
}
```

### 12.2 スケーリング戦略

1. **水平スケーリング**: Cloudflare Workers の自動スケール
2. **データベース**: KV → PostgreSQL + Prisma
3. **キャッシュ**: Redis 導入
4. **CDN**: 静的アセットの最適化

### 12.3 マイクロサービス化

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Chat      │  │   Persona   │  │   Analytics │
│   Service   │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────────┐
              │   API       │
              │   Gateway   │
              └─────────────┘
```

この技術仕様書は、システムの技術的な詳細と設計思想を文書化し、開発チームの技術的な意思決定を支援します。
