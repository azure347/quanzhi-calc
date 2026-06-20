<script setup>
/**
 * ScoreCard.vue — 劝退分数展示卡片
 *
 * 职责：
 * 1. 展示当前专业的劝退指数（加权平均分）
 * 2. 显示分数对应的评级区间（文案、颜色、emoji）
 * 3. 显示该专业的吐槽语（roast）
 * 4. 提供收藏和添加对比的操作按钮
 * 5. 分数 > 80 时显示"快跑！"奔跑动画标签
 */

import { computed } from 'vue'
import { calculateIndex, getScoreSegment } from '../composables/useCalculator.js'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  major: { type: Object, required: true },      // 专业数据对象
  tier: { type: String, required: true },       // 当前学历层次
  subfield: { type: String, required: true },  // 当前子方向
  weights: { type: Array, required: true },    // 权重数组
  segments: { type: Array, required: true },   // 分数段配置
  isFavorited: { type: Boolean, default: false }, // 是否已收藏
  canAddCompare: { type: Boolean, default: true } // 是否可添加对比
})

// ============================================================
// Emit 定义
// ============================================================
const emit = defineEmits(['toggleFavorite', 'addCompare'])

// ============================================================
// 计算属性
// ============================================================

/**
 * 从专业数据中提取当前子方向的各项维度得分
 * 如果当前子方向不存在，回退到"通用"
 */
const scores = computed(() => {
  const t = props.major.tiers[props.tier]
  return (t.subfields[props.subfield] || t.subfields['通用']).scores
})

/**
 * 计算当前劝退指数（加权平均分）
 */
const score = computed(() => calculateIndex(scores.value, props.weights))

/**
 * 获取当前分数对应的评级区间
 */
const segment = computed(() => getScoreSegment(score.value, props.segments))

/**
 * 进度条样式
 * 宽度为分数百分比，颜色从绿色渐变到橙色再到对应评级的颜色
 */
const barStyle = computed(() => ({
  width: score.value + '%',
  background: `linear-gradient(90deg, #2ecc71, #e67e22, ${segment.value.color})`
}))
</script>

<template>
  <div class="score-section">
    <!-- 劝退指数标签 -->
    <div class="score-label">劝退指数</div>

    <!-- 专业名称和分类 -->
    <div class="major-name-row">
      <span class="major-name">{{ major.name }}</span>
      <span class="major-cat">{{ major.categoryEmoji }} {{ major.category }}</span>
    </div>

    <!-- 分数和快跑标签 -->
    <div class="score-row">
      <div class="score-number" :style="{ color: segment.color }">{{ score }}</div>
      <!-- 分数 > 80 时显示奔跑动画标签 -->
      <span class="flee-tag" :class="{ show: score > 80 }">快跑！</span>
    </div>

    <!-- 分数进度条 -->
    <div class="score-bar-wrap"><div class="score-bar-fill" :style="barStyle"></div></div>

    <!-- 评级文案和表情 -->
    <div class="score-comment">
      <span>{{ segment.text }}</span>
      <span class="score-emoji">{{ segment.emoji }}</span>
    </div>

    <!-- 专业吐槽语 -->
    <div class="major-roast">💬 {{ major.roast }}</div>

    <!-- 操作按钮：收藏 / 添加对比 -->
    <div class="score-actions">
      <button class="action-btn" :class="{ favorited: isFavorited }" @click="emit('toggleFavorite')">
        {{ isFavorited ? '⭐ 已收藏' : '☆ 收藏' }}
      </button>
      <button class="action-btn" @click="emit('addCompare')">
        + 添加对比
      </button>
    </div>
  </div>
</template>

<style scoped>
.score-section { text-align: center; position: relative; }
.score-label { font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 2px; }
.major-name-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px 0; }
.major-name { font-size: 1.2em; font-weight: 700; }
.major-cat { font-size: 12px; color: #aaa; background: #f5f5f5; padding: 2px 10px; border-radius: 10px; }
.score-row { display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; }
/* 超大分数显示 */
.score-number { font-size: 5em; font-weight: 900; line-height: 1; transition: color 0.5s; }
/* 快跑标签（分数>80时显示） */
.flee-tag {
  display: none; background: #e94560; color: #fff; font-size: 13px; font-weight: 900;
  padding: 5px 14px; border-radius: 12px; animation: fleeShake 0.3s ease-in-out infinite;
  white-space: nowrap; box-shadow: 0 3px 10px rgba(233,69,96,0.3);
}
.flee-tag.show { display: inline-block; }
/* 快跑抖动动画 */
@keyframes fleeShake {
  0%,100% { transform: rotate(0) scale(1); }
  25% { transform: rotate(-6deg) scale(1.08); }
  75% { transform: rotate(6deg) scale(1.08); }
}
/* 进度条 */
.score-bar-wrap { height: 10px; background: #e8e8e8; border-radius: 5px; margin: 10px 0; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
/* 评级文案 */
.score-comment { font-size: 15px; color: #555; margin-top: 4px; line-height: 1.6; font-style: italic; }
.score-emoji { font-size: 22px; margin-left: 4px; vertical-align: middle; }
/* 吐槽语 */
.major-roast {
  font-size: 13px; color: #d63031; text-align: center; padding: 8px 10px;
  background: rgba(233,69,96,0.04); border-radius: 10px;
  border-left: 3px solid #e94560; margin-top: 8px; line-height: 1.5;
}
/* 操作按钮容器 */
.score-actions {
  display: flex; justify-content: center; gap: 8px; margin-top: 12px;
  flex-wrap: wrap;
}
.action-btn {
  padding: 6px 14px; border-radius: 16px; font-size: 13px;
  border: 1px solid #e0e0e0; background: #fff; color: #555;
  cursor: pointer; transition: all 0.2s; font-weight: 500;
}
.action-btn:hover {
  background: #f5f5f5; transform: translateY(-1px);
}
/* 收藏激活态 */
.action-btn.favorited {
  background: #fff3e0; color: #e67e22; border-color: #e67e22;
}

/* 移动端适配 */
@media (max-width: 720px) {
  .score-number { font-size: 3.5em; }
}
</style>
