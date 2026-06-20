/**
 * 天坑劝退指数计算器 - 核心算法模块
 *
 * 职责：
 * 1. calculateIndex() — 根据各项得分和权重计算加权平均劝退指数
 * 2. getScoreSegment() — 根据得分确定所在的评分区间（用于显示文案和颜色）
 *
 * 计算公式: Index = Σ(scores[i] × weights[i]) / Σ(weights[i])
 * 规则：
 * - 全0权重时回退为均权(3)
 * - 新增维度(civil_exam/overseas_study/entrepreneurship)使用固定权重3
 * - 分数范围 0-100，越高表示越"天坑"
 */

/**
 * 计算加权劝退指数
 * @param {Object} scores - 各维度得分，键为维度名，值为0-100的分数
 * @param {Array} weights - 各维度权重数组，索引对应维度顺序
 * @returns {number} 加权平均分数（0-100），四舍五入取整
 */
export function calculateIndex(scores, weights) {
  // 前6个维度的键名（核心维度）
  const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff']
  let wSum = 0  // 权重总和
  let sSum = 0  // 加权分数总和

  // 遍历前6个核心维度，计算加权分数
  for (let i = 0; i < dimKeys.length; i++) {
    const w = weights[i]
    sSum += scores[dimKeys[i]] * w
    wSum += w
  }

  // 全0权重时回退为等权（每个维度权重为3）
  if (wSum === 0) {
    for (let i = 0; i < dimKeys.length; i++) {
      sSum += scores[dimKeys[i]] * 3
      wSum += 3
    }
  }

  // 新增的3个维度使用固定权重3（考公、出国、创业）
  const newDimKeys = ['civil_exam', 'overseas_study', 'entrepreneurship']
  for (const key of newDimKeys) {
    if (scores[key] !== undefined) {
      sSum += scores[key] * 3
      wSum += 3
    }
  }

  return Math.round(sSum / wSum)
}

/**
 * 根据分数获取对应的评分区间
 * @param {number} score - 劝退指数（0-100）
 * @param {Array} segments - 评分区间配置数组，每个区间有 max（上限）、text（文案）、emoji、color 等字段
 * @returns {Object} 匹配的评分区间对象
 */
export function getScoreSegment(score, segments) {
  // 遍历区间配置，找到第一个 score <= max 的区间
  for (const seg of segments) {
    if (score <= seg.max) return seg
  }
  // 默认返回最后一个区间（最高分数段）
  return segments[segments.length - 1]
}
