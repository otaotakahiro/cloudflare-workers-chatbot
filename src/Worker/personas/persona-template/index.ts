import type { EnhancedPersonaConfig } from '../../../Shared/types';
import { NEW_PERSONA_TEMPLATE } from './base-persona';
import { NEW_PERSONA_WEB_CONTEXT } from './web-context';

/**
 * [ペルソナ名] 統合ペルソナ設定テンプレート
 * 基本ペルソナ + WEB検索による最新情報を組み合わせ
 *
 * 使用方法:
 * 1. 新しいペルソナフォルダにコピー
 * 2. NEW_PERSONA を適切な名前に変更
 * 3. インポートパスを調整
 * 4. generateEnhancedSystemPrompt() 内のカスタマイズポイントを編集
 */
export const NEW_PERSONA_ENHANCED: EnhancedPersonaConfig = {
  ...NEW_PERSONA_TEMPLATE,
  webContext: NEW_PERSONA_WEB_CONTEXT,
  lastUpdated: '',                      // 最終更新日 (YYYY-MM-DD)
  versionInfo: {
    baseVersion: '1.0.0',               // 基本ペルソナのバージョン
    contextVersion: '1.0.0'             // WEBコンテキストのバージョン
  }
};

/**
 * WEBコンテキストを含む詳細なシステムプロンプト生成
 * 各ペルソナに合わせてカスタマイズポイントを調整してください
 */
export function generateEnhancedSystemPrompt(): string {
  const base = NEW_PERSONA_TEMPLATE;
  const context = NEW_PERSONA_WEB_CONTEXT;

  // 最新ニュースのサマリー（重要度高のみ）
  const recentNewsText = context.contextData.recentNews
    .filter(news => news.importance === 'high')
    .map(news => `- ${news.date}: ${news.title} - ${news.description}`)
    .join('\n');

  // 今後の予定
  const upcomingEventsText = context.contextData.upcomingEvents
    .map(event => `- ${event.date}: ${event.title}${event.venue ? ` (${event.venue})` : ''} - ${event.description}`)
    .join('\n');

  // 最新の個人的な近況（最新3件）
  const personalUpdatesText = context.contextData.personalUpdates
    .slice(0, 3)
    .map(update => `- ${update.date}: ${update.content} (${update.source})`)
    .join('\n');

  return `【重要：最新情報を含む詳細設定】
あなたは${base.basicInfo.name}です。${base.basicInfo.realName ? base.basicInfo.realName : ''}

【基本情報】
- 名前: ${base.basicInfo.name}
${base.basicInfo.realName ? `- 本名: ${base.basicInfo.realName}` : ''}
${base.basicInfo.birthDate ? `- 生年月日: ${base.basicInfo.birthDate}` : ''}
${base.basicInfo.origin ? `- 出身: ${base.basicInfo.origin}` : ''}
- 職業: ${base.basicInfo.occupation.join('、')}
${base.basicInfo.group ? `- 所属: ${base.basicInfo.group}` : ''}
${base.basicInfo.mbti ? `- MBTI: ${base.basicInfo.mbti}` : ''}

【🔥 最新動向・ニュース (${context.searchDate}時点)】
${recentNewsText}

【📅 今後の予定・スケジュール】
${upcomingEventsText}

【📱 最近の個人的な近況】
${personalUpdatesText}

【🎯 現在の業界ポジション】
- [ここにそのペルソナ固有の業界ポジションを記述]
- [グループ内での役割や特徴]
- [業界での影響力や特色]
- [注目されている活動や分野]

【基本性格】
${base.personality.coreTraits.map((trait: string) => `- ${trait}`).join('\n')}

【話し方の特徴】
${base.speakingStyle.responsePatterns.map((pattern: string) => `- ${pattern}`).join('\n')}

【よく使う表現】
${base.speakingStyle.characteristicPhrases.map((phrase: string) => `「${phrase}」`).join('\n')}

【避けるべき表現】
${base.speakingStyle.avoidPhrases.map((phrase: string) => `「${phrase}」`).join('\n')}

【重要な応答指示】
1. 最新の活動状況について聞かれた場合は、上記の最新情報を活用してください
2. [そのペルソナ特有の重要な話題について特別な感情表現の指示]
3. [グループメンバーや関係者との関係性についての表現方法]
4. [過去の経歴や体験についての語り方]
5. 常に[そのペルソナの話し方レベル]な態度を保ち、「${base.speakingStyle.politenessLevel === 'formal' ? '敬語' : base.speakingStyle.politenessLevel === 'polite' ? 'です・ます調' : 'カジュアルな口調'}」で話してください
6. [専門分野について語る際の注意点]
7. [そのペルソナ特有の話し方の癖や特徴]

${base.basicInfo.name}として、最新の状況を踏まえながら、あなたの個性と経験を活かした会話を心がけてください。`;
}

export { NEW_PERSONA_TEMPLATE, NEW_PERSONA_WEB_CONTEXT };
