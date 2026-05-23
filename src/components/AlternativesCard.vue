<script setup>
defineProps({
  alternatives: { type: Array, required: true }
})
</script>

<template>
  <div class="alter-wrap">
    <div class="alter-title">🔍 如果你非要选这个大类，不如考虑：</div>
    <div class="alter-grid">
      <div v-for="a in alternatives" :key="a.name" class="alter-card" :class="{ green: a.is_green_flag }">
        <div class="alter-name">{{ a.is_green_flag ? '👍' : '🤔' }} {{ a.name }}</div>
        <div class="alter-cat">{{ a.category }}</div>
        <div class="alter-salary">💰 {{ a.typical_salary }}</div>
        <div class="alter-roast">💬 {{ a.roast }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alter-wrap { margin-top: 4px; }
.alter-title { font-size: 14px; font-weight: 700; color: #333; margin-bottom: 10px; }
.alter-grid { display: flex; flex-direction: column; gap: 8px; }
.alter-card {
  padding: 12px 14px; border-radius: 10px; background: #fafafa;
  border: 1px solid #eee; transition: all 0.2s;
}
.alter-card:hover { background: #fff; border-color: #ddd; box-shadow: 0 3px 12px rgba(0,0,0,0.05); }
.alter-card.green { border-left: 3px solid #2ecc71; }
.alter-card:not(.green) { border-left: 3px solid #e67e22; }
.alter-name { font-weight: 700; font-size: 14px; color: #2d3436; }
.alter-cat { font-size: 11px; color: #aaa; margin-top: 2px; }
.alter-salary { font-size: 13px; color: #e67e22; font-weight: 600; margin-top: 4px; }
.alter-roast { font-size: 12px; color: #888; margin-top: 4px; font-style: italic; }
</style>