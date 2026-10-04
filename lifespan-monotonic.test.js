'use strict';

// A person one year older with the same answers must never get a lower result.
// Scans ages 18-100, both sexes, across first-screen answer combinations (smoking x
// exercise x sleep hours) with no refine answers, all-healthy refine answers and
// all-unhealthy refine answers. Uses the scoring functions from index.html directly.
// Run: node lifespan-monotonic.test.js  (no dependencies)

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Pull a top-level `function name(...) {...}` or `const name = ...;` out of index.html.
function grab(name) {
  const fnAt = html.indexOf(`function ${name}(`);
  const constAt = html.indexOf(`const ${name} =`);
  const start = fnAt !== -1 ? fnAt : constAt;
  if (start === -1) throw new Error(`could not find ${name} in index.html`);
  if (fnAt === -1 && /^const \w+ = [^{[]*;/.test(html.slice(start, start + 200))) {
    return html.slice(start, html.indexOf(';', start) + 1);
  }
  let i = html.indexOf(fnAt !== -1 ? '{' : html.slice(start).match(/[{[]/)[0], start);
  const open = html[i];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (; i < html.length; i += 1) {
    if (html[i] === open) depth += 1;
    else if (html[i] === close) {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  let end = i + 1;
  if (fnAt === -1 && html[end] === ';') end += 1;
  return html.slice(start, end);
}

const names = [
  'LIFE_TABLE_MIN_AGE', 'LIFE_TABLE_EX', 'BONUS_SCALING', 'optionValues', 'ACTIVITY_PRESETS',
  'clamp', 'remainingLifeExpectancy', 'rawAgeEffectScale', 'ageEffectScale', 'sleepHoursYears',
  'calculateHoursScore', 'applyBonusScaling', 'sumAdjustment', 'buildDiagnosis', 'clampLifespan',
  'buildBaseLifespan', 'buildCategoryImpacts', 'computeLifespan'
];
const src = names.map(grab).join('\n') +
  '\nreturn { optionValues, ACTIVITY_PRESETS, sleepHoursYears, calculateHoursScore, computeLifespan };';
const S = new Function(src)();
const ov = S.optionValues;

const REFINE_KEYS = ['sauna', 'diet', 'vegetables', 'processed', 'water', 'fish', 'sleepQuality',
  'sleepConsistency', 'alcohol', 'stress', 'social', 'meditation', 'nature', 'sun', 'checkups',
  'conditions', 'family', 'education', 'marital', 'income', 'diabetes', 'bp', 'cholesterol', 'mentalHealth'];
const pick = (key, fn) => fn(...Object.values(ov[key]));

// Mirrors collectInputs() + neutralizeUnanswered(): unanswered refine questions score 0.
function scoredInputs({ age, sex, smoking, activity, sleep, refine = 'none' }) {
  const preset = S.ACTIVITY_PRESETS[activity];
  const v = {
    age, sex, height: 175, weight: 72, bmiAnswered: false,
    cardio: ov.cardio[preset.cardio], strength: ov.strength[preset.strength], steps: ov.steps[preset.steps],
    sleepHours: sleep, sleepHoursScore: S.calculateHoursScore(sleep), sleepHoursYears: S.sleepHoursYears(sleep),
    smoking: ov.smoking[smoking], heart: 0, cancer: 0
  };
  REFINE_KEYS.forEach((k) => { v[k] = 0; });
  if (refine === 'healthy') {
    REFINE_KEYS.forEach((k) => { v[k] = pick(k, Math.max); });
    Object.assign(v, { bmiAnswered: true, height: 178, weight: 72 });
  } else if (refine === 'unhealthy') {
    REFINE_KEYS.forEach((k) => { v[k] = pick(k, Math.min); });
    Object.assign(v, { bmiAnswered: true, height: 170, weight: 105, heart: -3, cancer: -2 });
  }
  return v;
}

const lifespan = (p) => S.computeLifespan(scoredInputs(p)).lifespan;

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const NAMED = {
  baseline: { smoking: 'never', activity: 'regular', sleep: 7.5 },
  "Peter's case": { smoking: 'formerRecent', activity: 'low', sleep: 6 },
  'current smoker': { smoking: 'current', activity: 'regular', sleep: 7.5 },
  'quit <5 years': { smoking: 'formerRecent', activity: 'regular', sleep: 7.5 },
  'quit 5+ years': { smoking: 'former5', activity: 'regular', sleep: 7.5 },
  'frequent exercise': { smoking: 'never', activity: 'high', sleep: 7.5 },
  'little exercise': { smoking: 'never', activity: 'low', sleep: 7.5 },
  'sleep 4h': { smoking: 'never', activity: 'regular', sleep: 4 },
  'sleep 12h': { smoking: 'never', activity: 'regular', sleep: 12 }
};

function firstDrop(profile) {
  for (const sex of ['male', 'female']) {
    let prev = lifespan({ ...profile, sex, age: 18 });
    for (let age = 19; age <= 100; age += 1) {
      const cur = lifespan({ ...profile, sex, age });
      if (cur < prev - 1e-9) return `${sex} ${age - 1} -> ${age}: ${prev.toFixed(4)} -> ${cur.toFixed(4)}`;
      prev = cur;
    }
  }
  return null;
}

test('six standard profiles keep their numbers (30/50/70 F/M baseline)', () => {
  const expected = { female: { 30: '86.1', 50: '86.7', 70: '87.9' }, male: { 30: '82.6', 50: '83.6', 70: '85.4' } };
  Object.entries(expected).forEach(([sex, rows]) => {
    Object.entries(rows).forEach(([age, shown]) => {
      const got = lifespan({ ...NAMED.baseline, sex, age: Number(age) }).toFixed(1);
      assert(got === shown, `${age} ${sex} baseline: expected ${shown}, got ${got}`);
    });
  });
});

Object.entries(NAMED).forEach(([name, profile]) => {
  test(`never lower a year later: ${name}, ages 18-100, both sexes`, () => {
    const drop = firstDrop(profile);
    assert(!drop, `${name}: result went down, ${drop}`);
  });
});

test('never lower a year later: every smoking x exercise x sleep combination, with no / healthy / unhealthy refine answers', () => {
  let checked = 0;
  Object.keys(ov.smoking).forEach((smoking) => {
    Object.keys(S.ACTIVITY_PRESETS).forEach((activity) => {
      [4, 5, 6, 6.5, 7, 7.5, 8, 9, 10, 12].forEach((sleep) => {
        ['none', 'healthy', 'unhealthy'].forEach((refine) => {
          const profile = { smoking, activity, sleep, refine };
          const drop = firstDrop(profile);
          assert(!drop, `${JSON.stringify(profile)}: result went down, ${drop}`);
          checked += 1;
        });
      });
    });
  });
  assert(checked === 480, `expected 480 combinations, checked ${checked}`);
});

console.log(`\n${passed} tests passed`);
