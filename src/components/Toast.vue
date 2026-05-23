<script setup>
import { ref, onUnmounted } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

function show(msg) {
  if (timer) clearTimeout(timer)
  message.value = msg
  visible.value = true
  timer = setTimeout(() => { visible.value = false }, 3000)
}

onUnmounted(() => { if (timer) clearTimeout(timer) })

defineExpose({ show })
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-box">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast-box {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  background: #fff; color: #2d3436; padding: 12px 28px; border-radius: 14px;
  font-size: 15px; z-index: 10000; box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  border-left: 4px solid #e94560;
  pointer-events: none;
}

.toast-enter-active { animation: toastIn 0.35s ease; }
.toast-leave-active { animation: toastOut 0.35s ease; }

@keyframes toastIn {
  from { opacity:0; transform:translateX(-50%) translateY(-20px); }
  to { opacity:1; transform:translateX(-50%) translateY(0); }
}
@keyframes toastOut {
  from { opacity:1; }
  to { opacity:0; transform:translateX(-50%) translateY(-20px); }
}
</style>