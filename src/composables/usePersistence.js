/**
 * 本地存储持久化模块
 *
 * 职责：
 * 1. 应用启动时从 localStorage 恢复状态
 * 2. 状态变化时自动保存到 localStorage
 * 3. 确保 weights 数组始终有9个元素（兼容新旧数据格式）
 *
 * 存储结构：
 * {
 *   currentMajorId, currentTier, currentSubfield,
 *   weights, compareList, favorites, recentMajors, theme
 * }
 */

import { watch } from 'vue'

// localStorage 存储的键名
const STORAGE_KEY = 'quanzhi-calc-state'

/**
 * 初始化本地存储持久化
 * @param {Object} state - 应用状态对象（响应式）
 */
export function usePersistence(state) {
  /**
   * 从 localStorage 加载状态
   * 如果存储数据损坏或不存在，静默忽略错误
   */
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // 将保存的数据合并到当前状态
        Object.assign(state, parsed)
      }
    } catch {
      // 忽略解析错误（例如存储被意外清除）
    }
  }

  /**
   * 将当前状态保存到 localStorage
   * 如果超出存储配额，静默忽略错误
   */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // 忽略配额超限错误
    }
  }

  // 初始化：加载本地存储的数据
  load()

  // 兼容处理：确保 weights 数组有9个元素
  // 早期版本只有6个维度，新版本扩展到9个，缺少的用默认值3填充
  if (state.weights.length < 9) {
    state.weights = [...state.weights, ...Array(9 - state.weights.length).fill(3)]
  }

  // 监听关键状态字段变化，自动保存到 localStorage
  // deep: true 确保嵌套对象（如 weights 数组）变化也能触发保存
  watch(
    () => [state.currentMajorId, state.currentTier, state.currentSubfield, state.weights, state.compareList, state.favorites, state.recentMajors, state.theme],
    save,
    { deep: true }
  )
}
