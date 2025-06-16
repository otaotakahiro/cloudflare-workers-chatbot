import { ref } from 'vue';
import { getDefaultPersona, getAvailablePersonas, isPersonaAvailable } from '../data/personas';
import type { Persona } from '../../Shared/types';

/**
 * ペルソナ管理機能のComposable
 * キャラクター変更機能を簡単に有効/無効にできます
 */
export function usePersonaManager() {
  // デフォルトペルソナが選択可能かチェックし、そうでなければ最初の利用可能なペルソナを使用
  const getInitialPersona = (): Persona => {
    const defaultPersona = getDefaultPersona();
    if (isPersonaAvailable(defaultPersona.id)) {
      return defaultPersona;
    }

    const availablePersonas = getAvailablePersonas();
    if (availablePersonas.length > 0) {
      return availablePersonas[0]!;
    }

    // フォールバック：利用可能なペルソナがない場合はデフォルトを使用
    return defaultPersona;
  };

  const currentPersona = ref<Persona>(getInitialPersona());
  const showPersonaSelector = ref(false);

  const changePersona = (persona: Persona): void => {
    // 選択可能なペルソナかチェック
    if (isPersonaAvailable(persona.id)) {
      currentPersona.value = persona;
    } else {
      console.warn(`Persona ${persona.id} is not available for selection`);
    }
  };

  const openPersonaSelector = (): void => {
    showPersonaSelector.value = true;
  };

  const closePersonaSelector = (): void => {
    showPersonaSelector.value = false;
  };

  const getPersonaGreeting = (persona: Persona): string => {
    const greetings: Record<string, string> = {
      'nct-mark': 'Yo! Mark from NCT here! What\'s up? 何か話したいことある？',
      'enhypen-sunghoon': 'こんにちは、ENHYPENのソンフンです。今日も素敵な一日にしましょう。',
      'kenmochi-touya': 'ういっす〜！剣持刀也や！今日はなんの話するんや？',
      'g-dragon': 'よう！G-Dragonだ。何か話したいことはあるか？',
      'ai-assistant': 'こんにちは！AIアシスタントです。何かお手伝いできることはありますか？',
      'cat-girl': 'にゃーん♪ ねこちゃんだにゃん！一緒に遊ぼうにゃ〜',
      'business-consultant': 'お疲れ様です。ビジネスコンサルタントです。どのようなご相談でしょうか？',
      'chef': 'ボンジュール！シェフです。美味しい料理について話しましょう！',
      'teacher': 'こんにちは！先生です。今日は何を学びたいですか？'
    };

    return greetings[persona.id] || `${persona.name}です。よろしくお願いします！`;
  };

  return {
    currentPersona,
    showPersonaSelector,
    changePersona,
    openPersonaSelector,
    closePersonaSelector,
    getPersonaGreeting,
  };
}
