<script setup>
const props = defineProps({
  tier: { type: String, required: true },
  tierRoast: { type: String, default: '' }
})

const emit = defineEmits(['change'])

const levels = [
  { key: 'bachelor', label: '本科', emoji: '🎓' },
  { key: 'master', label: '硕士', emoji: '📚' },
  { key: 'doctor', label: '博士', emoji: '🔬' }
]
</script>

<template>
  <div class="level-switch">
    <button
      v-for="l in levels" :key="l.key"
      class="level-btn"
      :class="{ active: tier === l.key }"
      @click="emit('change', l.key)"
    >{{ l.emoji }} {{ l.label }}</button>
  </div>
  <div class="level-hint">
    <template v-if="tier === 'bachelor'">本科：月薪5000妈说你没出息</template>
    <template v-else-if="tier === 'master'">硕士：月薪12000妈说隔壁王阿姨儿子本科就15000了</template>
    <template v-else>博士：月薪30000妈说你还没对象</template>
  </div>
  <div class="tier-roast" v-if="tierRoast">{{ tierRoast }}</div>
</template>

<style scoped>
.level-switch { display: flex; gap: 8px; justify-content: center; margin: 8px 0; }
.level-btn {
  padding: 8px 22px; border-radius: 20px; border: 1.5px solid #ddd;
  background: #f8f8f8; color: #999; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}
.level-btn.active {
  background: linear-gradient(135deg, #e94560, #d63031);
  color: #fff; border-color: #e94560;
  box-shadow: 0 4px 14px rgba(233,69,96,0.25);
}
.level-btn:hover:not(.active) { border-color: #bbb; color: #555; background: #f0f0f0; }
.level-hint { text-align: center; font-size: 12px; color: #aaa; margin-top: 2px; min-height: 18px; }
.tier-roast { text-align: center; font-size: 12px; color: #d63031; margin-top: 4px; font-style: italic; min-height: 18px; padding: 0 10px; }
</style>