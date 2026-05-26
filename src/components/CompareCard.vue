<script setup>
import { computed } from 'vue'
import data from '../data/majors.json'
import { calculateIndex } from '../composables/useCalculator.js'

const props = defineProps({
  compareList: { type: Array, required: true },
  weights: { type: Array, required: true }
})

const emit = defineEmits(['remove', 'select'])

const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff', 'civil_exam', 'overseas_study', 'entrepreneurship']

const compareMajors = computed(() =>
  props.compareList.map(id => {
    const major = data.majors.find(m => m.id === id)
    if (!major) return null
    const subfields = major.tiers && major.tiers['bachelor'] && major.tiers['bachelor'].subfields
    const sub = subfields && (subfields['通用'] || Object.values(subfields)[0])
    if (!sub || !sub.scores) return null
    return {
      id,
      name: major.name,
      emoji: major.categoryEmoji,
      scores: sub.scores,
      score: calculateIndex(sub.scores, props.weights)
    }
  }).filter(Boolean)
)

function getScore(major, dim) {
  return major.scores[dim]
}

function scoreColor(val) {
  if (val < 30) return '#2ecc71'
  if (val < 50) return '#e67e22'
  if (val < 70) return '#e67e22'
  return '#e94560'
}
</script>

<template>
  <div class="compare-card">
    <div class="compare-header">
      <span class="compare-title">专业对比</span>
      <span class="compare-hint">点击移除</span>
    </div>
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th>专业</th>
            <th v-for="d in data.dimensions" :key="d.key">{{ d.funnyName }}</th>
            <th>总分</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in compareMajors"
            :key="m.id"
            class="compare-row"
            @click="emit('remove', m.id)"
          >
            <td class="compare-major-cell">
              <span>{{ m.emoji }}</span>
              <span class="compare-name">{{ m.name }}</span>
            </td>
            <td v-for="dim in dimKeys" :key="dim">
              <span
                class="compare-dim-score"
                :style="{ color: scoreColor(getScore(m, dim)) }"
              >{{ getScore(m, dim) }}</span>
            </td>
            <td>
              <span class="compare-total" :style="{ color: scoreColor(m.score) }">
                {{ m.score }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="compareMajors.length === 0" class="compare-empty">
      还没有添加对比专业
    </div>
  </div>
</template>

<style scoped>
.compare-card {
  overflow: hidden;
  min-width: 0;
}
.compare-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; flex-shrink: 0;
}
.compare-title { font-size: 15px; font-weight: 700; }
.compare-hint { font-size: 12px; color: #aaa; }
.compare-table-wrap { overflow-x: auto; min-width: 0; max-width: 100%; }
.compare-table {
  border-collapse: collapse; font-size: 13px;
}
.compare-table th {
  text-align: left; padding: 6px 8px; color: #aaa;
  font-weight: 600; white-space: nowrap;
  border-bottom: 2px solid #eee;
}
.compare-table td {
  padding: 8px; border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.compare-row {
  cursor: pointer;
  transition: background 0.15s;
}
.compare-row:hover { background: #fef2f2; }
.compare-row:hover td { border-bottom-color: #fce0e0; }
.compare-major-cell {
  text-align: left; display: flex; align-items: center; gap: 6px;
  white-space: nowrap;
}
.compare-name { font-weight: 600; }
.compare-dim-score { font-weight: 700; font-size: 14px; }
.compare-total { font-weight: 900; font-size: 16px; }
.compare-empty { text-align: center; color: #ccc; padding: 20px; font-size: 14px; }
</style>