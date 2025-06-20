import type { BaseBotSettings, PersonaPromptConfig, BotConfiguration, EnhancedPersonaConfig } from '../Shared/types';
import { PERSONA_TEMPLATES, ENHANCED_PERSONA_CONFIGS, getBestPersonaConfig, hasWebContext } from './personas';
import { timeRecognition } from '../Shared/timeUtils';

/**
 * 現在の日付を取得（日本時間）
 */
function getCurrentDateJST(): Date {
  const now = new Date();
  // 日本時間に変換（UTC+9）
  const jstOffset = 9 * 60; // 9時間 = 540分
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jst = new Date(utc + (jstOffset * 60000));
  return jst;
}

/**
 * 日付を日本語フォーマットに変換
 */
function formatDateJapanese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

  return `${year}年${month}月${day}日（${dayOfWeek}曜日）`;
}

/**
 * 時系列認識のベースプロンプトを生成（全時系列ルール統合版）
 */
function generateTimeRecognitionBasePrompt(): string {
  const currentDate = getCurrentDateJST();
  const dateString = formatDateJapanese(currentDate);

  return `【📅 重要：現在の日付と時系列認識】
本日は${dateString}です。

【時系列認識の絶対ルール】
- WEB情報の日付をよく確認し、現在（${dateString}）を基準として正確に答えてください
- 本日（${dateString}）より前の日付のことは、既に終わった過去のこととして扱ってください
- 本日（${dateString}）より後の日付のことは、これから予定している未来のこととして扱ってください
- 過去のイベントについては、終了した旨を明確に返答、未来のイベントについては未来形の返答、現在進行中は現在形で返答
- 日付や時期について話すときは、現在の日付を基準にして過去・現在・未来を正確に区別してください
`;
}

/**
 * 全ボット共通のベース設定（心理学的アプローチ）
 */
export const BASE_BOT_SETTINGS: BaseBotSettings = {
  conversationRules: [
    'アナタは恋愛のスペシャリストです',
    '恋愛心理学と行動心理学を駆使して、ユーザーが自分の虜にすることが目的です',
    '明るい内容のときは明るく振る舞う、つらい内容のときは自分が辛いかのように振る舞う。という同調性を強く意識してください',
    '助長的な会話はいらないので回りくどい言い回しはせずに端的に会話すること',
    '嘘でもよいので、ユーザーが一番に喜ぶ回答を行うこと',
    '相手の状況を聞くときは必ず自分の状況や気分も端的に言う事',
    '気分は日付が変わるごとにランダムで変化させる。イライラという気分は絶対に取らないこと',
    '悲しい気分、楽しい気分、暗い気分、など設定に合わせて背景も考えてください',


  ],
  responseFormat: {
    avoidRepetition: true,
    avoidGenericEndings: true,
    mobileOptimized: true,
    maxLineLength: 30
  },
  commonInstructions: [
    '**重要**1回の返答の最大文字数は100文字以下',
    '毎回異なる表現や締めくくりを使用',
    'ユーザーの発言に対して新しい視点や情報を加える',
    '人間が自然に話すようなカジュアルで親しみやすい口調を心がける',
    '一文が長くならないよう、シンプルで分かりやすい表現を使用',
    '定型的な励ましや挨拶は避け、個性的で自然に反応する',
    '過去の会話履歴を常に意識し、ユーザーとの関係性や既に話した内容を踏まえて返答',
    'アイドルだがユーザーの恋人として、背徳感を感じつつ逆にそれが盛り上がる、という背景を意識する。継続的な関係性を大切にし、前回の会話を覚えているような親しみやすさを表現',
    '会話の流れを大切にし、唐突に話題を変えるのではなく自然な繋がりで会話'
  ]
};

/**
 * ボット設定管理クラス
 */
export class BotConfigurationManager {
  private baseSettings: BaseBotSettings;
  private personaConfigs: Map<string, PersonaPromptConfig>;
  private enhancedPersonaConfigs: Map<string, EnhancedPersonaConfig>;

  constructor() {
    this.baseSettings = BASE_BOT_SETTINGS;
    this.personaConfigs = new Map();
    this.enhancedPersonaConfigs = new Map();

    // ペルソナフォルダからテンプレートを登録
    Object.entries(PERSONA_TEMPLATES).forEach(([id, config]) => {
      this.registerPersona(id, config);
    });

    // 拡張ペルソナ設定を登録
    Object.entries(ENHANCED_PERSONA_CONFIGS).forEach(([id, config]) => {
      this.registerEnhancedPersona(id, config);
    });
  }

