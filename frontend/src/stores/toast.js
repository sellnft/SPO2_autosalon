import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 1
  
  function show(toast) {
    const id = nextId++
    toasts.value.push({
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 5000
    })
    
    setTimeout(() => {
      remove(id)
    }, toast.duration || 5000)
    
    return id
  }
  
  function success(message, title = '') {
    return show({ type: 'success', message, title })
  }
  
  function error(message, title = '') {
    return show({ type: 'error', message, title })
  }
  
  function warning(message, title = '') {
    return show({ type: 'warning', message, title })
  }
  
  function info(message, title = '') {
    return show({ type: 'info', message, title })
  }
  
  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  
  function clear() {
    toasts.value = []
  }
  
  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
})