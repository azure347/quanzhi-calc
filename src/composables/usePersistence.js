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

  // Ensure weights always has 9 elements (3 new dims added)
  if (state.weights.length < 9) {
    state.weights = [...state.weights, ...Array(9 - state.weights.length).fill(3)]
  }

  watch(
    () => [state.currentMajorId, state.currentTier, state.currentSubfield, state.weights, state.compareList, state.favorites, state.recentMajors, state.theme],
    save,
    { deep: true }
  )
}