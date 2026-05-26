<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  majors: { type: Array, required: true },
  recentMajors: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['select', 'update:modelValue'])

const inputVal = ref(props.modelValue)

const filteredMajors = computed(() => {
  const q = inputVal.value.trim().toLowerCase()
  if (!q) return []
  return props.majors.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.aliases.some(a => a.toLowerCase().includes(q))
  )
})

const showRecent = computed(() => !inputVal.value.trim() && props.recentMajors.length > 0)

const popularMajors = computed(() =>
  props.majors.slice(0, 6)
)

function highlight(text, q) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length)
}

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
    <!-- Recent -->
    <template v-if="showRecent">
      <div class="section-label">最近看过</div>
      <span
        v-for="id in recentMajors"
        :key="'r-' + id"
        class="tag tag-recent"
        @click="selectMajor(majors.find(m => m.id === id))"
      >{{ majors.find(m => m.id === id)?.categoryEmoji }} {{ majors.find(m => m.id === id)?.name }}</span>
      <div class="section-label" style="margin-top:8px">热门专业</div>
    </template>

    <!-- Popular (shown when input is empty and no recent) -->
    <template v-if="!inputVal.trim() && !showRecent">
      <span
        v-for="m in popularMajors"
        :key="m.id"
        class="tag"
        @click="selectMajor(m)"
      >{{ m.categoryEmoji }} {{ m.name }}</span>
    </template>

    <!-- Search results -->
    <template v-if="inputVal.trim()">
      <template v-if="filteredMajors.length === 0">
        <div class="no-result">恭喜，这个专业暂时安全，或者太冷门了没人骂 😅</div>
      </template>
      <span
        v-for="m in filteredMajors"
        :key="m.id"
        class="tag"
        @click="selectMajor(m)"
        v-html="m.categoryEmoji + ' ' + highlight(m.name, inputVal.trim())"
      ></span>
    </template>
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
  align-items: center;
}
.section-label {
  font-size: 11px; color: #aaa; text-transform: uppercase;
  letter-spacing: 1px; width: 100%; margin-bottom: 2px;
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
.tag-recent {
  background: #f0f7ff; color: #3498db; border-color: #c0dcf0;
}
.tag-recent:hover {
  background: #3498db; color: #fff; border-color: #3498db;
}
:deep(mark) {
  background: #ffe066; color: #555; border-radius: 2px; padding: 0 1px;
}
.no-result { text-align: center; padding: 30px; color: #aaa; font-size: 15px; width: 100%; }
</style>