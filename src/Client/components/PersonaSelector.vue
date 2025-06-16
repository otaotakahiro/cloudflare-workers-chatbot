<template>
  <div class="persona-selector">
    <div class="persona-selector-header">
      <h3>キャラクター選択</h3>
      <button @click="$emit('close')" class="close-button">×</button>
    </div>
    <div class="persona-grid">
      <div
        v-for="persona in availablePersonas"
        :key="persona.id"
        :class="['persona-card', { active: selectedPersona?.id === persona.id }]"
        @click="selectPersona(persona)"
      >
        <div class="persona-avatar">
          <img :src="persona.avatar" :alt="persona.name" @error="handleImageError" />
        </div>
        <div class="persona-info">
          <h4>{{ persona.name }}</h4>
          <p class="persona-role">{{ persona.role }}</p>
          <p class="persona-description">{{ persona.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getAvailablePersonas } from '../data/personas';
import type { Persona } from '../../Shared/types';

interface Props {
  selectedPersona?: Persona;
}

interface Emits {
  (e: 'select', persona: Persona): void;
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// 選択可能なペルソナのみを取得
const availablePersonas = computed(() => getAvailablePersonas());

const selectPersona = (persona: Persona): void => {
  emit('select', persona);
  emit('close');
};

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-avatar.svg'; // フォールバック画像
};
</script>

<style scoped>
.persona-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
  /* iOS Safari の安全領域対応 */
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}

.persona-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.persona-selector-header h3 {
  color: #fff;
  margin: 0;
  font-size: 22px;
  font-weight: bold;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.persona-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px;
}

.persona-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.persona-card:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.25);
}

.persona-card.active {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
}

.persona-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.persona-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.persona-info {
  flex: 1;
  min-width: 0;
}

.persona-info h4 {
  color: #fff;
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persona-role {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 6px 0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persona-description {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 11px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* スマホ最適化 */
@media (max-width: 768px) {
  .persona-selector {
    padding: 15px;
    padding-top: max(15px, env(safe-area-inset-top));
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }

  .persona-selector-header {
    margin-bottom: 15px;
  }

  .persona-selector-header h3 {
    font-size: 20px;
  }

  .close-button {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .persona-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .persona-card {
    padding: 14px;
    border-radius: 14px;
    min-height: 70px;
    gap: 10px;
  }

  .persona-avatar {
    width: 50px;
    height: 50px;
  }

  .persona-info h4 {
    font-size: 15px;
    margin-bottom: 4px;
  }

  .persona-role {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .persona-description {
    font-size: 10px;
    line-height: 1.2;
  }
}

/* 極小画面対応 */
@media (max-width: 480px) {
  .persona-selector {
    padding: 12px;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  .persona-selector-header h3 {
    font-size: 18px;
  }

  .close-button {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }

  .persona-grid {
    gap: 10px;
  }

  .persona-card {
    padding: 12px;
    border-radius: 12px;
    min-height: 65px;
    gap: 8px;
  }

  .persona-avatar {
    width: 45px;
    height: 45px;
  }

  .persona-info h4 {
    font-size: 14px;
  }

  .persona-role {
    font-size: 11px;
  }

  .persona-description {
    font-size: 9px;
  }
}

/* 横向き対応 */
@media (max-height: 500px) and (orientation: landscape) {
  .persona-selector {
    padding: 10px;
    padding-top: max(10px, env(safe-area-inset-top));
    padding-bottom: max(10px, env(safe-area-inset-bottom));
  }

  .persona-selector-header {
    margin-bottom: 10px;
  }

  .persona-selector-header h3 {
    font-size: 16px;
  }

  .close-button {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .persona-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 8px;
  }

  .persona-card {
    padding: 8px;
    min-height: 50px;
    gap: 6px;
  }

  .persona-avatar {
    width: 35px;
    height: 35px;
  }

  .persona-info h4 {
    font-size: 12px;
    margin-bottom: 2px;
  }

  .persona-role {
    font-size: 9px;
    margin-bottom: 2px;
  }

  .persona-description {
    font-size: 8px;
    -webkit-line-clamp: 1;
  }
}

/* タッチデバイス用の改善 */
@media (hover: none) and (pointer: coarse) {
  .persona-card:hover {
    transform: none;
    background: rgba(255, 255, 255, 0.12);
  }

  .persona-card:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.25);
  }

  .close-button:hover {
    transform: none;
    background: rgba(255, 255, 255, 0.2);
  }

  .close-button:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
