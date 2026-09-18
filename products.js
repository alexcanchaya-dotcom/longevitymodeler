// Habit-tool catalog for Longevity Modeler (longevitymodeler.com).
// Amazon Associates store ID: longevitymode-20
//
// Locked offer rules (Longevity Market + CoS):
// - Free estimate stays free and first. No email wall.
// - Products only for move / sleep gaps. Smoking is tip-only — never a SKU.
// - Diet, stress, "see the doctor", and medical chips: tip only, no product.
// - If a BMI / weight gap appears (refine screen or screen 1): walk gear and/or
//   a simple scale only. No pills.
// - No hardcoded prices or review counts.
// - Do not invent Amazon product claims. Catalog SKUs use real Amazon.com
//   product pages tagged with longevitymode-20. Fit Simplify bands keep the
//   existing amzn.to short link.

const AMAZON_STORE_ID = 'longevitymode-20';

const NEVER_PRODUCT_FACTORS = [
  'smoking',
  'nicotine',
  'diet',
  'vegetables',
  'processed',
  'water',
  'fish',
  'stress',
  'checkups',
  'conditions',
  'family',
  'heart',
  'cancer',
  'diabetes',
  'bp',
  'cholesterol',
  'mentalHealth',
  'sauna',
  'alcohol',
  'social',
  'meditation',
  'nature',
  'sun',
  'education',
  'marital',
  'income'
];

const HABIT_TOOL_FACTORS = {
  move: ['cardio', 'strength', 'steps', 'exercise', 'activity', 'walk'],
  sleep: ['sleep', 'sleepHours', 'sleepHoursScore', 'sleepQuality', 'sleepConsistency'],
  bmi: ['bmi', 'weight', 'bodyMass', 'bodyweight']
};

const affiliateProducts = {
  bands: {
    id: 'bands',
    categories: ['move'],
    name: 'Fit Simplify Resistance Loop Exercise Bands',
    description: 'Portable bands for home strength and daily exercise / activity.',
    amazonLink: 'https://amzn.to/3LW2jF4',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81sF0Q3FGXL._AC_SL1500_.jpg',
    whyRecommend: 'A simple way to add resistance training when exercise or activity is one of your top habit gaps.',
    isPlaceholder: false
  },
  walking_shoes: {
    id: 'walking_shoes',
    categories: ['move', 'bmi'],
    name: 'Brooks Men’s Ghost Max Cushion Neutral Running & Walking Shoe',
    description: 'Everyday walk gear for more exercise and activity. Size, color, and sex variants are chosen on Amazon — pick your size on the product page, or the matching women’s Ghost Max listing if needed.',
    amazonLink: 'https://www.amazon.com/dp/B0CGKPMLP7?tag=longevitymode-20',
    imageUrl: '',
    whyRecommend: 'Comfortable walk gear makes it easier to build an exercise and activity habit.',
    isPlaceholder: false
  },
  pedometer: {
    id: 'pedometer',
    categories: ['move'],
    name: 'Fitbit Inspire 3 activity tracker',
    description: 'A simple activity check for daily movement — not a longevity gadget.',
    amazonLink: 'https://www.amazon.com/dp/B0B5F9SZW7?tag=longevitymode-20',
    imageUrl: '',
    whyRecommend: 'A simple activity check can help you notice whether you are moving enough.',
    isPlaceholder: false
  },
  sleep_mask: {
    id: 'sleep_mask',
    categories: ['sleep'],
    name: 'Clementine Silk Organic Sleep Mask (Black)',
    description: 'Blocks light for darker nights. Not a supplement or sleep-clinic kit.',
    amazonLink: 'https://www.amazon.com/dp/B09GRR4D9G?tag=longevitymode-20',
    imageUrl: '',
    whyRecommend: 'A non-pill sleep tool when sleep is one of your top habit gaps.',
    isPlaceholder: false
  },
  blackout_curtain: {
    id: 'blackout_curtain',
    categories: ['sleep'],
    name: 'Amazon Basics Room Darkening Blackout Curtains (52 x 84, Black, set of 2)',
    description: 'Darkens the room for more consistent sleep. Not a pill or melatonin stack.',
    amazonLink: 'https://www.amazon.com/dp/B0153TOMRY?tag=longevitymode-20',
    imageUrl: '',
    whyRecommend: 'Room darkness is a simple sleep-environment change — no supplements.',
    isPlaceholder: false
  },
  scale: {
    id: 'scale',
    categories: ['bmi'],
    name: 'Etekcity Digital Bathroom Scale',
    description: 'A basic weight check — no smart-longevity kit and no pills.',
    amazonLink: 'https://www.amazon.com/dp/B00F3J9G1W?tag=longevitymode-20',
    imageUrl: '',
    whyRecommend: 'If a BMI or weight gap is on screen, walk gear and/or a simple scale are the only tools we show. No pills.',
    isPlaceholder: false
  }
};

