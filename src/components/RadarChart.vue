<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  scores: { type: Object, required: true },
  dimensions: { type: Array, required: true }
})

const canvasRef = ref(null)

const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff']
const newDimKeys = ['civil_exam', 'overseas_study', 'entrepreneurship']
const colors = ['#e94560', '#e67e22', '#d63031', '#0984e3', '#6c5ce7', '#00b894']
const newColors = ['#00cec9', '#fdcb6e', '#6c5ce7']

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

function barColor(val) {
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

    <!-- New 3 dimensions as bar indicators -->
    <div class="new-dims-wrap">
      <div class="new-dims-label">附加维度</div>
      <div class="new-dim-row" v-for="(key, i) in newDimKeys" :key="key">
        <span class="new-dim-name">{{ dimensions.find(d => d.key === key)?.funnyName || key }}</span>
        <div class="new-dim-bar-bg">
          <div
            class="new-dim-bar-fill"
            :style="{
              width: (scores[key] || 0) + '%',
              background: barColor(scores[key] || 0)
            }"
          ></div>
        </div>
        <span class="new-dim-score" :style="{ color: barColor(scores[key] || 0) }">{{ scores[key] || 0 }}</span>
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

.new-dims-wrap {
  margin-top: 16px; padding: 14px 16px;
  background: #fafafa; border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.new-dims-label {
  font-size: 11px; color: #aaa; text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 10px;
}
.new-dim-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.new-dim-row:last-child { margin-bottom: 0; }
.new-dim-name { font-size: 13px; color: #555; width: 70px; text-align: left; flex-shrink: 0; }
.new-dim-bar-bg {
  flex: 1; height: 8px; background: #e8e8e8; border-radius: 4px; overflow: hidden;
}
.new-dim-bar-fill {
  height: 100%; border-radius: 4px; transition: width 0.5s;
}
.new-dim-score { font-size: 13px; font-weight: 700; width: 28px; text-align: right; flex-shrink: 0; }

.radar-legend {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px 16px; margin-top: 10px;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { font-size: 12px; color: #666; }
</style>