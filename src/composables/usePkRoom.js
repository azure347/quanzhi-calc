/**
 * PK Room — multiplayer mode via localStorage (source of truth)
 * Each browser gets a unique session ID (browser identity)
 * The URL hash contains the ROOM ID (shared data pool key)
 * When joining via PK URL: ROOM_ID comes from hash, browser uses its own SESSION_ID
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { calculateIndex } from './useCalculator.js'
import data from '../data/majors.json'

const PLAYER_COUNT = 4
const SESSION_KEY = 'quanzhi-pk-session'
const SLOTS_KEY = 'quanzhi-pk-slots'
const POLL_INTERVAL = 800

// Browser's unique session ID (browser identity, stored permanently)
// IMPORTANT: never overwrite with hash-based room ID
function getBrowserSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = Math.random().toString(36).slice(2, 10)
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Room ID from URL hash (shared across all browsers in the same PK room)
function getRoomId() {
  const hash = window.location.hash
  const match = hash.match(/^#pk\/([^?]+)/)
  if (match) return match[1]
  return null
}

function getMySlot() {
  const raw = localStorage.getItem(SESSION_KEY + '-slot')
  return raw ? parseInt(raw) : null
}

function setMySlot(slot) {
  if (slot) localStorage.setItem(SESSION_KEY + '-slot', String(slot))
  else localStorage.removeItem(SESSION_KEY + '-slot')
}

// All slots stored as JSON in localStorage, keyed by browser session ID
function getAllSlots() {
  try {
    return JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}')
  } catch { return {} }
}

function setAllSlots(slots) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

function computeScore(majorId, weights) {
  if (!majorId || !weights?.length) return null
  const major = data.majors.find(m => m.id === majorId)
  if (!major) return null
  const tier = major.tiers['bachelor']
  const sub = tier?.subfields?.['通用']
  if (!sub) return null
  return calculateIndex(sub.scores, weights)
}

export function usePkRoom() {
  const players = ref([])
  const isInPkMode = ref(false)
  let pollTimer = null

  // Each browser has its own session ID
  const browserSessionId = ref(getBrowserSessionId())
  // The current room ID (from hash or set on join)
  const roomId = ref(getRoomId() || getBrowserSessionId())
  const mySlot = ref(getMySlot())

  const localSlot = computed(() => mySlot.value)

  const pkUrl = computed(() => {
    if (!isInPkMode.value) return ''
    const base = window.location.pathname
    return `${base}#pk/${roomId.value}`
  })

  // Load players from localStorage slots
  function loadFromStorage() {
    const slots = getAllSlots()
    const allPlayers = []
    for (let i = 1; i <= PLAYER_COUNT; i++) {
      let found = null
      for (const [, slotData] of Object.entries(slots)) {
        if (slotData.slot === i) {
          found = slotData
          break
        }
      }
      allPlayers.push(found ? {
        slot: i,
        majorId: found.majorId || '',
        weights: found.weights || [],
        nickname: found.nickname || '',
        score: computeScore(found.majorId, found.weights),
        major: found.majorId ? data.majors.find(m => m.id === found.majorId) : null,
        isPlaceholder: !found.majorId
      } : {
        slot: i,
        majorId: '',
        weights: [],
        nickname: '',
        score: null,
        major: null,
        isPlaceholder: true
      })
    }
    return allPlayers
  }

  function refreshPlayers() {
    players.value = loadFromStorage()
    const hasData = players.value.some(p => p.majorId)
    const hasHash = window.location.hash.match(/^#pk\/.+/)
    isInPkMode.value = hasData || Object.keys(getAllSlots()).length > 0 || !!hasHash
  }

  function onStorage(e) {
    if (e.key === SLOTS_KEY || e.key === SESSION_KEY + '-slot') {
      const slots = getAllSlots()
      // Check if my slot is still mine
      const mySlotData = slots[browserSessionId.value]
      if (mySlotData) {
        mySlot.value = mySlotData.slot
      } else if (!mySlotData && mySlot.value) {
        mySlot.value = null
      }
      refreshPlayers()
    }
  }

  onMounted(() => {
    refreshPlayers()
    window.addEventListener('storage', onStorage)
    pollTimer = setInterval(refreshPlayers, POLL_INTERVAL)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', onStorage)
    if (pollTimer) clearInterval(pollTimer)
  })

  function joinRoom(majorId, weights, nickname = '') {
    isInPkMode.value = true

    // Set the room ID from hash if present, otherwise use browser's session ID
    if (!roomId.value) {
      roomId.value = getRoomId() || browserSessionId.value
    }

    // Find slot: keep existing or take first empty
    // IMPORTANT: check ALL slots from ALL browsers, not just current session
    if (!mySlot.value) {
      const slots = getAllSlots()
      const usedSlots = new Set(Object.values(slots).map(s => s.slot))
      let found = null
      for (let i = 1; i <= PLAYER_COUNT; i++) {
        if (!usedSlots.has(i)) { found = i; break }
      }
      if (!found) return false // room full
      mySlot.value = found
      setMySlot(found)
    }

    // Write to storage with browser's session ID as key
    const slots = getAllSlots()
    slots[browserSessionId.value] = { slot: mySlot.value, majorId, weights, nickname }
    setAllSlots(slots)

    // Set URL hash with room ID
    const hash = `#pk/${roomId.value}`
    if (window.location.hash !== hash) {
      window.location.hash = hash
    }

    refreshPlayers()
    return true
  }

  function leaveRoom() {
    if (!mySlot.value) return
    const slots = getAllSlots()
    delete slots[browserSessionId.value]
    setAllSlots(slots)
    mySlot.value = null
    setMySlot(null)
    // Always exit PK mode for this browser - other browsers handle their own state
    isInPkMode.value = false
    // Clean up URL hash
    if (window.location.hash.startsWith('#pk/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    refreshPlayers()
  }

  function getPlayersWithScores() {
    return players.value
  }

  return {
    players,
    isInPkMode,
    pkUrl,
    localSlot,
    joinRoom,
    leaveRoom,
    getPlayersWithScores
  }
}