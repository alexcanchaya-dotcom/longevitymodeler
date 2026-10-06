'use strict';
// Road to 100 (#44): video list, empty-ID safety, click-to-load embed, tracked links, 16-language strings.
// Node only, no dependencies: road100.js runs against a tiny stub DOM in a vm sandbox.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LANGS = ['en', 'es', 'pl', 'de', 'fr', 'zh', 'it', 'pt', 'ja', 'ko', 'ru', 'ar', 'hi', 'tr', 'nl', 'sv'];
const EXPECTED = [
  { slug: 'sauna-evidence', title: 'Aiming for 100? What the Sauna Research Really Shows', page: 'index' },
  { slug: 'life-expectancy-5-answers', title: "I Checked My Life Expectancy in 60 Seconds. Here's What Moved It", page: 'index' },
  { slug: 'habits-vs-calculator', title: 'Aiming for 100? The Habits That Matter vs What the Calculator Asks', page: 'index' }
];
const PAGE_PATH = { index: '/' };
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`ok - ${name}`); }
function assert(cond, msg) { if (!cond) throw new Error(msg); }

class El {
  constructor(tag, id) { this.tagName = tag.toUpperCase(); this.id = id || ''; this.children = []; this.attrs = {}; this.listeners = {}; this.hidden = false; this.textContent = ''; this.className = ''; }
  appendChild(c) { this.children.push(c); c.parent = this; return c; }
  replaceChild(n, o) { const i = this.children.indexOf(o); this.children[i] = n; n.parent = this; return o; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
  click() { (this.listeners.click || []).forEach((fn) => fn({ preventDefault() {} })); }
  all() { return this.children.flatMap((c) => [c, ...c.all()]); }
  querySelectorAll(sel) { const cls = sel.replace(/^\./, ''); return this.all().filter((e) => e.className.split(' ').includes(cls)); }
}

function runRoad100(videos, search) {
  const ids = ['road100Section', 'road100Videos', 'road100Cta', 'road100Disclaimer', 'road100ResultLine'];
  const els = Object.fromEntries(ids.map((id) => [id, new El(id === 'road100Section' ? 'section' : 'div', id)]));
  els.road100Section.hidden = true; els.road100ResultLine.hidden = true;
  const document = { getElementById: (id) => els[id] || null, createElement: (t) => new El(t) };
  const sandbox = { document, navigator: { language: 'en-US' }, URLSearchParams,
    localStorage: { getItem: () => null }, location: { search: search || '' } };
  sandbox.window = sandbox; sandbox.window.localStorage = sandbox.localStorage;
  let src = fs.readFileSync(path.join(__dirname, 'road100.js'), 'utf8');
  if (videos) src = src.replace(/window\.ROAD100_VIDEOS = \[[\s\S]*?\];/, `window.ROAD100_VIDEOS = ${JSON.stringify(videos)};`);
  vm.runInNewContext(src, sandbox);
  return { els, sandbox };
}
const STR = { cta: 'CTA', resultLine: 'LINE', play: 'Play', disclaimer: 'DISC' };

function loadTranslations() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const start = html.indexOf('const translations = {');
  let i = html.indexOf('{', start), depth = 0, quote = null;
  for (let j = i; j < html.length; j += 1) {
    const c = html[j];
    if (quote) { if (c === '\\') j += 1; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    if (c === '}' && --depth === 0) return new Function(`return (${html.slice(i, j + 1)});`)();
  }
  throw new Error('unbalanced translations object');
}

const { sandbox: base } = runRoad100();
const LIST = base.ROAD100_VIDEOS;

test("video list = Peter's real uploads (slug, title, page), in going-public order", () => {
  assert(LIST.length === EXPECTED.length, `expected ${EXPECTED.length} videos, got ${LIST.length}`);
  EXPECTED.forEach((e, i) => {
    ['slug', 'title', 'page'].forEach((k) => assert(LIST[i][k] === e[k], `video ${i + 1} ${k}: ${LIST[i][k]}`));
  });
  ['what-moved-my-number', 'can-you-reach-100', 'joke-quizzes-vs-real'].forEach((s) =>
    assert(!LIST.some((v) => v.slug === s), `pilot slug ${s} still listed`));
});

test('every videoId is empty (nothing public yet)', () => {
  LIST.forEach((v) => assert(v.videoId === '', `${v.slug} has videoId ${v.videoId}`));
});

test('slugs are unique, URL-safe, and every page has a known path', () => {
  const slugs = LIST.map((v) => v.slug);
  assert(new Set(slugs).size === slugs.length, 'duplicate slug');
  slugs.forEach((s) => assert(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s), `bad slug ${s}`));
  LIST.forEach((v) => assert(PAGE_PATH[v.page], `unknown page ${v.page}`));
});

