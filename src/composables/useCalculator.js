/**
 * 天坑劝退指数计算器 - 核心算法
 *
 * 公式: Index = Σ(scores[i] × weights[i]) / Σ(weights[i])
 * 全0权重时回退为均权(3)
 * 新增维度(civil_exam/overseas_study/entrepreneurship)使用固定权重3
 */

export function calculateIndex(scores, weights) {
  const dimKeys = ['employment', 'salary', 'degree_threshold', 'environment', 'prospect', 'transfer_diff']
  let wSum = 0
  let sSum = 0

  for (let i = 0; i < dimKeys.length; i++) {
    const w = weights[i]
    sSum += scores[dimKeys[i]] * w
    wSum += w
  }

  // All weights 0 → fallback to equal weight (3)
  if (wSum === 0) {
    for (let i = 0; i < dimKeys.length; i++) {
      sSum += scores[dimKeys[i]] * 3
      wSum += 3
    }
  }

  // New dimensions use fixed weight of 3
  const newDimKeys = ['civil_exam', 'overseas_study', 'entrepreneurship']
  for (const key of newDimKeys) {
    if (scores[key] !== undefined) {
      sSum += scores[key] * 3
      wSum += 3
    }
  }

  return Math.round(sSum / wSum)
}

export function getScoreSegment(score, segments) {
  for (const seg of segments) {
    if (score <= seg.max) return seg
  }
  return segments[segments.length - 1]
}