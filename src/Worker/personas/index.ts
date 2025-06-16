import type { PersonaPromptConfig, EnhancedPersonaConfig } from '../../Shared/types';

// 各ペルソナフォルダのindexファイルからのインポート
import { G_DRAGON_TEMPLATE, G_DRAGON_ENHANCED } from './001-g-dragon/index';
import { TAJIMA_SHOGO_TEMPLATE, TAJIMA_SHOGO_ENHANCED } from './002-tajima-shogo/index';
import { NCT_MARK_TEMPLATE } from './003-nct-mark/index';

/**
 * 基本ペルソナテンプレートの中央管理レジストリ
 * レガシー対応：既存の基本ペルソナアクセス用
 */
export const PERSONA_TEMPLATES: Record<string, PersonaPromptConfig> = {
  'g-dragon': G_DRAGON_TEMPLATE,
  'tajima-shogo': TAJIMA_SHOGO_TEMPLATE,
  'nct-mark': NCT_MARK_TEMPLATE,
  // 新しいペルソナはここに追加
  // 'new-persona-id': NEW_PERSONA_TEMPLATE,
};

/**
 * 拡張ペルソナ設定の中央管理レジストリ
 * WEB検索情報を含む最新版のペルソナ設定
 */
export const ENHANCED_PERSONA_CONFIGS: Record<string, EnhancedPersonaConfig> = {
  'g-dragon': G_DRAGON_ENHANCED,
  'tajima-shogo': TAJIMA_SHOGO_ENHANCED,
  // WEBコンテキスト対応済みのペルソナのみここに登録
  // 'new-persona-id': NEW_PERSONA_ENHANCED,
};

/**
 * ペルソナ登録情報の管理
 */
export interface PersonaRegistration {
  id: string;
  folderNumber: string;
  hasWebContext: boolean;
  lastUpdated: string;
}

/**
 * 登録されているペルソナの一覧
 */
export const PERSONA_REGISTRY: PersonaRegistration[] = [
  {
    id: 'g-dragon',
    folderNumber: '001',
    hasWebContext: true,
    lastUpdated: '2025-01-17'
  },
  {
    id: 'tajima-shogo',
    folderNumber: '002',
    hasWebContext: true,
    lastUpdated: '2025-01-17'
  },
  {
    id: 'nct-mark',
    folderNumber: '003',
    hasWebContext: false,
    lastUpdated: '2025-01-17'
  }
];

/**
 * 利用可能なペルソナIDの一覧を取得
 */
export function getAvailablePersonaIds(): string[] {
  return Object.keys(PERSONA_TEMPLATES);
}

/**
 * 指定されたペルソナテンプレートを取得（基本版）
 */
export function getPersonaTemplate(personaId: string): PersonaPromptConfig | undefined {
  return PERSONA_TEMPLATES[personaId];
}

/**
 * 指定された拡張ペルソナ設定を取得（WEB情報込み）
 */
export function getEnhancedPersonaConfig(personaId: string): EnhancedPersonaConfig | undefined {
  return ENHANCED_PERSONA_CONFIGS[personaId];
}

/**
 * ペルソナがWEBコンテキストに対応しているかチェック
 */
export function hasWebContext(personaId: string): boolean {
  return personaId in ENHANCED_PERSONA_CONFIGS;
}

/**
 * 最適なペルソナ設定を取得（WEB情報優先）
 */
export function getBestPersonaConfig(personaId: string): PersonaPromptConfig | EnhancedPersonaConfig | undefined {
  // WEB情報付きが利用可能な場合はそちらを優先
  return getEnhancedPersonaConfig(personaId) || getPersonaTemplate(personaId);
}

/**
 * 新しいペルソナテンプレートを動的に登録（テスト用途など）
 */
export function registerPersonaTemplate(personaId: string, template: PersonaPromptConfig): void {
  PERSONA_TEMPLATES[personaId] = template;
}

/**
 * ペルソナテンプレートが存在するかチェック
 */
export function hasPersonaTemplate(personaId: string): boolean {
  return personaId in PERSONA_TEMPLATES;
}

/**
 * ペルソナ登録情報を取得
 */
export function getPersonaRegistration(personaId: string): PersonaRegistration | undefined {
  return PERSONA_REGISTRY.find(reg => reg.id === personaId);
}
