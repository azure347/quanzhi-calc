<script setup>
/**
 * ShareCard.vue — 分享卡片弹窗组件
 *
 * 职责：
 * 1. 在模态弹窗中展示一张精美的分享图片预览
 * 2. 图片内容包含：专业名称、劝退指数、评级文案、分数环形进度条等
 * 3. 所有内容通过 Canvas 绑定绘制（用于生成图片）
 * 4. 提供下载按钮，将卡片导出为 PNG 图片
 * 5. 点击遮罩层可关闭弹窗
 */

import { ref, computed } from 'vue'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  major: { type: Object, required: true },      // 专业数据对象
  score: { type: Number, required: true },      // 劝退指数
  segment: { type: Object, required: true },    // 评级区间对象（包含颜色、文案、emoji）
  tier: { type: String, required: true }         // 学历层次中文标签
})

// ============================================================
// Emit 定义
// ============================================================
const emit = defineEmits(['close'])

// ============================================================
// 组件内部状态
// ============================================================
const canvasRef = ref(null)  // Canvas DOM 引用

// ============================================================
// Canvas 绑制函数
// ============================================================

/**
 * 在 Canvas 上绘制分享卡片
 * 包含：背景渐变、顶部强调条、标题、专业名称、分数圆环、评级文案、底部注释
 */
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = 600, H = 400
  canvas.width = W
  canvas.height = H

  ctx.clearRect(0, 0, W, H)

  // ---- 背景渐变 ----
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#f5f0eb')
  bg.addColorStop(1, '#f0e8df')
  ctx.fillStyle = bg
  roundRect(ctx, 0, 0, W, H, 20)
  ctx.fill()

  // ---- 顶部强调条（红橙渐变）----
  const accent = ctx.createLinearGradient(0, 0, W, 0)
  accent.addColorStop(0, '#e94560')
  accent.addColorStop(0.5, '#e67e22')
  accent.addColorStop(1, '#e94560')
  ctx.fillStyle = accent
  roundRectTop(ctx, 0, 0, W, 12, 20)
  ctx.fill()

  // ---- 标题 ----
  ctx.fillStyle = '#e94560'
  ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('天坑劝退计算器', W / 2, 60)

  // ---- 专业名称 + 分类 ----
  ctx.fillStyle = '#2d3436'
  ctx.font = 'bold 36px "Microsoft YaHei", sans-serif'
  ctx.fillText(props.major.name, W / 2, 120)

  ctx.fillStyle = '#999'
  ctx.font = '20px "Microsoft YaHei", sans-serif'
  ctx.fillText(`${props.major.categoryEmoji} ${props.major.category}  |  ${props.tier}`, W / 2, 155)

  // ---- 分数圆环 ----
  const cx = W / 2, cy = 250
  const r = 80

  // 外环背景（灰色）
  ctx.beginPath()
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 12
  ctx.stroke()

  // 分数弧线（彩色）
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (Math.PI * 2 * props.score / 100)
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.strokeStyle = props.segment.color
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.stroke()

  // 分数数字
  ctx.fillStyle = props.segment.color
  ctx.font = 'bold 60px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(props.score, cx, cy)

  ctx.fillStyle = '#888'
  ctx.font = '18px "Microsoft YaHei", sans-serif'
  ctx.fillText('劝退指数', cx, cy + 45)

  // ---- 评级文案 ----
  ctx.fillStyle = '#555'
  ctx.font = 'italic 22px "Microsoft YaHei", sans-serif'
  ctx.textBaseline = 'alphabetic'
  const words = props.segment.text
  wrapText(ctx, words, W / 2, 365, 500, 26)

  // ---- Emoji ----
  ctx.font = '24px sans-serif'
  ctx.fillText(props.segment.emoji, W - 40, 385)

  // ---- 页脚注释 ----
  ctx.fillStyle = '#ccc'
  ctx.font = '14px "Microsoft YaHei", sans-serif'
  ctx.fillText('quanzhi-calc · 数据纯属娱乐', W / 2, H - 20)
}

/**
 * 绘制圆角矩形（四个角都是圆角）
 * @param {CanvasRenderingContext2D} ctx - Canvas 绑制上下文
 * @param {number} x, y, w, h - 矩形边界
 * @param {number} r - 圆角半径
 */
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

/**
 * 绘制顶部圆角矩形（仅上方有圆角，下方直角）
 */
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

/**
 * 自动换行文本绘制
 * 超过 maxWidth 时自动换到下一行
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - 文本内容
 * @param {number} x, y - 起始坐标
 * @param {number} maxWidth - 单行最大宽度
 * @param {number} lineHeight - 行高
 */
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

/**
 * 下载卡片图片
 * 将 Canvas 内容导出为 PNG 并触发下载
 */
function download() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `${props.major.name}-劝退指数-${props.score}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  emit('close')
}

// 组件挂载时绘制
import { onMounted } from 'vue'
onMounted(draw)
</script>

<template>
  <!-- 模态遮罩层（点击可关闭） -->
  <div class="share-overlay" @click.self="emit('close')">
    <div class="share-modal">
      <!-- 弹窗头部 -->
      <div class="share-header">
        <span>分享卡片</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <!-- 卡片预览（Canvas） -->
      <div class="card-preview">
        <canvas ref="canvasRef" class="share-canvas"></canvas>
      </div>

      <!-- 下载按钮 -->
      <button class="download-btn" @click="download">📥 保存图片</button>
    </div>
  </div>
</template>

<style scoped>
/* 遮罩层 */
.share-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
/* 弹窗容器 */
.share-modal {
  background: #fff; border-radius: 20px; padding: 24px;
  max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
/* 头部 */
.share-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.share-header span { font-size: 18px; font-weight: 700; color: #2d3436; }
/* 关闭按钮 */
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #aaa; line-height: 1; }
.close-btn:hover { color: #e94560; }
/* 卡片预览区 */
.card-preview { margin-bottom: 16px; }
/* Canvas 样式 */
.share-canvas { width: 100%; max-width: 600px; height: auto; border-radius: 12px; border: 1px solid #eee; }
/* 下载按钮 */
.download-btn {
  width: 100%; padding: 14px; border-radius: 14px; background: #e94560; color: #fff;
  border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.download-btn:hover { opacity: 0.85; }
</style>
