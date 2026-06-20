<script setup>
/**
 * CompareCard.vue — 专业对比卡片
 *
 * 职责：
 * 1. 以表格形式展示用户添加的多个专业的各项维度得分和总分
 * 2. 支持最多3个专业同时对比
 * 3. 点击某行可移除该专业（从对比列表中删除）
 * 4. 各维度得分用颜色区分（绿色=低分好，红色=高分差）
 * 5. 总分列高亮显示，便于快速比较
 */

import { computed } from 'vue'
import data from '../data/majors.json'
import { calculateIndex } from '../composables/useCalculator.js'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  compareList: { type: Array, required: true }, // 要对比的专业ID列表
  weights: { type: Array, required: true }       // 当前权重配置（影响总分计算）
})

// ============================================================
// Emit 定义
// ============================================================
const emit = defineEmits(['remove', 'select'])

// ============================================================
// 组件内部常量
// ============================================================
// 所有9个维度的键名（6个核心维度 + 3个新增维度）
const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff', 'civil_exam', 'overseas_study', 'entrepreneurship']

// ============================================================
// 计算属性
// ============================================================

/**
 * 对比专业的详细数据
 * 为 compareList 中的每个 ID 解析出专业名称、emoji、各项得分和总分
 * 过滤掉数据不完整的专业
 */
const compareMajors = computed(() =>
  props.compareList.map(id => {
    const major = data.majors.find(m => m.id === id)
    if (!major) return null
    // 获取本科层次的子方向数据
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
  }).filter(Boolean)  // 移除无效项
)

// ============================================================
// 方法
// ============================================================

/**
 * 获取指定专业在指定维度上的得分
 * @param {Object} major - 专业数据对象
 * @param {string} dim - 维度键名
 * @returns {number} 该维度上的得分
 */
function getScore(major, dim) {
  return major.scores[dim]
}

/**
 * 根据分数返回颜色（绿色低分→橙色中分→红色高分）
 * @param {number} val - 分数（0-100）
 * @returns {string} CSS 颜色值
 */
function scoreColor(val) {
  if (val < 30) return '#2ecc71'
  if (val < 50) return '#e67e22'
  if (val < 70) return '#e67e22'
  return '#e94560'
}
</script>

<template>
  <div class="compare-card">
    <!-- 卡片头部 -->
    <div class="compare-header">
      <span class="compare-title">专业对比</span>
      <span class="compare-hint">点击移除</span>
    </div>

    <!-- 对比表格（可横向滚动） -->
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th>专业</th>
            <!-- 遍历9个维度的名称作为表头 -->
            <th v-for="d in data.dimensions" :key="d.key">{{ d.funnyName }}</th>
            <th>总分</th>
          </tr>
        </thead>
        <tbody>
          <!-- 遍历每个对比专业，渲染为一行 -->
          <tr
            v-for="m in compareMajors"
            :key="m.id"
            class="compare-row"
            @click="emit('remove', m.id)"
          >
            <!-- 专业名称列 -->
            <td class="compare-major-cell">
              <span>{{ m.emoji }}</span>
              <span class="compare-name">{{ m.name }}</span>
            </td>
            <!-- 9个维度得分列 -->
            <td v-for="dim in dimKeys" :key="dim">
              <span
                class="compare-dim-score"
                :style="{ color: scoreColor(getScore(m, dim)) }"
              >{{ getScore(m, dim) }}</span>
            </td>
            <!-- 总分列 -->
            <td>
              <span class="compare-total" :style="{ color: scoreColor(m.score) }">
                {{ m.score }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态提示 -->
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
/* 头部区域 */
.compare-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; flex-shrink: 0;
}
.compare-title { font-size: 15px; font-weight: 700; }
.compare-hint { font-size: 12px; color: #aaa; }
/* 表格容器（支持横向滚动） */
.compare-table-wrap { overflow-x: auto; min-width: 0; max-width: 100%; }
/* 表格样式 */
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
/* 表格行（悬停高亮，点击可删除） */
.compare-row {
  cursor: pointer;
  transition: background 0.15s;
}
.compare-row:hover { background: #fef2f2; }
.compare-row:hover td { border-bottom-color: #fce0e0; }
/* 专业名称单元格 */
.compare-major-cell {
  text-align: left; display: flex; align-items: center; gap: 6px;
  white-space: nowrap;
}
.compare-name { font-weight: 600; }
/* 维度得分数字 */
.compare-dim-score { font-weight: 700; font-size: 14px; }
/* 总分数字 */
.compare-total { font-weight: 900; font-size: 16px; }
/* 空状态 */
.compare-empty { text-align: center; color: #ccc; padding: 20px; font-size: 14px; }
</style>
