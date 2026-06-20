<script setup>
/**
 * TourGuide.vue — 新手引导组件
 *
 * 职责：
 * 1. 首次访问应用时（localStorage 中无标记）显示3步骤引导
 * 2. 引导用户了解核心功能：搜索专业、调整权重、查看结果
 * 3. 点击"知道了"可关闭引导，并标记完成（避免下次访问重复显示）
 * 4. 引导卡片以固定定位浮在页面内容之上
 *
 * 引导步骤：
 * 1. 搜索专业 — 输入专业名称，支持别名模糊搜索
 * 2. 调整权重 — 九个维度可以自定义权重
 * 3. 查看结果 — 劝退指数由加权平均算出
 */

import { ref, watch } from 'vue'

const props = defineProps({
  step: { type: Number, required: true },       // 当前步骤（0/1/2）
  onClose: { type: Function, required: true }   // 关闭回调函数
})

// 引导步骤配置数组
const steps = [
  {
    title: '搜索专业',    // 步骤1标题
    desc: '输入专业名称，支持别名模糊搜索，点击即可切换',  // 步骤1说明
    position: { bottom: '220px', left: '50%' }  // 卡片位置
  },
  {
    title: '调整权重',    // 步骤2标题
    desc: '九个维度可以自定义权重，滑到最右=你非常在意这个因素', // 步骤2说明
    position: { bottom: '100px', right: '20px' } // 卡片位置
  },
  {
    title: '查看结果',    // 步骤3标题
    desc: '劝退指数由加权平均算出，分数越高越要谨慎入坑',  // 步骤3说明
    position: { top: '80px', left: '50%' }      // 卡片位置
  }
]

/**
 * 关闭引导
 * 标记已完成到 localStorage（避免下次访问重复显示引导）
 * 然后调用 onClose 回调
 */
function close() {
  localStorage.setItem('quanzhi-tour-done', '1')
  props.onClose()
}
</script>

<template>
  <!-- 引导遮罩层 -->
  <div class="tour-overlay">
    <!-- 引导卡片 -->
    <div class="tour-card" :style="steps[step].position">
      <!-- 步骤进度指示（如"步骤 1/3"） -->
      <div class="tour-step">步骤 {{ step + 1 }}/{{ steps.length }}</div>
      <!-- 步骤标题 -->
      <div class="tour-title">{{ steps[step].title }}</div>
      <!-- 步骤说明文字 -->
      <div class="tour-desc">{{ steps[step].desc }}</div>
      <!-- 操作按钮 -->
      <div class="tour-actions">
        <button class="tour-btn" @click="close">知道了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 遮罩层（全屏覆盖，但 pointer-events: none 不拦截点击） */
.tour-overlay {
  position: fixed; inset: 0; z-index: 9998;
  pointer-events: none;
}
/* 引导卡片 */
.tour-card {
  position: fixed;
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  pointer-events: all;  /* 允许点击操作 */
  max-width: 280px;
  transform: translateX(-50%);
  border: 2px solid var(--accent, #e94560);
}
/* 步骤进度文字 */
.tour-step {
  font-size: 11px; color: #aaa; text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 8px;
}
/* 步骤标题 */
.tour-title {
  font-size: 18px; font-weight: 700; margin-bottom: 8px;
  color: var(--accent, #e94560);
}
/* 步骤说明 */
.tour-desc {
  font-size: 14px; color: #555; line-height: 1.6;
}
/* 按钮容器 */
.tour-actions {
  margin-top: 16px; text-align: right;
}
/* 知道了按钮 */
.tour-btn {
  background: var(--accent, #e94560); color: #fff;
  border: none; border-radius: 20px; padding: 8px 20px;
  font-size: 14px; cursor: pointer; font-weight: 600;
  transition: opacity 0.2s;
}
.tour-btn:hover { opacity: 0.85; }

/* 移动端适配 */
@media (max-width: 720px) {
  .tour-card { max-width: 200px; }
}
</style>
