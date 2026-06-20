<script setup>
/**
 * DetailCard.vue — 详细数据展示卡片
 *
 * 职责：
 * 1. 以表格形式展示当前子方向的详细数据
 * 2. 包含就业率、平均薪资、典型岗位、工作环境、行业趋势等字段
 * 3. 底部提供可展开的"数据说明"区域，解释计算方法和数据来源
 * 4. 使用 HTML <details>/<summary> 标签实现展开/收起交互
 */

defineProps({
  details: { type: Object, required: true }, // 详细数据对象
  subfield: { type: String, required: true } // 当前子方向名称
})
</script>

<template>
  <div class="detail-wrap" v-if="details">
    <!-- 卡片标题 -->
    <div class="detail-header">{{ subfield === '通用' ? '📋' : '📋' }} {{ subfield }}方向 详细数据</div>

    <!-- 详细数据表格 -->
    <table class="detail-table">
      <tr><td class="k">就业率</td><td class="v">{{ details.employment_rate }}</td></tr>
      <tr><td class="k">平均薪资</td><td class="v">{{ details.avg_salary }}</td></tr>
      <tr><td class="k">典型岗位</td><td class="v">{{ details.typical_roles }}</td></tr>
      <tr><td class="k">工作环境</td><td class="v">{{ details.work_env_desc }}</td></tr>
      <tr><td class="k">行业趋势</td><td class="v">{{ details.industry_trend }}</td></tr>
    </table>

    <!-- 数据说明（可展开） -->
    <details class="methodology">
      <summary>📊 数据说明</summary>
      <div class="methodology-content">
        <!-- 计算公式说明 -->
        <p><strong>计算公式：</strong>劝退指数 = Σ(各维度得分 × 权重) / Σ权重，权重范围 0-5，默认均为3。</p>
        <!-- 数据来源声明 -->
        <p><strong>数据来源：</strong>知乎、小红书、脉脉、B站评论区等网友主观经验分享，经聚合整理后得出。</p>
        <!-- 免责声明 -->
        <p><strong>免责声明：</strong>本计算器纯属娱乐，数据不代表任何官方统计结果，不能作为真实志愿填报依据。请以教育部官方数据和高校招生简章为准。</p>
      </div>
    </details>
  </div>
</template>

<style scoped>
.detail-wrap { margin-top: 4px; }
/* 头部标题 */
.detail-header { font-size: 13px; font-weight: 700; color: #2d3436; margin-bottom: 8px; }
/* 数据表格 */
.detail-table { width: 100%; font-size: 13px; border-collapse: collapse; }
.detail-table td { padding: 7px 10px; }
/* 奇偶行交替背景色 */
.detail-table tr:nth-child(odd) { background: #fafafa; }
/* 表格键名（标签列） */
.detail-table .k { color: #999; width: 80px; font-weight: 400; }
/* 表格值列 */
.detail-table .v { color: #2d3436; }

/* 数据说明区域 */
.methodology {
  margin-top: 12px; border-top: 1px dashed #e0e0e0; padding-top: 10px;
}
/* 折叠/展开标题 */
.methodology summary {
  font-size: 13px; color: #888; cursor: pointer; user-select: none;
  list-style: none;
}
/* 隐藏默认的折叠标记三角形 */
.methodology summary::-webkit-details-marker { display: none; }
/* 自定义展开箭头（使用 ::before 作为展开指示器） */
.methodology summary::before {
  content: '▶ '; font-size: 10px; transition: transform 0.2s;
}
/* 展开状态下箭头旋转90度 */
.methodology[open] summary::before { transform: rotate(90deg); }
/* 说明内容区域 */
.methodology-content {
  margin-top: 8px; font-size: 12px; color: #999; line-height: 1.7;
  background: #fafafa; border-radius: 8px; padding: 10px;
}
.methodology-content p { margin-bottom: 6px; }
.methodology-content p:last-child { margin-bottom: 0; }
</style>
