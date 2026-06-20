<script setup>
/**
 * RadarChart.vue — 多维度雷达图与新增维度仪表盘组件
 *
 * 职责：
 * 1. 使用 Canvas 绘制6维雷达图，展示核心维度（就业、薪资、学历门槛、环境、前景、转专业难度）
 * 2. 在雷达图下方绘制3个圆形仪表盘，展示新增维度（考公难度、出国难度、创业难度）
 * 3. 提供图例说明各维度含义
 * 4. 分数越高、颜色越红，表示该维度越"坑"
 */

import { ref, watch, onMounted } from 'vue'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  scores: { type: Object, required: true },   // 各维度得分对象
  dimensions: { type: Array, required: true } // 维度配置（含名称、emoji、搞笑名称等）
})

// ============================================================
// 组件内部状态
// ============================================================
const canvasRef = ref(null)  // Canvas DOM 引用

// 6个核心维度的键名（与 dimensions[0-5] 对应）
const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff']
// 6个维度的颜色配置
const colors = ['#e94560', '#e67e22', '#d63031', '#0984e3', '#6c5ce7', '#00b894']

// 3个新增维度的键名
const newDimKeys = ['civil_exam', 'overseas_study', 'entrepreneurship']
// 3个新增维度的颜色配置
const newDimColors = ['#00cec9', '#fdcb6e', '#a29bfe']

/**
 * 根据分数返回对应的颜色
 * <30 绿色（相对较好）
 * 30-70 橙色（中等）
 * >=70 红色（较坑）
 * @param {number} val - 分数（0-100）
 * @returns {string} CSS 颜色值
 */
function scoreColor(val) {
  if (val < 30) return '#2ecc71'
  if (val < 50) return '#e67e22'
  if (val < 70) return '#e67e22'
  return '#e94560'
}

/**
 * 绘制雷达图和仪表盘
 * 在 Canvas 上完成所有绘制工作
 */
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 处理高清屏（devicePixelRatio）
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const cx = w / 2, cy = h / 2   // 画布中心点
  const r = Math.min(cx, cy) - 30 // 雷达图半径
  const n = dimKeys.length        // 维度数量（6个）

  // 清空画布
  ctx.clearRect(0, 0, w, h)

  // ---- 绘制网格线（5层同心正六边形）----
  for (let level = 1; level <= 5; level++) {
    ctx.beginPath()
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 0.5
    for (let i = 0; i < n; i++) {
      // 计算每个顶点的角度和位置
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + (r / 5) * level * Math.cos(angle)
      const y = cy + (r / 5) * level * Math.sin(angle)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // ---- 绘制轴线（从中心到6个顶点）----
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    ctx.beginPath()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    ctx.stroke()

    // 绘制维度名称标签
    const lx = cx + (r + 20) * Math.cos(angle)
    const ly = cy + (r + 20) * Math.sin(angle)
    ctx.fillStyle = '#555'
    ctx.font = '12px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(props.dimensions[i].funnyName, lx, ly)
  }

  // ---- 绘制数据多边形（填充 + 描边）----
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const val = (props.scores[dimKeys[i]] || 0) / 100  // 归一化到 0-1
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

  // ---- 绘制数据点（6个带边框的圆点）----
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

// 组件挂载时绘制一次
onMounted(draw)

// 监听 scores 或 dimensions 变化时重新绘制
watch(() => [props.scores, props.dimensions], draw, { deep: true })
</script>

<template>
  <div class="radar-wrap">
    <!-- 雷达图标题 -->
    <div class="radar-title">6维能力图（越大越惨）</div>
    <!-- 雷达图画布 -->
    <canvas ref="canvasRef" class="radar-canvas"></canvas>

    <!-- 3个新增维度的小仪表盘 -->
    <div class="gauge-row">
      <div
        v-for="(key, i) in newDimKeys"
        :key="key"
        class="gauge-pod"
        :style="{ borderColor: newDimColors[i] + '44' }"
      >
        <!-- 仪表盘标题 -->
        <div class="gauge-title">{{ dimensions.find(d => d.key === key)?.funnyName }}</div>
        <!-- SVG 仪表盘（圆弧进度） -->
        <svg class="gauge-svg" viewBox="0 0 80 80">
          <!-- 背景圆弧（灰色底环） -->
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="#f0f0f0"
            stroke-width="6"
          />
          <!-- 分数圆弧（彩色前景环） -->
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
          <!-- 分数数字 -->
          <text x="40" y="36" text-anchor="middle" class="gauge-score" :fill="scoreColor(scores[key] || 0)">{{ scores[key] || 0 }}</text>
          <!-- "分"单位标签 -->
          <text x="40" y="52" text-anchor="middle" class="gauge-label">分</text>
        </svg>
        <!-- 维度简短描述 -->
        <div class="gauge-desc">{{ dimensions.find(d => d.key === key)?.description.split('，')[0] }}</div>
      </div>
    </div>

    <!-- 六维图例 -->
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

/* 仪表盘容器 */
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
/* 圆弧过渡动画 */
.gauge-arc { transition: stroke-dasharray 0.5s; }
/* 仪表盘分数文字 */
.gauge-score { font-size: 18px; font-weight: 800; font-family: "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
/* 仪表盘单位文字 */
.gauge-label { font-size: 10px; fill: #bbb; font-family: "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
/* 仪表盘描述 */
.gauge-desc { font-size: 10px; color: #aaa; margin-top: 4px; text-align: center; max-width: 90px; }

/* 图例 */
.radar-legend {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px 16px; margin-top: 10px;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { font-size: 12px; color: #666; }
</style>
