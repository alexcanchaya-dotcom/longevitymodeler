// Soothing Stories sleep cross-link (Ready AUTH ship 22 Sep 2026).
// Own PR — not Refine #39. Educational; never claims stories fix sleep or add years.
if (typeof document !== 'undefined') {
  (function () {
    var PRIMARY_URL = 'https://youtu.be/Up8AEZjP0wE'; // Marco Polo sleep
    var SECONDARY_URL = 'https://youtu.be/NPgE4MONZ0M'; // William

    function ready(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    }

    function ensureStyles() {
      if (document.getElementById('soothingStoriesStyles')) return;
      var style = document.createElement('style');
      style.id = 'soothingStoriesStyles';
      style.textContent = [
        '.soothing-stories{margin:14px 0 10px;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);}',
        '.soothing-stories[hidden]{display:none!important;}',
        '.soothing-stories-title{margin:0 0 6px;font-size:17px;font-weight:650;letter-spacing:0.15px;color:#fff;line-height:1.35;}',
        '.soothing-stories-sub{margin:0 0 10px;font-size:13px;line-height:1.4;color:var(--text-secondary,#a8b0c4);}',
        '.soothing-stories-links{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:0;}',
        '.soothing-stories-primary{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;padding:10px 14px;font:inherit;font-size:14px;font-weight:700;color:#1a2340;background:linear-gradient(135deg,#f4f7ff,#d7e2ff);text-decoration:none;}',
        '.soothing-stories-primary:hover{filter:brightness(1.04);}',
        '.soothing-stories-secondary{color:#d7e2ff;font-size:14px;font-weight:600;text-decoration:underline;text-underline-offset:3px;}',
        '.soothing-stories-secondary:hover{color:#fff;}'
      ].join('');
      document.head.appendChild(style);
    }

    function ensureCard() {
      var existing = document.getElementById('soothingStories');
      if (existing) return existing;

      var habit = document.getElementById('habitTools');
      var recs = document.querySelector('.recommendations');
      var card = document.createElement('aside');
      card.id = 'soothingStories';
      card.className = 'soothing-stories';
      card.hidden = true;
      card.setAttribute('aria-label', 'Soothing Stories');
      card.innerHTML =
        "<h3 class=\"soothing-stories-title\">Can't sleep? Try a soothing story.</h3>" +
        '<p class="soothing-stories-sub">From Soothing Stories on YouTube — calm listening, not medical advice.</p>' +
        '<div class="soothing-stories-links">' +
        '<a class="soothing-stories-primary" href="' + PRIMARY_URL + '" target="_blank" rel="noopener noreferrer">Marco Polo sleep</a>' +
        '<a class="soothing-stories-secondary" href="' + SECONDARY_URL + '" target="_blank" rel="noopener noreferrer">William</a>' +
        '</div>';

      // Order: tip levers → Stories → Amazon habit tools. Never replace Amazon cards.
      if (habit && habit.parentNode) {
        habit.parentNode.insertBefore(card, habit);
      } else if (recs && recs.parentNode) {
        recs.parentNode.insertBefore(card, recs.nextSibling);
      } else {
        document.body.appendChild(card);
      }
      return card;
    }

    function hideStories() {
      var card = document.getElementById('soothingStories');
      if (card) card.hidden = true;
    }

    // Locked gate (Product Ready): sleepHours < 7, or Refine sleepQuality === poor.
    // 7–9 and >9 hide. Unanswered sleep never shows.
    function shouldShowStories(values) {
      var hoursRaw = values && values.sleepHours;
      var hoursEl = document.getElementById('sleepHours');
      var hoursAnswered = hoursEl && String(hoursEl.value || '').trim() !== '' && isFinite(parseFloat(hoursEl.value));
      if (!hoursAnswered) return false;

      var hours = typeof hoursRaw === 'number' && isFinite(hoursRaw)
        ? hoursRaw
        : parseFloat(hoursEl.value);

      if (isFinite(hours) && hours < 7) return true;

      var qualityEl = document.getElementById('sleepQuality');
      if (qualityEl && qualityEl.value === 'poor') return true;

      return false;
    }

    function showStoriesIfNeeded(values) {
      ensureStyles();
      var card = ensureCard();
      card.hidden = !shouldShowStories(values);
    }

    function wrapHabitTools() {
      if (typeof displayHabitTools !== 'function') return false;
      if (displayHabitTools.__soothingStoriesWrapped) return true;

      var original = displayHabitTools;
      function wrapped(improvements, values) {
        original(improvements, values);
        showStoriesIfNeeded(values);
      }
      wrapped.__soothingStoriesWrapped = true;
      displayHabitTools = wrapped;
      try { window.displayHabitTools = wrapped; } catch (e) {}

      var origHide = typeof hideHabitTools === 'function' ? hideHabitTools : null;
      if (origHide && !origHide.__soothingStoriesWrapped) {
        function hideWrapped() {
          origHide();
          hideStories();
        }
        hideWrapped.__soothingStoriesWrapped = true;
        hideHabitTools = hideWrapped;
        try { window.hideHabitTools = hideWrapped; } catch (e) {}
      }
      return true;
    }

    ready(function () {
      ensureStyles();
      ensureCard();
      var tries = 0;
      (function install() {
        if (wrapHabitTools()) return;
        tries += 1;
        if (tries < 40) setTimeout(install, 50);
      })();
    });
  })();
}
