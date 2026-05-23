<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  majors: { type: Array, required: true },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['select', 'update:modelValue'])

const inputVal = ref(props.modelValue)

const filteredMajors = computed(() => {
  const q = inputVal.value.trim().toLowerCase()
  if (!q) return props.majors
  return props.majors.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.aliases.some(a => a.toLowerCase().includes(q))
  )
})

function onInput(e) {
  inputVal.value = e.target.value
  emit('update:modelValue', inputVal.value)
}

function selectMajor(major) {
  inputVal.value = major.name
  emit('update:modelValue', major.name)
  emit('select', major.id)
}

defineExpose({ setValue: (v) => { inputVal.value = v } })
</script>

<template>
  <div class="search-wrap">
    <input
      class="search-box"
      :value="inputVal"
      @input="onInput"
      placeholder="输入专业名称，测测你的福气..."
      autocomplete="off"
    />
  </div>
  <div class="suggestions">
    <template v-if="filteredMajors.length === 0">
      <div class="no-result">恭喜，这个专业暂时安全，或者太冷门了没人骂 😅</div>
    </template>
    <span
      v-for="m in filteredMajors" :key="m.id"
      class="tag"
      @click="selectMajor(m)"
    >{{ m.categoryEmoji }} {{ m.name }}</span>
  </div>
</template>

<style scoped>
.search-wrap {
  max-width: 560px; margin: 16px auto 0; padding: 0 16px; position: relative; z-index: 1;
}
.search-box {
  width: 100%; padding: 14px 20px; font-size: 16px;
  border-radius: 30px; border: 2px solid #ddd; outline: none;
  background: #fff; color: #2d3436; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.search-box:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(233,69,96,0.1), 0 2px 12px rgba(0,0,0,0.06);
}
.search-box::placeholder { color: #bbb; font-style: italic; }

.suggestions {
  max-width: 560px; margin: 4px auto 0; padding: 0 16px;
  display: flex; flex-wrap: wrap; gap: 6px; position: relative; z-index: 1;
}
.tag {
  padding: 6px 16px; border-radius: 16px; font-size: 13px;
  background: #f0f0f0; color: #777; cursor: pointer; border: 1px solid #e0e0e0;
  transition: all 0.2s;
}
.tag:hover {
  background: var(--accent); color: #fff; border-color: var(--accent);
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(233,69,96,0.2);
}
.no-result { text-align: center; padding: 30px; color: #aaa; font-size: 15px; width: 100%; }
</style>