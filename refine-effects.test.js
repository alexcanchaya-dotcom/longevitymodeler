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
  'bmiAdjustmentYears', 'buildBaseLifespan', 'LI_2018_E50_ALL_LOW_RISK', 'positiveAdjustmentCap',
  'capPositiveAdjustment', 'buildCategoryImpacts', 'computeLifespan'
];
const src = names.map(grab).join('\n') +
  '\nreturn { optionValues, ACTIVITY_PRESETS, sleepHoursYears, calculateHoursScore, computeLifespan, positiveAdjustmentCap, capPositiveAdjustment };';
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

// Li et al. 2018, Circulation 138:345-355: life expectancy at 50 with all five low-risk factors
// 43.1 years (women) and 37.6 years (men) -> expected age at death 93.1 / 87.6.
test('every answer healthy at 50 lands within 0.5 years of Li et al. 2018 (93.1 F / 87.6 M)', () => {
  const f = lifespan({ smoking: 'never', activity: 'high', sleep: 7.5, refine: 'healthy', sex: 'female', age: 50 });
  const m = lifespan({ smoking: 'never', activity: 'high', sleep: 7.5, refine: 'healthy', sex: 'male', age: 50 });
  assert(Math.abs(f - 93.1) <= 0.5, `all-healthy F at 50: ${f}`);
  assert(Math.abs(m - 87.6) <= 0.5, `all-healthy M at 50: ${m}`);
});

test('cap = Li 2018 projection at 50 minus the CSO baseline at 50 (8.58 F / 6.19 M)', () => {
  assert(Math.abs(S.positiveAdjustmentCap('female') - 8.58) < 1e-9, `F cap ${S.positiveAdjustmentCap('female')}`);
  assert(Math.abs(S.positiveAdjustmentCap('male') - 6.19) < 1e-9, `M cap ${S.positiveAdjustmentCap('male')}`);
});

test('the cap never changes a negative (or below-cap) total', () => {
  const neg = { activity: 1.2, nutrition: 0.5, sleep: -1, lifestyle: -10, wellness: 0.2, management: -0.9, socioeconomic: -0.6, medical: -3 };
  const out = S.capPositiveAdjustment(neg, 6.19, 1);
  Object.keys(neg).forEach((k) => assert(out[k] === neg[k], `${k} changed`));
  // Whole grid: results with the cap match results without it whenever the uncapped total is <= 0.
  const uncappedSrc = src.replace('if (!(total > cap)) return impacts;', 'return impacts;');
  const U = new Function(uncappedSrc)();
  const healthy50 = scoredInputs({ age: 50, sex: 'female', smoking: 'never', activity: 'high', sleep: 7.5, refine: 'healthy' });
  assert(U.computeLifespan(healthy50).lifespan > 95, 'uncapped copy should exceed the cap (sanity check)');
  let checked = 0;
  ['current', 'formerRecent', 'former5', 'never'].forEach((smoking) => ['low', 'some', 'regular', 'high'].forEach((activity) =>
    [4, 5, 6, 7.5, 9, 12].forEach((sleep) => ['none', 'healthy', 'unhealthy'].forEach((refine) => ['female', 'male'].forEach((sex) => {
      for (let age = 18; age <= 100; age += 1) {
        const v = scoredInputs({ age, sex, smoking, activity, sleep, refine });
        const raw = U.computeLifespan(v);
        if (Object.values(raw.impacts).reduce((a, b) => a + b, 0) > 0) continue;
        checked += 1;
        const capped = S.computeLifespan(v).lifespan;
        assert(Math.abs(capped - raw.lifespan) < 1e-12, `${smoking}/${activity}/${sleep}/${refine}/${sex}/${age}: ${capped} vs ${raw.lifespan}`);
      }
    })))));
  assert(checked > 1000, `only ${checked} negative-total cases checked`);
});

console.log(`\n${passed} tests passed`);
