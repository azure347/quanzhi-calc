<script setup>
import { computed } from 'vue'

const props = defineProps({
  subfields: { type: Array, required: true },
  current: { type: String, required: true }
})

const emit = defineEmits(['select'])
</script>

<template>
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
.dir-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.dir-tag {
  padding: 6px 16px; border-radius: 16px; font-size: 13px;
  background: #f5f5f5; color: #999; cursor: pointer; border: 1.5px solid #e0e0e0;
  transition: all 0.2s;
}
.dir-tag.active {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: #fff; border-color: #e67e22; font-weight: 600;
  box-shadow: 0 3px 10px rgba(230,126,34,0.25);
}
.dir-tag:hover:not(.active) { border-color: #e67e22; color: #e67e22; }
</style>