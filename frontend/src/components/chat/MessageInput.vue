<script setup>
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'

const chatStore = useChatStore()
const toastStore = useToastStore()

const text = ref('')
const textareaRef = ref(null)

async function handleSend() {
  const content = text.value.trim()
  if (!content || chatStore.sending) return

  text.value = ''

  try {
    await chatStore.sendMessage(content)
  } catch (err) {
    toastStore.error('Не удалось отправить сообщение')
    text.value = content
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function autoResize(event) {
  const el = event.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}
</script>

<template>
  <div class="cv-minput">
    <div class="cv-minput__field">
      <textarea
        ref="textareaRef"
        v-model="text"
        class="cv-minput__textarea"
        placeholder="Написать сообщение..."
        rows="1"
        @keydown="handleKeydown"
        @input="autoResize"
      ></textarea>

      <button
        class="cv-minput__send"
        :disabled="!text.trim() || chatStore.sending"
        aria-label="Отправить"
        @click="handleSend"
      >
        <span class="cv-minput__send-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cv-minput {
  position: relative;
  padding: 14px 18px 18px;
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 60%),
    linear-gradient(180deg, rgba(28, 24, 18, 0.2), rgba(15, 13, 10, 0.3));
  border-top: 1px solid rgba(201, 169, 97, 0.12);
  z-index: 1;
}

.cv-minput::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.28) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-minput__field {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 8px 8px 8px 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 1rem;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-minput__field:focus-within {
  border-color: rgba(201, 169, 97, 0.45);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 40px rgba(201, 169, 97, 0.08),
    0 1px 0 rgba(232, 213, 160, 0.08) inset;
}

.cv-minput__textarea {
  flex: 1;
  padding: 10px 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  max-height: 120px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-minput__textarea::-webkit-scrollbar {
  width: 6px;
}

.cv-minput__textarea::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 3px;
}

.cv-minput__textarea::placeholder {
  color: rgba(200, 190, 175, 0.4);
  transition: color 0.25s ease;
}

.cv-minput__textarea:focus::placeholder {
  color: rgba(200, 190, 175, 0.55);
}

.cv-minput__send {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  overflow: hidden;
}

.cv-minput__send::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 245, 214, 0.4), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.cv-minput__send:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 8px 28px rgba(201, 169, 97, 0.55),
    0 0 32px rgba(201, 169, 97, 0.3),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-minput__send:hover:not(:disabled)::before {
  opacity: 1;
}

.cv-minput__send:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

.cv-minput__send:disabled {
  color: rgba(200, 190, 175, 0.4);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  box-shadow: none;
  cursor: not-allowed;
}

.cv-minput__send-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-minput__send:hover:not(:disabled) .cv-minput__send-icon {
  transform: translateX(2px) translateY(-1px) scale(1.05);
}

@media (max-width: 768px) {
  .cv-minput {
    padding: 10px 12px 14px;
  }

  .cv-minput__field {
    padding: 6px 6px 6px 12px;
    gap: 8px;
  }

  .cv-minput__textarea {
    font-size: 13.5px;
    padding: 9px 0;
  }

  .cv-minput__send {
    width: 40px;
    height: 40px;
    border-radius: 11px;
  }
}
</style>