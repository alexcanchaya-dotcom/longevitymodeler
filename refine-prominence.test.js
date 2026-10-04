'use strict';
// Refine prominence (#39): locked copy, 16-language strings, and the products.js overlay behaviour.
// Node only, no dependencies: the overlay runs against a tiny stub DOM in a vm sandbox.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { REFINE_PRIMARY_EN, refinePrimaryCopy, affiliateProducts } = require('./products');

const LANGS = ['en', 'es', 'pl', 'de', 'fr', 'zh', 'it', 'pt', 'ja', 'ko', 'ru', 'ar', 'hi', 'tr', 'nl', 'sv'];
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`ok - ${name}`); }
function assert(cond, msg) { if (!cond) throw new Error(msg); }

function loadTranslations() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const start = html.indexOf('const translations = {');
  assert(start >= 0, 'translations object not found in index.html');
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
const translations = loadTranslations();

test('locked English copy is exact', () => {
  assert(REFINE_PRIMARY_EN.title === 'Want a fuller picture?', 'title changed');
  assert(REFINE_PRIMARY_EN.button === 'Add more answers', 'button changed');
  assert(translations.en.refinePrimary.title === 'Want a fuller picture?', 'en title in index.html changed');
  assert(translations.en.refinePrimary.button === 'Add more answers', 'en button in index.html changed');
  assert(translations.en.refinePrimary.summary === REFINE_PRIMARY_EN.summary, 'en summary differs from products.js');
});

test('no precise / accurate / more exact wording in the English copy', () => {
  const all = Object.values(REFINE_PRIMARY_EN).join(' ').toLowerCase();
  ['precise', 'accurate', 'exact'].forEach((w) => assert(!all.includes(w), `found "${w}"`));
});

test('all 16 languages have their own title, button and summary', () => {
  LANGS.forEach((lang) => {
    const rp = translations[lang] && translations[lang].refinePrimary;
    assert(rp, `${lang}: refinePrimary missing`);
    ['title', 'button', 'summary'].forEach((k) => {
      assert(typeof rp[k] === 'string' && rp[k].trim(), `${lang}: ${k} empty`);
      if (lang !== 'en') assert(rp[k] !== REFINE_PRIMARY_EN[k], `${lang}: ${k} is still English`);
    });
  });
});

test('copy falls back to English per key', () => {
  assert(refinePrimaryCopy(null, 'de').title === 'Want a fuller picture?', 'no table');
  assert(refinePrimaryCopy({ xx: { refinePrimary: { title: 'T' } } }, 'xx').button === 'Add more answers', 'missing key');
  assert(refinePrimaryCopy(translations, 'de').button === translations.de.refinePrimary.button, 'de button');
});

test('products.js still exports the catalog', () => {
  assert(Array.isArray(affiliateProducts) ? affiliateProducts.length > 0 : Object.keys(affiliateProducts).length > 0, 'catalog empty');
});

// ---- overlay behaviour against a stub DOM ----
function makeDom() {
  const byId = new Map();
  function el(tag, id) {
    const node = {
      tagName: tag.toUpperCase(), id: id || '', className: '', textContent: '', style: {}, hidden: false, open: false,
      listeners: {}, children: [], parentNode: null,
      setAttribute() {}, addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      click() { (this.listeners.click || []).forEach((f) => f()); },
      appendChild(c) { c.parentNode = this; this.children.push(c); if (c.id) byId.set(c.id, c); return c; },
      insertBefore(c) { return this.appendChild(c); },
      scrollIntoView() { this.scrolled = true; },
      replaceWith(other) { this.removed = true; if (this.id) byId.delete(this.id); if (other.id) byId.set(other.id, other); doc.inlineNote = null; },
      set innerHTML(html) { const re = /<(\w+)[^>]*id="([^"]+)"/g; let m; while ((m = re.exec(html))) byId.set(m[2], el(m[1], m[2])); },
    };
    if (id) byId.set(id, node);
    return node;
  }
  const doc = {
    readyState: 'complete', head: el('head'), body: el('body'), inlineNote: null,
    getElementById: (id) => byId.get(id) || null,
    querySelector: (sel) => (sel === '.refine-inline-note' ? doc.inlineNote : null),
    createElement: (tag) => el(tag),
    addEventListener() {},
  };
  el('details', 'refineDetails');
  el('summary', 'refineSummary').textContent = 'Refine my number';
  doc.inlineNote = el('p', 'refineInlineNoteStub');
  return doc;
}

function runOverlay(lang) {
  const document = makeDom();
  const sandbox = {
    document, translations, currentLanguage: lang, setTimeout: () => 0, opened: 0,
    console,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // Page globals the overlay relies on (declared by index.html in the browser).
  vm.runInContext(`
    function openRefineForm() { opened += 1; const d = document.getElementById('refineDetails'); d.open = true; }
    function applyLanguage(lang) { currentLanguage = lang; document.getElementById('refineSummary').textContent = translations[lang].buttons.refine; }
  `, sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'products.js'), 'utf8'), sandbox);
  return { document, sandbox };
}

test('overlay replaces the inline note with the primary block in the page language', () => {
  LANGS.forEach((lang) => {
    const { document } = runOverlay(lang);
    const rp = translations[lang].refinePrimary;
    assert(document.querySelector('.refine-inline-note') === null, `${lang}: old note still there`);
    assert(document.getElementById('refinePrimary'), `${lang}: block missing`);
    assert(document.getElementById('refinePrimaryTitle').textContent === rp.title, `${lang}: title`);
    assert(document.getElementById('refineNumberPrimary').textContent === rp.button, `${lang}: button`);
    assert(document.getElementById('refineSummary').textContent === rp.summary, `${lang}: summary`);
  });
});

test('primary button opens the same refine form (page openRefineForm)', () => {
  const { document, sandbox } = runOverlay('en');
  assert(!document.getElementById('refineDetails').open, 'form should start closed');
  document.getElementById('refineNumberPrimary').click();
  assert(sandbox.opened === 1 && document.getElementById('refineDetails').open, 'form did not open');
});

test('language change re-applies the copy after the page resets the summary', () => {
  const { document, sandbox } = runOverlay('en');
  vm.runInContext("applyLanguage('de')", sandbox);
  assert(document.getElementById('refineSummary').textContent === translations.de.refinePrimary.summary, 'summary not re-applied');
  assert(document.getElementById('refinePrimaryTitle').textContent === translations.de.refinePrimary.title, 'title not re-applied');
  vm.runInContext("applyLanguage('en')", sandbox);
  assert(document.getElementById('refinePrimaryTitle').textContent === 'Want a fuller picture?', 'en title not restored');
});

console.log(`\n${passed} tests passed`);
