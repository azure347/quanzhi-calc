<script setup>
import { ref, reactive, computed, provide, watch, nextTick, onMounted } from 'vue'
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
import TourGuide from './components/TourGuide.vue'
import CompareCard from './components/CompareCard.vue'
import ShareCard from './components/ShareCard.vue'

import { calculateIndex, getScoreSegment } from './composables/useCalculator.js'
import { usePersistence } from './composables/usePersistence.js'
import { useUrlSync } from './composables/useUrlSync.js'

// ── State ──
const state = reactive({
  currentMajorId: 'cs',
  currentTier: 'bachelor',
  currentSubfield: '通用',
  weights: [3, 3, 3, 3, 3, 3, 3, 3, 3],
  compareList: [],
  favorites: [],
  recentMajors: [],
  theme: 'light'
})
usePersistence(state)
useUrlSync(state)

// Theme init
onMounted(() => {
  if (state.theme === 'dark') {
    document.body.classList.add('dark')
  }
})

// Tour
const showTour = ref(!localStorage.getItem('quanzhi-tour-done') && !window.location.search)
const tourStep = ref(0)
const showShareCard = ref(false)

const searchInput = ref('')

// Easter egg counters
const toggleCount = ref(0)

// Toast ref
const toastRef = ref(null)
provide('showToast', (msg) => toastRef.value?.show(msg))

const currentMajorId = computed(() => state.currentMajorId)
const currentTier = computed(() => state.currentTier)
const currentSubfield = computed(() => state.currentSubfield)
const weights = computed({
  get: () => state.weights,
  set: (v) => { state.weights = v }
})

// ── Computed ──
const currentMajor = computed(() => data.majors.find(m => m.id === state.currentMajorId) || data.majors[0])

const tierData = computed(() => {
  const major = currentMajor.value
  const tier = major.tiers[state.currentTier]
  if (!tier.subfields[state.currentSubfield]) {
    state.currentSubfield = '通用'
  }
  return tier
})

const subfieldKeys = computed(() => Object.keys(tierData.value.subfields))

const scores = computed(() => {
  const sub = tierData.value.subfields[state.currentSubfield]
  return sub ? sub.scores : tierData.value.subfields['通用'].scores
})

const details = computed(() => {
  const sub = tierData.value.subfields[state.currentSubfield]
  return sub ? sub.details : tierData.value.subfields['通用'].details
})

const score = computed(() => calculateIndex(scores.value, state.weights))
const segment = computed(() => getScoreSegment(score.value, data.scoreSegments))

const isFavorited = computed(() => state.favorites.includes(state.currentMajorId))

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
  state.currentMajorId = id
  state.currentTier = 'bachelor'
  state.currentSubfield = '通用'
  toggleCount.value = 0
  searchInput.value = ''
  addRecentMajor(id)
}

function changeTier(tier) {
  state.currentTier = tier
  state.currentSubfield = '通用'
  toggleCount.value++
  if (toggleCount.value >= 5) {
    nextTick(() => toastRef.value?.show('你都切了5次了，还没选好？兄弟你的人生需要果断！🤪'))
    toggleCount.value = 0
  }
}

function changeSubfield(sf) {
  state.currentSubfield = sf
}

function onWeightChange(idx, value) {
  // handled by v-model
}

function onSalaryMax() {
  nextTick(() => toastRef.value?.show('薪资拉到最高！看来你对工资真的很在意，但现实是...那你应该选计算机啊！'))
}

function nextTourStep() {
  if (tourStep.value < 2) {
    tourStep.value++
  } else {
    showTour.value = false
    localStorage.setItem('quanzhi-tour-done', '1')
  }
}

function addCompareMajor(id) {
  if (state.compareList.length >= 3 || state.compareList.includes(id)) return
  state.compareList.push(id)
}

function removeCompareMajor(id) {
  state.compareList = state.compareList.filter(mid => mid !== id)
}

function toggleFavorite() {
  const id = state.currentMajorId
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(f => f !== id)
  } else {
    state.favorites.push(id)
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light'
  document.body.classList.toggle('dark', state.theme === 'dark')
}

function addRecentMajor(id) {
  state.recentMajors = [id, ...state.recentMajors.filter(r => r !== id)].slice(0, 3)
}

function copyShareUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    toastRef.value?.show('链接已复制，快去分享给朋友吧！')
  })
}

function openShareCard() {
  showShareCard.value = true
}

const tierLabel = computed(() => data.tierConfig[state.currentTier]?.label || '本科')

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
  <TourGuide v-if="showTour" :step="tourStep" :onClose="nextTourStep" />
  <ShareCard v-if="showShareCard" :major="currentMajor" :score="score" :segment="segment" :tier="tierLabel" @close="showShareCard = false" />

  <!-- Header -->
  <div class="header">
    <h1>天坑劝退计算器</h1>
    <p class="sub">选专业有风险，入坑需谨慎 —— 测测你的福气指数</p>
    <div class="header-actions">
      <button class="icon-btn" @click="toggleTheme" :title="state.theme === 'light' ? '深色模式' : '浅色模式'">
        {{ state.theme === 'light' ? '🌙' : '☀️' }}
      </button>
      <button
        class="icon-btn"
        @click="toggleFavorite"
        :class="{ active: isFavorited }"
        :title="isFavorited ? '取消收藏' : '收藏'"
      >
        {{ isFavorited ? '⭐' : '☆' }}
      </button>
      <button class="icon-btn" @click="copyShareUrl" title="分享链接">🔗</button>
      <button class="icon-btn" @click="openShareCard" title="分享卡片">🖼️</button>
    </div>
  </div>

  <!-- Favorites Drawer -->
  <div v-if="state.favorites.length > 0" class="fav-drawer">
    <div class="fav-label">我的收藏</div>
    <div class="fav-chips">
      <span
        v-for="fid in state.favorites"
        :key="fid"
        class="fav-chip"
        :class="{ current: fid === state.currentMajorId }"
        @click="selectMajor(fid)"
      >
        {{ data.majors.find(m => m.id === fid)?.name || fid }}
        <span class="fav-remove" @click.stop="state.favorites = state.favorites.filter(f => f !== fid)">×</span>
      </span>
    </div>
  </div>

  <!-- Search -->
  <SearchBar
    :majors="data.majors"
    :recentMajors="state.recentMajors"
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
          :isFavorited="isFavorited"
          @toggleFavorite="toggleFavorite"
          @addCompare="addCompareMajor(currentMajor.id)"
        />
      </div>

      <!-- Compare Card (shown when compareList has items) -->
      <div v-if="state.compareList.length > 0" class="card">
        <CompareCard
          :compareList="state.compareList"
          :weights="state.weights"
          @remove="removeCompareMajor"
          @select="selectMajor"
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
.header { text-align: center; padding: 28px 20px 8px; position: relative; z-index: 1; }
.header h1 {
  font-size: 2.4em; font-weight: 900;
  background: linear-gradient(135deg, #e94560, #e67e22, #e94560);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin-bottom: 6px;
}
.header .sub { font-size: 1.1em; color: #999; letter-spacing: 1px; }
.header-actions {
  position: absolute; right: 20px; top: 28px;
  display: flex; gap: 8px;
}
.icon-btn {
  background: rgba(255,255,255,0.8); border: 1px solid #e0e0e0;
  border-radius: 20px; padding: 6px 12px; font-size: 16px; cursor: pointer;
  transition: all 0.2s; line-height: 1;
}
.icon-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.icon-btn.active { background: #fff3e0; border-color: #e67e22; }

.fav-drawer {
  max-width: 560px; margin: 10px auto 0; padding: 0 16px;
  display: flex; align-items: center; gap: 10px; position: relative; z-index: 1;
  flex-wrap: wrap;
}
.fav-label { font-size: 13px; color: #e67e22; font-weight: 600; white-space: nowrap; }
.fav-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fav-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: 14px; font-size: 13px;
  background: #fff3e0; color: #e67e22; border: 1px solid #f0dcc0;
  cursor: pointer; transition: all 0.2s;
}
.fav-chip:hover { background: #ffe0b2; }
.fav-chip.current { background: #e67e22; color: #fff; border-color: #e67e22; }
.fav-remove { font-size: 16px; line-height: 1; margin-left: 2px; }

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
  .header h1 { font-size: 1.6em; }
  .header { padding: 20px 16px 8px; }
  .header-actions { position: static; margin-top: 8px; justify-content: center; }
}
</style>