/**
 * PK Room — WebSocket-based multiplayer mode
 * Connects to Spring Boot backend for real-time sync across browsers
 *
 * 使用方式:
 * 1. 后端启动: cd quanzhi-calc-backend && mvn spring-boot:run
 * 2. 前端开发: npm run dev
 * 3. 在 .env.development 中配置: VITE_PK_WS_URL=ws://localhost:8080/ws/pk
 * 4. 生产环境: VITE_PK_WS_URL=wss://your-backend.com/ws/pk
 */

import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { calculateIndex } from './useCalculator.js'
import data from '../data/majors.json'

const WS_URL = import.meta.env.VITE_PK_WS_URL || 'ws://localhost:8080/ws/pk'
const POLL_INTERVAL = 1000
const RECONNECT_DELAY = 3000

const PLAYER_COUNT = 4

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10)
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

export function usePkRoomWebSocket() {
  const players = ref([])
  const isInPkMode = ref(false)
  const roomId = ref(null)
  const localSlot = ref(null)
  const pkUrl = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)

  let ws = null
  let sessionId = generateSessionId()
  let pollTimer = null
  let reconnectTimer = null

  const showToast = inject('showToast', null)

  // Build player list from room data
  function buildPlayers(room) {
    if (!room || !room.players) {
      return Array.from({ length: PLAYER_COUNT }, (_, i) => ({
        slot: i + 1,
        majorId: '',
        weights: [],
        nickname: '',
        score: null,
        major: null,
        isPlaceholder: true
      }))
    }

    return Array.from({ length: PLAYER_COUNT }, (_, i) => {
      const slot = i + 1
      const player = room.players.find(p => p.slot === slot)
      if (player && !player.placeholder && player.majorId) {
        return {
          slot,
          majorId: player.majorId || '',
          weights: player.weights || [],
          nickname: player.nickname || '',
          score: computeScore(player.majorId, player.weights),
          major: player.majorId ? data.majors.find(m => m.id === player.majorId) : null,
          isPlaceholder: false
        }
      }
      return {
        slot,
        majorId: '',
        weights: [],
        nickname: '',
        score: null,
        major: null,
        isPlaceholder: true
      }
    })
  }

  const winnerScore = computed(() => {
    const scores = players.value
      .filter(p => !p.isPlaceholder && p.score != null)
      .map(p => p.score)
    if (!scores.length) return null
    return Math.max(...scores)
  })

  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return
    if (isConnecting.value) return

    isConnecting.value = true
    try {
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('[PK WS] Connected')
        isConnected.value = true
        isConnecting.value = false

        if (roomId.value) {
          sendMessage({ type: 'JOIN', roomId: roomId.value })
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleMessage(msg)
        } catch (e) {
          console.error('[PK WS] Failed to parse message:', e)
        }
      }

      ws.onclose = () => {
        console.log('[PK WS] Disconnected')
        isConnected.value = false
        isConnecting.value = false

        if (roomId.value) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY)
        }
      }

      ws.onerror = (err) => {
        console.error('[PK WS] Error:', err)
        isConnected.value = false
        isConnecting.value = false
      }
    } catch (e) {
      console.error('[PK WS] Connection failed:', e)
      isConnecting.value = false
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    isConnected.value = false
    isConnecting.value = false
  }

  function sendMessage(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...msg,
        sessionId
      }))
    }
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'SYNC':
      case 'UPDATE':
        if (msg.payload) {
          players.value = buildPlayers(msg.payload)
          if (msg.payload.id) {
            roomId.value = msg.payload.id
            pkUrl.value = `${window.location.pathname}#pk/${msg.payload.id}`
          }
          // Find our slot from the server response
          const myPlayer = msg.payload.players?.find(
            p => p.sessionId === sessionId && !p.placeholder
          )
          if (myPlayer) {
            localSlot.value = myPlayer.slot
          }
        }
        break

      case 'ERROR':
        console.error('[PK WS] Server error:', msg.payload)
        showToast?.(msg.payload?.error || '发生错误')
        break

      default:
        console.debug('[PK WS] Unknown message type:', msg.type)
    }
  }

  function startPolling() {
    if (pollTimer) return
    pollTimer = setInterval(async () => {
      if (!roomId.value) return
      try {
        const res = await fetch(`/api/pk/room/${roomId.value}/poll`)
        if (res.ok) {
          const room = await res.json()
          players.value = buildPlayers(room)
        }
      } catch (e) {
        console.error('[PK Poll] Failed:', e)
      }
    }, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function joinRoom(majorId, weights, nickname = '') {
    // Get or create room
    if (!roomId.value) {
      try {
        const res = await fetch('/api/pk/room', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          roomId.value = data.roomId
        }
      } catch (e) {
        console.error('[PK] Failed to create room:', e)
        return false
      }
    }

    isInPkMode.value = true
    pkUrl.value = `${window.location.pathname}#pk/${roomId.value}`

    window.location.hash = `pk/${roomId.value}`

    connect()

    sendMessage({
      type: 'JOIN',
      roomId: roomId.value,
      payload: { majorId, nickname }
    })

    return true
  }

  function updateMyData(majorId, weights, nickname, score) {
    if (!roomId.value) return

    sendMessage({
      type: 'UPDATE',
      roomId: roomId.value,
      payload: { majorId, weights, nickname, score }
    })
  }

  function leaveRoom() {
    if (!roomId.value) return

    sendMessage({
      type: 'LEAVE',
      roomId: roomId.value
    })

    disconnect()
    stopPolling()

    roomId.value = null
    localSlot.value = null
    pkUrl.value = ''
    isInPkMode.value = false
    players.value = []

    if (window.location.hash.startsWith('#pk/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  function getPlayersWithScores() {
    return players.value
  }

  onUnmounted(() => {
    disconnect()
    stopPolling()
  })

  return {
    players,
    isInPkMode,
    isConnected,
    pkUrl,
    localSlot,
    winnerScore,
    joinRoom,
    leaveRoom,
    updateMyData,
    getPlayersWithScores
  }
}