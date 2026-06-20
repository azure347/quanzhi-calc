<script setup>
/**
 * Toast.vue — 轻提示（Toast）组件
 *
 * 职责：
 * 1. 在屏幕顶部中央显示临时提示信息
 * 2. 3秒后自动消失
 * 3. 提供入场（淡入+上滑）和退场（淡出+上滑）动画
 * 4. 通过 defineExpose 暴露 show() 方法供父组件调用
 *
 * 使用方式：
 * const toastRef = ref(null)
 * toastRef.value?.show('提示内容')
 */

import { ref, onUnmounted } from 'vue'

// ============================================================
// 组件状态
// ============================================================
const visible = ref(false)  // 是否显示提示
const message = ref('')     // 提示文本内容
let timer = null           // 定时器引用（用于自动关闭）

/**
 * 显示提示
 * 如果已有定时器在运行，先清除（避免提示被提前关闭）
 * 显示后启动3秒自动关闭定时器
 * @param {string} msg - 要显示的提示文本
 */
function show(msg) {
  if (timer) clearTimeout(timer)  // 清除之前的定时器
  message.value = msg
  visible.value = true
  // 3秒后自动隐藏
  timer = setTimeout(() => { visible.value = false }, 3000)
}

/**
 * 组件卸载时清理定时器
 * 防止内存泄漏
 */
onUnmounted(() => { if (timer) clearTimeout(timer) })

// ============================================================
// 暴露方法给父组件
// ============================================================
/**
 * 通过模板 ref 可以调用 toastRef.value.show('xxx') 显示提示
 */
defineExpose({ show })
</script>

<template>
  <!-- 使用 Vue Transition 组件实现淡入淡出动画 -->
  <Transition name="toast">
    <div v-if="visible" class="toast-box">{{ message }}</div>
  </Transition>
</template>

<style scoped>
/* Toast 容器 */
.toast-box {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  background: #fff; color: #2d3436; padding: 12px 28px; border-radius: 14px;
  font-size: 15px; z-index: 10000; box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  border-left: 4px solid #e94560;  /* 左侧红色强调条 */
  pointer-events: none;  /* 禁止交互，不会遮挡页面操作 */
}

/* 入场动画 */
.toast-enter-active { animation: toastIn 0.35s ease; }
/* 退场动画 */
.toast-leave-active { animation: toastOut 0.35s ease; }

/* 淡入 + 上滑动画 */
@keyframes toastIn {
  from { opacity:0; transform:translateX(-50%) translateY(-20px); }
  to { opacity:1; transform:translateX(-50%) translateY(0); }
}

/* 淡出 + 上滑动画 */
@keyframes toastOut {
  from { opacity:1; }
  to { opacity:0; transform:translateX(-50%) translateY(-20px); }
}
</style>
