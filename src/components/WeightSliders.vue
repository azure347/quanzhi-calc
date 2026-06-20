<script setup>
/**
 * WeightSliders.vue — 权重调节滑块组件
 *
 * 职责：
 * 1. 展示9个维度的权重调节滑块（范围0-5）
 * 2. 支持拖动滑块调整各维度权重
 * 3. 权重变化通过 v-model 双向绑定同步到父组件
 * 4. 薪资维度权重拉到最高(5)时触发彩蛋回调（salaryMax 事件）
 *
 * 权重含义：
 * - 0 = 完全忽略该维度
 * - 1-4 = 逐渐重视程度递增
 * - 5 = 极度在意该因素
 */

import { ref, watch } from 'vue'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  dimensions: { type: Array, required: true }, // 维度配置数组
  modelValue: { type: Array, required: true }  // 权重数组（v-model）
})

// ============================================================
// Emit 定义
// ============================================================
const emit = defineEmits(['update:modelValue', 'salaryMax', 'change'])

// ============================================================
// 组件内部状态
// ============================================================
const weights = ref([...props.modelValue])  // 本地权重副本

// ============================================================
// 监听器
// ============================================================

// 监听外部 modelValue 变化，同步到本地副本（避免父子状态不同步）
watch(() => props.modelValue, (val) => { weights.value = [...val] })

// ============================================================
// 方法
// ============================================================

/**
 * 处理滑块值变化
 * 更新本地状态，向上游同步，并检查是否触发了薪资权重最高的彩蛋
 * @param {number} idx - 维度索引（0-8）
 * @param {number} value - 新的权重值（0-5）
 */
function onSliderChange(idx, value) {
  weights.value[idx] = value
  // 同步到父组件（v-model 模式）
  emit('update:modelValue', [...weights.value])
  emit('change', idx, value)
  // 薪资维度（索引1）权重拉到最高时触发彩蛋
  if (idx === 1 && value === 5) {
    emit('salaryMax')
  }
}
</script>

<template>
  <div class="slider-group">
    <!-- 标题 -->
    <div class="slider-title">权重调节（0=忽略, 拖到最右有惊喜）</div>

    <!-- 遍历9个维度，渲染对应的滑块 -->
    <div class="slider-row" v-for="(d, i) in dimensions" :key="d.key">
      <!-- 维度标签（显示 emoji 和搞笑名称，悬停显示完整描述） -->
      <span class="slider-label" :title="d.name + '：' + d.description">{{ d.emoji }} {{ d.funnyName }}</span>
      <!-- 滑块输入（范围 0-5） -->
      <input type="range" min="0" max="5" :value="weights[i]" @input="onSliderChange(i, parseInt($event.target.value))">
      <!-- 当前权重值显示 -->
      <span class="slider-val">{{ weights[i] }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider-group {}
/* 组件标题 */
.slider-title { font-size: 13px; color: #999; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase; }
/* 单行滑块容器 */
.slider-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 6px; }
/* 维度标签（右侧对齐，宽度固定，超出省略） */
.slider-row .slider-label { width: 110px; text-align: right; color: #777; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 滑块样式 */
.slider-row input[type="range"] { flex: 1; accent-color: #e94560; cursor: pointer; }
/* 权重数值显示 */
.slider-row .slider-val { width: 24px; text-align: center; color: #e94560; font-weight: 700; }
</style>
