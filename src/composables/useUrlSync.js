/**
 * URL sync — encodes/decodes app state to/from URL query params.
 * Allows sharing a link with the exact current configuration.
 *
 * Format: ?m=cs&t=bachelor&s=通用&w=3,3,5,2,4,1
 */

export function useUrlSync(state) {
  const keys = {
    m: 'currentMajorId',
    t: 'currentTier',
    s: 'currentSubfield',
    w: 'weights'
  }

  function encode() {
    const params = new URLSearchParams()
    params.set('m', state.currentMajorId)
    params.set('t', state.currentTier)
    params.set('s', state.currentSubfield)
    params.set('w', state.weights.join(','))
    return params.toString()
  }

  function decode() {
    const params = new URLSearchParams(window.location.search)
    const updates = {}

    if (params.has('m')) updates.currentMajorId = params.get('m')
    if (params.has('t')) {
      const t = params.get('t')
      if (['bachelor', 'master', 'doctor'].includes(t)) updates.currentTier = t
    }
    if (params.has('s')) updates.currentSubfield = params.get('s')
    if (params.has('w')) {
      const w = params.get('w')
      const parts = w.split(',').map(Number)
      if (parts.length === 9 && parts.every(n => !isNaN(n))) {
        updates.weights = parts.map(n => Math.max(0, Math.min(5, n)))
      }
    }

    return updates
  }

  function applyFromUrl() {
    const updates = decode()
    if (Object.keys(updates).length > 0) {
      Object.assign(state, updates)
    }
  }

  function updateUrl() {
    const search = encode()
    const newUrl = `${window.location.pathname}?${search}`
    window.history.replaceState(null, '', newUrl)
  }

  // Apply URL params to state on init (takes priority over localStorage)
  applyFromUrl()

  // Sync URL whenever state changes
  const unwatch = setInterval(() => {
    const search = encode()
    if (window.location.search !== `?${search}`) {
      updateUrl()
    }
  }, 500)

  return { updateUrl }
}