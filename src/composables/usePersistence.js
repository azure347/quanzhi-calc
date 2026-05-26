import { watch } from 'vue'

const STORAGE_KEY = 'quanzhi-calc-state'

export function usePersistence(state) {
  // Load from localStorage on init
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.assign(state, parsed)
      }
    } catch {
      // ignore parse errors
    }
  }

  // Save to localStorage on change
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }

  load()

  watch(
    () => [state.currentMajorId, state.currentTier, state.currentSubfield, state.weights, state.compareList, state.favorites, state.recentMajors, state.theme],
    save,
    { deep: true }
  )
}