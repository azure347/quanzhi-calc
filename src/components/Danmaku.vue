<script setup>
/**
 * Danmaku.vue — 弹幕效果组件
 *
 * 职责：
 * 1. 在页面背景层渲染飘过的弹幕动画
 * 2. 弹幕内容是关于专业吐槽的各种网友评论
 * 3. 使用 Canvas 绑定实现高性能弹幕渲染
 * 4. 每隔一段时间随机生成一条弹幕从屏幕右侧飘向左侧
 * 5. 弹幕不影响页面交互（pointer-events: none）
 *
 * 弹幕内容示例：
 * - "快跑！别来！"
 * - "生化环材天坑专业"
 * - "张雪峰说得对"
 * - 等等
 */

import { ref, onMounted, onUnmounted } from 'vue'

// ============================================================
// 组件状态
// ============================================================
const canvasRef = ref(null)   // Canvas DOM 引用
let ctx = null               // Canvas 绑制上下文
let animFrameId = null        // requestAnimationFrame ID（用于取消动画）
let bullets = []             // 当前在屏幕上的弹幕列表
let active = false           // 组件是否处于活跃状态

// ============================================================
// 弹幕内容语料库
// ============================================================
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

// 弹幕文字颜色列表（半透明）
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

// ============================================================
// 弹幕类
// ============================================================
/**
 * 单条弹幕对象
 * 负责管理自身的位置、速度、绘制和越界判断
 */
class Bullet {
  constructor(canvasW, canvasH) {
    // 随机选择弹幕文本
    this.text = corpus[Math.floor(Math.random() * corpus.length)]
    // 随机选择文字颜色
    this.color = colors[Math.floor(Math.random() * colors.length)]
    // 随机速度（0.5 - 1.5 像素每帧）
    this.speed = 0.5 + Math.random() * 1.0
    // 随机 Y 轴位置（屏幕高度的 10% - 80% 之间）
    this.y = Math.random() * (canvasH * 0.7) + canvasH * 0.1
    // 初始 X 位置（屏幕右侧外面，可稍有偏移）
    this.x = canvasW + Math.random() * 200
    // 随机字号（14 - 24 px）
    this.fontSize = 14 + Math.floor(Math.random() * 10)
  }

  /**
   * 更新弹幕位置（每帧调用）
   * X 坐标向左移动 speed 个像素
   */
  update() {
    this.x -= this.speed
  }

  /**
   * 在 Canvas 上绘制弹幕
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.font = `${this.fontSize}px "Microsoft YaHei", sans-serif`
    ctx.fillStyle = this.color
    ctx.fillText(this.text, this.x, this.y)
  }

  /**
   * 判断弹幕是否已经飘出屏幕左侧
   * @param {CanvasRenderingContext2D} ctx
   * @returns {boolean}
   */
  isOffScreen(ctx) {
    return this.x < -ctx.measureText(this.text).width
  }
}

// ============================================================
// 弹幕生成与绑定循环
// ============================================================

/**
 * 随机生成新弹幕
 * 以 4% 的概率在每帧尝试生成新弹幕
 * @param {number} canvasW - Canvas 宽度
 * @param {number} canvasH - Canvas 高度
 */
function spawnBullet(canvasW, canvasH) {
  if (Math.random() < 0.04) {
    bullets.push(new Bullet(canvasW, canvasH))
  }
}

/**
 * 主绑定循环（通过 requestAnimationFrame 驱动）
 * 负责：生成弹幕 → 清空画布 → 更新位置 → 绘制 → 移除越界弹幕 → 继续下一帧
 */
function draw() {
  if (!active) return  // 组件不活跃时停止绑定
  const canvas = canvasRef.value
  if (!canvas) return

  // 处理高清屏：设置 Canvas 实际像素尺寸
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // 随机生成新弹幕
  spawnBullet(w, h)
  // 清空画布
  ctx.clearRect(0, 0, w, h)
  // 更新并绘制所有弹幕，移除越界弹幕
  bullets.forEach(b => { b.update(); b.draw(ctx) })
  bullets = bullets.filter(b => !b.isOffScreen(ctx))

  // 请求下一帧
  animFrameId = requestAnimationFrame(draw)
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 组件挂载时启动弹幕动画
 */
onMounted(() => {
  active = true
  draw()
})

/**
 * 组件卸载时清理资源
 * 停止动画循环，清空弹幕列表，重置上下文
 */
onUnmounted(() => {
  active = false
  if (animFrameId) cancelAnimationFrame(animFrameId)
  bullets = []
  ctx = null
})
</script>

<template>
  <!-- 弹幕 Canvas（固定在页面最底层，不影响交互） -->
  <canvas ref="canvasRef" class="danmaku-canvas"></canvas>
</template>

<style scoped>
/* 全屏覆盖，固定定位在页面底部 */
.danmaku-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;  /* 不拦截鼠标事件 */
  z-index: 0;            /* 最底层 */
  opacity: 0.65;         /* 适度透明，不遮挡内容 */
}
</style>