const CATEGORY_PRODUCT_ORDER = {
  move: ['bands', 'walking_shoes', 'pedometer'],
  sleep: ['sleep_mask', 'blackout_curtain'],
  bmi: ['walking_shoes', 'scale']
};

function normalizeFactorKey(factor) {
  return String(factor || '').trim();
}

function isNeverProductFactor(factor) {
  const lower = normalizeFactorKey(factor).toLowerCase();
  if (!lower) return true;
  if (lower === 'smoking' || lower.startsWith('smok') || lower.includes('nicotin')) {
    return true;
  }
  return NEVER_PRODUCT_FACTORS.some((name) => name.toLowerCase() === lower);
}

function categoryForFactor(factor) {
  if (isNeverProductFactor(factor)) return null;
  const lower = normalizeFactorKey(factor).toLowerCase();

  if (HABIT_TOOL_FACTORS.bmi.some((key) => key.toLowerCase() === lower)) {
    return 'bmi';
  }
  if (lower.startsWith('sleep') || HABIT_TOOL_FACTORS.sleep.some((key) => key.toLowerCase() === lower)) {
    return 'sleep';
  }
  if (HABIT_TOOL_FACTORS.move.some((key) => key.toLowerCase() === lower)) {
    return 'move';
  }
  return null;
}

function factorDisplayLabel(factor) {
  const category = categoryForFactor(factor);
  const key = normalizeFactorKey(factor).toLowerCase();
  if (category === 'move' || key === 'steps') {
    return 'exercise / activity';
  }
  if (category === 'sleep') return 'sleep';
  if (category === 'bmi') return 'weight / BMI';
  return key;
}

function getHabitToolsForImprovements(improvements, options) {
  const maxCards = (options && options.maxCards) || 3;
  const list = Array.isArray(improvements) ? improvements : [];
  const allowable = [];
  const seenFactors = new Set();

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    const factor = typeof item === 'string' ? item : item && item.factor;
    const category = categoryForFactor(factor);
    if (!category) continue;
    const key = normalizeFactorKey(factor).toLowerCase();
    if (seenFactors.has(key)) continue;
    seenFactors.add(key);
    allowable.push({ factor, category });
    if (allowable.length >= 3) break;
  }

  const usedIds = new Set();
  const picked = [];

  function tryAddFromCategory(category, factor) {
    if (picked.length >= maxCards) return false;
    const order = CATEGORY_PRODUCT_ORDER[category] || [];
    for (let j = 0; j < order.length; j += 1) {
      const id = order[j];
      if (usedIds.has(id)) continue;
      const product = affiliateProducts[id];
      if (!product) continue;
      usedIds.add(id);
      picked.push({
        ...product,
        matchedFactor: factor,
        matchedCategory: category,
        matchedLabel: factorDisplayLabel(factor)
      });
      return true;
    }
    return false;
  }

  // One card per top allowable habit factor so sleep is not crowded out by move.
  for (let i = 0; i < allowable.length; i += 1) {
    tryAddFromCategory(allowable[i].category, allowable[i].factor);
  }

  // Fill remaining slots from those same gaps only.
  for (let i = 0; i < allowable.length; i += 1) {
    while (picked.length < maxCards) {
      if (!tryAddFromCategory(allowable[i].category, allowable[i].factor)) break;
    }
  }

  return picked;
}

// Older callers passed the #1 recommendation text or factor. Smoking still
// returns null. Prefer getHabitToolsForImprovements for top 2–3 gaps.
function getProductForRecommendation(recommendationText) {
  const factor = normalizeFactorKey(recommendationText);
  if (!factor || isNeverProductFactor(factor)) return null;
  const tools = getHabitToolsForImprovements([{ factor }]);
  return tools[0] || null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AMAZON_STORE_ID,
    affiliateProducts,
    NEVER_PRODUCT_FACTORS,
    categoryForFactor,
    isNeverProductFactor,
    factorDisplayLabel,
    getHabitToolsForImprovements,
    getProductForRecommendation
  };
}
