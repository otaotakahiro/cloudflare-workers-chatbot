<template>
  <div class="chat-container" :style="{ background: currentPersona.backgroundColor }">
    <div class="background-overlay"></div>
    <div class="chat-header">
      <div
        class="avatar"
        :class="{ clickable: isPersonaSwitchingEnabled }"
        @click="isPersonaSwitchingEnabled && openPersonaSelector()"
      >
        <img :src="currentPersona.avatar" :alt="currentPersona.name" class="avatar-image" @error="handleAvatarError" />
        <div v-if="isPersonaSwitchingEnabled" class="change-indicator">変更</div>
      </div>
      <div class="chat-title">
        <h2>{{ currentPersona.name }}</h2>
        <p>{{ currentPersona.description }}</p>
      </div>
      <button
        v-if="isPersonaSwitchingEnabled"
        @click="openPersonaSelector"
        class="persona-change-button"
      >
        <span class="button-text">キャラクター変更</span>
        <span class="button-icon">🔄</span>
      </button>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="メッセージを入力..."
        type="text"
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
        {{ isLoading ? '...' : '送信' }}
      </button>
    </div>

    <!-- ペルソナ選択モーダル（機能が有効な場合のみ） -->
    <PersonaSelector
      v-if="isPersonaSwitchingEnabled && showPersonaSelector"
      :selected-persona="currentPersona"
      @select="handlePersonaChange"
      @close="closePersonaSelector"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import PersonaSelector from './components/PersonaSelector.vue';
import { usePersonaManager } from './composables/usePersonaManager';
import { isFeatureEnabled } from './config/features';
import type { ChatMessage } from '../Shared/types';

const messages = ref<ChatMessage[]>([]);
const userInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const sessionId = ref(crypto.randomUUID());
const isLoading = ref(false);

// ペルソナ管理機能
const {
  currentPersona,
  showPersonaSelector,
  changePersona,
  openPersonaSelector,
  closePersonaSelector,
  getPersonaGreeting,
} = usePersonaManager();

// 機能フラグ
const isPersonaSwitchingEnabled = computed(() => isFeatureEnabled('PERSONA_SWITCHING'));

const scrollToBottom = (): void => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handlePersonaChange = (persona: any): void => {
  const oldPersona = currentPersona.value;
  changePersona(persona);

  // ペルソナ変更時は会話をリセットして、新しい挨拶のみを表示
  if (isPersonaSwitchingEnabled.value) {
    // 会話履歴をクリア
    messages.value = [];

    // 新しいセッションIDを生成（履歴を完全に分離）
    sessionId.value = crypto.randomUUID();

    // 新しいペルソナの挨拶のみを表示
    messages.value.push({
      role: 'assistant',
      content: getPersonaGreeting(persona)
    });
    scrollToBottom();

    // モーダルを閉じる
    closePersonaSelector();
  }
};

