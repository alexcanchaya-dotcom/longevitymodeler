'use strict';

// Evidence-based refine effects: family history, education, marital status and income are scored in
// years (not bonus-scaled), general health checks score 0, and the standard profiles are unchanged.
// Uses the scoring functions from index.html directly.
// Run: node refine-effects.test.js  (no dependencies)

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
function test(name, fn) { fn(); passed += 1; console.log(`ok - ${name}`); }
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const r1 = (x) => Math.round(x * 10) / 10;
const BASE = { smoking: 'never', activity: 'regular', sleep: 7.5 };

test('the six standard profiles are unchanged at 1 decimal', () => {
  const cases = [
    [{ ...BASE, age: 50, sex: 'female' }, 86.7], [{ ...BASE, age: 50, sex: 'male' }, 83.6],
    [{ ...BASE, age: 50, sex: 'male', smoking: 'current' }, 73.6], [{ ...BASE, age: 50, sex: 'female', sleep: 5 }, 85.5],
    [{ ...BASE, age: 50, sex: 'male', sleep: 9.5 }, 82.7],
  ];
  cases.forEach(([p, want]) => assert(r1(lifespan(p)) === want, `${JSON.stringify(p)}: ${lifespan(p)} != ${want}`));
  const steps = scoredInputs({ ...BASE, age: 50, sex: 'male' });
  steps.steps = ov.steps.lt5k;
  assert(r1(S.computeLifespan(steps).lifespan) === 81.2, '<5k steps man should stay 81.2');
});

test("Peter's case is unchanged (45 M 73.97, 46 M 74.03)", () => {
  const p = { smoking: 'formerRecent', activity: 'low', sleep: 6, sex: 'male' };
  assert(Math.abs(lifespan({ ...p, age: 45 }) - 73.97) < 0.005, `45: ${lifespan({ ...p, age: 45 })}`);
  assert(Math.abs(lifespan({ ...p, age: 46 }) - 74.03) < 0.005, `46: ${lifespan({ ...p, age: 46 })}`);
});

test('general health checks add nothing (Cochrane CD009009, RR 1.00)', () => {
  Object.values(ov.checkups).forEach((v) => assert(v === 0, 'checkups must score 0'));
});

test('family, education, marital status and income are added as years, not bonus-scaled', () => {
  const base = scoredInputs({ ...BASE, age: 50, sex: 'male' });
  const before = S.computeLifespan(base).lifespan;
  [['family', 'excellent'], ['family', 'poor'], ['education', 'graduate'], ['education', 'lessHS'],
    ['marital', 'married'], ['marital', 'single'], ['income', 'high'], ['income', 'poverty']].forEach(([k, opt]) => {
    const v = { ...base, [k]: ov[k][opt] };
    const diff = S.computeLifespan(v).lifespan - before;
    assert(Math.abs(diff - ov[k][opt]) < 1e-9, `${k}=${opt}: added ${diff}, expected ${ov[k][opt]}`);
  });
});

test('every answer healthy at 50 sits at least 2 years below the old 99.77 (F) / 96.66 (M)', () => {
  const f = lifespan({ smoking: 'never', activity: 'high', sleep: 7.5, refine: 'healthy', sex: 'female', age: 50 });
  const m = lifespan({ smoking: 'never', activity: 'high', sleep: 7.5, refine: 'healthy', sex: 'male', age: 50 });
  assert(f <= 97.8 && m <= 94.7, `all-healthy at 50: F ${f}, M ${m}`);
});

console.log(`\n${passed} tests passed`);