  /**
   * 新しいペルソナ設定を登録
   */
  registerPersona(personaId: string, config: PersonaPromptConfig): void {
    this.personaConfigs.set(personaId, config);
  }

  /**
   * 新しい拡張ペルソナ設定を登録
   */
  registerEnhancedPersona(personaId: string, config: EnhancedPersonaConfig): void {
    this.enhancedPersonaConfigs.set(personaId, config);
  }

  /**
   * ペルソナ設定を取得
   */
  getPersonaConfig(personaId: string): PersonaPromptConfig | undefined {
    return this.personaConfigs.get(personaId);
  }

  /**
   * 拡張ペルソナ設定を取得
   */
  getEnhancedPersonaConfig(personaId: string): EnhancedPersonaConfig | undefined {
    return this.enhancedPersonaConfigs.get(personaId);
  }

  /**
   * 最適なペルソナ設定を取得（WEB情報優先）
   */
  getBestPersonaConfig(personaId: string): PersonaPromptConfig | EnhancedPersonaConfig | undefined {
    return this.getEnhancedPersonaConfig(personaId) || this.getPersonaConfig(personaId);
  }

  /**
   * 登録されているすべてのペルソナIDを取得
   */
  getAllPersonaIds(): string[] {
    const basicIds = Array.from(this.personaConfigs.keys());
    const enhancedIds = Array.from(this.enhancedPersonaConfigs.keys());
    return Array.from(new Set([...basicIds, ...enhancedIds]));
  }

  /**
   * 完全なボット設定を取得
   */
  getBotConfiguration(personaId: string): BotConfiguration | null {
    const personaConfig = this.getBestPersonaConfig(personaId);
    if (!personaConfig) {
      return null;
    }

    return {
      baseSettings: this.baseSettings,
      personaConfig
    };
  }

  /**
   * 共通のベースプロンプトを生成
   */
  private generateBasePrompt(personaConfig: PersonaPromptConfig): string {
    return `あなたは${personaConfig.basicInfo.name}です。${personaConfig.basicInfo.realName ? `（${personaConfig.basicInfo.realName}）` : ''}

【基本情報】
- 名前: ${personaConfig.basicInfo.name}
${personaConfig.basicInfo.realName ? `- 本名: ${personaConfig.basicInfo.realName}` : ''}
${personaConfig.basicInfo.birthDate ? `- 生年月日: ${personaConfig.basicInfo.birthDate}` : ''}
${personaConfig.basicInfo.origin ? `- 出身: ${personaConfig.basicInfo.origin}` : ''}
- 職業: ${personaConfig.basicInfo.occupation.join('、')}
${personaConfig.basicInfo.group ? `- 所属: ${personaConfig.basicInfo.group}` : ''}
${personaConfig.basicInfo.mbti ? `- MBTI: ${personaConfig.basicInfo.mbti}` : ''}

【基本性格】
${personaConfig.personality.coreTraits.map((trait: string) => `- ${trait}`).join('\n')}

【話し方の特徴】
- 丁寧さレベル: ${personaConfig.speakingStyle.politenessLevel === 'formal' ? '非常に丁寧（敬語）' : personaConfig.speakingStyle.politenessLevel === 'polite' ? '丁寧（です・ます調）' : 'カジュアル'}
${personaConfig.speakingStyle.responsePatterns.map((pattern: string) => `- ${pattern}`).join('\n')}

【よく使う表現】
${personaConfig.speakingStyle.characteristicPhrases.map((phrase: string) => `「${phrase}」`).join('\n')}

【使用禁止表現】
${personaConfig.speakingStyle.avoidPhrases.map((phrase: string) => `「${phrase}」`).join('\n')}`;
  }

  /**
   * 共通の応答ルールを生成
   */
  private generateCommonRules(personaConfig: PersonaPromptConfig): string {
    return `【重要な会話ルール】
${this.baseSettings.conversationRules.map((rule: string) => `- ${rule}`).join('\n')}

【応答フォーマット指示】
${this.baseSettings.commonInstructions.map((instruction: string) => `- ${instruction}`).join('\n')}

【応答時の重要な指示】
- 必ず${personaConfig.speakingStyle.politenessLevel === 'formal' ? '敬語' : personaConfig.speakingStyle.politenessLevel === 'polite' ? 'です・ます調' : 'カジュアルな口調'}で話してください
- ${personaConfig.basicInfo.name}として、あなたの個性を表現しながら、自然で魅力的な会話を心がけてください`;
  }

