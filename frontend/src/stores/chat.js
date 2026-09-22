import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { chatApi } from '@/services/api/chatApi'
import { chatSocket, ConnectionStatus } from '@/services/websocket/chatSocket'

/* ============================================================
 *  Генератор optimistic id
 * ============================================================ */

function optimisticId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useChatStore = defineStore('chat', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const chats = ref([])
  const chatsTotal = ref(0)

  const currentChatId = ref(null)

  /** messages[chatId] = массив сообщений */
  const messages = ref({})

  /** Метаданные пагинации по чату: { [chatId]: { page, perPage, total, hasMore } } */
  const messagesMeta = ref({})

  const loading = ref(false)
  const loadingMessages = ref(false)
  const sending = ref(false)

  const error = ref(null)
  const searchQuery = ref('')

  const socketStatus = ref(ConnectionStatus.DISCONNECTED)
  const socketConnected = computed(
    () => socketStatus.value === ConnectionStatus.CONNECTED
  )

  // Race-condition guard для переключения чатов
  let fetchMsgSeq = 0

  // Cleanup-функции для отписок
  const cleanupFns = []

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const currentChat = computed(
    () => chats.value.find(c => c.id === currentChatId.value) || null
  )

  const currentMessages = computed(
    () => messages.value[currentChatId.value] || []
  )

  const currentMessagesMeta = computed(
    () => messagesMeta.value[currentChatId.value] || {
      page: 1, perPage: 50, total: 0, hasMore: false
    }
  )

  const filteredChats = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return chats.value

    return chats.value.filter(c =>
      c.sellerName?.toLowerCase().includes(q) ||
      c.buyerName?.toLowerCase().includes(q) ||
      c.announcementTitle?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    )
  })

  const totalUnread = computed(() =>
    chats.value.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  )

  const hasChats = computed(() => chats.value.length > 0)

  const isEmpty = computed(() => !loading.value && chats.value.length === 0)

  /** Быстрый поиск чата по ID */
  const chatById = computed(() => {
    const map = new Map()
    chats.value.forEach(c => map.set(c.id, c))
    return (id) => map.get(Number(id)) || null
  })

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  function ensureMessagesBucket(chatId) {
    if (!messages.value[chatId]) {
      messages.value = { ...messages.value, [chatId]: [] }
    }
  }

  function patchChatInList(chatId, patch) {
    const index = chats.value.findIndex(c => c.id === Number(chatId))
    if (index === -1) return false

    chats.value = [
      ...chats.value.slice(0, index),
      { ...chats.value[index], ...patch },
      ...chats.value.slice(index + 1)
    ]
    return true
  }

  function updateChatFromMessage(chatId, message) {
    patchChatInList(chatId, {
      lastMessage: message.content,
      lastMessageAt: message.createdAt
    })
  }

  /* ============================================================
   *  CHATS — LIST
   * ============================================================ */

  async function fetchChats(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await chatApi.getChats(params)
      // Поддержка и старого (массив), и нового ({ items, total }) формата
      const items = Array.isArray(response) ? response : response.items || []
      const total = Array.isArray(response) ? response.length : response.total ?? 0

      chats.value = items
      chatsTotal.value = total
      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /* ============================================================
   *  MESSAGES
   * ============================================================ */

  /**
   * Загрузить сообщения чата.
   * @param {number|string} chatId
   * @param {Object} [opts]
   * @param {boolean} [opts.force=false] — перезагрузить даже если уже есть
   * @param {boolean} [opts.append=false] — добавить в начало (пагинация вверх)
   */
  async function fetchMessages(chatId, opts = {}) {
    if (!chatId) return []

    const cid = Number(chatId)
    const seq = ++fetchMsgSeq

    // Если сообщения уже есть — не грузим повторно (если не force)
    if (!opts.force && messages.value[cid]?.length > 0 && !opts.append) {
      return messages.value[cid]
    }

    ensureMessagesBucket(cid)
    loadingMessages.value = true
    error.value = null

    try {
      const response = await chatApi.getMessages(cid, {
        page: opts.page ?? 1,
        perPage: opts.perPage ?? 50,
        order: 'asc'
      })

      // Race guard: применяем только если это последний запрос
      if (seq !== fetchMsgSeq) return messages.value[cid]

      const items = Array.isArray(response) ? response : response.items || []
      const total = Array.isArray(response) ? response.length : response.total ?? items.length
      const page = response.page ?? opts.page ?? 1
      const perPage = response.perPage ?? opts.perPage ?? 50

      if (opts.append) {
        // Старые сообщения идут в начало (пагинация вверх)
        messages.value[cid] = [...items, ...(messages.value[cid] || [])]
      } else {
        messages.value[cid] = items
      }

      messagesMeta.value = {
        ...messagesMeta.value,
        [cid]: {
          page,
          perPage,
          total,
          hasMore: page * perPage < total
        }
      }

      // Локально сбрасываем счётчик непрочитанных
      patchChatInList(cid, { unreadCount: 0 })

      // И говорим серверу (тихо)
      chatApi.markAsRead?.(cid).catch(() => {})

      return messages.value[cid]
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      if (seq === fetchMsgSeq) loadingMessages.value = false
    }
  }

  /**
   * Подгрузка следующей страницы сообщений (вверх — более старые).
   */
  async function loadMoreMessages(chatId) {
    const cid = Number(chatId)
    const meta = messagesMeta.value[cid]
    if (!meta?.hasMore) return []
    if (loadingMessages.value) return []

    return fetchMessages(cid, {
      page: meta.page + 1,
      perPage: meta.perPage,
      append: true
    })
  }

  /* ============================================================
   *  SELECT CHAT
   * ============================================================ */

  async function selectChat(chatId) {
    if (chatId == null) {
      // Отписка от текущего чата
      if (currentChatId.value) {
        chatSocket.leaveChat?.(currentChatId.value)
      }
      currentChatId.value = null
      return
    }

    const cid = Number(chatId)

    // Отписываемся от старого
    if (currentChatId.value && currentChatId.value !== cid) {
      chatSocket.leaveChat?.(currentChatId.value)
    }

    currentChatId.value = cid

    // Подписываемся на новый
    chatSocket.joinChat?.(cid)

    await fetchMessages(cid)
  }

  /* ============================================================
   *  SEND / RETRY
   * ============================================================ */

  async function sendMessage(content) {
    if (!currentChatId.value || !content.trim()) return null
    if (sending.value) return null

    const chatId = currentChatId.value
    const text = content.trim()

    sending.value = true
    error.value = null

    ensureMessagesBucket(chatId)

    const optimisticMessage = {
      id: optimisticId(),
      chatId,
      senderId: 1,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sending'
    }

    messages.value = {
      ...messages.value,
      [chatId]: [...messages.value[chatId], optimisticMessage]
    }

    try {
      const sentMessage = await chatApi.sendMessage(chatId, text)

      // Заменяем optimistic на реальное
      const idx = messages.value[chatId].findIndex(
        m => m.id === optimisticMessage.id
      )
      if (idx !== -1) {
        const next = [...messages.value[chatId]]
        next[idx] = { ...sentMessage, status: 'sent' }
        messages.value = { ...messages.value, [chatId]: next }
      }

      updateChatFromMessage(chatId, sentMessage)
      return sentMessage
    } catch (err) {
      // Помечаем failed — можно будет retry
      const idx = messages.value[chatId].findIndex(
        m => m.id === optimisticMessage.id
      )
      if (idx !== -1) {
        const next = [...messages.value[chatId]]
        next[idx] = { ...next[idx], status: 'failed' }
        messages.value = { ...messages.value, [chatId]: next }
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      sending.value = false
    }
  }

  /**
   * Повторить отправку упавшего сообщения.
   */
  async function retryMessage(messageId) {
    const chatId = currentChatId.value
    if (!chatId) return

    const msg = messages.value[chatId]?.find(m => m.id === messageId)
    if (!msg || msg.status !== 'failed') return

    // Удаляем упавшее
    messages.value = {
      ...messages.value,
      [chatId]: messages.value[chatId].filter(m => m.id !== messageId)
    }

    // Пробуем заново
    return sendMessage(msg.content)
  }

  /* ============================================================
   *  CREATE / OPEN CHAT
   * ============================================================ */

  async function createOrOpenChat(announcementId, sellerId, opts = {}) {
    const annId = Number(announcementId)
    const sid = Number(sellerId)

    // Ищем существующий чат: покупатель (я) + это объявление
    const existing = chats.value.find(
      c => c.announcementId === annId &&
        c.sellerId === sid &&
        c.buyerId === 1 // TODO: заменить на authStore.user.id
    )

    if (existing) {
      if (!opts.silent) await selectChat(existing.id)
      return existing
    }

    const chat = await chatApi.createChat(annId, sid)
    if (!chat) return null

    // Добавляем в начало списка
    if (!chats.value.find(c => c.id === chat.id)) {
      chats.value = [chat, ...chats.value]
      chatsTotal.value += 1
    }

    if (!opts.silent) await selectChat(chat.id)
    return chat
  }

  /* ============================================================
   *  DELETE / EDIT MESSAGES
   * ============================================================ */

  async function deleteMessage(messageId) {
    const chatId = currentChatId.value
    if (!chatId) return

    const prev = messages.value[chatId]?.find(m => m.id === messageId)
    if (!prev) return

    // Optimistic
    messages.value = {
      ...messages.value,
      [chatId]: messages.value[chatId].filter(m => m.id !== messageId)
    }

    try {
      await chatApi.deleteMessage?.(chatId, messageId)
    } catch (err) {
      // Откат
      messages.value = {
        ...messages.value,
        [chatId]: [...messages.value[chatId], prev].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
      }
      error.value = normalizeError(err)
      throw err
    }
  }

  async function editMessage(messageId, newContent) {
    const chatId = currentChatId.value
    if (!chatId) return

    const idx = messages.value[chatId]?.findIndex(m => m.id === messageId)
    if (idx === -1) return

    const prev = messages.value[chatId][idx]

    // Optimistic
    const next = [...messages.value[chatId]]
    next[idx] = { ...prev, content: newContent, editedAt: new Date().toISOString() }
    messages.value = { ...messages.value, [chatId]: next }

    try {
      const result = await chatApi.editMessage?.(chatId, messageId, newContent)
      if (result) {
        const next2 = [...messages.value[chatId]]
        next2[idx] = result
        messages.value = { ...messages.value, [chatId]: next2 }
      }
      return result
    } catch (err) {
      // Откат
      const next2 = [...messages.value[chatId]]
      next2[idx] = prev
      messages.value = { ...messages.value, [chatId]: next2 }
      error.value = normalizeError(err)
      throw err
    }
  }

  /* ============================================================
   *  READ
   * ============================================================ */

  function markChatAsRead(chatId = null) {
    const cid = chatId ?? currentChatId.value
    if (!cid) return
    patchChatInList(cid, { unreadCount: 0 })
    chatApi.markAsRead?.(cid).catch(() => {})
  }

  async function markAllAsRead() {
    chats.value = chats.value.map(c => ({ ...c, unreadCount: 0 }))
    // Опционально — API для батча
    await Promise.all(
      chats.value.map(c => chatApi.markAsRead?.(c.id).catch(() => {}))
    ).catch(() => {})
  }

  /* ============================================================
   *  WEBSOCKET
   * ============================================================ */

  function handleWsMessage(message) {
    const chatId = message.chatId
    if (!chatId) return

    ensureMessagesBucket(chatId)

    // Защита от дублей
    const exists = messages.value[chatId].some(m => m.id === message.id)
    if (exists) return

    messages.value = {
      ...messages.value,
      [chatId]: [...messages.value[chatId], message]
    }

    updateChatFromMessage(chatId, message)

    // Если это не текущий чат — увеличиваем unread
    if (currentChatId.value !== chatId) {
      const chat = chatBy.value(chatId)
      if (chat) {
        patchChatInList(chatId, {
          unreadCount: (chat.unreadCount || 0) + 1
        })
      }
    } else {
      // Помечаем прочитанным
      chatApi.markAsRead?.(chatId).catch(() => {})
    }
  }

  function connectWebSocket() {
    if (socketConnected.value) return

    // Подписка на сообщения
    const offMessage = chatSocket.onMessage(handleWsMessage)

    // Подписка на статус
    const offStatus = chatSocket.onStatusChange?.((status) => {
      socketStatus.value = status
    })

    cleanupFns.push(offMessage)
    if (typeof offStatus === 'function') cleanupFns.push(offStatus)

    chatSocket.connect()
  }

  function disconnectWebSocket() {
    cleanupFns.forEach(fn => {
      try { fn() } catch { /* no-op */ }
    })
    cleanupFns.length = 0

    chatSocket.disconnect()
    socketStatus.value = ConnectionStatus.DISCONNECTED
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function reset() {
    chats.value = []
    chatsTotal.value = 0
    currentChatId.value = null
    messages.value = {}
    messagesMeta.value = {}
    error.value = null
    searchQuery.value = ''
    loading.value = false
    loadingMessages.value = false
    sending.value = false
    fetchMsgSeq = 0
  }

  /* ============================================================
   *  AUTO-CLEANUP при разрушении стора
   * ============================================================ */

  if (typeof onUnmounted === 'function') {
    try {
      onUnmounted(() => {
        cleanupFns.forEach(fn => {
          try { fn() } catch { /* no-op */ }
        })
      })
    } catch { /* вне setup — ок */ }
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    chats,
    chatsTotal,
    currentChatId,
    messages,
    messagesMeta,
    loading,
    loadingMessages,
    sending,
    error,
    searchQuery,
    socketStatus,
    socketConnected,

    // Getters
    currentChat,
    currentMessages,
    currentMessagesMeta,
    filteredChats,
    totalUnread,
    hasChats,
    isEmpty,
    chatById,

    // Actions — chats
    fetchChats,
    selectChat,
    createOrOpenChat,

    // Actions — messages
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    deleteMessage,
    editMessage,

    // Actions — read
    markChatAsRead,
    markAllAsRead,

    // WebSocket
    connectWebSocket,
    disconnectWebSocket,

    // Reset
    reset
  }
})