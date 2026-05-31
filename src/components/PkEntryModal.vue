<script setup>
import { ref, computed, watch } from 'vue'
import data from '../data/majors.json'
import WeightSliders from './WeightSliders.vue'

const props = defineProps({
  initialMajorId: { type: String, default: '' },
  initialWeights: { type: Array, default: () => [3,3,3,3,3,3,3,3,3] },
  initialNickname: { type: String, default: '' },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'start'])

const searchInput = ref('')
const selectedMajorId = ref(props.initialMajorId)
const selectedNickname = ref(props.initialNickname)
const weights = ref([...props.initialWeights])

// Pre-fill from prop
watch(() => props.initialMajorId, v => { selectedMajorId.value = v })
watch(() => props.initialNickname, v => { selectedNickname.value = v })
watch(() => props.initialWeights, v => { weights.value = [...v] }, { immediate: true })

const selectedMajor = computed(() => data.majors.find(m => m.id === selectedMajorId.value))

const filteredMajors = computed(() => {
  const q = searchInput.value.trim().toLowerCase()
  if (!q) return []
  return data.majors.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.aliases.some(a => a.toLowerCase().includes(q))
  ).slice(0, 8)
})

function selectMajor(major) {
  selectedMajorId.value = major.id
  searchInput.value = major.name
}

function highlight(text, q) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length)
}

function onStart() {
  if (!selectedMajorId.value) return
  emit('start', {
    majorId: selectedMajorId.value,
    weights: weights.value,
    nickname: selectedNickname.value.trim()
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span>🎓</span>
          <span>{{ isEdit ? '编辑我的选择' : '开始多人PK' }}</span>
        </div>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <!-- Nickname -->
      <div class="field">
        <label class="field-label">你的昵称（选填）</label>
        <input
          v-model="selectedNickname"
          class="nickname-input"
          placeholder="比如：小明、卷王、躺平达人"
          maxlength="10"
        />
      </div>

      <!-- Major search -->
      <div class="field">
        <label class="field-label">选择你的专业</label>
        <div class="search-wrap">
          <input
            v-model="searchInput"
            class="search-box"
            placeholder="输入专业名称搜索..."
            autocomplete="off"
          />
        </div>
        <div class="suggestions" v-if="searchInput.trim()">
          <template v-if="filteredMajors.length === 0">
            <div class="no-result">没有找到这个专业 😅</div>
          </template>
          <span
            v-for="m in filteredMajors"
            :key="m.id"
            class="tag"
            :class="{ selected: m.id === selectedMajorId }"
            @click="selectMajor(m)"
            v-html="m.categoryEmoji + ' ' + highlight(m.name, searchInput.trim())"
          ></span>
        </div>
        <!-- Selected preview -->
        <div v-if="selectedMajor" class="selected-preview">
          <span class="preview-emoji">{{ selectedMajor.categoryEmoji }}</span>
          <span class="preview-name">{{ selectedMajor.name }}</span>
          <span class="preview-cat">{{ selectedMajor.category }}</span>
        </div>
      </div>

      <!-- Weights -->
      <div class="field">
        <label class="field-label">权重调节（影响最终评分）</label>
        <WeightSliders
          :dimensions="data.dimensions"
          v-model="weights"
        />
      </div>

      <!-- Start button -->
      <button
        class="start-btn"
        :disabled="!selectedMajorId"
        @click="onStart"
      >
        {{ isEdit ? '💾 保存修改' : '🚀 开始PK' }}
      </button>

      <div class="modal-hint">
        {{ isEdit ? '保存后刷新页面即可看到更新' : '点击后链接已复制，快发给朋友邀请加入！' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover { color: #999; }

.field { margin-bottom: 20px; }
.field-label {
  display: block;
  font-size: 13px;
  color: #999;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.nickname-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.nickname-input:focus { border-color: #e94560; }

.search-wrap { position: relative; }

.search-box {
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-box:focus { border-color: #e94560; }

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 13px;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.tag:hover { background: #e94560; color: #fff; border-color: #e94560; }
.tag.selected { background: #e94560; color: #fff; border-color: #e94560; }

:deep(mark) {
  background: #ffe066;
  color: #555;
  border-radius: 2px;
  padding: 0 1px;
}

.no-result { font-size: 13px; color: #ccc; padding: 8px 0; }

.selected-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 14px;
  background: #fff3f5;
  border-radius: 10px;
  border: 1.5px solid #fecdd9;
}

.preview-emoji { font-size: 18px; }
.preview-name { font-size: 14px; font-weight: 700; color: #333; }
.preview-cat { font-size: 12px; color: #aaa; }

.start-btn {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #e94560, #e67e22);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(233,69,96,0.35);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-hint {
  text-align: center;
  font-size: 12px;
  color: #bbb;
}
</style>