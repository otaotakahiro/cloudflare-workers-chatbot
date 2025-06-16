import type { Persona } from '../../Shared/types';
import { AVAILABLE_PERSONA_IDS } from '../config/features';

// 動的にペルソナを生成する関数
const generatePersonaFromTemplate = (id: string, template: any): Persona => {
  // 基本的なペルソナ情報をテンプレートから生成
  const basePersona: Persona = {
    id,
    name: template.basicInfo.realName ?
          `${template.basicInfo.name} (${template.basicInfo.realName.replace(/（.*）/, '')})` :
          template.basicInfo.name,
    role: template.basicInfo.occupation?.join('、') || 'アーティスト',
    tone: template.personality.coreTraits?.join('、') || '親しみやすい',
    description: [
      template.basicInfo.birthDate && `${template.basicInfo.birthDate}生まれ`,
      template.basicInfo.origin && `${template.basicInfo.origin}出身`,
      template.basicInfo.group && `${template.basicInfo.group}として活動`,
      template.basicInfo.mbti && `MBTI：${template.basicInfo.mbti}`
    ].filter(Boolean).join('。'),
    avatar: `/default-avatar.svg`,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  };

  // 個別設定（必要に応じて追加）
  switch (id) {
    case 'g-dragon':
      return {
        ...basePersona,
        avatar: '/g-dragon.png',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
    case 'tajima-shogo':
      return {
        ...basePersona,
        avatar: '/default-avatar.svg',
        backgroundColor: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)'
      };
    case 'nct-mark':
      return {
        ...basePersona,
        avatar: '/nct-mark.png',
        backgroundColor: 'linear-gradient(135deg, #88e5a3 0%, #5f9ea0 100%)'
      };
    default:
      return basePersona;
  }
};

// バックエンドペルソナテンプレートを動的にインポート（実行時には無効だが、型チェック用）
// 実際の運用では、APIエンドポイントでペルソナリストを取得する想定
export const personas: Persona[] = [
  // 動的生成のプレースホルダー - 実際の実装では API から取得
  {
    id: 'g-dragon',
    name: 'G-Dragon (クォン・ジヨン)',
    role: 'ラッパー、ソングライター、音楽プロデューサー、起業家、ファッションアイコン',
    tone: '陽気でエネルギッシュ、親しみやすく気さく、創造性に溢れている',
    description: '1988年8月18日生まれ、韓国ソウル市出身。BIGBANG（リーダー、メインラッパー）として活動。MBTI：ENTP',
    avatar: '/g-dragon.png',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'tajima-shogo',
    name: '田島将吾',
    role: 'アイドル、ラッパー、ダンサー、作詞作曲家',
    tone: '温和で癒し系、穏やかで思いやり深い、控えめで謙虚',
    description: '1998年10月13日生まれ、東京都出身。INI（メインラッパー、メインダンサー）として活動。MBTI：ENTJ',
    avatar: '/default-avatar.svg',
    backgroundColor: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'nct-mark',
    name: 'Mark Lee',
    role: 'K-POPアイドル、ラッパー、ボーカル、ダンサー、作詞家',
    tone: 'エネルギッシュで前向き、努力家で向上心が強い、親しみやすく社交的',
    description: '1999年8月2日生まれ、カナダ・トロント出身。NCT（NCT U, NCT 127, NCT Dream）として活動。MBTI：INFJ',
    avatar: '/nct-mark.png',
    backgroundColor: 'linear-gradient(135deg, #88e5a3 0%, #5f9ea0 100%)',
    textColor: '#ffffff'
  },
  // その他の汎用ペルソナ（レガシー）
  {
    id: 'ai-assistant',
    name: 'AIアシスタント',
    role: '親切で知識豊富なAIヘルパー',
    tone: '丁寧で分かりやすい',
    description: '様々な質問にお答えする汎用AIアシスタント',
    avatar: '/ai-assistant.svg',
    backgroundColor: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    textColor: '#ffffff'
  }
];

export const getPersonaById = (id: string): Persona | undefined => {
  return personas.find(persona => persona.id === id);
};

export const getDefaultPersona = (): Persona => {
  return personas[0]!; // G-Dragon をデフォルトに（配列の最初の要素）
};

/**
 * 選択可能なペルソナのみを取得する関数
 * AVAILABLE_PERSONA_IDSで指定されたペルソナのみを返します
 * AVAILABLE_PERSONA_IDSが空の場合は全てのペルソナを返します
 */
export const getAvailablePersonas = (): Persona[] => {
  if (AVAILABLE_PERSONA_IDS.length === 0) {
    return personas;
  }

  return personas.filter(persona => AVAILABLE_PERSONA_IDS.includes(persona.id));
};

/**
 * 指定されたペルソナIDが選択可能かどうかをチェックする関数
 */
export const isPersonaAvailable = (personaId: string): boolean => {
  if (AVAILABLE_PERSONA_IDS.length === 0) {
    return true; // 制限がない場合は全て選択可能
  }

  return AVAILABLE_PERSONA_IDS.includes(personaId);
};
