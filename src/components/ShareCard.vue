<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  major: { type: Object, required: true },
  score: { type: Number, required: true },
  segment: { type: Object, required: true },
  tier: { type: String, required: true }
})

const emit = defineEmits(['close'])

const canvasRef = ref(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = 600, H = 400
  canvas.width = W
  canvas.height = H

  ctx.clearRect(0, 0, W, H)

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#f5f0eb')
  bg.addColorStop(1, '#f0e8df')
  ctx.fillStyle = bg
  roundRect(ctx, 0, 0, W, H, 20)
  ctx.fill()

  // Top accent bar
  const accent = ctx.createLinearGradient(0, 0, W, 0)
  accent.addColorStop(0, '#e94560')
  accent.addColorStop(0.5, '#e67e22')
  accent.addColorStop(1, '#e94560')
  ctx.fillStyle = accent
  roundRectTop(ctx, 0, 0, W, 12, 20)
  ctx.fill()

  // Title
  ctx.fillStyle = '#e94560'
  ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('天坑劝退计算器', W / 2, 60)

  // Major name + category
  ctx.fillStyle = '#2d3436'
  ctx.font = 'bold 36px "Microsoft YaHei", sans-serif'
  ctx.fillText(props.major.name, W / 2, 120)

  ctx.fillStyle = '#999'
  ctx.font = '20px "Microsoft YaHei", sans-serif'
  ctx.fillText(`${props.major.categoryEmoji} ${props.major.category}  |  ${props.tier}`, W / 2, 155)

  // Score circle
  const cx = W / 2, cy = 250
  const r = 80

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 12
  ctx.stroke()

  // Score arc
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (Math.PI * 2 * props.score / 100)
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.strokeStyle = props.segment.color
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.stroke()

  // Score number
  ctx.fillStyle = props.segment.color
  ctx.font = 'bold 60px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(props.score, cx, cy)

  ctx.fillStyle = '#888'
  ctx.font = '18px "Microsoft YaHei", sans-serif'
  ctx.fillText('劝退指数', cx, cy + 45)

  // Comment
  ctx.fillStyle = '#555'
  ctx.font = 'italic 22px "Microsoft YaHei", sans-serif'
  ctx.textBaseline = 'alphabetic'
  const words = props.segment.text
  wrapText(ctx, words, W / 2, 365, 500, 26)

  // Emoji
  ctx.font = '24px sans-serif'
  ctx.fillText(props.segment.emoji, W - 40, 385)

  // Footer
  ctx.fillStyle = '#ccc'
  ctx.font = '14px "Microsoft YaHei", sans-serif'
  ctx.fillText('quanzhi-calc · 数据纯属娱乐', W / 2, H - 20)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let row = 0
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y + row * lineHeight)
      line = chars[i]
      row++
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y + row * lineHeight)
}

function download() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `${props.major.name}-劝退指数-${props.score}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  emit('close')
}

import { onMounted } from 'vue'
onMounted(draw)
</script>

<template>
  <div class="share-overlay" @click.self="emit('close')">
    <div class="share-modal">
      <div class="share-header">
        <span>分享卡片</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      <div class="card-preview">
        <canvas ref="canvasRef" class="share-canvas"></canvas>
      </div>
      <button class="download-btn" @click="download">📥 保存图片</button>
    </div>
  </div>
</template>

<style scoped>
.share-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
.share-modal {
  background: #fff; border-radius: 20px; padding: 24px;
  max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.share-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.share-header span { font-size: 18px; font-weight: 700; color: #2d3436; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #aaa; line-height: 1; }
.close-btn:hover { color: #e94560; }
.card-preview { margin-bottom: 16px; }
.share-canvas { width: 100%; max-width: 600px; height: auto; border-radius: 12px; border: 1px solid #eee; }
.download-btn {
  width: 100%; padding: 14px; border-radius: 14px; background: #e94560; color: #fff;
  border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.download-btn:hover { opacity: 0.85; }
</style>