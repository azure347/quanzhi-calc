const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', 'utf8'));

// Score overrides for new 3 dimensions by major category/characteristics
const scoreOverrides = {
  // 法学类 → 考公容易
  'law': { civil_exam: 20, overseas_study: 40, entrepreneurship: 70 },
  'political_sci': { civil_exam: 15, overseas_study: 45, entrepreneurship: 75 },
  'sociology': { civil_exam: 45, overseas_study: 35, entrepreneurship: 65 },
  'ir': { civil_exam: 40, overseas_study: 30, entrepreneurship: 80 },

  // 商科 → 创业高
  'finance': { civil_exam: 55, overseas_study: 35, entrepreneurship: 35 },
  'accounting': { civil_exam: 60, overseas_study: 40, entrepreneurship: 40 },
  'marketing': { civil_exam: 65, overseas_study: 50, entrepreneurship: 25 },
  'business_admin': { civil_exam: 65, overseas_study: 55, entrepreneurship: 30 },
  'hr': { civil_exam: 60, overseas_study: 55, entrepreneurship: 45 },
  'economics': { civil_exam: 60, overseas_study: 35, entrepreneurship: 40 },

  // 医学 → 考公难，出国有潜力
  'clinical_med': { civil_exam: 80, overseas_study: 20, entrepreneurship: 65 },
  'tcm': { civil_exam: 75, overseas_study: 30, entrepreneurship: 60 },
  'nursing': { civil_exam: 70, overseas_study: 40, entrepreneurship: 50 },

  // 基础理科 → 留学容易，创业难
  'chemistry': { civil_exam: 70, overseas_study: 15, entrepreneurship: 75 },
  'physics': { civil_exam: 65, overseas_study: 15, entrepreneurship: 75 },
  'math': { civil_exam: 60, overseas_study: 10, entrepreneurship: 70 },
  'materials': { civil_exam: 75, overseas_study: 20, entrepreneurship: 60 },
  'env_science': { civil_exam: 70, overseas_study: 25, entrepreneurship: 65 },

  // 工科 → 出国难，稳定
  'mechanical': { civil_exam: 65, overseas_study: 45, entrepreneurship: 50 },
  'ee': { civil_exam: 65, overseas_study: 35, entrepreneurship: 55 },
  'cs': { civil_exam: 50, overseas_study: 30, entrepreneurship: 40 },
  'civil': { civil_exam: 60, overseas_study: 55, entrepreneurship: 55 },
  'architecture': { civil_exam: 70, overseas_study: 40, entrepreneurship: 45 },
  'aerospace': { civil_exam: 75, overseas_study: 25, entrepreneurship: 70 },
  'energy': { civil_exam: 65, overseas_study: 40, entrepreneurship: 55 },
  'food_science': { civil_exam: 70, overseas_study: 35, entrepreneurship: 60 },

  // 文科/语言 → 留学较高
  'chinese_lit': { civil_exam: 55, overseas_study: 20, entrepreneurship: 60 },
  'history': { civil_exam: 30, overseas_study: 20, entrepreneurship: 70 },
  'philosophy': { civil_exam: 25, overseas_study: 15, entrepreneurship: 75 },
  'english': { civil_exam: 60, overseas_study: 10, entrepreneurship: 55 },
  'japanese': { civil_exam: 65, overseas_study: 15, entrepreneurship: 50 },
  'russian': { civil_exam: 60, overseas_study: 20, entrepreneurship: 55 },
  'french': { civil_exam: 55, overseas_study: 10, entrepreneurship: 55 },
  'german': { civil_exam: 55, overseas_study: 10, entrepreneurship: 55 },
  'spanish': { civil_exam: 55, overseas_study: 10, entrepreneurship: 55 },
  'korean': { civil_exam: 60, overseas_study: 15, entrepreneurship: 55 },
  'arabic': { civil_exam: 65, overseas_study: 25, entrepreneurship: 50 },
  'persian': { civil_exam: 60, overseas_study: 30, entrepreneurship: 55 },
  'turkish': { civil_exam: 60, overseas_study: 25, entrepreneurship: 55 },
  'indonesian': { civil_exam: 60, overseas_study: 20, entrepreneurship: 50 },
  'vietnamese': { civil_exam: 55, overseas_study: 20, entrepreneurship: 50 },
  'thai': { civil_exam: 55, overseas_study: 20, entrepreneurship: 55 },
  'portuguese': { civil_exam: 55, overseas_study: 15, entrepreneurship: 55 },
  'italian': { civil_exam: 55, overseas_study: 10, entrepreneurship: 60 },
  'ukrainian': { civil_exam: 65, overseas_study: 30, entrepreneurship: 55 },
  'polish': { civil_exam: 55, overseas_study: 15, entrepreneurship: 60 },
  'dutch': { civil_exam: 60, overseas_study: 10, entrepreneurship: 60 },
  'hebrew': { civil_exam: 65, overseas_study: 20, entrepreneurship: 60 },
  'hindi': { civil_exam: 55, overseas_study: 15, entrepreneurship: 60 },
  'swahili': { civil_exam: 65, overseas_study: 25, entrepreneurship: 55 },
  'hungarian': { civil_exam: 60, overseas_study: 20, entrepreneurship: 60 },

  // 艺术/教育 → 创业高
  'journalism': { civil_exam: 65, overseas_study: 25, entrepreneurship: 35 },
  'film_directing': { civil_exam: 75, overseas_study: 20, entrepreneurship: 20 },
  'fine_arts': { civil_exam: 80, overseas_study: 20, entrepreneurship: 20 },
  'music': { civil_exam: 80, overseas_study: 20, entrepreneurship: 25 },
  'dance': { civil_exam: 80, overseas_study: 25, entrepreneurship: 25 },
  'education': { civil_exam: 40, overseas_study: 30, entrepreneurship: 65 },
  'pre_education': { civil_exam: 45, overseas_study: 40, entrepreneurship: 55 },
  'psychology': { civil_exam: 55, overseas_study: 20, entrepreneurship: 60 },
  'landscape': { civil_exam: 65, overseas_study: 40, entrepreneurship: 45 },
  'urban_plan': { civil_exam: 60, overseas_study: 35, entrepreneurship: 50 },
};

const defaultScore = { civil_exam: 50, overseas_study: 40, entrepreneurship: 55 };

let updated = 0;
for (const major of data.majors) {
  const override = scoreOverrides[major.id] || defaultScore;
  for (const tier of Object.values(major.tiers)) {
    for (const sub of Object.values(tier.subfields)) {
      if (sub.scores) {
        sub.scores.civil_exam = override.civil_exam;
        sub.scores.overseas_study = override.overseas_study;
        sub.scores.entrepreneurship = override.entrepreneurship;
        updated++;
      }
    }
  }
}

fs.writeFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} subfields across ${data.majors.length} majors`);