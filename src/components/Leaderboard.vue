<script setup>
import { computed } from 'vue'
import data from '../data/majors.json'
import { calculateIndex } from '../composables/useCalculator.js'

const emit = defineEmits(['close'])

const top10 = computed(() => {
  return data.majors
    .map(major => {
      const sub = major.tiers['bachelor'].subfields['通用']
      const score = calculateIndex(sub.scores, [3,3,3,3,3,3,3,3,3])
      return { id: major.id, name: major.name, emoji: major.categoryEmoji, category: major.category, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((m, i) => ({ ...m, rank: i + 1 }))
})

function scoreColor(s) {
  if (s < 30) return '#2ecc71'
  if (s < 50) return '#e67e22'
  if (s < 70) return '#e67e22'
  return '#e94560'
}

function medalEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

function scoreLabel(s) {
  const seg = data.scoreSegments.find(seg => s <= seg.max) || data.scoreSegments[data.scoreSegments.length - 1]
  return seg.text.split('——')[0].trim()
}
</script>

<template>
  <div class="lb-overlay" @click.self="emit('close')">
    <div class="lb-modal">
      <div class="lb-header">
        <span>🏆 天坑排行榜 TOP10</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      <p class="lb-sub">基于默认权重客观计算，数据纯属娱乐</p>
      <div class="lb-list">
        <div
          v-for="m in top10"
          :key="m.id"
          class="lb-row"
        >
          <span class="lb-rank">{{ medalEmoji(m.rank) }} {{ m.rank }}</span>
          <span class="lb-info">
            <span class="lb-name">{{ m.emoji }} {{ m.name }}</span>
            <span class="lb-cat">{{ m.category }}</span>
          </span>
          <span class="lb-score-wrap">
            <span class="lb-score" :style="{ color: scoreColor(m.score) }">{{ m.score }}</span>
            <span class="lb-label">{{ scoreLabel(m.score) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lb-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
.lb-modal {
  background: #fff; border-radius: 20px; padding: 24px;
  width: 420px; max-width: 90vw; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.lb-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
}
.lb-header span { font-size: 20px; font-weight: 900; color: #e94560; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #aaa; line-height: 1; }
.close-btn:hover { color: #e94560; }
.lb-sub { font-size: 12px; color: #aaa; margin-bottom: 16px; text-align: center; }
.lb-list { display: flex; flex-direction: column; gap: 8px; }
.lb-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 12px;
  background: #fafafa; border: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.lb-row:hover { background: #fff0f0; border-color: #f8d0d0; }
.lb-rank {
  font-size: 18px; font-weight: 900; width: 40px; text-align: center;
  flex-shrink: 0; color: #555;
}
.lb-row:nth-child(1) .lb-rank { color: #f5a623; }
.lb-row:nth-child(2) .lb-rank { color: #aaa; }
.lb-row:nth-child(3) .lb-rank { color: #cd7f32; }
.lb-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.lb-name { font-size: 15px; font-weight: 700; color: #2d3436; }
.lb-cat { font-size: 12px; color: #aaa; }
.lb-score-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.lb-score { font-size: 24px; font-weight: 900; line-height: 1; }
.lb-label { font-size: 11px; color: #aaa; white-space: nowrap; max-width: 90px; text-align: right; overflow: hidden; text-overflow: ellipsis; }
</style>