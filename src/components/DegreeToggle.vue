<script setup>
/**
 * DegreeToggle.vue — 学历层次切换组件
 *
 * 职责：
 * 1. 提供本科/硕士/博士 三个学历层次的切换按钮
 * 2. 每个层次显示对应的"吐槽"提示语
 * 3. 显示当前学历层次特有的吐槽文案（tierRoast）
 *
 * 学历层次说明：
 * - 本科：月薪5000妈说你没出息
 * - 硕士：月薪12000妈说隔壁王阿姨儿子本科就15000了
 * - 博士：月薪30000妈说你还没对象
 */

const props = defineProps({
  tier: { type: String, required: true },      // 当前选中的学历层次
  tierRoast: { type: String, default: '' }       // 当前专业在该学历层次的吐槽语
})

const emit = defineEmits(['change'])

// 学历层次配置数组
const levels = [
  { key: 'bachelor', label: '本科', emoji: '🎓' },  // 本科层次
  { key: 'master', label: '硕士', emoji: '📚' },   // 硕士层次
  { key: 'doctor', label: '博士', emoji: '🔬' }    // 博士层次
]
</script>

<template>
  <!-- 学历层次切换按钮组 -->
  <div class="level-switch">
    <button
      v-for="l in levels" :key="l.key"
      class="level-btn"
      :class="{ active: tier === l.key }"
      @click="emit('change', l.key)"
    >{{ l.emoji }} {{ l.label }}</button>
  </div>

  <!-- 各层次的调侃提示语 -->
  <div class="level-hint">
    <template v-if="tier === 'bachelor'">本科：月薪5000妈说你没出息</template>
    <template v-else-if="tier === 'master'">硕士：月薪12000妈说隔壁王阿姨儿子本科就15000了</template>
    <template v-else>博士：月薪30000妈说你还没对象</template>
  </div>

  <!-- 该专业在该学历层次的吐槽语（如有） -->
  <div class="tier-roast" v-if="tierRoast">{{ tierRoast }}</div>
</template>

<style scoped>
/* 切换按钮组 */
.level-switch { display: flex; gap: 8px; justify-content: center; margin: 8px 0; }
/* 按钮基础样式 */
.level-btn {
  padding: 8px 22px; border-radius: 20px; border: 1.5px solid #ddd;
  background: #f8f8f8; color: #999; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}
/* 激活态按钮（渐变背景） */
.level-btn.active {
  background: linear-gradient(135deg, #e94560, #d63031);
  color: #fff; border-color: #e94560;
  box-shadow: 0 4px 14px rgba(233,69,96,0.25);
}
/* 悬停态（非激活按钮） */
.level-btn:hover:not(.active) { border-color: #bbb; color: #555; background: #f0f0f0; }
/* 调侃提示语 */
.level-hint { text-align: center; font-size: 12px; color: #aaa; margin-top: 2px; min-height: 18px; }
/* 专业吐槽语 */
.tier-roast { text-align: center; font-size: 12px; color: #d63031; margin-top: 4px; font-style: italic; min-height: 18px; padding: 0 10px; }
</style>
