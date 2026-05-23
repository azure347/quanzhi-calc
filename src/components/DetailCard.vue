<script setup>
defineProps({
  details: { type: Object, required: true },
  subfield: { type: String, required: true }
})
</script>

<template>
  <div class="detail-wrap" v-if="details">
    <div class="detail-header">{{ subfield === '通用' ? '📋' : '📋' }} {{ subfield }}方向 详细数据</div>
    <table class="detail-table">
      <tr><td class="k">就业率</td><td class="v">{{ details.employment_rate }}</td></tr>
      <tr><td class="k">平均薪资</td><td class="v">{{ details.avg_salary }}</td></tr>
      <tr><td class="k">典型岗位</td><td class="v">{{ details.typical_roles }}</td></tr>
      <tr><td class="k">工作环境</td><td class="v">{{ details.work_env_desc }}</td></tr>
      <tr><td class="k">行业趋势</td><td class="v">{{ details.industry_trend }}</td></tr>
    </table>
  </div>
</template>

<style scoped>
.detail-wrap { margin-top: 4px; }
.detail-header { font-size: 13px; font-weight: 700; color: #2d3436; margin-bottom: 8px; }
.detail-table { width: 100%; font-size: 13px; border-collapse: collapse; }
.detail-table td { padding: 7px 10px; }
.detail-table tr:nth-child(odd) { background: #fafafa; }
.detail-table .k { color: #999; width: 80px; font-weight: 400; }
.detail-table .v { color: #2d3436; }
</style>