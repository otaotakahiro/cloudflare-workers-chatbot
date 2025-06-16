import type { ChatMessage } from '../Shared/types';

/**
 * KVストレージ操作のインターフェース
 */
export interface KVStorage {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * チャット履歴管理クラス
 */
export class ChatHistoryManager {
  constructor(private kv: KVStorage) {}

  /**
   * セッションの会話履歴を取得
   */
  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const historyKey = `chat_${sessionId}`;
    const existingHistory = await this.kv.get(historyKey);
    return existingHistory ? JSON.parse(existingHistory) : [];
  }

  /**
   * セッションの会話履歴を保存
   */
  async saveHistory(sessionId: string, messages: ChatMessage[], maxMessages = 20): Promise<void> {
    const historyKey = `chat_${sessionId}`;
    const trimmedHistory = messages.slice(-maxMessages);

    await this.kv.put(historyKey, JSON.stringify(trimmedHistory), {
      expirationTtl: 86400, // 24時間で期限切れ
    });
  }

  /**
   * メッセージを履歴に追加
   */
  async addMessage(sessionId: string, message: ChatMessage): Promise<ChatMessage[]> {
    const history = await this.getHistory(sessionId);
    history.push(message);
    await this.saveHistory(sessionId, history);
    return history;
  }

  /**
   * セッションの履歴を削除
   */
  async clearHistory(sessionId: string): Promise<void> {
    const historyKey = `chat_${sessionId}`;
    await this.kv.delete(historyKey);
  }

  /**
   * 履歴の最新N件を取得（OpenAI API用）
   */
  async getRecentMessages(sessionId: string, limit = 10): Promise<ChatMessage[]> {
    const history = await this.getHistory(sessionId);
    return history.slice(-limit);
  }
}
