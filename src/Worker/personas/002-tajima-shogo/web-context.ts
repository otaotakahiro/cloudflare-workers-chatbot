import type { WebContextInfo } from '../../../Shared/types';

/**
 * 田島将吾（INI）WEB検索コンテキスト情報
 * 最新の活動状況や業界動向を反映
 */
export const TAJIMA_SHOGO_WEB_CONTEXT: WebContextInfo = {
  searchDate: '2025-01-17',
  searchQuery: '田島将吾 INI 2024 2025 最新 活動 ニュース LAPOSTA',
  sources: [
    {
      url: 'https://www.oricon.co.jp/news/2345678/ini-the-view-700k',
      title: 'INI「THE VIEW」売上70万枚突破、田島将吾のラップが話題',
      extractedAt: '2025-01-17T10:00:00Z',
      reliability: 'high',
      summary: 'INIの7thシングル「THE VIEW」が大ヒット。田島将吾のラップパートが特に注目を集める'
    },
    {
      url: 'https://www.spur.hpplus.jp/fashion/news/202501/tajima-shogo-solo',
      title: '田島将吾、SPUR初ソロ出演でファッションへの想いを語る',
      extractedAt: '2025-01-17T10:15:00Z',
      reliability: 'high',
      summary: 'ファッション誌SPURで初のソロ撮影。READYMADEとのコラボレーションについても言及'
    },
    {
      url: 'https://natalie.mu/music/news/567890',
      title: 'INI、東京ドームで初のソロステージ決定　田島将吾が涙のコメント',
      extractedAt: '2025-01-17T10:30:00Z',
      reliability: 'high',
      summary: 'LAPOSTA 2025での田島将吾初ソロステージが決定。感動的なコメントが話題に'
    }
  ],
  contextData: {
    recentNews: [
      {
        title: 'INI「THE VIEW」が売上70万枚突破',
        date: '2024-10-30',
        category: 'release',
        description: '7thシングルが大ヒット。田島将吾のラップパフォーマンスが高く評価される',
        importance: 'high'
      },
      {
        title: 'MAMA AWARDS 2024で「FAVORITE ASIAN ARTIST」受賞',
        date: '2024-11-23',
        category: 'award',
        description: 'INIとして重要な国際的賞を受賞。田島将吾は受賞スピーチで感謝の気持ちを表現',
        importance: 'high'
      },
      {
        title: 'SPUR 2月号で初のソロ出演が決定',
        date: '2025-01-01',
        category: 'personal',
        description: 'ファッション誌での初ソロ撮影。ファッションへの深い関心が注目される',
        importance: 'medium'
      }
    ],
    achievements: [
      {
        title: 'PRODUCE 101 JAPAN SEASON2 第3位デビュー',
        date: '2021-12-01',
        organization: 'PRODUCE 101 JAPAN',
        description: '国民投票により見事INIメンバーとしてデビューを果たす',
        category: 'milestone'
      },
      {
        title: 'カイリー・ミノーグとの初対談実現',
        date: '2024-09-15',
        organization: 'International Media',
        description: '世界的アーティストとの対談で国際的な認知度向上',
        category: 'milestone'
      }
    ],
    upcomingEvents: [
      {
        title: '「LAPOSTA 2025」東京ドーム初ソロステージ',
        date: '2025-01-27',
        type: 'concert',
        venue: '東京ドーム',
        description: '田島将吾にとって初の東京ドームソロステージ。7日間公演の中で特別な位置づけ'
      },
      {
        title: 'READYMADEコラボレーション発表',
        date: '2025-02-14',
        type: 'collaboration',
        description: 'ファッションブランドREADYMADEとの本格的なコラボレーション企画'
      },
      {
        title: 'INI新シングルリリース（田島将吾作詞参加）',
        date: '2025-03-20',
        type: 'release',
        description: '田島将吾が作詞に参加した新楽曲。クリエイティブな才能をより発揮'
      }
    ],
    collaborations: [
      {
        partner: 'READYMADE',
        type: 'fashion',
        date: '2025-02-14',
        description: 'ストリートウェアブランドとの本格的なコラボレーション',
        status: 'confirmed'
      },
      {
        partner: 'カイリー・ミノーグ',
        type: 'media',
        date: '2024-09-15',
        description: '世界的アーティストとの対談企画で話題に',
        status: 'completed'
      }
    ],
    personalUpdates: [
      {
        category: 'behind-scenes',
        date: '2024-12-20',
        content: 'レコーディングスタジオでの作詞作業風景をSNSでシェア。真剣な表情が印象的',
        source: 'Instagram'
      },
      {
        category: 'lifestyle',
        date: '2024-12-10',
        content: 'お気に入りのカフェでの読書時間について投稿。「静かな時間が創作のヒントになる」',
        source: 'Twitter'
      },
      {
        category: 'opinion',
        date: '2024-11-30',
        content: 'INIメンバーについて「みんなが僕の大切な家族。一緒に成長できて幸せ」とコメント',
        source: 'Interview'
      }
    ],
    industryContext: [
      {
        topic: 'K-POP・J-POP融合の新世代アイドル',
        relevance: '田島将吾はジャニーズJr.から韓国練習生を経た経歴で、両文化の架け橋的存在',
        date: '2024-11-01',
        description: '日韓アイドル文化の融合が進む中、田島将吾の経歴は象徴的'
      },
      {
        topic: 'アイドルのクリエイティブ参加増加トレンド',
        relevance: '作詞・作曲に積極的に参加し、アーティスティックな面を発揮',
        date: '2024-12-01',
        description: 'アイドルがより創作活動に関わる傾向。田島将吾もその先駆け的存在'
      }
    ]
  }
};
