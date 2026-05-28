<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animFrameId = null
let bullets = []
let active = false

const corpus = [
  '快跑！别来！',
  '破防了',
  '真实！',
  '泪目',
  '这不就是我吗',
  '别来送死了',
  '我已经跑路了',
  '张雪峰说得对',
  '生化环材天坑专业',
  '新铁人三项：跑滴滴、送外卖、送快递',
  '小时候愿望每天挣100块，长大实现月入3000',
  '法考通过率10%，红圈所录取率0.5%',
  '千万别学会计，行业供大于求',
  'AI翻译正在你背后偷笑',
  '材料劝退是知乎经典话题',
  '提桶跑路',
  '我的青春浇筑在混凝土里',
  '身边没一个不后悔的',
  '普通一本毕业，在家蹲',
  '文科专业能干嘛',
  '你同学都退休了你还在规培',
  '35岁才正式上岗',
  '投行 IBD 是清北复交 plus 的专利',
  '传统媒体已死',
  '国际贸易：你的工作可以被全球更便宜的人替代',
  '旅游管理考公无对口岗',
  '英语专业 AI 翻译双重打击',
  '本科学历横着走 → 100=博士起步',
  '学前教育出生率下降',
  '临床医学劝人学医天打雷劈',
  'MBA工商管理：万金油=什么都会=什么都不会',
]

const colors = [
  'rgba(233,69,96,0.35)',
  'rgba(230,126,34,0.35)',
  'rgba(155,89,182,0.35)',
  'rgba(52,152,219,0.35)',
  'rgba(46,204,113,0.35)',
  'rgba(255,107,107,0.35)',
  'rgba(255,179,71,0.35)',
  'rgba(255,127,80,0.35)',
]

class Bullet {
  constructor(canvasW, canvasH) {
    this.text = corpus[Math.floor(Math.random() * corpus.length)]
    this.color = colors[Math.floor(Math.random() * colors.length)]
    this.speed = 0.5 + Math.random() * 1.0
    this.y = Math.random() * (canvasH * 0.7) + canvasH * 0.1
    this.x = canvasW + Math.random() * 200
    this.fontSize = 14 + Math.floor(Math.random() * 10)
  }

  update() {
    this.x -= this.speed
  }

  draw(ctx) {
    ctx.font = `${this.fontSize}px "Microsoft YaHei", sans-serif`
    ctx.fillStyle = this.color
    ctx.fillText(this.text, this.x, this.y)
  }

  isOffScreen(ctx) {
    return this.x < -ctx.measureText(this.text).width
  }
}

function spawnBullet(canvasW, canvasH) {
  if (Math.random() < 0.04) {
    bullets.push(new Bullet(canvasW, canvasH))
  }
}

function draw() {
  if (!active) return
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  spawnBullet(w, h)
  ctx.clearRect(0, 0, w, h)
  bullets.forEach(b => { b.update(); b.draw(ctx) })
  bullets = bullets.filter(b => b.isOffScreen(ctx))

  animFrameId = requestAnimationFrame(draw)
}

onMounted(() => {
  active = true
  draw()
})

onUnmounted(() => {
  active = false
  if (animFrameId) cancelAnimationFrame(animFrameId)
  bullets = []
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="danmaku-canvas"></canvas>
</template>

<style scoped>
.danmaku-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.65;
}
</style>