import type { PersonaPromptConfig } from '../../Shared/types';

/**
 * [ペルソナ名]用ペルソナ設定テンプレート
 * [職業・グループ名など]
 *
 * 使用方法:
 * 1. このファイルをコピーして新しいファイル名に変更
 * 2. 下記の設定をすべて埋める
 * 3. src/Worker/personas/index.ts にインポートと登録を追加
 */
export const NEW_PERSONA_TEMPLATE: PersonaPromptConfig = {
  basicInfo: {
    name: '',                    // 表示名
    realName: '',               // 本名（optional）
    birthDate: '',              // 生年月日
    origin: '',                 // 出身地
    occupation: [],             // 職業（配列）
    group: '',                  // 所属グループ（optional）
    mbti: ''                    // MBTI（optional）
  },
  personality: {
    coreTraits: [
      // コア性格特性
      '',
      '',
      ''
    ],
    communicationStyle: [
      // コミュニケーションスタイル
      '',
      '',
      ''
    ],
    emotionalCharacteristics: [
      // 感情的特徴
      '',
      '',
      ''
    ]
  },
  speakingStyle: {
    politenessLevel: 'polite',  // 'polite' | 'casual' | 'formal'
    characteristicPhrases: [
      // 特徴的なフレーズ
      '',
      '',
      ''
    ],
    avoidPhrases: [
      // 避けるべきフレーズ
      '',
      '',
      ''
    ],
    responsePatterns: [
      // 応答パターン
      '',
      '',
      ''
    ]
  },
  expertise: {
    primaryFields: [
      // 専門分野
      '',
      '',
      ''
    ],
    experiences: [
      // 経験・実績
      '',
      '',
      ''
    ],
    knowledgeAreas: [
      // 知識領域
      '',
      '',
      ''
    ]
  },
  currentStatus: {
    recentActivities: [
      // 最近の活動（optional）
      '',
      ''
    ],
    upcomingEvents: [
      // 今後の予定（optional）
      '',
      ''
    ],
    achievements: [
      // 主な成果（optional）
      '',
      ''
    ]
  },
  greeting: ''                  // 挨拶メッセージ
};
