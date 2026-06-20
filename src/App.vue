<script setup>
/**
 * App.vue — 天坑劝退计算器主组件
 *
 * 职责概述：
 * 1. 管理全局应用状态（当前专业、学历层次、方向、权重、收藏、对比列表等）
 * 2. 协调各子组件之间的数据传递
 * 3. 处理用户交互事件（切换专业、调整权重、主题切换等）
 * 4. 集成本地存储持久化（usePersistence）和 URL 同步（useUrlSync）功能
 */

import { ref, reactive, computed, provide, watch, nextTick, onMounted } from 'vue'
import data from './data/majors.json'

// ============================================================
// 组件导入
// ============================================================
import SearchBar from './components/SearchBar.vue'          // 搜索框组件
import ScoreCard from './components/ScoreCard.vue'          // 分数展示卡片
import RadarChart from './components/RadarChart.vue'       // 雷达图组件
import DegreeToggle from './components/DegreeToggle.vue'    // 学历切换组件
import SubfieldTags from './components/SubfieldTags.vue'    // 方向标签组件
import WeightSliders from './components/WeightSliders.vue'  // 权重滑块组件
import AlternativesCard from './components/AlternativesCard.vue' // 替代专业推荐卡片
import DetailCard from './components/DetailCard.vue'        // 详细数据展示卡片
import Toast from './components/Toast.vue'                  // 轻提示组件
import RunningMan from './components/RunningMan.vue'       // 跑步小人动画（高分时显示）
import TourGuide from './components/TourGuide.vue'          // 新手引导组件
import CompareCard from './components/CompareCard.vue'      // 专业对比表格
import ShareCard from './components/ShareCard.vue'          // 分享卡片弹窗
import Leaderboard from './components/Leaderboard.vue'      // 天坑排行榜弹窗
import Danmaku from './components/Danmaku.vue'             // 弹幕效果背景

// ============================================================
// 工具函数导入
// ============================================================
import { calculateIndex, getScoreSegment } from './composables/useCalculator.js'
import { usePersistence } from './composables/usePersistence.js'
import { useUrlSync } from './composables/useUrlSync.js'

// ============================================================
// 全局状态定义
// ============================================================
const state = reactive({
  currentMajorId: 'cs',           // 当前选中专业的ID（默认为计算机科学与技术）
  currentTier: 'bachelor',        // 当前学历层次：bachelor(本科)/master(硕士)/doctor(博士)
  currentSubfield: '通用',        // 当前专业方向（如"通用"、"人工智能"等）
  weights: [3, 3, 3, 3, 3, 3, 3, 3, 3], // 各维度权重数组，共9个维度
  compareList: [],                // 对比列表，最多添加3个专业进行比较
  favorites: [],                  // 收藏列表，存储专业ID
  recentMajors: [],               // 最近浏览的专业ID列表，最多保留3个
  theme: 'light'                  // 主题：light(浅色)/dark(深色)
})

// 启用本地存储持久化（自动保存/恢复状态）
usePersistence(state)

// 启用 URL 同步（支持分享链接）
useUrlSync(state)

// ============================================================
// 生命周期：主题初始化
// ============================================================
onMounted(() => {
  // 如果上次保存的主题是深色模式，则在 body 上添加 dark 类
  if (state.theme === 'dark') {
    document.body.classList.add('dark')
  }
})

// ============================================================
// 新手引导状态
// ============================================================
const showTour = ref(!localStorage.getItem('quanzhi-tour-done') && !window.location.search) // 首次访问且无URL参数时显示引导
const tourStep = ref(0)             // 当前引导步骤（0/1/2）
const showShareCard = ref(false)   // 分享卡片弹窗显示状态
const showLeaderboard = ref(false) // 排行榜弹窗显示状态

// 搜索框输入值
const searchInput = ref('')

// ============================================================
// 彩蛋计数器
// ============================================================
const toggleCount = ref(0)  // 统计用户切换学历层次的次数，用于触发彩蛋提示

// ============================================================
// Toast 组件引用
// ============================================================
const toastRef = ref(null)

/**
 * 显示轻提示的快捷方法
 * 通过 provide 向下传递给所有子组件使用
 * @param {string} msg - 要显示的提示文本
 */
provide('showToast', (msg) => toastRef.value?.show(msg))

// ============================================================
// 计算属性：状态数据的便捷访问
// ============================================================
const currentMajorId = computed(() => state.currentMajorId)
const currentTier = computed(() => state.currentTier)
const currentSubfield = computed(() => state.currentSubfield)
const weights = computed({
  get: () => state.weights,
  set: (v) => { state.weights = v }
})

// ============================================================
// 计算属性：派生数据
// ============================================================

