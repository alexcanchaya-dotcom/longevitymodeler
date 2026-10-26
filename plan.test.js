'use strict';
const { buildPlanText, buildPlanHtml, buildPlanMailto, planCopy } = require('./plan');
function assert(c, m) { if (!c) throw new Error(m); }
const data = { number: '85.5 years', levers: [{ title: 'Sleep hours', tip: 'Aim for 7–9h.' }, { title: 'Strength <b>', tip: '' }, { title: 'Steps', tip: 'Walk more.' }] };
const en = buildPlanText(data, 'en');
assert(en.includes('85.5 years'), 'number in plan');
assert(en.includes('Week 4'), '4 weeks');
assert(en.includes('Educational only'), 'disclaimer');
assert(!/\+\s?\d+(\.\d+)? years/i.test(en), 'no +X years promise');
assert(!/unlock/i.test(en), 'never "unlock"');
assert(buildPlanText(data, 'it').includes('Settimana 4'), 'IT copy');
assert(buildPlanText(data, 'ru').includes('Неделя 4'), 'RU copy');
// All 16 site languages have their own complete copy; unknown codes fall back to EN.
const { PLAN_COPY } = require('./plan');
const LANGS = ['en', 'es', 'pl', 'de', 'fr', 'zh', 'it', 'pt', 'ja', 'ko', 'ru', 'ar', 'hi', 'tr', 'nl', 'sv'];
const KEYS = Object.keys(PLAN_COPY.en);
LANGS.forEach((l) => {
  assert(PLAN_COPY[l], l + ' has plan copy');
  KEYS.forEach((k) => assert(typeof PLAN_COPY[l][k] === typeof PLAN_COPY.en[k], l + '.' + k + ' present'));
  if (l !== 'en') ['title', 'levers', 'weeks', 'button', 'print', 'download', 'email', 'disclaimer'].forEach((k) =>
    assert(PLAN_COPY[l][k] !== PLAN_COPY.en[k], l + '.' + k + ' still English'));
  const txt = buildPlanText(data, l);
  assert(txt.includes(PLAN_COPY[l].week(4)) && txt.includes('Sleep hours'), l + ' plan builds with week 4 + levers');
  assert(!/\+\s?\d+(\.\d+)? (years|Jahre|años|ans|anni)/i.test(txt), l + ': no +X years promise');
});
assert(planCopy('xx') === planCopy('en'), 'unknown langs fall back to EN');
assert(buildPlanHtml(data, 'ar').includes('dir="rtl"') && !buildPlanHtml(data, 'de').includes('dir='), 'AR plan page is RTL only');
// WCAG AA: link text vs link background (and vs hover background) >= 4.5:1, parsed from index.html CSS.
const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const rule = (sel) => { const m = css.match(new RegExp(sel.replace(/[.:]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); assert(m, sel + ' rule'); return m[1]; };
const prop = (body, name) => (body.match(new RegExp('(?:^|[;\\s])' + name + ':\\s*(#[0-9a-fA-F]{6})')) || [])[1];
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const base = rule('.get-my-plan-link'), hover = rule('.get-my-plan-link:hover');
assert(ratio(prop(base, 'color'), prop(base, 'background')) >= 4.5, 'link contrast AA');
assert(ratio(prop(hover, 'color'), prop(hover, 'background')) >= 4.5, 'hover contrast AA');
assert(/outline:\s*3px solid/.test(rule('.get-my-plan-link:focus-visible')), 'visible keyboard focus');
assert(buildPlanHtml(data, 'en').includes('Strength &lt;b&gt;'), 'HTML escaped');
const m = buildPlanMailto(data, 'en');
assert(m.startsWith('mailto:?subject='), 'mailto has no address (collects no email)');
assert(buildPlanText({ number: '80.0 years', levers: [] }, 'en').includes('already look strong'), 'no-lever case');
console.log('plan tests passed');
