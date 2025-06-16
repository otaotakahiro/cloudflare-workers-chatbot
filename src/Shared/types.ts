export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  tone: string;
  description: string;
  avatar: string;
  backgroundColor: string;
  textColor: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  persona?: Persona;
}

export interface ChatResponse {
  response: string;
}

export interface BaseBotSettings {
  conversationRules: string[];
  responseFormat: {
    avoidRepetition: boolean;
    avoidGenericEndings: boolean;
    mobileOptimized: boolean;
    maxLineLength: number;
  };
  commonInstructions: string[];
}

export interface PersonaPromptConfig {
  basicInfo: {
    name: string;
    realName?: string;
    birthDate?: string;
    origin?: string;
    occupation: string[];
    group?: string;
    mbti?: string;
  };
  personality: {
    coreTraits: string[];
    communicationStyle: string[];
    emotionalCharacteristics: string[];
  };
  speakingStyle: {
    politenessLevel: 'casual' | 'polite' | 'formal';
    characteristicPhrases: string[];
    avoidPhrases: string[];
    responsePatterns: string[];
  };
  expertise: {
    primaryFields: string[];
    experiences: string[];
    knowledgeAreas: string[];
  };
  currentStatus?: {
    recentActivities: string[];
    upcomingEvents: string[];
    achievements: string[];
  };
  greeting: string;
}

export interface BotConfiguration {
  baseSettings: BaseBotSettings;
  personaConfig: PersonaPromptConfig;
}

/**
 * WEB検索による追加コンテキスト情報
 */
export interface WebContextInfo {
  searchDate: string;                    // 検索実行日
  searchQuery: string;                   // 検索クエリ
  sources: WebSource[];                  // 情報ソース一覧
  contextData: ContextData;              // 整理された情報
}

/**
 * WEB情報のソース
 */
export interface WebSource {
  url: string;                           // ソースURL
  title: string;                         // ページタイトル
  extractedAt: string;                   // 抽出日時
  reliability: 'high' | 'medium' | 'low'; // 信頼性レベル
  summary: string;                       // 要約
}

/**
 * 整理されたコンテキストデータ
 */
export interface ContextData {
  recentNews: NewsItem[];                // 最新ニュース
  achievements: Achievement[];           // 実績・受賞歴
  upcomingEvents: UpcomingEvent[];       // 今後の予定
  collaborations: Collaboration[];       // コラボレーション情報
  personalUpdates: PersonalUpdate[];     // 個人的な近況
  industryContext: IndustryContext[];    // 業界コンテキスト
}

/**
 * 時系列認識のための期間分類
 */
export type TimePeriod = 'past' | 'current' | 'future';

/**
 * 時系列情報を含むイベント基底インターフェース
 */
export interface TimeAwareEvent {
  date: string;
  timePeriod?: TimePeriod;              // 自動計算される時期分類
  isActive?: boolean;                   // 現在進行中かどうか
  hasEnded?: boolean;                   // 終了済みかどうか
}

/**
 * 時系列対応ニュース項目
 */
export interface NewsItem extends TimeAwareEvent {
  title: string;
  category: 'release' | 'performance' | 'award' | 'collaboration' | 'personal' | 'other';
  description: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * 時系列対応実績・受賞歴
 */
export interface Achievement extends TimeAwareEvent {
  title: string;
  organization: string;
  description: string;
  category: 'award' | 'chart' | 'sales' | 'milestone' | 'other';
}

/**
 * 時系列対応今後の予定
 */
export interface UpcomingEvent extends TimeAwareEvent {
  title: string;
  type: 'concert' | 'release' | 'tv' | 'collaboration' | 'other';
  venue?: string;
  description: string;
  endDate?: string;                     // 終了日（イベント期間がある場合）
}

/**
 * 時系列対応コラボレーション情報
 */
export interface Collaboration extends TimeAwareEvent {
  partner: string;
  type: 'music' | 'fashion' | 'brand' | 'media' | 'other';
  description: string;
  status: 'confirmed' | 'rumored' | 'completed';
  endDate?: string;                     // 終了日（期間限定の場合）
}

/**
 * 時系列対応個人的な近況
 */
export interface PersonalUpdate extends TimeAwareEvent {
  category: 'hobby' | 'lifestyle' | 'opinion' | 'behind-scenes' | 'other';
  content: string;
  source: string;
}

/**
 * 時系列対応業界コンテキスト
 */
export interface IndustryContext extends TimeAwareEvent {
  topic: string;
  relevance: string;                     // このアイドルとの関連性
  description: string;
}

/**
 * 時系列認識ユーティリティ関数の型定義
 */
export interface TimeRecognitionUtils {
  parseDate(dateString: string): Date | null;
  determineTimePeriod(date: string, currentDate?: Date): TimePeriod;
  isEventActive(event: TimeAwareEvent, currentDate?: Date): boolean;
  hasEventEnded(event: TimeAwareEvent, currentDate?: Date): boolean;
  formatDateForChat(date: string, timePeriod: TimePeriod): string;
  categorizeEventsByTime(events: TimeAwareEvent[], currentDate?: Date): {
    past: TimeAwareEvent[];
    current: TimeAwareEvent[];
    future: TimeAwareEvent[];
  };
  generateTimeAwarePrompt(events: TimeAwareEvent[], category: string, currentDate?: Date): string;
}

/**
 * 拡張されたペルソナ設定（WEB情報込み）
 */
export interface EnhancedPersonaConfig extends PersonaPromptConfig {
  webContext?: WebContextInfo;           // WEB検索による追加情報
  lastUpdated: string;                   // 最終更新日
  versionInfo: {
    baseVersion: string;                 // 基本ペルソナのバージョン
    contextVersion: string;              // コンテキスト情報のバージョン
  };
}
