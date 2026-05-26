<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  scores: { type: Object, required: true },
  dimensions: { type: Array, required: true }
})

const canvasRef = ref(null)

const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff']
const colors = ['#e94560', '#e67e22', '#d63031', '#0984e3', '#6c5ce7', '#00b894']

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const cx = w / 2, cy = h / 2
  const r = Math.min(cx, cy) - 30
  const n = dimKeys.length

  ctx.clearRect(0, 0, w, h)

  // Grid lines
  for (let level = 1; level <= 5; level++) {
    ctx.beginPath()
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 0.5
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + (r / 5) * level * Math.cos(angle)
      const y = cy + (r / 5) * level * Math.sin(angle)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    ctx.beginPath()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    ctx.stroke()

    const lx = cx + (r + 20) * Math.cos(angle)
    const ly = cy + (r + 20) * Math.sin(angle)
    ctx.fillStyle = '#555'
    ctx.font = '12px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(props.dimensions[i].funnyName, lx, ly)
  }

  // Data polygon
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const val = (props.scores[dimKeys[i]] || 0) / 100
    const x = cx + r * val * Math.cos(angle)
    const y = cy + r * val * Math.sin(angle)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(233,69,96,0.12)'
  ctx.fill()
  ctx.strokeStyle = '#e94560'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Dots
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const val = (props.scores[dimKeys[i]] || 0) / 100
    const x = cx + r * val * Math.cos(angle)
    const y = cy + r * val * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fillStyle = colors[i]
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

const newDimKeys = ['civil_exam', 'overseas_study', 'entrepreneurship']
const newDimColors = ['#00cec9', '#fdcb6e', '#a29bfe']

function scoreColor(val) {
  if (val < 30) return '#2ecc71'
  if (val < 50) return '#e67e22'
  if (val < 70) return '#e67e22'
  return '#e94560'
}

onMounted(draw)
watch(() => [props.scores, props.dimensions], draw, { deep: true })
</script>

<template>
  <div class="radar-wrap">
    <div class="radar-title">6维能力图（越大越惨）</div>
    <canvas ref="canvasRef" class="radar-canvas"></canvas>

    <!-- Mini gauge pods for 3 new dimensions -->
    <div class="gauge-row">
      <div
        v-for="(key, i) in newDimKeys"
        :key="key"
        class="gauge-pod"
        :style="{ borderColor: newDimColors[i] + '44' }"
      >
        <div class="gauge-title">{{ dimensions.find(d => d.key === key)?.funnyName }}</div>
        <svg class="gauge-svg" viewBox="0 0 80 80">
          <!-- Background arc -->
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="#f0f0f0"
            stroke-width="6"
          />
          <!-- Score arc -->
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            :stroke="scoreColor(scores[key] || 0)"
            stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="201"
            :stroke-dashoffset="201 - (scores[key] || 0) / 100 * 201"
            transform="rotate(-90 40 40)"
            class="gauge-arc"
          />
          <text x="40" y="36" text-anchor="middle" class="gauge-score" :fill="scoreColor(scores[key] || 0)">{{ scores[key] || 0 }}</text>
          <text x="40" y="52" text-anchor="middle" class="gauge-label">分</text>
        </svg>
        <div class="gauge-desc">{{ dimensions.find(d => d.key === key)?.description.split('，')[0] }}</div>
      </div>
    </div>

    <div class="radar-legend">
      <div v-for="(dim, i) in dimensions.slice(0, 6)" :key="dim.key" class="legend-item">
        <span class="legend-dot" :style="{ background: colors[i] }"></span>
        <span class="legend-label">{{ dim.funnyName }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.radar-wrap { text-align: center; }
.radar-title { font-size: 13px; color: #999; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase; }
.radar-canvas { width: 100%; height: 300px; display: block; }

.gauge-row {
  display: flex; justify-content: center; gap: 20px;
  margin: 16px 0 0;
}
.gauge-pod {
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 8px 8px;
  border-radius: 14px;
  border: 1.5px solid;
  background: #fafafa;
  width: 100px;
}
.gauge-title {
  font-size: 12px; color: #888; margin-bottom: 6px;
  white-space: nowrap;
}
.gauge-svg { width: 76px; height: 76px; }
.gauge-arc { transition: stroke-dasharray 0.5s; }
.gauge-score { font-size: 18px; font-weight: 800; font-family: "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
.gauge-label { font-size: 10px; fill: #bbb; font-family: "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
.gauge-desc { font-size: 10px; color: #aaa; margin-top: 4px; text-align: center; max-width: 90px; }

.radar-legend {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px 16px; margin-top: 10px;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { font-size: 12px; color: #666; }
</style>