/**
 * 创业指数更新脚本
 * 读取 entrepreneurship-data.csv，按 major_id 更新 majors.json 中所有子字段的 entrepreneurship 分数
 */

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', 'utf8'));
const csvText = fs.readFileSync('D:/Projects/quanzhi-calc/scripts/entrepreneurship-data.csv', 'utf8');

// Parse CSV: skip comments and empty lines
const lines = csvText.split('\n').filter(l => l.trim() && !l.startsWith('#'));
const scoreMap = {};

for (const line of lines) {
  // Skip header lines that start with major_id
  if (line.startsWith('major_id,')) continue;
  const parts = line.split(',');
  if (parts.length < 2) continue;
  const id = parts[0].trim();
  const score = parseInt(parts[1].trim(), 10);
  if (id && !isNaN(score)) {
    scoreMap[id] = score;
  }
}

console.log(`Loaded ${Object.keys(scoreMap).length} score mappings`);
console.log('IDs:', Object.keys(scoreMap).join(', '));

let updated = 0;
let notFound = [];

for (const major of data.majors) {
  const score = scoreMap[major.id];
  if (score === undefined) {
    notFound.push(major.id + '(' + major.name + ')');
    continue;
  }
  for (const tier of Object.values(major.tiers || {})) {
    for (const sub of Object.values(tier.subfields || {})) {
      if (sub.scores) {
        sub.scores.entrepreneurship = score;
        updated++;
      }
    }
  }
}

console.log(`Updated ${updated} subfields across ${data.majors.length} majors`);
if (notFound.length > 0) {
  console.log(`NOT FOUND (${notFound.length}): ${notFound.join(', ')}`);
}

fs.writeFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', JSON.stringify(data, null, 2));
console.log('majors.json written');