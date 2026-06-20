<script setup>
/**
 * SubfieldTags.vue — 专业方向（子方向）标签选择组件
 *
 * 职责：
 * 1. 展示当前专业在特定学历层次下的所有子方向
 * 2. 支持点击切换当前子方向
 * 3. 当前选中的子方向显示高亮样式
 *
 * 示例：计算机科学与技术专业在本科层次下有"通用"、"人工智能"、"网络安全"等方向
 */

const props = defineProps({
  subfields: { type: Array, required: true }, // 子方向名称数组，如 ['通用', '人工智能', '金融科技']
  current: { type: String, required: true }   // 当前选中的子方向名称
})

const emit = defineEmits(['select'])  // 选中子方向时触发
</script>

<template>
  <!-- 子方向标签容器 -->
  <div class="dir-tags">
    <span
      v-for="sf in subfields" :key="sf"
      class="dir-tag"
      :class="{ active: sf === current }"
      @click="emit('select', sf)"
    >{{ sf }}</span>
  </div>
</template>

<style scoped>
/* 标签容器（flex 布局自动换行） */
.dir-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
/* 标签基础样式 */
.dir-tag {
  padding: 6px 16px; border-radius: 16px; font-size: 13px;
  background: #f5f5f5; color: #999; cursor: pointer; border: 1.5px solid #e0e0e0;
  transition: all 0.2s;
}
/* 激活态（选中）标签 */
.dir-tag.active {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: #fff; border-color: #e67e22; font-weight: 600;
  box-shadow: 0 3px 10px rgba(230,126,34,0.25);
}
/* 悬停态（非激活） */
.dir-tag:hover:not(.active) { border-color: #e67e22; color: #e67e22; }
</style>
