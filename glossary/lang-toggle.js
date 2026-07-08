(function () {
  'use strict';

  var STORAGE_KEY = 'glossary-lang';
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
    var zh = card.getAttribute('data-term-zh') || '';
    var en = card.getAttribute('data-term-en') || '';
    return lang === 'en' ? (en || zh) : (zh || en);
  }

  function pickKey(card, lang) {
    if (lang === 'en') {
      var enName = card.getAttribute('data-term-en') || '';
      return (enName ? enName.charAt(0) : '?').toUpperCase();
    }
    var py = card.getAttribute('data-pinyin') || '';
    if (py) return py.toUpperCase();
    var zhName = card.getAttribute('data-term-zh') || '';
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

  function render(lang) {
    var shell = $('.glossary-groups');
    if (!shell) return;
    var cards = $$('.glossary-card', shell);

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
      sec.className = 'glossary-group';
      sec.id = 'letter-' + letter;
      sec.innerHTML =
        '<h2 class="glossary-group__heading">' +
          '<span>' + letter + '</span>' +
          '<span class="glossary-group__heading-meta">' + items.length + ' 个词条</span>' +
        '</h2>' +
        '<div class="glossary-grid"></div>';
      var newGrid = sec.querySelector('.glossary-grid');
      items.forEach(function (card) {
        var titleEl = card.querySelector('.glossary-card__title');
        if (titleEl) titleEl.textContent = pickName(card, lang);
        newGrid.appendChild(card);
      });
      shell.appendChild(sec);
    });

    var alpha = $('.glossary-alphabet');
    if (alpha) {
      $$('.glossary-alphabet__chip', alpha).forEach(function (chip) { chip.remove(); });
      letters.forEach(function (letter) {
        var a = document.createElement('a');
        a.className = 'glossary-alphabet__chip';
        a.href = '#letter-' + letter;
        a.textContent = letter;
        alpha.appendChild(a);
      });
    }

    document.documentElement.setAttribute('data-glossary-lang', lang);
  }

  function applyLang(lang) {
    var toggle = $('.glossary-lang-toggle');
    if (toggle) {
      toggle.textContent = lang === 'en' ? 'EN' : '中';
      toggle.setAttribute('data-lang', lang);
      toggle.setAttribute('title', lang === 'en' ? '切换到中文' : '切换到英文');
      toggle.setAttribute('aria-label', lang === 'en' ? '当前英文，点击切换到中文' : '当前中文，点击切换到英文');
    }

    var shell = $('.glossary-shell');
    if (shell) {
      shell.classList.add('is-fading');
      requestAnimationFrame(function () {
        render(lang);
        requestAnimationFrame(function () {
          shell.classList.remove('is-fading');
        });
      });
    }
  }

  function init() {
    var lang = getStoredLang();
    var toggle = $('.glossary-lang-toggle');
    if (!toggle) {
      document.documentElement.setAttribute('data-glossary-lang', lang);
      return;
    }
    toggle.addEventListener('click', function () {
      var cur = getStoredLang();
      var next = cur === 'zh' ? 'en' : 'zh';
      setStoredLang(next);
      applyLang(next);
    });
    applyLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
