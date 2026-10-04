'use strict';

// Checks the CSO life-table lookup in index.html moves one row per year of age.
// Run: node lifetable.test.js  (no dependencies)

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function extract(re, label) {
  const m = html.match(re);
  if (!m) throw new Error(`could not find ${label} in index.html`);
  return m[0];
}

const src = [
  'function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }',
  extract(/const LIFE_TABLE_MIN_AGE = \d+;/, 'LIFE_TABLE_MIN_AGE'),
  extract(/const LIFE_TABLE_EX = \{[\s\S]*?\n    \};/, 'LIFE_TABLE_EX'),
  extract(/function remainingLifeExpectancy\(age, sex\) \{[\s\S]*?\n    \}/, 'remainingLifeExpectancy'),
  'module.exports = { LIFE_TABLE_MIN_AGE, LIFE_TABLE_EX, remainingLifeExpectancy };'
].join('\n');
const mod = { exports: {} };
new Function('module', src)(mod);
const { LIFE_TABLE_MIN_AGE, LIFE_TABLE_EX, remainingLifeExpectancy } = mod.exports;

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('one row per year of age, 18 to 105, for both sexes', () => {
  assert(LIFE_TABLE_MIN_AGE === 18, 'table should start at age 18');
  ['male', 'female'].forEach((sex) => {
    assert(LIFE_TABLE_EX[sex].length === 88, `${sex}: expected 88 rows, got ${LIFE_TABLE_EX[sex].length}`);
  });
});

test('spot values match CSO Irish Life Tables No. 17 (2015-2017)', () => {
  const cso = {
    male: { 18: 62.05, 45: 36.07, 46: 35.13, 50: 31.41, 65: 18.28, 100: 2.59, 105: 0.5 },
    female: { 18: 65.78, 45: 39.29, 46: 38.33, 50: 34.52, 65: 20.97, 100: 2.17, 105: 0.5 }
  };
  Object.entries(cso).forEach(([sex, rows]) => {
    Object.entries(rows).forEach(([age, ex]) => {
      const got = remainingLifeExpectancy(Number(age), sex);
      assert(near(got, ex), `${sex} e(${age}): expected ${ex}, got ${got}`);
    });
  });
});

test('every whole age returns its own row (no rounding to bands, no off-by-one)', () => {
  ['male', 'female'].forEach((sex) => {
    for (let age = 18; age <= 105; age += 1) {
      const got = remainingLifeExpectancy(age, sex);
      const row = LIFE_TABLE_EX[sex][age - LIFE_TABLE_MIN_AGE];
      assert(near(got, row), `${sex} age ${age}: lookup ${got} != row ${row}`);
    }
  });
});

test('remaining years fall and age + remaining years rises every year from 18 to 100', () => {
  ['male', 'female'].forEach((sex) => {
    for (let age = 19; age <= 100; age += 1) {
      const prev = remainingLifeExpectancy(age - 1, sex);
      const cur = remainingLifeExpectancy(age, sex);
      assert(cur < prev, `${sex}: e(${age}) ${cur} should be below e(${age - 1}) ${prev}`);
      assert(age + cur > age - 1 + prev, `${sex}: ${age}+e(${age}) should be above ${age - 1}+e(${age - 1})`);
    }
  });
});

test('45- and 46-year-old men get different table values (Peter\'s case)', () => {
  const a = 45 + remainingLifeExpectancy(45, 'male');
  const b = 46 + remainingLifeExpectancy(46, 'male');
  assert(b > a, `46 (${b}) should be above 45 (${a})`);
  assert(near(Number((b - a).toFixed(2)), 0.06), `gap should be 0.06 years, got ${(b - a).toFixed(4)}`);
});

console.log(`\n${passed} tests passed`);
