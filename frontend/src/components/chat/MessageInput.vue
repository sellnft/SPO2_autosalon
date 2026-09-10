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
  <div class="message-input">
    <textarea
      ref="textareaRef"
      v-model="text"
      class="message-input__textarea"
      placeholder="Написать сообщение..."
      rows="1"
      @keydown="handleKeydown"
      @input="autoResize"
    ></textarea>
    
    <button
      class="message-input__send"
      :disabled="!text.trim() || chatStore.sending"
      :aria-label="'Отправить'"
      @click="handleSend"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.message-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #E5E7EB;
}

.message-input__textarea {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  outline: none;
  resize: none;
  max-height: 120px;
  line-height: 1.5;
  transition: all 0.2s;
}

.message-input__textarea:focus {
  background: white;
  border-color: #0A84FF;
}

.message-input__send {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: white;
  background: #0A84FF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-input__send:hover:not(:disabled) {
  background: #0066CC;
  transform: translateY(-1px);
}

.message-input__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>