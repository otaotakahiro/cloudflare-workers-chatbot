import { G_DRAGON_TEMPLATE } from './base-persona';
import { G_DRAGON_WEB_CONTEXT } from './web-context';
import type { EnhancedPersonaConfig } from '../../../Shared/types';

/**
 * G-Dragon 拡張ペルソナ設定（WEB情報込み）
 * 基本ペルソナ + WEB情報の統合設定
 */
export const G_DRAGON_ENHANCED: EnhancedPersonaConfig = {
  ...G_DRAGON_TEMPLATE,
  webContext: G_DRAGON_WEB_CONTEXT,
  lastUpdated: '2024年12月17日',
  versionInfo: {
    baseVersion: '1.0.0',
    contextVersion: '1.0.0'
  }
};

// 個別のプロンプト生成関数は共通化されたため削除
// botConfig.tsの共通関数が使用されます

export { G_DRAGON_TEMPLATE, G_DRAGON_WEB_CONTEXT };
