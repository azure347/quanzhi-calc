<script setup>
import { computed, inject } from 'vue'
import PkPlayerCard from './PkPlayerCard.vue'

const props = defineProps({
  players: { type: Array, required: true }, // pre-computed with score, major, isPlaceholder
  segments: { type: Array, required: true },
  isInPkMode: { type: Boolean, required: true },
  pkUrl: { type: String, required: true },
  localSlot: { type: Number, required: true },
  onEdit: { type: Function, required: true },
  onLeave: { type: Function, required: true }
})

const showToast = inject('showToast')

const playersWithScores = computed(() => props.players)

const winnerScore = computed(() => {
  const scores = playersWithScores.value
    .filter(p => !p.isPlaceholder && p.score != null)
    .map(p => p.score)
  if (!scores.length) return null
  return Math.max(...scores)
})

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('PK链接已复制，快发给朋友吧！')
  })
}
</script>

<template>
  <div class="pk-arena">
    <!-- Header -->
    <div class="pk-header">
      <div class="pk-title">
        <span class="pk-icon">🎓</span>
        <span>多人PK模式</span>
        <span class="player-count">{{ playersWithScores.filter(p => !p.isPlaceholder).length }}/{{ players.length }}人</span>
      </div>
      <div class="pk-actions">
        <button class="icon-btn" @click="copyLink" title="复制链接">🔗</button>
        <button class="leave-btn" @click="onLeave">退出PK</button>
      </div>
    </div>

    <!-- Hint -->
    <div class="pk-hint">
      💡 提示：修改专业或权重后，刷新页面即可同步到所有玩家
    </div>

    <!-- Players grid -->
    <div class="players-grid">
      <PkPlayerCard
        v-for="p in playersWithScores"
        :key="p.slot"
        :player="p"
        :is-local="p.slot === localSlot"
        :is-placeholder="p.isPlaceholder"
        :segments="segments"
        :winner-score="winnerScore"
      />
    </div>

    <!-- Footer -->
    <div class="pk-footer">
      <button class="edit-btn" @click="onEdit">
        ✏️ 编辑我的选择
      </button>
      <div class="share-hint">或把浏览器地址栏的链接发给朋友邀请加入</div>
    </div>
  </div>
</template>

<style scoped>
.pk-arena {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px;
}

.pk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pk-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.pk-icon { font-size: 24px; }

.player-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.pk-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn {
  background: rgba(255,255,255,0.8);
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #fff;
  transform: translateY(-1px);
}

.leave-btn {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-btn:hover {
  background: #fafafa;
  color: #e94560;
  border-color: #e94560;
}

.pk-hint {
  text-align: center;
  font-size: 12px;
  color: #bbb;
  margin-bottom: 20px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 8px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.pk-footer {
  text-align: center;
}

.edit-btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #e94560, #e67e22);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(233,69,96,0.3);
}

.share-hint {
  font-size: 12px;
  color: #ccc;
  margin-top: 10px;
}
</style>