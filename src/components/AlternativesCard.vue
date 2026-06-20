<script setup>
/**
 * AlternativesCard.vue — 替代专业推荐卡片
 *
 * 职责：
 * 1. 展示当前专业的替代专业推荐列表
 * 2. 每个替代专业显示：名称、分类、典型薪资、吐槽语
 * 3. 标记"绿牌"专业（is_green_flag = true），表示相对较好的替代选择
 * 4. 为替代专业添加不同的左侧边框颜色区分
 */

defineProps({
  alternatives: { type: Array, required: true } // 替代专业数组，每个元素包含 name, category, typical_salary, roast, is_green_flag
})
</script>

<template>
  <div class="alter-wrap">
    <!-- 卡片标题 -->
    <div class="alter-title">🔍 如果你非要选这个大类，不如考虑：</div>

    <!-- 替代专业卡片列表 -->
    <div class="alter-grid">
      <div
        v-for="a in alternatives"
        :key="a.name"
        class="alter-card"
        :class="{ green: a.is_green_flag }"
      >
        <!-- 专业名称（绿牌显示 👍，普通显示 🤔） -->
        <div class="alter-name">{{ a.is_green_flag ? '👍' : '🤔' }} {{ a.name }}</div>
        <!-- 专业分类 -->
        <div class="alter-cat">{{ a.category }}</div>
        <!-- 典型薪资 -->
        <div class="alter-salary">💰 {{ a.typical_salary }}</div>
        <!-- 吐槽语 -->
        <div class="alter-roast">💬 {{ a.roast }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alter-wrap { margin-top: 4px; }
/* 标题 */
.alter-title { font-size: 14px; font-weight: 700; color: #333; margin-bottom: 10px; }
/* 卡片网格容器 */
.alter-grid { display: flex; flex-direction: column; gap: 8px; }
/* 单张卡片基础样式 */
.alter-card {
  padding: 12px 14px; border-radius: 10px; background: #fafafa;
  border: 1px solid #eee; transition: all 0.2s;
}
.alter-card:hover { background: #fff; border-color: #ddd; box-shadow: 0 3px 12px rgba(0,0,0,0.05); }
/* 绿牌（推荐）卡片左侧高亮边框 */
.alter-card.green { border-left: 3px solid #2ecc71; }
/* 普通卡片左侧边框 */
.alter-card:not(.green) { border-left: 3px solid #e67e22; }
/* 专业名称 */
.alter-name { font-weight: 700; font-size: 14px; color: #2d3436; }
/* 专业分类 */
.alter-cat { font-size: 11px; color: #aaa; margin-top: 2px; }
/* 典型薪资 */
.alter-salary { font-size: 13px; color: #e67e22; font-weight: 600; margin-top: 4px; }
/* 吐槽语 */
.alter-roast { font-size: 12px; color: #888; margin-top: 4px; font-style: italic; }
</style>
