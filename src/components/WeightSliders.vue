<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  dimensions: { type: Array, required: true },
  modelValue: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue', 'salaryMax', 'change'])

const weights = ref([...props.modelValue])

watch(() => props.modelValue, (val) => { weights.value = [...val] })

function onSliderChange(idx, value) {
  weights.value[idx] = value
  emit('update:modelValue', [...weights.value])
  emit('change', idx, value)
  if (idx === 1 && value === 5) {
    emit('salaryMax')
  }
}
</script>

<template>
  <div class="slider-group">
    <div class="slider-title">权重调节（0=忽略, 拖到最右有惊喜）</div>
    <div class="slider-row" v-for="(d, i) in dimensions" :key="d.key">
      <span class="slider-label" :title="d.name + '：' + d.description">{{ d.emoji }} {{ d.funnyName }}</span>
      <input type="range" min="0" max="5" :value="weights[i]" @input="onSliderChange(i, parseInt($event.target.value))">
      <span class="slider-val">{{ weights[i] }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider-group {}
.slider-title { font-size: 13px; color: #999; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase; }
.slider-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 6px; }
.slider-row .slider-label { width: 110px; text-align: right; color: #777; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slider-row input[type="range"] { flex: 1; accent-color: #e94560; cursor: pointer; }
.slider-row .slider-val { width: 24px; text-align: center; color: #e94560; font-weight: 700; }
</style>