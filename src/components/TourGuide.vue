<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  step: { type: Number, required: true },
  onClose: { type: Function, required: true }
})

const steps = [
  {
    title: '搜索专业',
    desc: '输入专业名称，支持别名模糊搜索，点击即可切换',
    position: { bottom: '220px', left: '50%' }
  },
  {
    title: '调整权重',
    desc: '九个维度可以自定义权重，滑到最右=你非常在意这个因素',
    position: { bottom: '100px', right: '20px' }
  },
  {
    title: '查看结果',
    desc: '劝退指数由加权平均算出，分数越高越要谨慎入坑',
    position: { top: '80px', left: '50%' }
  }
]

function close() {
  localStorage.setItem('quanzhi-tour-done', '1')
  props.onClose()
}
</script>

<template>
  <div class="tour-overlay">
    <div class="tour-card" :style="steps[step].position">
      <div class="tour-step">步骤 {{ step + 1 }}/{{ steps.length }}</div>
      <div class="tour-title">{{ steps[step].title }}</div>
      <div class="tour-desc">{{ steps[step].desc }}</div>
      <div class="tour-actions">
        <button class="tour-btn" @click="close">知道了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tour-overlay {
  position: fixed; inset: 0; z-index: 9998;
  pointer-events: none;
}
.tour-card {
  position: fixed;
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  pointer-events: all;
  max-width: 280px;
  transform: translateX(-50%);
  border: 2px solid var(--accent, #e94560);
}
.tour-step {
  font-size: 11px; color: #aaa; text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 8px;
}
.tour-title {
  font-size: 18px; font-weight: 700; margin-bottom: 8px;
  color: var(--accent, #e94560);
}
.tour-desc {
  font-size: 14px; color: #555; line-height: 1.6;
}
.tour-actions {
  margin-top: 16px; text-align: right;
}
.tour-btn {
  background: var(--accent, #e94560); color: #fff;
  border: none; border-radius: 20px; padding: 8px 20px;
  font-size: 14px; cursor: pointer; font-weight: 600;
  transition: opacity 0.2s;
}
.tour-btn:hover { opacity: 0.85; }

@media (max-width: 720px) {
  .tour-card { max-width: 200px; }
}
</style>