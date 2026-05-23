<script setup>
import { ref, computed, provide, watch, nextTick } from 'vue'
import data from './data/majors.json'

import SearchBar from './components/SearchBar.vue'
import ScoreCard from './components/ScoreCard.vue'
import RadarChart from './components/RadarChart.vue'
import DegreeToggle from './components/DegreeToggle.vue'
import SubfieldTags from './components/SubfieldTags.vue'
import WeightSliders from './components/WeightSliders.vue'
import AlternativesCard from './components/AlternativesCard.vue'
import DetailCard from './components/DetailCard.vue'
import Toast from './components/Toast.vue'
import RunningMan from './components/RunningMan.vue'

import { calculateIndex, getScoreSegment } from './composables/useCalculator.js'

// ── State ──
const currentMajorId = ref('cs')
const currentTier = ref('bachelor')
const currentSubfield = ref('通用')
const weights = ref([3, 3, 3, 3, 3, 3])
const searchInput = ref('')

// Easter egg counters
const toggleCount = ref(0)

// Toast ref
const toastRef = ref(null)
provide('showToast', (msg) => toastRef.value?.show(msg))

// ── Computed ──
const currentMajor = computed(() => data.majors.find(m => m.id === currentMajorId.value) || data.majors[0])

const tierData = computed(() => {
  const major = currentMajor.value
  const tier = major.tiers[currentTier.value]
  if (!tier.subfields[currentSubfield.value]) {
    currentSubfield.value = '通用'
  }
  return tier
})

const subfieldKeys = computed(() => Object.keys(tierData.value.subfields))

const scores = computed(() => {
  const sub = tierData.value.subfields[currentSubfield.value]
  return sub ? sub.scores : tierData.value.subfields['通用'].scores
})

const details = computed(() => {
  const sub = tierData.value.subfields[currentSubfield.value]
  return sub ? sub.details : tierData.value.subfields['通用'].details
})

const score = computed(() => calculateIndex(scores.value, weights.value))
const segment = computed(() => getScoreSegment(score.value, data.scoreSegments))

// ── Watch for easter eggs ──
watch(score, (newVal) => {
  if (newVal >= 90) {
    document.body.classList.add('shake', 'red-glow')
    setTimeout(() => {
      document.body.classList.remove('shake', 'red-glow')
    }, 2000)
  }
})

// ── Actions ──
function selectMajor(id) {
  currentMajorId.value = id
  currentTier.value = 'bachelor'
  currentSubfield.value = '通用'
  toggleCount.value = 0
  searchInput.value = ''
}

function changeTier(tier) {
  currentTier.value = tier
  currentSubfield.value = '通用'
  toggleCount.value++
  if (toggleCount.value >= 5) {
    nextTick(() => toastRef.value?.show('你都切了5次了，还没选好？兄弟你的人生需要果断！🤪'))
    toggleCount.value = 0
  }
}

function changeSubfield(sf) {
  currentSubfield.value = sf
}

function onWeightChange(idx, value) {
  // handled by v-model
}

function onSalaryMax() {
  nextTick(() => toastRef.value?.show('薪资拉到最高！看来你对工资真的很在意，但现实是...那你应该选计算机啊！'))
}

// Provide current state to children via provide
provide('currentMajor', currentMajor)
provide('currentTier', currentTier)
provide('currentSubfield', currentSubfield)
provide('scores', scores)
provide('weights', weights)
provide('segments', data.scoreSegments)
provide('dimensions', data.dimensions)
</script>

<template>
  <Toast ref="toastRef" />

  <!-- Header -->
  <div class="header">
    <h1>天坑劝退计算器</h1>
    <p class="sub">选专业有风险，入坑需谨慎 —— 测测你的福气指数</p>
  </div>

  <!-- Search -->
  <SearchBar
    :majors="data.majors"
    :modelValue="searchInput"
    @update:modelValue="searchInput = $event"
    @select="selectMajor"
  />

  <!-- Main -->
  <div class="main">
    <!-- Left Column -->
    <div class="left-col">
      <!-- Score Card -->
      <div class="card">
        <ScoreCard
          :major="currentMajor"
          :tier="currentTier"
          :subfield="currentSubfield"
          :weights="weights"
          :segments="data.scoreSegments"
        />
      </div>

      <!-- Degree Toggle -->
      <div class="card">
        <DegreeToggle
          :tier="currentTier"
          :tierRoast="tierData.roast"
          @change="changeTier"
        />
      </div>

      <!-- Toggle counter hint -->
      <div v-if="toggleCount >= 3" class="toggle-hint">
        你已经切换 {{ toggleCount }} 次了，差不多得了 😅
      </div>

      <!-- Subfield Tags -->
      <div class="card">
        <SubfieldTags
          :subfields="subfieldKeys"
          :current="currentSubfield"
          @select="changeSubfield"
        />
      </div>

      <!-- Detail Card -->
      <div class="card">
        <DetailCard :details="details" :subfield="currentSubfield" />
      </div>

      <!-- Running Man (score > 80) -->
      <div v-if="score > 80" class="card runner-card">
        <RunningMan />
      </div>
    </div>

    <!-- Right Column -->
    <div class="right-col">
      <!-- Radar Chart -->
      <div class="card">
        <RadarChart :scores="scores" :dimensions="data.dimensions" />
      </div>

      <!-- Weight Sliders -->
      <div class="card">
        <WeightSliders
          :dimensions="data.dimensions"
          :modelValue="weights"
          @update:modelValue="weights = $event"
          @salaryMax="onSalaryMax"
        />
      </div>

      <!-- Alternatives -->
      <div class="card">
        <AlternativesCard :alternatives="currentMajor.alternatives" />
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-emoji">😂</span>
    本计算器纯属娱乐，请勿当真 · 数据来源：知乎、小红书、脉脉、B站评论区
    <span class="footer-emoji">🎓</span>
  </div>
</template>

<style scoped>
.toggle-hint {
  text-align: center; font-size: 13px; color: #e67e22; padding: 8px;
  background: rgba(230,126,34,0.08); border-radius: 10px;
  animation: hintPulse 1s ease-in-out infinite;
}
@keyframes hintPulse {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.runner-card { padding: 12px 20px !important; }

@media (max-width: 720px) {
  .main { grid-template-columns: 1fr; }
}
</style>