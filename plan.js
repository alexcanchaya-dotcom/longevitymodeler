// "Get my plan" — zero-account, zero-email fallback (Longevity Offer, Oct 2026).
// Rules: the free number is never gated. This collects NO email and sends nothing.
// It reads the result already on screen (number + top 3 levers) and builds a
// printable / downloadable page, or a mailto: the visitor addresses to themself.
// It does not touch scoring, cookies or ads.

var PLAN_COPY = {
  en: {
    button: 'Get my plan', note: 'Free. No email, no account. Print it, save it, or email it to yourself.',
    title: 'Your habit plan', number: 'Your estimate', levers: 'Your top 3 levers',
    weeks: 'One small step a week',
    week: function (n) { return 'Week ' + n; },
    weekStep: function (lever) { return 'Start one small step on: ' + lever + '.'; },
    week4: 'Keep all three going. Run the calculator again to see where you are.',
    none: 'Your habits already look strong. Keep them going.',
    linked: 'These habits are linked to longer life in studies.',
    disclaimer: 'Educational only. This is not medical advice. Talk to a doctor about your own health.',
    print: 'Print / save as PDF', download: 'Download', email: 'Email it to myself',
    subject: 'My Longevity Modeler habit plan'
  },
  it: {
    button: 'Ottieni il mio piano', note: 'Gratis. Niente email, niente account. Stampalo, salvalo o invialo a te stesso.',
    title: 'Il tuo piano di abitudini', number: 'La tua stima', levers: 'Le tue 3 leve principali',
    weeks: 'Un piccolo passo a settimana',
    week: function (n) { return 'Settimana ' + n; },
    weekStep: function (lever) { return 'Inizia con un piccolo passo su: ' + lever + '.'; },
    week4: 'Mantieni tutte e tre. Rifai il calcolo per vedere a che punto sei.',
    none: 'Le tue abitudini sono già buone. Continua così.',
    linked: 'Negli studi queste abitudini sono legate a una vita più lunga.',
    disclaimer: 'Solo a scopo educativo. Non è un consiglio medico. Parla con un medico della tua salute.',
    print: 'Stampa / salva in PDF', download: 'Scarica', email: 'Invialo a me stesso',
    subject: 'Il mio piano di abitudini Longevity Modeler'
  },
  ru: {
    button: 'Получить мой план', note: 'Бесплатно. Без email и регистрации. Распечатайте, сохраните или отправьте себе.',
    title: 'Ваш план привычек', number: 'Ваша оценка', levers: 'Ваши 3 главных рычага',
    weeks: 'Один маленький шаг в неделю',
    week: function (n) { return 'Неделя ' + n; },
    weekStep: function (lever) { return 'Сделайте один маленький шаг: ' + lever + '.'; },
    week4: 'Продолжайте все три. Пройдите расчёт снова, чтобы увидеть прогресс.',
    none: 'Ваши привычки уже хорошие. Продолжайте.',
    linked: 'В исследованиях эти привычки связаны с более долгой жизнью.',
    disclaimer: 'Только в образовательных целях. Это не медицинский совет. Обсудите своё здоровье с врачом.',
    print: 'Печать / сохранить PDF', download: 'Скачать', email: 'Отправить себе',
    subject: 'Мой план привычек Longevity Modeler'
  }
};

function planCopy(lang) { return PLAN_COPY[lang] || PLAN_COPY.en; }

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// data: { number: '85.5 years', levers: [{ title, tip }] }
function buildPlanText(data, lang) {
  var c = planCopy(lang);
  var levers = (data.levers || []).slice(0, 3);
  var lines = [c.title, '', c.number + ': ' + (data.number || '--'), '', c.levers + ':'];
  if (!levers.length) lines.push('- ' + c.none);
  levers.forEach(function (l, i) { lines.push((i + 1) + '. ' + l.title + (l.tip ? ' — ' + l.tip : '')); });
  lines.push('', c.weeks + ':');
  for (var w = 1; w <= 3; w++) {
    var lv = levers[w - 1] || levers[0];
    lines.push(c.week(w) + ': ' + (lv ? c.weekStep(lv.title) : c.none));
  }
  lines.push(c.week(4) + ': ' + c.week4, '', c.linked, c.disclaimer, '', 'https://longevitymodeler.com');
  return lines.join('\n');
}

function buildPlanHtml(data, lang) {
  var c = planCopy(lang);
  var text = buildPlanText(data, lang);
  var body = text.split('\n').map(function (l) { return l ? '<p>' + escapeHtml(l) + '</p>' : ''; }).join('');
  return '<!doctype html><html lang="' + escapeHtml(PLAN_COPY[lang] ? lang : 'en') + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(c.title) + '</title>' +
    '<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;line-height:1.5;color:#111}p{margin:4px 0}</style>' +
    '</head><body>' + body + '</body></html>';
}

function buildPlanMailto(data, lang) {
  var c = planCopy(lang);
  // No address: the visitor types their own. Nothing is sent or stored by the site.
  return 'mailto:?subject=' + encodeURIComponent(c.subject) + '&body=' + encodeURIComponent(buildPlanText(data, lang));
}

if (typeof document !== 'undefined') {
  (function () {
    function lang() { try { return currentLanguage; } catch (e) { return 'en'; } }
    function readResult() {
      var num = (document.getElementById('lifespanValue') || {}).textContent || '';
      var cards = document.querySelectorAll('#recommendationChips .lever-card');
      var levers = Array.prototype.map.call(cards, function (card) {
        var t = card.querySelector('h4 span:not(.lever-rank)');
        var tip = card.querySelector('.lever-tip');
        return { title: t ? t.textContent.trim() : '', tip: tip ? tip.textContent.trim() : '' };
      });
      return { number: num.trim(), levers: levers };
    }
    function refreshLabels() {
      var c = planCopy(lang());
      var b = document.getElementById('getMyPlanButton');
      var n = document.getElementById('getMyPlanNote');
      if (b) b.textContent = c.button;
      if (n) n.textContent = c.note;
    }
    function openPlan() {
      var l = lang(), c = planCopy(l), data = readResult();
      var html = buildPlanHtml(data, l);
      var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      var box = document.getElementById('getMyPlanActions');
      box.innerHTML = '';
      function add(label, href, extra) {
        var a = document.createElement('a');
        a.className = 'get-my-plan-link';
        a.href = href; a.textContent = label;
        if (extra) extra(a);
        box.appendChild(a);
      }
      add(c.print, url, function (a) { a.target = '_blank'; a.rel = 'noopener'; });
      add(c.download, url, function (a) { a.download = 'my-habit-plan.html'; });
      add(c.email, buildPlanMailto(data, l));
      box.hidden = false;
      box.style.display = 'flex';
    }
    function init() {
      var b = document.getElementById('getMyPlanButton');
      if (!b) return;
      b.addEventListener('click', openPlan);
      refreshLabels();
      if (typeof applyLanguage === 'function' && !applyLanguage.__planWrapped) {
        var orig = applyLanguage;
        var wrapped = function (x) { var r = orig.apply(this, arguments); refreshLabels(); var a = document.getElementById('getMyPlanActions'); if (a) { a.hidden = true; a.style.display = ''; a.innerHTML = ''; } return r; };
        wrapped.__planWrapped = true;
        applyLanguage = wrapped;
        try { window.applyLanguage = wrapped; } catch (e) {}
      }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PLAN_COPY: PLAN_COPY, buildPlanText: buildPlanText, buildPlanHtml: buildPlanHtml, buildPlanMailto: buildPlanMailto, planCopy: planCopy };
}
