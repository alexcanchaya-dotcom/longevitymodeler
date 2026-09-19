'use strict';

const {
  affiliateProducts,
  getHabitToolsForImprovements,
  getProductForRecommendation,
  isNeverProductFactor
} = require('./products');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ids(tools) {
  return tools.map((tool) => tool.id);
}

function hasSleepSku(tools) {
  return tools.some((tool) => tool.id === 'sleep_mask' || tool.id === 'blackout_curtain');
}

function hasMoveSku(tools) {
  return tools.some((tool) => tool.id === 'bands' || tool.id === 'walking_shoes' || tool.id === 'pedometer');
}

// Ranked the same way index.html does for never-exercise + 5h / poor / very irregular sleep.
// Cardio, strength, and steps outrank every sleep field, which is the live bug.
const poorSleepLowActivity = [
  { factor: 'cardio', potentialGain: 1.35 },
  { factor: 'strength', potentialGain: 1.35 },
  { factor: 'steps', potentialGain: 1.35 },
  { factor: 'sauna', potentialGain: 1.35 },
  { factor: 'smoking', potentialGain: 1.35 },
  { factor: 'stress', potentialGain: 0.675 },
  { factor: 'diet', potentialGain: 0.54 },
  { factor: 'sleepHoursScore', potentialGain: 0.45 },
  { factor: 'sleepQuality', potentialGain: 0.36 },
  { factor: 'sleepConsistency', potentialGain: 0.36 }
];

const strongSleepMoveOnly = [
  { factor: 'cardio', potentialGain: 1.35 },
  { factor: 'strength', potentialGain: 1.35 },
  { factor: 'steps', potentialGain: 1.35 }
];

let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  console.log('ok - ' + name);
}

test('poor sleep + low activity includes a sleep tool and a move tool, max 3', () => {
  const tools = getHabitToolsForImprovements(poorSleepLowActivity, { maxCards: 3 });
  assert(tools.length <= 3, 'expected at most 3 cards, got ' + tools.length);
  assert(hasSleepSku(tools), 'expected sleep_mask or blackout_curtain, got ' + ids(tools));
  assert(hasMoveSku(tools), 'expected a move tool alongside sleep, got ' + ids(tools));
  assert(!tools.some((tool) => tool.categories.includes('smoking')), 'smoking must never be a product');
});

test('truncated top levers still get a sleep SKU from weak sleep fields', () => {
  const topLeversOnly = poorSleepLowActivity.slice(0, 3);
  const tools = getHabitToolsForImprovements(topLeversOnly, {
    maxCards: 3,
    values: {
      sleepHours: 5,
      sleepHoursScore: 0,
      sleepQuality: 0,
      sleepConsistency: 0
    }
  });
  assert(hasSleepSku(tools), 'expected sleep SKU from sleep fields, got ' + ids(tools));
  assert(tools.length <= 3, 'expected at most 3 cards');
});

test('low unscaled sleep category score still unlocks a sleep SKU', () => {
  const tools = getHabitToolsForImprovements(strongSleepMoveOnly, {
    maxCards: 3,
    categoryScores: { sleep: 0 }
  });
  assert(hasSleepSku(tools), 'expected sleep SKU from low category score, got ' + ids(tools));
});

test('smoking current never maps to a nicotine or smoking SKU', () => {
  assert(isNeverProductFactor('smoking'), 'smoking must be tip-only');
  assert(getProductForRecommendation('smoking') === null, 'smoking recommendation must be null');
  const tools = getHabitToolsForImprovements([
    { factor: 'smoking' },
    { factor: 'cardio' },
    { factor: 'sleepHoursScore' }
  ], { maxCards: 3 });
  assert(tools.every((tool) => tool.matchedCategory !== 'smoking'), 'no smoking category cards');
  assert(!ids(tools).some((id) => /smok|nicotin/i.test(id)), 'no nicotine SKU ids: ' + ids(tools));
  const smokingOnly = getHabitToolsForImprovements([{ factor: 'smoking' }]);
  assert(smokingOnly.length === 0, 'smoking-only gaps must show no cards');
});

test('strong sleep + only move gaps does not show sleep products', () => {
  const tools = getHabitToolsForImprovements(strongSleepMoveOnly, {
    maxCards: 3,
    values: {
      sleepHours: 7.5,
      sleepHoursScore: 1,
      sleepQuality: 0.8,
      sleepConsistency: 0.8
    },
    categoryScores: { sleep: 2.6 }
  });
  assert(!hasSleepSku(tools), 'did not expect sleep products, got ' + ids(tools));
  assert(ids(tools).every((id) => ['bands', 'walking_shoes', 'pedometer'].includes(id)),
    'expected only move SKUs, got ' + ids(tools));
  assert(tools.length === 3, 'expected three move cards');
});

test('diet, stress, and medical stay tip-only', () => {
  const tools = getHabitToolsForImprovements([
    { factor: 'diet' },
    { factor: 'stress' },
    { factor: 'bp' },
    { factor: 'checkups' }
  ]);
  assert(tools.length === 0, 'expected no cards for tip-only factors, got ' + ids(tools));
});

test('BMI gap only gets walk gear and/or a scale', () => {
  const tools = getHabitToolsForImprovements([{ factor: 'bmi' }], { maxCards: 3 });
  assert(tools.length > 0, 'expected BMI tools');
  assert(tools.every((tool) => tool.id === 'walking_shoes' || tool.id === 'scale'),
    'BMI may only show walk gear or a scale, got ' + ids(tools));
});

test('catalog Amazon links are unchanged', () => {
  assert(affiliateProducts.sleep_mask.amazonLink === 'https://www.amazon.com/dp/B09GRR4D9G?tag=longevitymode-20',
    'sleep_mask link changed');
  assert(affiliateProducts.blackout_curtain.amazonLink === 'https://www.amazon.com/dp/B0153TOMRY?tag=longevitymode-20',
    'blackout_curtain link changed');
  assert(affiliateProducts.bands.amazonLink === 'https://amzn.to/3LW2jF4', 'bands link changed');
});

console.log('\n' + passed + ' tests passed');
