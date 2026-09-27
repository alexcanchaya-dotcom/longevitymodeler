/*
 * Road to 100 (YouTube @RoadTo100Years): video embeds on the homepage calculator.
 *
 * ============================ EDIT HERE ============================
 * To publish a video, paste its 11-character YouTube ID into `videoId`
 * (one-line edit). Entries with an empty videoId render NOTHING. If every
 * videoId is empty, the whole Road to 100 section stays hidden.
 * All five videos currently target the homepage (index.html).
 * Tracked link for each video (for the YouTube description):
 *   https://longevitymodeler.com/?utm_source=youtube&utm_campaign=road100&utm_content=<slug>
 * ===================================================================
 */
window.ROAD100_VIDEOS = [
  { slug: 'life-expectancy-5-answers', title: 'Life Expectancy Calculator: 5 Answers, Under a Minute', videoId: '', page: 'index' },
  { slug: 'what-moved-my-number', title: "I Checked My Life Expectancy in 60 Seconds. Here's What Moved It", videoId: '', page: 'index' },
  { slug: 'habits-vs-calculator', title: 'Aiming for 100? The Habits That Matter vs What the Calculator Asks', videoId: '', page: 'index' },
  { slug: 'can-you-reach-100', title: 'Can You Reach 100? What the Real Numbers Say', videoId: '', page: 'index' },
  { slug: 'joke-quizzes-vs-real', title: 'Joke Lifespan Quizzes vs a Real Life Expectancy Calculator', videoId: '', page: 'index' }
];
/* ========================== END OF EDIT AREA ========================== */

(function () {
  'use strict';

  var ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

  function publishedVideos(page) {
    return (window.ROAD100_VIDEOS || []).filter(function (v) {
      return v && v.page === page && ID_PATTERN.test(String(v.videoId || '').trim());
    });
  }

  function isRoad100Visit() {
    try {
      var campaign = new URLSearchParams(window.location.search).get('utm_campaign');
      return (campaign || '').toLowerCase() === 'road100';
    } catch (e) {
      return false;
    }
  }

  // Click-to-load: only a lazy thumbnail until the visitor clicks. No YouTube script,
  // no iframe and no cookies before the click; the 16:9 box is reserved by CSS.
  function buildVideo(video, playLabel) {
    var id = String(video.videoId).trim();
    var figure = document.createElement('figure');
    figure.className = 'road100-video';

    var frame = document.createElement('div');
    frame.className = 'road100-frame';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'road100-play';
    button.setAttribute('aria-label', playLabel + ': ' + video.title);

    var img = document.createElement('img');
    img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 480;
    img.height = 360;

    var icon = document.createElement('span');
    icon.className = 'road100-play-icon';
    icon.setAttribute('aria-hidden', 'true');

    button.appendChild(img);
    button.appendChild(icon);
    button.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      iframe.title = video.title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.replaceChild(iframe, button);
    });

    frame.appendChild(button);
    var caption = document.createElement('figcaption');
    caption.textContent = video.title;
    figure.appendChild(frame);
    figure.appendChild(caption);
    return figure;
  }

  var SUPPORTED = ['en', 'es', 'pl', 'de', 'fr', 'zh', 'it', 'pt', 'ja', 'ko', 'ru', 'ar', 'hi', 'tr', 'nl', 'sv'];

  // Mirrors detectLanguage() in index.html; only used before the page's own language code runs.
  function earlyLanguage() {
    try {
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang && SUPPORTED.indexOf(urlLang) !== -1) return urlLang;
      var stored = window.localStorage.getItem('preferredLang');
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
      var browser = (navigator.language || '').slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(browser) !== -1) return browser;
    } catch (e) { /* fall through */ }
    return 'en';
  }

  var mountedVideos = null;

  // Runs as soon as this script loads. The <script> tag sits right after the section markup
  // and before the content below it, so showing the section here does not shift anything
  // that is already painted. Visible text starts in English and is swapped by render().
  function mount() {
    var section = document.getElementById('road100Section');
    if (!section || mountedVideos) return;
    var videos = publishedVideos('index');
    mountedVideos = videos;
    if (!videos.length) {
      section.hidden = true;
      return;
    }
    // Set text direction now (same language detection as the page) so Arabic doesn't flip later.
    section.dir = earlyLanguage() === 'ar' ? 'rtl' : 'ltr';
    var list = document.getElementById('road100Videos');
    var play = 'Play video';
    videos.forEach(function (v) { list.appendChild(buildVideo(v, play)); });
    section.hidden = false;
  }

  // Called by the page's language code. strings: { cta, resultLine, play, disclaimer }
  function render(strings, dir) {
    var line = document.getElementById('road100ResultLine');
    if (line) {
      line.hidden = !isRoad100Visit();
      line.textContent = strings.resultLine;
      line.dir = dir;
    }

    mount();
    var section = document.getElementById('road100Section');
    if (!section || !mountedVideos || !mountedVideos.length) return;
    section.dir = dir;
    var cta = document.getElementById('road100Cta');
    if (cta) cta.textContent = strings.cta;
    var disclaimer = document.getElementById('road100Disclaimer');
    if (disclaimer) disclaimer.textContent = strings.disclaimer;
    section.querySelectorAll('.road100-play').forEach(function (b, i) {
      b.setAttribute('aria-label', strings.play + ': ' + mountedVideos[i].title);
    });
  }

  mount();

  window.Road100 = { render: render, publishedVideos: publishedVideos, isRoad100Visit: isRoad100Visit };
})();