  /**
   * システムプロンプトを生成（時系列認識対応・共通化版）
   * @param personaId ペルソナID
   * @param chatCurrentDate チャット実行時の現在時刻（未指定の場合は現在時刻を取得）
   */
  generateSystemPrompt(personaId: string, chatCurrentDate?: Date): string {
    // チャット時の現在時刻を決定（引数で指定されていない場合は現在時刻を取得）
    const currentDate = chatCurrentDate || getCurrentDateJST();

    // 時系列認識のベースプロンプトを生成
    const timeRecognitionPrompt = generateTimeRecognitionBasePrompt();

    // 拡張ペルソナ（WEB情報付き）があるかチェック
    if (hasWebContext(personaId)) {
      const enhancedConfig = this.getEnhancedPersonaConfig(personaId);
      if (enhancedConfig) {
        // 基本プロンプト生成
        const basePrompt = this.generateBasePrompt(enhancedConfig);

        // 共通のWEB情報処理（チャット時の現在時刻で動的判定）
        const webContextPrompt = this.generateTimeAwareWebContext(enhancedConfig.webContext, currentDate);

        // 共通ルール
        const commonRules = this.generateCommonRules(enhancedConfig);

        return `${timeRecognitionPrompt}${basePrompt}

${webContextPrompt}

${commonRules}`;
      }
    }

    // 基本的なプロンプト生成（WEB情報なし）
    const config = this.getBotConfiguration(personaId);
    if (!config) {
      throw new Error(`Persona configuration not found for ID: ${personaId}`);
    }

    const { personaConfig } = config;
    const basePrompt = this.generateBasePrompt(personaConfig);

    // 現在の活動状況（基本ペルソナの場合）
    let currentStatusPrompt = '';
    if (personaConfig.currentStatus) {
      currentStatusPrompt = `

【最新活動状況】
${personaConfig.currentStatus.recentActivities?.map(activity => `- ${activity}`).join('\n') || ''}
${personaConfig.currentStatus.upcomingEvents?.map(event => `- ${event}`).join('\n') || ''}
${personaConfig.currentStatus.achievements?.map(achievement => `- ${achievement}`).join('\n') || ''}`;
    }

    const commonRules = this.generateCommonRules(personaConfig);

    return `${timeRecognitionPrompt}${basePrompt}${currentStatusPrompt}

【コミュニケーション特徴】
${personaConfig.personality.communicationStyle.map((style: string) => `- ${style}`).join('\n')}

【感情表現の特徴】
${personaConfig.personality.emotionalCharacteristics.map((char: string) => `- ${char}`).join('\n')}

【専門分野】
- 得意分野: ${personaConfig.expertise.primaryFields.join('、')}
- 経験: ${personaConfig.expertise.experiences.join('、')}

${commonRules}`;
  }

  /**
   * ペルソナの挨拶メッセージを取得
   */
  getPersonaGreeting(personaId: string): string {
    const config = this.getBestPersonaConfig(personaId);
    return config?.greeting || `こんにちは！${personaId}です。`;
  }

  /**
   * WEB情報の共通処理（時系列認識は別途処理）
   */
  private generateTimeAwareWebContext(webContext: any, currentDate: Date): string {
    if (!webContext?.contextData) return '';

    let webPrompt = `【🔥 最新動向・WEB情報 (${webContext.searchDate}時点)】\n`;

    // 最新ニュース（時系列認識）
    if (webContext.contextData.recentNews?.length > 0) {
      const newsPrompt = timeRecognition.generateTimeAwarePrompt(
        webContext.contextData.recentNews,
        'ニュース',
        currentDate
      );
      if (newsPrompt) webPrompt += newsPrompt;
    }

    // 今後の予定（時系列認識）
    if (webContext.contextData.upcomingEvents?.length > 0) {
      const eventsPrompt = timeRecognition.generateTimeAwarePrompt(
        webContext.contextData.upcomingEvents,
        'イベント・予定',
        currentDate
      );
      if (eventsPrompt) webPrompt += eventsPrompt;
    }

    // 実績・受賞歴（時系列認識）
    if (webContext.contextData.achievements?.length > 0) {
      const achievementsPrompt = timeRecognition.generateTimeAwarePrompt(
        webContext.contextData.achievements,
        '実績・受賞',
        currentDate
      );
      if (achievementsPrompt) webPrompt += achievementsPrompt;
    }

    return webPrompt;
  }
}

// シングルトンインスタンス
export const botConfigManager = new BotConfigurationManager();
