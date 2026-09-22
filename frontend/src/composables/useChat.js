import { computed, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useRouter, useRoute } from 'vue-router'

/**
 * Composable-обёртка над chat-store.
 * - Guard авторизации
 * - Тосты
 * - Автоматическая очистка polling'а при unmount
 */
export function useChat() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  const router = useRouter()
  const route = useRoute()

  // === Реактивные данные ===
  const chats = computed(() => chatStore.chats)
  const currentChat = computed(() => chatStore.currentChat)
  const messages = computed(() => chatStore.currentMessages)
  const totalUnread = computed(() => chatStore.totalUnread)
  const loading = computed(() => chatStore.loading)
  const sending = computed(() => chatStore.sending ?? false)
  const error = computed(() => chatStore.error)

  // === Guard авторизации (правильный, через .value) ===
  function ensureAuth(message = 'Войдите, чтобы продолжить') {
    if (authStore.isAuthenticated.value) return true

    toastStore.info(message)
    router.push({
      name: 'login',
      query: { redirect: route.fullPath }
    })
    return false
  }

  /**
   * Открыть чат с продавцом.
   * Если чат уже существует — стор вернёт его, дубликата не будет.
   */
  async function openChatWithSeller(announcementId, sellerId) {
    if (!ensureAuth('Войдите, чтобы написать продавцу')) {
      return null
    }

    // Защита от открытия чата с самим собой
    if (authStore.user?.id === sellerId) {
      toastStore.warning?.('Это ваш собственный автомобиль') ||
        toastStore.info('Это ваш собственный автомобиль')
      return null
    }

    try {
      const chat = await chatStore.createOrOpenChat(announcementId, sellerId)
      if (chat?.id) {
        router.push({ name: 'chat-detail', params: { id: chat.id } })
      }
      return chat
    } catch (err) {
      toastStore.error(err?.message || 'Не удалось открыть чат')
      return null
    }
  }

  /**
   * Отправить сообщение в текущий чат.
   * @param {string} content
   * @param {Object} [opts]
   * @param {boolean} [opts.silent] — не показывать тост об ошибке (оффлайн-режим)
   */
  async function sendMessage(content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    try {
      return await chatStore.sendMessage(text)
    } catch (err) {
      if (!opts.silent) {
        toastStore.error(err?.message || 'Не удалось отправить сообщение')
      }
      throw err
    }
  }

  /** Пометить текущий чат прочитанным */
  async function markAsRead(chatId = null) {
    const id = chatId ?? currentChat.value?.id
    if (!id) return

    try {
      await chatStore.markAsRead?.(id)
    } catch (err) {
      // Тихая ошибка — не критично для UX
      console.warn('[useChat] markAsRead failed:', err?.message || err)
    }
  }

  /** Удалить сообщение (локально или на бэке) */
  async function deleteMessage(messageId) {
    try {
      await chatStore.deleteMessage?.(messageId)
      toastStore.success('Сообщение удалено')
    } catch (err) {
      toastStore.error(err?.message || 'Не удалось удалить сообщение')
      throw err
    }
  }

  /** Загрузить сообщения конкретного чата */
  async function fetchMessages(chatId, opts = {}) {
    try {
      return await chatStore.fetchMessages?.(chatId, opts)
    } catch (err) {
      if (!opts.silent) {
        toastStore.error('Не удалось загрузить сообщения')
      }
      throw err
    }
  }

  /** Закрыть/очистить текущий чат (при выходе со страницы) */
  function closeChat() {
    chatStore.selectChat?.(null)
  }

  // Очистка при unmount — например, остановка polling'а
  onUnmounted(() => {
    chatStore.stopPolling?.()
  })

  return {
    // Данные
    chats,
    currentChat,
    messages,
    totalUnread,
    loading,
    sending,
    error,

    // Действия
    openChatWithSeller,
    sendMessage,
    markAsRead,
    deleteMessage,
    fetchMessages,
    closeChat,

    // Прокидываем из стора
    selectChat: chatStore.selectChat,
    fetchChats: chatStore.fetchChats
  }
}