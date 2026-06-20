<script setup>
/**
 * RunningMan.vue — 跑步小人动画组件
 *
 * 职责：
 * 1. 当劝退指数 > 80 时显示此组件
 * 2. 展示一个 SVG 绘制的小人奔跑动画
 * 3. 配合"快跑！"文字，传达"快跑别选这个专业"的幽默感
 *
 * 动画效果：
 * - 小人在水平方向上来回奔跑
 * - 双腿交替摆动
 * - 文字脉冲闪烁
 */

</script>

<template>
  <div class="runner-wrap">
    <!-- SVG 奔跑小人 -->
    <svg class="runner-svg" width="80" height="65" viewBox="0 0 80 65">
      <!-- 头部（圆形） -->
      <circle cx="32" cy="18" r="9" fill="none" stroke="#e94560" stroke-width="2.5"/>
      <!-- 身体（竖线） -->
      <line x1="32" y1="27" x2="32" y2="48" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 背包/书包（矩形） -->
      <rect x="24" y="28" width="12" height="14" rx="3" fill="none" stroke="#e67e22" stroke-width="2"/>
      <!-- 书包肩带 -->
      <line x1="24" y1="28" x2="36" y2="28" stroke="#e67e22" stroke-width="2"/>
      <!-- 左臂 -->
      <line x1="32" y1="34" x2="20" y2="42" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 右臂 -->
      <line x1="32" y1="34" x2="44" y2="28" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 左腿 -->
      <g class="runner-leg-left"><line x1="32" y1="48" x2="22" y2="60" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/></g>
      <!-- 右腿 -->
      <g class="runner-leg-right"><line x1="32" y1="48" x2="44" y2="62" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/></g>
      <!-- 地面虚线 -->
      <line x1="0" y1="64" x2="78" y2="64" stroke="#ccc" stroke-width="1" stroke-dasharray="4,4"/>
    </svg>
    <!-- 奔跑文字 -->
    <span class="runner-text">快跑！</span>
  </div>
</template>

<style scoped>
/* 容器（水平垂直居中） */
.runner-wrap {
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px;
}
/* SVG 小人（左右奔跑动画） */
.runner-svg { animation: runnerDash 3s ease-in-out infinite; }
/* 文字样式 */
.runner-text {
  color: #e94560; font-size: 18px; font-weight: 900; letter-spacing: 2px;
  animation: runnerTextPulse 1.5s ease-in-out infinite;
}

/* 小人左右奔跑动画 */
@keyframes runnerDash {
  0%,100% { transform: translateX(-30px); }
  50% { transform: translateX(30px); }
}

/* 文字脉冲闪烁动画 */
@keyframes runnerTextPulse {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 左腿摆动动画（绕髋关节旋转） */
.runner-leg-left  { animation: legSwing 0.3s ease-in-out infinite alternate; transform-origin: 38px 58px; }
/* 右腿摆动动画（与左腿错开0.15秒，产生交替效果） */
.runner-leg-right { animation: legSwing 0.3s ease-in-out 0.15s infinite alternate; transform-origin: 52px 58px; }

/* 腿部前后摆动关键帧 */
@keyframes legSwing {
  0% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}
</style>
