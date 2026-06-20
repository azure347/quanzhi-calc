<script setup>
/**
 * SearchBar.vue — 专业搜索组件
 *
 * 职责：
 * 1. 提供专业名称的模糊搜索功能（支持别名匹配）
 * 2. 显示最近浏览的专业（recentMajors）
 * 3. 显示热门专业推荐（majors 数组的前6个）
 * 4. 高亮搜索结果中匹配的文字
 * 5. 通过 emit 向上层组件传递选中的专业ID
 */

import { ref, computed } from 'vue'

// ============================================================
// Props 定义
// ============================================================
const props = defineProps({
  majors: { type: Array, required: true },      // 所有专业数据列表
  recentMajors: { type: Array, default: () => [] }, // 最近浏览的专业ID列表
  modelValue: { type: String, default: '' }   // 搜索框的当前输入值（v-model）
})

// ============================================================
// Emit 定义
// ============================================================
const emit = defineEmits(['select', 'update:modelValue'])

// ============================================================
// 组件内部状态
// ============================================================
const inputVal = ref(props.modelValue)  // 搜索框的本地输入值

// ============================================================
// 计算属性
// ============================================================

/**
 * 根据搜索关键词过滤专业列表
 * 匹配规则：专业名称或别名中包含搜索关键词（不区分大小写）
 * @returns {Array} 匹配的专业列表
 */
const filteredMajors = computed(() => {
  const q = inputVal.value.trim().toLowerCase()
  if (!q) return []
  return props.majors.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.aliases.some(a => a.toLowerCase().includes(q))
  )
})

/**
 * 是否显示"最近浏览"区域
 * 条件：搜索框为空且有最近浏览记录
 */
const showRecent = computed(() => !inputVal.value.trim() && props.recentMajors.length > 0)

/**
 * 热门专业列表（取前6个）
 * 用于用户未进行搜索时展示推荐
 */
const popularMajors = computed(() =>
  props.majors.slice(0, 6)
)

// ============================================================
// 方法
// ============================================================

/**
 * 高亮文本中匹配的关键词
 * 在匹配位置前后插入 <mark> 标签包裹匹配字符
 * @param {string} text - 原始文本（专业名称）
 * @param {string} q - 搜索关键词
 * @returns {string} HTML字符串，匹配部分被 <mark> 包裹
 */
function highlight(text, q) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length)
}

/**
 * 搜索框输入事件处理
 * 更新本地状态并向上游同步
 * @param {Event} e - input 事件对象
 */
function onInput(e) {
  inputVal.value = e.target.value
  emit('update:modelValue', inputVal.value)
}

/**
 * 选择一个专业
 * 更新输入框显示的名称，触发 select 事件
 * @param {Object} major - 被选中的专业对象
 */
function selectMajor(major) {
  inputVal.value = major.name
  emit('update:modelValue', major.name)
  emit('select', major.id)
}

// ============================================================
// 暴露方法给父组件
// ============================================================
/**
 * 允许父组件通过 ref 调用 setValue 方法
 * 用于清空搜索框等场景
 */
defineExpose({ setValue: (v) => { inputVal.value = v } })
</script>

<template>
  <!-- 搜索框包装容器 -->
  <div class="search-wrap">
    <input
      class="search-box"
      :value="inputVal"
      @input="onInput"
      placeholder="输入专业名称，测测你的福气..."
      autocomplete="off"
    />
  </div>

  <!-- 搜索建议区域 -->
  <div class="suggestions">
    <!-- 最近浏览（输入为空且有历史记录时显示） -->
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

    <!-- 热门推荐（输入为空且无历史记录时显示） -->
    <template v-if="!inputVal.trim() && !showRecent">
      <span
        v-for="m in popularMajors"
        :key="m.id"
        class="tag"
        @click="selectMajor(m)"
      >{{ m.categoryEmoji }} {{ m.name }}</span>
    </template>

    <!-- 搜索结果 -->
    <template v-if="inputVal.trim()">
      <!-- 无搜索结果提示 -->
      <template v-if="filteredMajors.length === 0">
        <div class="no-result">恭喜，这个专业暂时安全，或者太冷门了没人骂 😅</div>
      </template>
      <!-- 搜索结果标签列表 -->
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
/* 搜索框包装 */
.search-wrap {
  max-width: 560px; margin: 16px auto 0; padding: 0 16px; position: relative; z-index: 1;
}
/* 搜索输入框样式 */
.search-box {
  width: 100%; padding: 14px 20px; font-size: 16px;
  border-radius: 30px; border: 2px solid #ddd; outline: none;
  background: #fff; color: #2d3436; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: border-color 0.3s, box-shadow 0.3s;
}
/* 搜索框聚焦态 */
.search-box:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(233,69,96,0.1), 0 2px 12px rgba(0,0,0,0.06);
}
.search-box::placeholder { color: #bbb; font-style: italic; }

/* 建议区域容器 */
.suggestions {
  max-width: 560px; margin: 4px auto 0; padding: 0 16px;
  display: flex; flex-wrap: wrap; gap: 6px; position: relative; z-index: 1;
  align-items: center;
}
/* 分区标题（如"最近看过"、"热门专业"） */
.section-label {
  font-size: 11px; color: #aaa; text-transform: uppercase;
  letter-spacing: 1px; width: 100%; margin-bottom: 2px;
}
/* 专业标签（可点击） */
.tag {
  padding: 6px 16px; border-radius: 16px; font-size: 13px;
  background: #f0f0f0; color: #777; cursor: pointer; border: 1px solid #e0e0e0;
  transition: all 0.2s;
}
/* 标签悬停态 */
.tag:hover {
  background: var(--accent); color: #fff; border-color: var(--accent);
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(233,69,96,0.2);
}
/* 最近浏览标签（蓝色调） */
.tag-recent {
  background: #f0f7ff; color: #3498db; border-color: #c0dcf0;
}
.tag-recent:hover {
  background: #3498db; color: #fff; border-color: #3498db;
}
/* 高亮匹配文字 */
:deep(mark) {
  background: #ffe066; color: #555; border-radius: 2px; padding: 0 1px;
}
/* 无结果提示 */
.no-result { text-align: center; padding: 30px; color: #aaa; font-size: 15px; width: 100%; }
</style>
