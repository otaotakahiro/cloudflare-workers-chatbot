# 新しいペルソナの作成ガイド

このディレクトリは、新しいアイドル・ペルソナを追加する際のテンプレートとガイドです。

## 📁 新しいペルソナフォルダの構造

```
src/Worker/personas/XXX-persona-name/
├── base-persona.ts             # 基本ペルソナ設定
├── web-context.ts             # WEB検索による追加情報（optional）
├── index.ts                   # 統合設定ファイル
└── README.md                  # ペルソナ固有の情報（optional）
```

## 🚀 新しいペルソナ追加の手順

### Step 1: フォルダ作成
```bash
# 新しい登録番号でフォルダを作成
mkdir src/Worker/personas/004-new-idol-name
```

### Step 2: 基本ペルソナファイル作成
`base-persona.ts` をコピーして編集：
```bash
cp src/Worker/personas/persona-template/base-persona.ts src/Worker/personas/004-new-idol-name/base-persona.ts
```

### Step 3: WEBコンテキスト作成（optional）
`web-context.ts` をコピーして編集：
```bash
cp src/Worker/personas/persona-template/web-context.ts src/Worker/personas/004-new-idol-name/web-context.ts
```

### Step 4: インデックスファイル作成
`index.ts` をコピーして編集：
```bash
cp src/Worker/personas/persona-template/index.ts src/Worker/personas/004-new-idol-name/index.ts
```

### Step 5: 中央レジストリに登録
`src/Worker/personas/index.ts` を編集：

```typescript
// インポート追加
import { NEW_IDOL_TEMPLATE, NEW_IDOL_ENHANCED } from './004-new-idol-name';

// 基本テンプレート追加
export const PERSONA_TEMPLATES: Record<string, PersonaPromptConfig> = {
  'g-dragon': G_DRAGON_TEMPLATE,
  'tajima-shogo': TAJIMA_SHOGO_TEMPLATE,
  'nct-mark': NCT_MARK_TEMPLATE,
  'new-idol': NEW_IDOL_TEMPLATE,  // 追加
};

// 拡張設定追加（WEBコンテキストありの場合）
export const ENHANCED_PERSONA_CONFIGS: Record<string, EnhancedPersonaConfig> = {
  'g-dragon': G_DRAGON_ENHANCED,
  'tajima-shogo': TAJIMA_SHOGO_ENHANCED,
  'new-idol': NEW_IDOL_ENHANCED,  // 追加
};

// レジストリ更新
export const PERSONA_REGISTRY: PersonaRegistration[] = [
  // 既存のペルソナ...
  {
    id: 'new-idol',
    folderNumber: '004',
    hasWebContext: true,  // WEBコンテキストの有無
    lastUpdated: '2025-01-17'
  }
];
```

### Step 6: フロントエンド設定更新
`src/Client/data/personas.ts` と `src/Client/config/features.ts` を更新

## 🎯 命名規則

### フォルダ名
- `XXX-persona-name` 形式
- XXX: 3桁の登録番号（001, 002, 003...）
- persona-name: kebab-case

### ファイル名
- `base-persona.ts`: 基本ペルソナ設定
- `web-context.ts`: WEB検索情報
- `index.ts`: 統合設定

### 変数名
- テンプレート: `PERSONA_NAME_TEMPLATE`
- 拡張設定: `PERSONA_NAME_ENHANCED`
- WEBコンテキスト: `PERSONA_NAME_WEB_CONTEXT`

## 📋 WEBコンテキスト作成のコツ

### 情報収集の観点
1. **最新ニュース**: リリース、受賞、コラボ等
2. **今後の予定**: コンサート、メディア出演等
3. **個人的近況**: SNS投稿、インタビュー等
4. **業界ポジション**: トレンド、影響力等

### 信頼性レベル
- `high`: 公式発表、メジャーメディア
- `medium`: 業界ニュースサイト
- `low`: 噂、未確認情報

### 重要度設定
- `high`: そのアイドルにとって重要なニュース
- `medium`: 業界全体に関わるニュース
- `low`: 一般的な活動報告

## 🔄 更新・メンテナンス

### 定期更新の頻度
- **WEBコンテキスト**: 月1回程度
- **基本ペルソナ**: 大きな変化があった時のみ
- **システム全体**: 四半期ごと

### バージョン管理
```typescript
versionInfo: {
  baseVersion: '1.0.0',      // 基本ペルソナの更新時にアップ
  contextVersion: '1.2.0'    // WEBコンテキストの更新時にアップ
}
```

## ⚠️ 注意事項

### 法的配慮
- 実在人物の場合は肖像権・著作権に注意
- 事実に基づく情報のみ使用
- 誤解を招く表現は避ける

### 品質管理
- 十分なテストを実施
- 他のペルソナとの一貫性を保つ
- 定期的な情報更新を心がける
