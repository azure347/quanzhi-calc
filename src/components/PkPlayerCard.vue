<script setup>
import { computed } from 'vue'
import { getScoreSegment } from '../composables/useCalculator.js'

const props = defineProps({
  player: { type: Object, required: true },
  isLocal: { type: Boolean, default: false },
  isPlaceholder: { type: Boolean, default: false },
  segments: { type: Array, required: true },
  winnerScore: { type: Number, default: null }
})

const major = computed(() => props.player.major)

const displayMajor = computed(() => major.value?.name || '未知专业')

const displayNickname = computed(() => props.player.nickname || '')

const currentSegment = computed(() => {
  if (props.player.score == null) return null
  const segs = props.segments
  for (const s of segs) {
    if (props.player.score <= s.max) return s
  }
  return segs[segs.length - 1]
})

const isWinner = computed(() =>
  props.winnerScore != null &&
  props.player.score != null &&
  props.player.score === props.winnerScore &&
  !props.isPlaceholder
)

const barStyle = computed(() => {
  if (props.player.score == null) return {}
  return {
    width: props.player.score + '%',
    background: `linear-gradient(90deg, #2ecc71, #e67e22, ${currentSegment.value?.color || '#e94560'})`
  }
})
</script>

<template>
  <div class="player-card" :class="{ placeholder: isPlaceholder, local: isLocal, winner: isWinner }">
    <!-- Placeholder state -->
    <template v-if="isPlaceholder">
      <div class="slot-num">玩家{{ player.slot }}</div>
      <div class="waiting-icon">❓</div>
      <div class="waiting-text">等待玩家设置...</div>
      <div class="score-placeholder">??</div>
      <div class="waiting-sub">还没决定选什么专业</div>
    </template>

    <!-- Filled state -->
    <template v-else>
      <div class="card-header">
        <span class="slot-num">玩家{{ player.slot }}</span>
        <span v-if="isLocal" class="you-badge">你</span>
        <span v-if="isWinner" class="winner-badge">🏆</span>
      </div>
      <div class="major-info">
        <span class="major-emoji">{{ major?.categoryEmoji || '📚' }}</span>
        <span class="major-name">{{ displayMajor }}</span>
      </div>
      <div class="nickname" v-if="displayNickname">{{ displayNickname }}</div>
      <div class="score-display">{{ player.score }}</div>
      <div class="score-bar-wrap"><div class="score-bar-fill" :style="barStyle"></div></div>
      <div class="score-comment">{{ currentSegment?.text }}</div>
      <div class="score-emoji">{{ currentSegment?.emoji }}</div>
    </template>
  </div>
</template>


<style scoped>
.player-card {
  border-radius: 16px;
  padding: 20px 16px;
  background: #fff;
  border: 2px solid #eee;
  text-align: center;
  min-width: 140px;
  transition: all 0.3s;
  position: relative;
}
.player-card.local {
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233,69,96,0.1);
}
.player-card.winner {
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243,156,18,0.15);
  background: linear-gradient(to bottom, #fffdf0, #fff);
}
.player-card.placeholder {
  background: #fafafa;
  border-style: dashed;
  opacity: 0.7;
}

.slot-num { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.card-header { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; }
.you-badge {
  background: #e94560; color: #fff; font-size: 10px; font-weight: 700;
  padding: 2px 6px; border-radius: 8px;
}
.winner-badge { font-size: 14px; }
.major-info { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 2px; }
.major-emoji { font-size: 18px; }
.major-name { font-size: 14px; font-weight: 700; color: #333; }
.nickname { font-size: 12px; color: #999; margin-bottom: 4px; }
.score-display {
  font-size: 4em; font-weight: 900; line-height: 1;
  color: #333; margin: 4px 0;
}
.score-bar-wrap { height: 8px; background: #e8e8e8; border-radius: 4px; margin: 8px 0; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.score-comment { font-size: 12px; color: #666; font-style: italic; line-height: 1.4; margin-top: 4px; }
.score-emoji { font-size: 18px; margin-top: 2px; }

.waiting-icon { font-size: 40px; margin: 10px 0; opacity: 0.4; }
.waiting-text { font-size: 13px; color: #bbb; margin-bottom: 8px; }
.score-placeholder { font-size: 3em; font-weight: 900; color: #ddd; line-height: 1; margin: 4px 0; }
.waiting-sub { font-size: 11px; color: #ccc; font-style: italic; }
</style>