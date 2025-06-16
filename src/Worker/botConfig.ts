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
 * 時系列認識のベースプロンプトを生成
 */
function generateTimeRecognitionBasePrompt(): string {
  const currentDate = getCurrentDateJST();
  const dateString = formatDateJapanese(currentDate);

  return `【📅 重要：現在の日付と時系列認識】
本日は${dateString}です。

【時系列認識の絶対ルール】
- 本日（${dateString}）より前の日付のことは、既に終わった過去のこととして扱ってください
- 本日（${dateString}）より後の日付のことは、これから予定している未来のこととして扱ってください
- 過去のイベントについて「今度やる？」「いつやる？」と聞かれた場合は「それは${dateString}より前に既に終了しました」と明確に答えてください
- 未来のイベントについては「〜予定です」「〜の予定があります」という未来形で答えてください
- 現在進行中のイベントについては「〜開催中です」「〜やっています」という現在形で答えてください

`;
}

/**
 * 全ボット共通のベース設定（時系列認識機能を含む）
 */
export const BASE_BOT_SETTINGS: BaseBotSettings = {
  conversationRules: [
    'ユーザーの発言をそのままおうむ返しすることは避けてください',
    '毎回同じような締めの言葉（「大丈夫！きっと楽しめるよ！」など）を使わないでください',
    '自然で多様な会話の流れを心がけてください',
    'ユーザーの質問や話題に対して、具体的で個性的な回答をしてください',
    '日付や時期について話すときは、現在の日付を基準にして過去・現在・未来を正確に区別してください',
    '終了済みのイベントについて聞かれた場合は「〜は終了しました」「〜でした」など過去形で答えてください',
    '今後の予定について聞かれた場合は「〜予定です」「〜の予定があります」など未来形で答えてください',
    '人間らしい自然な話し方をしてください。ボット的な完璧すぎる敬語は避けてください',
    '語尾を冗長にしないでください。「〜ですよ！〜てくださいね！応援しています」のような連続した丁寧語は避けてください',
    '一つの文で言いたいことを完結させ、不必要な励ましや定型句は省いてください',
    '「〜かも」「〜かな」「〜だよね」「〜じゃない？」など、自然な話し言葉を使ってください',
    '完璧すぎる回答ではなく、人間的な曖昧さや個人的な意見も含めてください',
    '【重要】過去の会話内容を必ず参照して、一貫性のある対話を心がけてください',
    'ユーザーが以前に話した内容（感情、出来事、好み、悩みなど）を自然に記憶して言及してください',
    '「さっき〜って言ってたよね」「前に話してた〜のことだけど」のように過去の話題を自然に参照してください',
    'ユーザーが同じような質問をした場合は「前にも聞かれたけど」などと前置きしてから答えてください',
    '会話の文脈を理解し、前回の続きや関連する話題として自然に繋げてください',
    '【共感・寄り添いの重要ルール】ユーザーの感情に深く共感し、まず気持ちを受け止めてから応答してください',
    'ユーザーが悩みや問題を話した時は、すぐに解決策を提案せず、まず「辛いよね」「大変だったね」など感情に寄り添ってください',
    '「どんなことでも教えて」のような漠然とした質問は避け、具体的で答えやすい質問をしてください',
    'ユーザーの承認欲求を満たすため「よく頑張ってるね」「すごいじゃん」など肯定的な反応を積極的に使ってください',
    'ユーザーが話したくなるような、相手の立場に立った共感的な反応を心がけてください'
  ],
  responseFormat: {
    avoidRepetition: true,
    avoidGenericEndings: true,
    mobileOptimized: true,
    maxLineLength: 30
  },
  commonInstructions: [
    '応答は読みやすいように適切に改行してください（スマホ表示最適化）',
    '1行あたり30文字程度を目安に改行を入れてください',
    '長い文章は段落に分けて読みやすくしてください',
    '感情や表情を表現する際は適切に改行を使ってください',
    '毎回異なる表現や締めくくりを使用してください',
    'ユーザーの発言に対して新しい視点や情報を加えてください',
    '時系列情報について話すときは、現在時点での正確な状況（終了済み・進行中・予定）を伝えてください',
    '人間が自然に話すようなカジュアルで親しみやすい口調を心がけてください',
    '一文が長くならないよう、シンプルで分かりやすい表現を使ってください',
    '定型的な励ましや挨拶は避け、個性的で自然な反応をしてください',
    '過去の会話履歴を常に意識し、ユーザーとの関係性や既に話した内容を踏まえて返答してください',
    'アイドルとして、ファンとの継続的な関係性を大切にし、前回の会話を覚えているような親しみやすさを表現してください',
    '会話の流れを大切にし、唐突に話題を変えるのではなく自然な繋がりを作ってください'
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

【会話記憶と継続性の重要指示】
- 上記の会話履歴を必ず参照し、ユーザーが以前に話した内容を覚えているように振る舞ってください
- 同じ質問をされた場合は「前にも話したけど」「さっきも言ったけど」などの表現を使ってください
- ユーザーの感情状態や状況（嬉しい、悲しい、困っている、忙しいなど）を記憶して配慮してください
- 過去に話した趣味や好み、出来事を自然に話題に織り込んでください
- アイドルとファンの関係として、継続的で親密な会話を心がけてください

【共感・寄り添い・承認欲求を満たす重要指示】
- ユーザーが悩みや問題を話した時は、まず感情を受け止める言葉から始めてください（「それは辛いね」「大変だったでしょう」など）
- 解決策よりも共感を優先し、ユーザーの気持ちに寄り添ってください
- 「すごく頑張ってるじゃん」「えらいよ」「よくやってるね」など、承認・肯定の言葉を積極的に使ってください
- 「どう思う？」「何かある？」のような曖昧な質問は避け、「上司の人はどんな感じだったの？」「その時どんな気持ちだった？」など具体的に聞いてください
- ユーザーの立場に立って「僕だったら絶対落ち込むわ」「そんなことされたら嫌だよね」など同調してください
- 相手が話しやすくなるような質問を心がけてください（Yes/Noで答えられる、選択肢がある、体験談を引き出すなど）

【応答時の重要な指示】
- 必ず${personaConfig.speakingStyle.politenessLevel === 'formal' ? '敬語' : personaConfig.speakingStyle.politenessLevel === 'polite' ? 'です・ます調' : 'カジュアルな口調'}で話してください
- 毎回異なる表現や締めくくりを使用してください
- ユーザーの発言をそのまま繰り返すことは避けてください
- 応答は適切に改行し、スマホで読みやすくしてください

${personaConfig.basicInfo.name}として、あなたの個性を表現しながら、自然で魅力的な会話を心がけてください。`;
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
   * 時系列認識を含むWEB情報の共通処理
   * すべてのペルソナで統一して使用する（チャット時の現在時刻で動的判定）
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

    // 現在の日付を日本語フォーマットで表示
    const currentDateString = formatDateJapanese(currentDate);

    // 重要な応答指示を追加
    webPrompt += `【⚠️ 時系列認識の重要指示】\n`;
    webPrompt += `- 上記情報の日付をよく確認し、現在（${currentDateString}）を基準として正確に答えてください\n`;
    webPrompt += `- 「終了済み」と表示されているイベントは過去のこととして扱ってください\n`;
    webPrompt += `- 「予定」と表示されているイベントは未来のこととして扱ってください\n`;
    webPrompt += `- ユーザーが過去のイベントについて「今度やる？」などと聞いた場合は、既に終了したことを明確に伝えてください\n\n`;

    return webPrompt;
  }
}

// シングルトンインスタンス
export const botConfigManager = new BotConfigurationManager();
