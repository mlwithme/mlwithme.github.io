(function () {
  'use strict';

  var STORAGE_KEY = 'ct-lang';
  var SUPPORTED = ['zh', 'en'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(v) !== -1) return v;
    } catch (e) {}
    return 'zh';
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function pickName(card, lang) {
    var zh = card.getAttribute('data-term-zh') || card.getAttribute('data-name-zh') || '';
    var en = card.getAttribute('data-term-en') || card.getAttribute('data-name-en') || '';
    return lang === 'en' ? (en || zh) : (zh || en);
  }

  function pickKey(card, lang) {
    if (lang === 'en') {
      var enName = card.getAttribute('data-term-en') || card.getAttribute('data-name-en') || '';
      return (enName ? enName.charAt(0) : '?').toUpperCase();
    }
    var py = card.getAttribute('data-pinyin') || '';
    if (py) return py.toUpperCase();
    var zhName = card.getAttribute('data-term-zh') || card.getAttribute('data-name-zh') || '';
    return (zhName ? zhName.charAt(0) : '?').toUpperCase();
  }

  function sortLetters(letters) {
    return letters.sort(function (a, b) {
      var aIsLetter = /[A-Za-z]/.test(a);
      var bIsLetter = /[A-Za-z]/.test(b);
      if (aIsLetter && !bIsLetter) return -1;
      if (!aIsLetter && bIsLetter) return 1;
      return a.localeCompare(b, 'zh');
    });
  }

  function renderList(lang) {
    var shell = $('.ct-groups');
    if (!shell) return;

    var cards = $$('.ct-card', shell);
    var groups = {};
    cards.forEach(function (card) {
      var key = pickKey(card, lang);
      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    });

    var letters = sortLetters(Object.keys(groups));

    shell.innerHTML = '';
    letters.forEach(function (letter) {
      var items = groups[letter];
      var sec = document.createElement('section');
      sec.className = 'ct-group';
      sec.id = 'letter-' + letter;
      sec.innerHTML =
        '<h2 class="ct-group__heading">' +
          '<span>' + letter + '</span>' +
          '<span class="ct-group__heading-meta">' + items.length + ' 个模板</span>' +
        '</h2>' +
        '<div class="ct-grid"></div>';
      var grid = sec.querySelector('.ct-grid');
      items.forEach(function (card) {
        var titleEl = card.querySelector('.ct-card__title');
        if (titleEl) titleEl.textContent = pickName(card, lang);
        grid.appendChild(card);
      });
      shell.appendChild(sec);
    });

    var alpha = $('.ct-alphabet');
    if (alpha) {
      $$('.ct-alphabet__chip', alpha).forEach(function (chip) { chip.remove(); });
      letters.forEach(function (letter) {
        var a = document.createElement('a');
        a.className = 'ct-alphabet__chip';
        a.href = '#letter-' + letter;
        a.textContent = letter;
        alpha.appendChild(a);
      });
    }
  }

  function renderDetail(lang) {
    var title = $('.ct-detail-hero__title');
    if (!title) return;
    var zh = title.getAttribute('data-name-zh') || '';
    var en = title.getAttribute('data-name-en') || '';
    title.textContent = lang === 'en' ? (en || zh) : (zh || en);
  }

  function applyLang(lang) {
    var toggles = $$('.ct-lang-toggle');
    toggles.forEach(function (toggle) {
      toggle.textContent = lang === 'en' ? 'EN' : '中';
      toggle.setAttribute('data-lang', lang);
      toggle.setAttribute('title', lang === 'en' ? '切换到中文' : '切换到英文');
      toggle.setAttribute('aria-label', lang === 'en' ? '当前英文，点击切换到中文' : '当前中文，点击切换到英文');
    });

    var shell = document.querySelector('.ct-shell');
    if (!shell) return;
    shell.classList.add('is-fading');
    requestAnimationFrame(function () {
      if (shell.classList.contains('ct-shell--detail')) {
        renderDetail(lang);
      } else {
        renderList(lang);
      }
      requestAnimationFrame(function () {
        shell.classList.remove('is-fading');
      });
    });

    document.documentElement.setAttribute('data-ct-lang', lang);
  }

  function init() {
    var lang = getStoredLang();
    var toggles = $$('.ct-lang-toggle');
    if (toggles.length === 0) {
      document.documentElement.setAttribute('data-ct-lang', lang);
      return;
    }
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var cur = getStoredLang();
        var next = cur === 'zh' ? 'en' : 'zh';
        setStoredLang(next);
        applyLang(next);
      });
    });
    applyLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 复制按钮：依赖 CSS 中 pre::before 视觉，按钮即 pre 本身 */
  document.addEventListener('click', function (e) {
    var pre = e.target.closest('pre');
    if (!pre || !pre.parentElement || !pre.parentElement.classList.contains('ct-detail-body')) return;
    var code = pre.querySelector('code') || pre;
    var text = code.innerText || code.textContent || '';
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      pre.classList.add('is-copied');
      setTimeout(function () { pre.classList.remove('is-copied'); }, 1200);
    }).catch(function () {});
  });
})();
