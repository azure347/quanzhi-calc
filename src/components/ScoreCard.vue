<script setup>
import { computed } from 'vue'
import { calculateIndex, getScoreSegment } from '../composables/useCalculator.js'

const props = defineProps({
  major: { type: Object, required: true },
  tier: { type: String, required: true },
  subfield: { type: String, required: true },
  weights: { type: Array, required: true },
  segments: { type: Array, required: true }
})

const scores = computed(() => {
  const t = props.major.tiers[props.tier]
  return (t.subfields[props.subfield] || t.subfields['通用']).scores
})

const score = computed(() => calculateIndex(scores.value, props.weights))
const segment = computed(() => getScoreSegment(score.value, props.segments))

const barStyle = computed(() => ({
  width: score.value + '%',
  background: `linear-gradient(90deg, #2ecc71, #e67e22, ${segment.value.color})`
}))
</script>

<template>
  <div class="score-section">
    <div class="score-label">劝退指数</div>
    <div class="major-name-row">
      <span class="major-name">{{ major.name }}</span>
      <span class="major-cat">{{ major.categoryEmoji }} {{ major.category }}</span>
    </div>
    <div class="score-row">
      <div class="score-number" :style="{ color: segment.color }">{{ score }}</div>
      <span class="flee-tag" :class="{ show: score > 80 }">快跑！</span>
    </div>
    <div class="score-bar-wrap"><div class="score-bar-fill" :style="barStyle"></div></div>
    <div class="score-comment">
      <span>{{ segment.text }}</span>
      <span class="score-emoji">{{ segment.emoji }}</span>
    </div>
    <div class="major-roast">💬 {{ major.roast }}</div>
  </div>
</template>

<style scoped>
.score-section { text-align: center; position: relative; }
.score-label { font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 2px; }
.major-name-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px 0; }
.major-name { font-size: 1.2em; font-weight: 700; }
.major-cat { font-size: 12px; color: #aaa; background: #f5f5f5; padding: 2px 10px; border-radius: 10px; }
.score-row { display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; }
.score-number { font-size: 5em; font-weight: 900; line-height: 1; transition: color 0.5s; }
.flee-tag {
  display: none; background: #e94560; color: #fff; font-size: 13px; font-weight: 900;
  padding: 5px 14px; border-radius: 12px; animation: fleeShake 0.3s ease-in-out infinite;
  white-space: nowrap; box-shadow: 0 3px 10px rgba(233,69,96,0.3);
}
.flee-tag.show { display: inline-block; }
@keyframes fleeShake {
  0%,100% { transform: rotate(0) scale(1); }
  25% { transform: rotate(-6deg) scale(1.08); }
  75% { transform: rotate(6deg) scale(1.08); }
}
.score-bar-wrap { height: 10px; background: #e8e8e8; border-radius: 5px; margin: 10px 0; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
.score-comment { font-size: 15px; color: #555; margin-top: 4px; line-height: 1.6; font-style: italic; }
.score-emoji { font-size: 22px; margin-left: 4px; vertical-align: middle; }
.major-roast {
  font-size: 13px; color: #d63031; text-align: center; padding: 8px 10px;
  background: rgba(233,69,96,0.04); border-radius: 10px;
  border-left: 3px solid #e94560; margin-top: 8px; line-height: 1.5;
}

@media (max-width: 720px) {
  .score-number { font-size: 3.5em; }
}
</style>