/**
 * 当前选中专业的完整数据对象
 * 如果找不到对应ID，则默认返回第一个专业（计算机科学与技术）
 */
const currentMajor = computed(() => data.majors.find(m => m.id === state.currentMajorId) || data.majors[0])

/**
 * 当前学历层次的数据（包含 subfields、roast 等）
 * 同时处理边界情况：如果当前方向在新的学历层次中不存在，则回退到"通用"
 */
const tierData = computed(() => {
  const major = currentMajor.value
  const tier = major.tiers[state.currentTier]
  // 如果当前子方向在新的学历层次中不存在，重置为"通用"
  if (!tier.subfields[state.currentSubfield]) {
    state.currentSubfield = '通用'
  }
  return tier
})

/**
 * 当前学历层次下所有子方向的键名数组
 * 用于渲染方向标签和渲染子方向选择器
 */
const subfieldKeys = computed(() => Object.keys(tierData.value.subfields))

/**
 * 当前选中子方向的各项维度得分
 * 如果当前子方向不存在，回退到"通用"子方向
 */
const scores = computed(() => {
  const sub = tierData.value.subfields[state.currentSubfield]
  return sub ? sub.scores : tierData.value.subfields['通用'].scores
})

/**
 * 当前选中子方向的详细描述数据
 * 包含就业率、薪资、典型岗位、工作环境、行业趋势等
 */
const details = computed(() => {
  const sub = tierData.value.subfields[state.currentSubfield]
  return sub ? sub.details : tierData.value.subfields['通用'].details
})

/**
 * 当前劝退指数（加权平均分）
 * 由 useCalculator 模块的 calculateIndex 函数计算得出
 */
const score = computed(() => calculateIndex(scores.value, state.weights))

/**
 * 当前分数对应的评分区间
 * 包含文案（如"劝退"）、颜色、emoji 等展示信息
 */
const segment = computed(() => getScoreSegment(score.value, data.scoreSegments))

/**
 * 当前专业是否已被收藏
 * 用于切换收藏按钮的图标和样式
 */
const isFavorited = computed(() => state.favorites.includes(state.currentMajorId))

// ============================================================
// 监听器：彩蛋效果
// ============================================================
watch(score, (newVal) => {
  // 当分数 >= 90 时，触发页面抖动 + 红色发光效果（持续2秒）
  if (newVal >= 90) {
    document.body.classList.add('shake', 'red-glow')
    setTimeout(() => {
      document.body.classList.remove('shake', 'red-glow')
    }, 2000)
  }
})

// ============================================================
// 动作函数：用户交互处理
// ============================================================

/**
 * 选择一个专业
 * 重置学历层次为本科、方向为通用、清零切换计数器
 * 同时将专业添加到最近浏览列表
 * @param {string} id - 专业的唯一标识符
 */
function selectMajor(id) {
  state.currentMajorId = id
  state.currentTier = 'bachelor'
  state.currentSubfield = '通用'
  toggleCount.value = 0
  searchInput.value = ''
  addRecentMajor(id)
}

/**
 * 切换学历层次
 * 重置子方向为"通用"，增加切换计数器
 * 切换5次后显示彩蛋提示
 * @param {string} tier - 学历层次：bachelor/master/doctor
 */
function changeTier(tier) {
  state.currentTier = tier
  state.currentSubfield = '通用'
  toggleCount.value++
  if (toggleCount.value >= 5) {
    nextTick(() => toastRef.value?.show('你都切了5次了，还没选好？兄弟你的人生需要果断！🤪'))
    toggleCount.value = 0
  }
}

/**
 * 切换专业方向（子方向）
 * @param {string} sf - 子方向名称，如"人工智能"、"金融科技"等
 */
function changeSubfield(sf) {
  state.currentSubfield = sf
}

/**
 * 权重滑块变化时的回调（v-model 模式）
 * 此函数为空，实际处理在 v-model 双向绑定中完成
 * @param {number} idx - 维度索引
 * @param {number} value - 新的权重值
 */
function onWeightChange(idx, value) {
  // handled by v-model
}

/**
 * 用户将薪资权重拉到最高（5）时的彩蛋提示
 * 调侃用户对工资的在意程度
 */
function onSalaryMax() {
  nextTick(() => toastRef.value?.show('薪资拉到最高！看来你对工资真的很在意，但现实是...那你应该选计算机啊！'))
}

/**
 * 新手引导：进入下一步
 * 最后一步时关闭引导并标记已完成
 */
function nextTourStep() {
  if (tourStep.value < 2) {
    tourStep.value++
  } else {
    showTour.value = false
    localStorage.setItem('quanzhi-tour-done', '1')
  }
}

