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
assert(planCopy('ja') === planCopy('en'), 'other langs fall back to EN');
assert(buildPlanHtml(data, 'en').includes('Strength &lt;b&gt;'), 'HTML escaped');
const m = buildPlanMailto(data, 'en');
assert(m.startsWith('mailto:?subject='), 'mailto has no address (collects no email)');
assert(buildPlanText({ number: '80.0 years', levers: [] }, 'en').includes('already look strong'), 'no-lever case');
console.log('plan tests passed');
