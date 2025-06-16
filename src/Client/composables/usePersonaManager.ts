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
    // 実際のペルソナテンプレートから挨拶を取得する
    // TODO: 将来的にはAPIエンドポイントから取得するか、
    // ペルソナオブジェクト自体にgreetingプロパティを追加することを検討

    // 現在は基本的なフォールバック挨拶を使用
    return `${persona.name}です。\n今日はどんな話をしようか？`;
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