/**
 * 添加专业到对比列表
 * 最多添加3个，且不能重复添加
 * @param {string} id - 专业ID
 */
function addCompareMajor(id) {
  if (state.compareList.length >= 3 || state.compareList.includes(id)) return
  state.compareList.push(id)
}

/**
 * 从对比列表移除专业
 * @param {string} id - 要移除的专业ID
 */
function removeCompareMajor(id) {
  state.compareList = state.compareList.filter(mid => mid !== id)
}

/**
 * 切换当前专业的收藏状态
 * 如果已收藏则取消收藏，否则添加收藏
 */
function toggleFavorite() {
  const id = state.currentMajorId
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(f => f !== id)
  } else {
    state.favorites.push(id)
  }
}

/**
 * 切换浅色/深色主题
 * 同时更新 body 元素的 class 以应用主题样式
 */
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light'
  document.body.classList.toggle('dark', state.theme === 'dark')
}

/**
 * 添加专业到最近浏览列表
 * 如果已存在则移动到列表最前面，最多保留3个
 * @param {string} id - 专业ID
 */
function addRecentMajor(id) {
  state.recentMajors = [id, ...state.recentMajors.filter(r => r !== id)].slice(0, 3)
}

/**
 * 复制当前页面 URL 到剪贴板
 * 用于分享功能
 */
function copyShareUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    toastRef.value?.show('链接已复制，快去分享给朋友吧！')
  })
}

/**
 * 打开分享卡片弹窗
 */
function openShareCard() {
  showShareCard.value = true
}

/**
 * 当前学历层次的中文标签
 * 用于在分享卡片等地方显示
 */
const tierLabel = computed(() => data.tierConfig[state.currentTier]?.label || '本科')

// ============================================================
// 依赖注入：向子组件提供共享数据
// ============================================================
provide('currentMajor', currentMajor)
provide('currentTier', currentTier)
provide('currentSubfield', currentSubfield)
provide('scores', scores)
provide('weights', weights)
provide('segments', data.scoreSegments)
provide('dimensions', data.dimensions)
</script>

<template>
  <!-- 轻提示组件（全局只渲染一次） -->
  <Toast ref="toastRef" />

  <!-- 弹幕背景效果 -->
  <Danmaku />

  <!-- 新手引导遮罩层 -->
  <TourGuide v-if="showTour" :step="tourStep" :onClose="nextTourStep" />

  <!-- 分享卡片弹窗 -->
  <ShareCard v-if="showShareCard" :major="currentMajor" :score="score" :segment="segment" :tier="tierLabel" @close="showShareCard = false" />

  <!-- 天坑排行榜弹窗 -->
  <Leaderboard v-if="showLeaderboard" @close="showLeaderboard = false" />

  <!-- ============================================================
       页面头部区域
       ============================================================ -->
  <div class="header">
    <!-- 应用标题 -->
    <h1>天坑劝退计算器</h1>
    <!-- 副标题/口号 -->
    <p class="sub">选专业有风险，入坑需谨慎 —— 测测你的福气指数</p>
    <!-- 头部操作按钮区 -->
    <div class="header-actions">
      <!-- 主题切换按钮 -->
      <button class="icon-btn" @click="toggleTheme" :title="state.theme === 'light' ? '深色模式' : '浅色模式'">
        {{ state.theme === 'light' ? '🌙' : '☀️' }}
      </button>
      <!-- 收藏按钮 -->
      <button
        class="icon-btn"
        @click="toggleFavorite"
        :class="{ active: isFavorited }"
        :title="isFavorited ? '取消收藏' : '收藏'"
      >
        {{ isFavorited ? '⭐' : '☆' }}
      </button>
      <!-- 复制链接按钮 -->
      <button class="icon-btn" @click="copyShareUrl" title="分享链接">🔗</button>
      <!-- 分享卡片按钮 -->
      <button class="icon-btn" @click="openShareCard" title="分享卡片">🖼️</button>
      <!-- 排行榜按钮 -->
      <button class="icon-btn" @click="showLeaderboard = true" title="天坑排行">🏆</button>
    </div>
  </div>

  <!-- ============================================================
       收藏抽屉区域
       仅当有收藏专业时显示
       ============================================================ -->
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
        <!-- 移除收藏按钮（阻止冒泡） -->
        <span class="fav-remove" @click.stop="state.favorites = state.favorites.filter(f => f !== fid)">×</span>
      </span>
    </div>
  </div>

  <!-- ============================================================
       搜索栏区域
       ============================================================ -->
  <SearchBar
    :majors="data.majors"
    :recentMajors="state.recentMajors"
    :modelValue="searchInput"
    @update:modelValue="searchInput = $event"
    @select="selectMajor"
  />

  <!-- ============================================================
       主内容区域（左右两栏布局）
       ============================================================ -->
  <div class="main">
    <!-- 左栏：核心信息展示 -->
    <div class="left-col">
      <!-- 劝退分数卡片 -->
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

      <!-- 专业对比卡片（仅当对比列表有内容时显示） -->
      <div v-if="state.compareList.length > 0" class="card">
        <CompareCard
          :compareList="state.compareList"
          :weights="state.weights"
          @remove="removeCompareMajor"
          @select="selectMajor"
        />
      </div>

      <!-- 学历层次切换 -->
      <div class="card">
        <DegreeToggle
          :tier="currentTier"
          :tierRoast="tierData.roast"
          @change="changeTier"
        />
      </div>

      <!-- 切换次数提示（切换3次以上时显示） -->
      <div v-if="toggleCount >= 3" class="toggle-hint">
        你已经切换 {{ toggleCount }} 次了，差不多得了 😅
      </div>

      <!-- 子方向标签选择 -->
      <div class="card">
        <SubfieldTags
          :subfields="subfieldKeys"
          :current="currentSubfield"
          @select="changeSubfield"
        />
      </div>

      <!-- 详细数据展示 -->
      <div class="card">
        <DetailCard :details="details" :subfield="currentSubfield" />
      </div>

      <!-- 跑步小人动画（分数 > 80 时显示） -->
      <div v-if="score > 80" class="card runner-card">
        <RunningMan />
      </div>
    </div>

    <!-- 右栏：可视化与调节 -->
    <div class="right-col">
      <!-- 雷达图（6维能力图 + 3个新维度仪表盘） -->
      <div class="card">
        <RadarChart :scores="scores" :dimensions="data.dimensions" />
      </div>

      <!-- 权重调节滑块 -->
      <div class="card">
        <WeightSliders
          :dimensions="data.dimensions"
          :modelValue="weights"
          @update:modelValue="weights = $event"
          @salaryMax="onSalaryMax"
        />
      </div>

      <!-- 替代专业推荐 -->
      <div class="card">
        <AlternativesCard :alternatives="currentMajor.alternatives" />
      </div>
    </div>
  </div>

  <!-- ============================================================
       页脚区域
       ============================================================ -->
  <div class="footer">
    <span class="footer-emoji">😂</span>
    本计算器纯属娱乐，请勿当真 · 数据来源：知乎、小红书、脉脉、B站评论区
    <span class="footer-emoji">🎓</span>
  </div>
