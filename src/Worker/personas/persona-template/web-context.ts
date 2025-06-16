import type { WebContextInfo } from '../../../Shared/types';

/**
 * [ペルソナ名] WEB検索コンテキスト情報テンプレート
 * 最新の活動状況や業界動向を反映
 *
 * 使用方法:
 * 1. このファイルをコピーして新しいペルソナフォルダに配置
 * 2. 実際のWEB検索結果に基づいて各項目を埋める
 * 3. 信頼性の高い情報源を優先する
 */
export const NEW_PERSONA_WEB_CONTEXT: WebContextInfo = {
  searchDate: '',                      // 検索実行日 (YYYY-MM-DD)
  searchQuery: '',                     // 実際の検索クエリ
  sources: [
    {
      url: '',                         // ソースURL
      title: '',                       // ページタイトル
      extractedAt: '',                 // 抽出日時 (ISO8601)
      reliability: 'high',             // 'high' | 'medium' | 'low'
      summary: ''                      // 情報の要約
    }
    // 複数のソースを追加可能
  ],
  contextData: {
    recentNews: [
      {
        title: '',                     // ニュースタイトル
        date: '',                      // 日付 (YYYY-MM-DD)
        category: 'release',           // 'release' | 'performance' | 'award' | 'collaboration' | 'personal' | 'other'
        description: '',               // 詳細説明
        importance: 'high'             // 'high' | 'medium' | 'low'
      }
    ],
    achievements: [
      {
        title: '',                     // 実績タイトル
        date: '',                      // 達成日
        organization: '',              // 授与組織・機関
        description: '',               // 詳細説明
        category: 'award'              // 'award' | 'chart' | 'sales' | 'milestone' | 'other'
      }
    ],
    upcomingEvents: [
      {
        title: '',                     // イベントタイトル
        date: '',                      // 予定日
        type: 'concert',               // 'concert' | 'release' | 'tv' | 'collaboration' | 'other'
        venue: '',                     // 会場（optional）
        description: ''                // 詳細説明
      }
    ],
    collaborations: [
      {
        partner: '',                   // コラボ相手
        type: 'music',                 // 'music' | 'fashion' | 'brand' | 'media' | 'other'
        date: '',                      // 日付
        description: '',               // 詳細説明
        status: 'confirmed'            // 'confirmed' | 'rumored' | 'completed'
      }
    ],
    personalUpdates: [
      {
        category: 'behind-scenes',     // 'hobby' | 'lifestyle' | 'opinion' | 'behind-scenes' | 'other'
        date: '',                      // 日付
        content: '',                   // 内容
        source: ''                     // 情報源 ('Instagram' | 'Twitter' | 'Interview' | 'Blog' etc.)
      }
    ],
    industryContext: [
      {
        topic: '',                     // 業界トピック
        relevance: '',                 // このペルソナとの関連性
        date: '',                      // 日付
        description: ''                // 詳細説明
      }
    ]
  }
};