const sendMessage = async (): Promise<void> => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userMessage = userInput.value;
  userInput.value = '';
  isLoading.value = true;

  // ユーザーメッセージを追加
  messages.value.push({ role: 'user', content: userMessage });
  scrollToBottom();

  try {
    console.log('Sending message to API:', {
      message: userMessage,
      sessionId: sessionId.value,
      persona: currentPersona.value.name
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        sessionId: sessionId.value,
        persona: currentPersona.value,
      }),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { response: string };
    console.log('API response received:', { responseLength: data.response.length });

    messages.value.push({ role: 'assistant', content: data.response });
  } catch (error) {
    console.error('Error sending message:', error);

    let errorMessage = '申し訳ありません。エラーが発生しました。';

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'サーバーに接続できませんでした。ネットワーク接続を確認してください。';
      } else if (error.message.includes('API error: 401')) {
        errorMessage = 'API認証エラーが発生しました。設定を確認してください。';
      } else if (error.message.includes('API error: 429')) {
        errorMessage = 'リクエストが多すぎます。少し時間をおいてから再度お試しください。';
      }
    }

    messages.value.push({
      role: 'assistant',
      content: errorMessage,
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const handleAvatarError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-avatar.svg';
};

onMounted(() => {
  // 初期メッセージ
  messages.value.push({
    role: 'assistant',
    content: getPersonaGreeting(currentPersona.value),
  });
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  transition: background 0.5s ease;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1;
}

.chat-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 70px;
}

.avatar {
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  border: 2px solid #fff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.avatar.clickable {
  cursor: pointer;
}

.avatar.clickable:hover {
  transform: scale(1.05);
}

.avatar.clickable:hover .change-indicator {
  opacity: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #007bff;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.chat-title {
  flex: 1;
  min-width: 0;
}

.chat-title h2 {
  color: #fff;
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-title p {
  color: rgba(255, 255, 255, 0.7);
  margin: 2px 0 0 0;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persona-change-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.persona-change-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.button-text {
  display: inline;
}

.button-icon {
  font-size: 14px;
}

.chat-messages {
  position: relative;
  z-index: 2;
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  -webkit-overflow-scrolling: touch;
}

.message {
  display: flex;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 14px;
}

.message.user .message-content {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border-bottom-left-radius: 4px;
  backdrop-filter: blur(10px);
}

.chat-input {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  /* iOS Safari の安全領域対応 */
  padding-bottom: max(15px, env(safe-area-inset-bottom));
}

input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  outline: none;
  /* iOS Safari のズーム防止 */
  transform: translateZ(0);
}

input:focus {
  background: rgba(255, 255, 255, 1);
}

input:disabled {
  opacity: 0.6;
}

button {
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* スマホ最適化 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 15px;
    min-height: 65px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .chat-title h2 {
    font-size: 15px;
  }

  .chat-title p {
    font-size: 10px;
  }

  .persona-change-button {
    padding: 6px 10px;
    font-size: 11px;
  }

  .button-text {
    display: none; /* スマホでは文字を非表示 */
  }

  .button-icon {
    font-size: 16px;
  }

  .chat-messages {
    padding: 12px;
    gap: 10px;
  }

  .message {
    max-width: 90%;
  }

  .message-content {
    padding: 10px 14px;
    font-size: 14px;
  }

  .chat-input {
    padding: 12px;
    gap: 6px;
    /* iOS Safari の安全領域対応 */
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  input {
    padding: 10px 14px;
    font-size: 16px; /* iOS Safari のズーム防止 */
  }

  button {
    padding: 10px 16px;
    font-size: 14px;
  }
}

/* 極小画面対応 */
@media (max-width: 480px) {
  .chat-header {
    padding: 10px 12px;
    min-height: 60px;
  }

  .avatar {
    width: 35px;
    height: 35px;
    margin-right: 8px;
  }

  .chat-title h2 {
    font-size: 14px;
  }

  .chat-title p {
    font-size: 9px;
  }

  .persona-change-button {
    padding: 5px 8px;
    min-width: 32px;
    min-height: 32px;
    border-radius: 16px;
  }

  .button-icon {
    font-size: 14px;
  }

  .chat-messages {
    padding: 10px;
  }

  .message-content {
    padding: 8px 12px;
    font-size: 13px;
  }

  .chat-input {
    padding: 10px;
  }

  input {
    padding: 8px 12px;
  }

  button {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* 横向き対応 */
@media (max-height: 500px) and (orientation: landscape) {
  .chat-header {
    padding: 8px 15px;
    min-height: 50px;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }

  .chat-title h2 {
    font-size: 13px;
  }

  .chat-title p {
    font-size: 8px;
  }

  .persona-change-button {
    padding: 4px 6px;
    min-width: 28px;
    min-height: 28px;
  }

  .button-icon {
    font-size: 12px;
  }

  .chat-messages {
    padding: 8px;
  }

  .chat-input {
    padding: 8px;
  }
}
</style>
