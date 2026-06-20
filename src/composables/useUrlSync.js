/**
 * URL 同步模块
 *
 * 职责：
 * 1. 将应用状态编码为 URL 查询参数，实现链接分享功能
 * 2. 从 URL 参数恢复应用状态（页面加载时优先于 localStorage）
 * 3. 状态变化时自动更新 URL（使用 replaceState 避免产生历史记录）
 *
 * URL 参数格式：
 * ?m=cs&t=bachelor&s=通用&w=3,3,5,2,4,1
 *   m = currentMajorId (专业ID)
 *   t = currentTier (学历层次：bachelor/master/doctor)
 *   s = currentSubfield (具体方向)
 *   w = weights (权重数组，逗号分隔)
 */

export function useUrlSync(state) {
  // URL 参数键与状态字段的映射关系
  const keys = {
    m: 'currentMajorId',  // 专业ID
    t: 'currentTier',     // 学历层次
    s: 'currentSubfield', // 专业方向
    w: 'weights'          // 权重数组
  }

  /**
   * 将当前状态编码为 URL 查询参数字符串
   * @returns {string} URLSearchParams 字符串，如 "m=cs&t=bachelor&w=3,3,3,..."
   */
  function encode() {
    const params = new URLSearchParams()
    params.set('m', state.currentMajorId)
    params.set('t', state.currentTier)
    params.set('s', state.currentSubfield)
    params.set('w', state.weights.join(','))
    return params.toString()
  }

  /**
   * 从 URL 参数解码并返回需要更新的状态字段
   * 对每个参数进行合法性校验，不合法的参数会被忽略
   * @returns {Object} 包含需要更新的状态字段的对象
   */
  function decode() {
    const params = new URLSearchParams(window.location.search)
    const updates = {}

    // 解析专业ID（m 参数）
    if (params.has('m')) updates.currentMajorId = params.get('m')

    // 解析学历层次（t 参数），仅接受有效的三个值
    if (params.has('t')) {
      const t = params.get('t')
      if (['bachelor', 'master', 'doctor'].includes(t)) updates.currentTier = t
    }

    // 解析专业方向（s 参数）
    if (params.has('s')) updates.currentSubfield = params.get('s')

    // 解析权重数组（w 参数），必须是9个有效数字，且范围限制在0-5
    if (params.has('w')) {
      const w = params.get('w')
      const parts = w.split(',').map(Number)
      // 校验：恰好9个元素，且每个都是有效数字
      if (parts.length === 9 && parts.every(n => !isNaN(n))) {
        // 将权重限制在 0-5 范围内
        updates.weights = parts.map(n => Math.max(0, Math.min(5, n)))
      }
    }

    return updates
  }

  /**
   * 将 URL 参数应用到状态上（页面初始化时调用）
   * URL 参数优先级高于 localStorage
   */
  function applyFromUrl() {
    const updates = decode()
    if (Object.keys(updates).length > 0) {
      Object.assign(state, updates)
    }
  }

  /**
   * 更新浏览器 URL（不触发页面刷新）
   * 使用 replaceState 避免产生浏览器历史记录
   */
  function updateUrl() {
    const search = encode()
    const newUrl = `${window.location.pathname}?${search}`
    window.history.replaceState(null, '', newUrl)
  }

  // 初始化：将 URL 参数应用到状态（优先级高于 localStorage）
  applyFromUrl()

  // 启动定时器：每500ms检查状态是否变化，如有变化则更新 URL
  // 这种轮询方式确保所有状态变化都能同步到 URL
  const unwatch = setInterval(() => {
    const search = encode()
    if (window.location.search !== `?${search}`) {
      updateUrl()
    }
  }, 500)

  // 返回清理函数，供调用者停止定时器
  return { updateUrl, stop: () => clearInterval(unwatch) }
}
