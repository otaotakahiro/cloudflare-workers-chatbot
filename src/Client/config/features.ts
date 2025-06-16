/**
 * アプリケーションの機能設定
 * 各機能の有効/無効を簡単に切り替えできます
 */
export const FEATURES = {
  /**
   * ペルソナ変更機能
   * true: キャラクター変更ボタンとモーダルを表示
   * false: 固定ペルソナで動作（デフォルトペルソナを使用）
   */
  PERSONA_SWITCHING: true,

  /**
   * 会話履歴機能
   * true: 会話履歴を保存・復元
   * false: セッション毎にリセット
   */
  CONVERSATION_HISTORY: true,

  /**
   * デバッグモード
   * true: 開発者向けの情報を表示
   * false: 本番モード
   */
  DEBUG_MODE: false,
} as const;

/**
 * 選択可能なペルソナのID一覧
 * この配列に含まれるペルソナのみがPersonaSelectorで表示されます
 * 空の配列の場合は全てのペルソナが表示されます
 */
export const AVAILABLE_PERSONA_IDS: string[] = [
  'nct-mark',
  'enhypen-sunghoon',
  'kenmochi-touya',
  'g-dragon'
  // 必要に応じてペルソナIDを追加/削除してください
  // 例: 'ai-assistant', 'cat-girl', 'business-consultant', 'chef', 'teacher'
];

/**
 * 機能が有効かどうかをチェックする関数
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

/**
 * ペルソナ選択機能を無効化するヘルパー関数
 * 開発・デバッグ時に素早く機能を切り替えられます
 */
export const disablePersonaSwitching = (): void => {
  // @ts-ignore - 設定値を動的に変更するため
  FEATURES.PERSONA_SWITCHING = false;
};

/**
 * ペルソナ選択機能を有効化するヘルパー関数
 */
export const enablePersonaSwitching = (): void => {
  // @ts-ignore - 設定値を動的に変更するため
  FEATURES.PERSONA_SWITCHING = true;
};

/**
 * 利用可能なペルソナを全て表示するヘルパー関数
 */
export const showAllPersonas = (): void => {
  AVAILABLE_PERSONA_IDS.length = 0; // 配列をクリア
};

/**
 * 特定のペルソナのみを表示するヘルパー関数
 */
export const setAvailablePersonas = (personaIds: string[]): void => {
  AVAILABLE_PERSONA_IDS.length = 0; // 配列をクリア
  AVAILABLE_PERSONA_IDS.push(...personaIds);
};