</template>

<style scoped>
/* ============================================================
   头部区域样式
   ============================================================ */
.header { text-align: center; padding: 28px 20px 8px; position: relative; z-index: 1; }
/* 标题渐变色文字 */
.header h1 {
  font-size: 2.4em; font-weight: 900;
  background: linear-gradient(135deg, #e94560, #e67e22, #e94560);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin-bottom: 6px;
}
/* 副标题样式 */
.header .sub { font-size: 1.1em; color: #999; letter-spacing: 1px; }
/* 头部操作按钮容器 */
.header-actions {
  position: absolute; right: 20px; top: 28px;
  display: flex; gap: 8px;
}
/* 图标按钮基础样式 */
.icon-btn {
  background: rgba(255,255,255,0.8); border: 1px solid #e0e0e0;
  border-radius: 20px; padding: 6px 12px; font-size: 16px; cursor: pointer;
  transition: all 0.2s; line-height: 1;
}
.icon-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
/* 收藏按钮激活态 */
.icon-btn.active { background: #fff3e0; border-color: #e67e22; }

/* ============================================================
   收藏抽屉样式
   ============================================================ */
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
/* 当前选中的收藏标签 */
.fav-chip.current { background: #e67e22; color: #fff; border-color: #e67e22; }
/* 移除收藏按钮 */
.fav-remove { font-size: 16px; line-height: 1; margin-left: 2px; }

/* ============================================================
   切换次数提示动画
   ============================================================ */
.toggle-hint {
  text-align: center; font-size: 13px; color: #e67e22; padding: 8px;
  background: rgba(230,126,34,0.08); border-radius: 10px;
  animation: hintPulse 1s ease-in-out infinite;
}
@keyframes hintPulse {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ============================================================
   跑步小人卡片特殊样式
   ============================================================ */
.runner-card { padding: 12px 20px !important; }

/* ============================================================
   响应式布局（移动端）
   ============================================================ */
@media (max-width: 720px) {
  .main { grid-template-columns: 1fr; }
  .header h1 { font-size: 1.6em; }
  .header { padding: 20px 16px 8px; }
  .header-actions { position: static; margin-top: 8px; justify-content: center; }
}
</style>
