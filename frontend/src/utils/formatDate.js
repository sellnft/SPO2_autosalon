export function formatDate(date, format = 'default') {
  if (!date) return ''
  
  const d = new Date(date)
  
  if (format === 'relative') {
    const now = new Date()
    const diff = now - d
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return 'сейчас'
    if (minutes < 60) return `${minutes} мин`
    if (hours < 24) return `${hours} ч`
    if (days < 7) return `${days} дн`
    
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  if (format === 'short') {
    return d.toLocaleDateString('ru-RU')
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return d.toLocaleDateString('ru-RU')
}