test('tracked link format per slug', () => {
  LIST.forEach((v) => {
    const url = new URL(`https://longevitymodeler.com${PAGE_PATH[v.page]}?utm_source=youtube&utm_campaign=road100&utm_content=${v.slug}`);
    assert(url.searchParams.get('utm_source') === 'youtube' && url.searchParams.get('utm_campaign') === 'road100' && url.searchParams.get('utm_content') === v.slug, v.slug);
  });
});

test('empty IDs: section stays hidden, no figure, no iframe, no thumbnail (all languages)', () => {
  LANGS.forEach((lang) => {
    const { els, sandbox } = runRoad100();
    sandbox.Road100.render(STR, lang === 'ar' ? 'rtl' : 'ltr');
    assert(els.road100Section.hidden === true, `${lang}: section shown`);
    assert(els.road100Videos.children.length === 0, `${lang}: videos rendered`);
    assert(sandbox.Road100.publishedVideos('index').length === 0, 'published list not empty');
  });
  const { els, sandbox } = runRoad100(null, '?utm_source=youtube&utm_campaign=road100&utm_content=sauna-evidence');
  sandbox.Road100.render(STR, 'ltr');
  assert(els.road100Section.hidden === true && els.road100Videos.children.length === 0, 'road100 visit rendered videos');
});

test('invalid IDs (wrong length/characters) still render nothing', () => {
  const vids = EXPECTED.map((e, i) => ({ ...e, videoId: ['abc', 'has space!!', '_0RhNKwx5FQ_extra'][i] }));
  const { els } = runRoad100(vids);
  assert(els.road100Section.hidden === true && els.road100Videos.children.length === 0, 'invalid ID rendered');
});

test('with one real ID: thumbnail only until click, then a nocookie iframe with no tracking parameters', () => {
  const vids = EXPECTED.map((e, i) => ({ ...e, videoId: i === 0 ? 'AAAAAAAAAAA' : '' }));
  const { els, sandbox } = runRoad100(vids);
  sandbox.Road100.render(STR, 'ltr');
  assert(els.road100Section.hidden === false, 'section hidden');
  assert(els.road100Videos.children.length === 1, 'expected 1 video');
  const all = els.road100Videos.all();
  assert(!all.some((e) => e.tagName === 'IFRAME'), 'iframe before click');
  const btn = all.find((e) => e.className === 'road100-play');
  btn.click();
  const iframe = els.road100Videos.all().find((e) => e.tagName === 'IFRAME');
  assert(iframe, 'no iframe after click');
  const u = new URL(iframe.src);
  assert(u.hostname === 'www.youtube-nocookie.com' && u.pathname === '/embed/AAAAAAAAAAA', `src ${iframe.src}`);
  assert([...u.searchParams.keys()].join(',') === 'autoplay', `unexpected embed params: ${u.search}`);
  assert(!/utm_|gclid|fbclid|si=/.test(iframe.src), 'tracking parameter on embed');
});

test('road100 result line only on utm_campaign=road100 visits', () => {
  let r = runRoad100(); r.sandbox.Road100.render(STR, 'ltr');
  assert(r.els.road100ResultLine.hidden === true, 'line shown on a normal visit');
  r = runRoad100(null, '?utm_source=youtube&utm_campaign=road100&utm_content=habits-vs-calculator'); r.sandbox.Road100.render(STR, 'ltr');
  assert(r.els.road100ResultLine.hidden === false && r.els.road100ResultLine.textContent === 'LINE', 'line missing on road100 visit');
});

test('16 languages have road100 strings; no "add X years" wording in strings or titles', () => {
  const t = loadTranslations();
  const bad = /\badds?\b[^.]{0,20}\byears?\b|\+\s?\d+\s*(years?|yrs)/i;
  LANGS.forEach((lang) => ['road100Cta', 'road100ResultLine', 'road100Play'].forEach((k) => {
    assert(typeof t[lang][k] === 'string' && t[lang][k].trim(), `${lang}.${k} missing`);
    if (lang !== 'en') assert(t[lang][k] !== t.en[k], `${lang}.${k} is still English`);
  }));
  [...LANGS.map((l) => t[l].road100Cta + ' ' + t[l].road100ResultLine), ...LIST.map((v) => v.title)].forEach((s) => assert(!bad.test(s), `wording: ${s}`));
});

test('static HTML: section hidden by default, script loaded, no YouTube iframe on any page', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(/<section class="road100-section" id="road100Section" hidden>/.test(html), 'section not hidden by default');
  assert(html.includes('<script src="road100.js"></script>'), 'road100.js not loaded');
  const pages = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html')).concat(fs.readdirSync(path.join(__dirname, 'blog')).filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`));
  pages.forEach((p) => assert(!/<iframe[^>]+youtube/i.test(fs.readFileSync(path.join(__dirname, p), 'utf8')), `${p} has a YouTube iframe`));
});

console.log(`\n${passed} tests passed`);
