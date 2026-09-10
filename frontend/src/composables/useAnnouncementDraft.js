import { ref, watch } from 'vue'

const STORAGE_KEY = 'announcement_draft'
const AUTOSAVE_DELAY = 1000

export function useAnnouncementDraft() {
  const draft = ref(null)
  let saveTimeout = null

  function loadDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        draft.value = JSON.parse(saved)
        return draft.value
      }
    } catch (err) {
      console.error('Failed to load draft:', err)
    }
    return null
  }

  function saveDraft(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save draft:', err)
    }
  }

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY)
    draft.value = null
  }

  function autoSave(data) {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveDraft(data)
    }, AUTOSAVE_DELAY)
  }

  function hasDraft() {
    return !!localStorage.getItem(STORAGE_KEY)
  }

  return {
    draft,
    loadDraft,
    saveDraft,
    clearDraft,
    autoSave,
    hasDraft
  }
}