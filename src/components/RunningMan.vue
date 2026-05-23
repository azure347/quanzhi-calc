<script setup>
</script>

<template>
  <div class="runner-wrap">
    <svg class="runner-svg" width="80" height="65" viewBox="0 0 80 65">
      <circle cx="32" cy="18" r="9" fill="none" stroke="#e94560" stroke-width="2.5"/>
      <line x1="32" y1="27" x2="32" y2="48" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="24" y="28" width="12" height="14" rx="3" fill="none" stroke="#e67e22" stroke-width="2"/>
      <line x1="24" y1="28" x2="36" y2="28" stroke="#e67e22" stroke-width="2"/>
      <line x1="32" y1="34" x2="20" y2="42" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="32" y1="34" x2="44" y2="28" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/>
      <g class="runner-leg-left"><line x1="32" y1="48" x2="22" y2="60" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/></g>
      <g class="runner-leg-right"><line x1="32" y1="48" x2="44" y2="62" stroke="#e94560" stroke-width="2.5" stroke-linecap="round"/></g>
      <line x1="0" y1="64" x2="78" y2="64" stroke="#ccc" stroke-width="1" stroke-dasharray="4,4"/>
    </svg>
    <span class="runner-text">快跑！</span>
  </div>
</template>

<style scoped>
.runner-wrap {
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px;
}
.runner-svg { animation: runnerDash 3s ease-in-out infinite; }
.runner-text {
  color: #e94560; font-size: 18px; font-weight: 900; letter-spacing: 2px;
  animation: runnerTextPulse 1.5s ease-in-out infinite;
}
@keyframes runnerDash {
  0%,100% { transform: translateX(-30px); }
  50% { transform: translateX(30px); }
}
@keyframes runnerTextPulse {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.runner-leg-left  { animation: legSwing 0.3s ease-in-out infinite alternate; transform-origin: 38px 58px; }
.runner-leg-right { animation: legSwing 0.3s ease-in-out 0.15s infinite alternate; transform-origin: 52px 58px; }
@keyframes legSwing {
  0% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}
</style>