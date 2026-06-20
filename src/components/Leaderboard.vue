<script setup>
/**
 * Leaderboard.vue — 天坑排行榜弹窗组件
 *
 * 职责：
 * 1. 展示劝退指数排名前10的专业
 * 2. 使用等权权重（全部为3）计算排名，确保公平比较
 * 3. 显示专业名称、分类、劝退分数、评级标签
 * 4. 前三名显示金牌、银牌、铜牌 emoji
 * 5. 点击遮罩层或关闭按钮可关闭弹窗
 */

import { computed } from 'vue'
import data from '../data/majors.json'
import { calculateIndex } from '../composables/useCalculator.js'

const emit = defineEmits(['close'])

// ============================================================
// 计算属性
// ============================================================

/**
 * 天坑排行榜 TOP10
 * 遍历所有专业，按劝退指数降序排列，取前10名
 * 每个条目包含：id, name, emoji, category, score, rank
 */
const top10 = computed(() => {
  return data.majors
    .map(major => {
      const bachelor = major.tiers && major.tiers['bachelor']
      const subfields = bachelor && bachelor.subfields
      const sub = subfields && (subfields['通用'] || Object.values(subfields)[0])
      if (!sub || !sub.scores) return null
      // 使用等权权重计算（均为3）
      const score = calculateIndex(sub.scores, [3,3,3,3,3,3,3,3,3])
      return { id: major.id, name: major.name, emoji: major.categoryEmoji, category: major.category, score }
    })
    .filter(Boolean)  // 移除无效数据
    .sort((a, b) => b.score - a.score)  // 按分数降序排列
    .slice(0, 10)    // 取前10名
    .map((m, i) => ({ ...m, rank: i + 1 }))  // 添加排名（从1开始）
})

// ============================================================
// 方法
// ============================================================

/**
 * 根据分数返回颜色（低分绿色，高分红色）
 * @param {number} s - 分数（0-100）
 * @returns {string} CSS 颜色值
 */
function scoreColor(s) {
  if (s < 30) return '#2ecc71'
  if (s < 50) return '#e67e22'
  if (s < 70) return '#e67e22'
  return '#e94560'
}

/**
 * 根据排名返回奖牌 emoji
 * @param {number} rank - 排名（1-10）
 * @returns {string} emoji 或空字符串
 */
function medalEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

/**
 * 从评级文案中提取简短标签（取"——"前面的部分）
 * @param {number} s - 分数
 * @returns {string} 简短评级标签
 */
function scoreLabel(s) {
  const seg = data.scoreSegments.find(seg => s <= seg.max) || data.scoreSegments[data.scoreSegments.length - 1]
  return seg.text.split('——')[0].trim()
}
</script>

<template>
  <!-- 模态遮罩层 -->
  <div class="lb-overlay" @click.self="emit('close')">
    <div class="lb-modal">
      <!-- 弹窗头部 -->
      <div class="lb-header">
        <span>🏆 天坑排行榜 TOP10</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <!-- 副标题 -->
      <p class="lb-sub">基于默认权重客观计算，数据纯属娱乐</p>

      <!-- 排行榜列表 -->
      <div class="lb-list">
        <div
          v-for="m in top10"
          :key="m.id"
          class="lb-row"
        >
          <!-- 排名 + 奖牌 -->
          <span class="lb-rank">{{ medalEmoji(m.rank) }} {{ m.rank }}</span>

          <!-- 专业信息 -->
          <span class="lb-info">
            <span class="lb-name">{{ m.emoji }} {{ m.name }}</span>
            <span class="lb-cat">{{ m.category }}</span>
          </span>

          <!-- 分数 + 评级标签 -->
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
/* 遮罩层 */
.lb-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
/* 弹窗容器 */
.lb-modal {
  background: #fff; border-radius: 20px; padding: 24px;
  width: 420px; max-width: 90vw; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
/* 头部 */
.lb-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
}
.lb-header span { font-size: 20px; font-weight: 900; color: #e94560; }
/* 关闭按钮 */
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #aaa; line-height: 1; }
.close-btn:hover { color: #e94560; }
/* 副标题 */
.lb-sub { font-size: 12px; color: #aaa; margin-bottom: 16px; text-align: center; }
/* 列表容器 */
.lb-list { display: flex; flex-direction: column; gap: 8px; }
/* 列表项 */
.lb-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 12px;
  background: #fafafa; border: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.lb-row:hover { background: #fff0f0; border-color: #f8d0d0; }
/* 排名单元格 */
.lb-rank {
  font-size: 18px; font-weight: 900; width: 40px; text-align: center;
  flex-shrink: 0; color: #555;
}
/* 前三名排名颜色 */
.lb-row:nth-child(1) .lb-rank { color: #f5a623; }
.lb-row:nth-child(2) .lb-rank { color: #aaa; }
.lb-row:nth-child(3) .lb-rank { color: #cd7f32; }
/* 专业信息单元格 */
.lb-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.lb-name { font-size: 15px; font-weight: 700; color: #2d3436; }
.lb-cat { font-size: 12px; color: #aaa; }
/* 分数区域 */
.lb-score-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.lb-score { font-size: 24px; font-weight: 900; line-height: 1; }
.lb-label { font-size: 11px; color: #aaa; white-space: nowrap; max-width: 90px; text-align: right; overflow: hidden; text-overflow: ellipsis; }
</style>
