(function () {
  'use strict';
  var root = document.querySelector('[data-syllabus-index]');
  if (!root) return;

  var search = root.querySelector('[data-syl-search]');
  var chipsWrap = root.querySelector('[data-syl-chips]');
  var grid = root.querySelector('[data-syl-grid]');
  var empty = root.querySelector('[data-syl-empty]');
  var emptyBtn = root.querySelector('[data-syl-empty-clear]');
  var countEl = root.querySelector('[data-syl-count]');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.syl-card'));
  var total = cards.length;

  var state = { q: '', tags: [] };

  function normalize(s) { return (s || '').toLowerCase().trim(); }

  function apply() {
    var q = normalize(state.q);
    var tags = state.tags;
    var visible = 0;
    cards.forEach(function (c) {
      var hay = normalize(c.getAttribute('data-search') || '');
      var ctags = (c.getAttribute('data-tags') || '').split('|').filter(Boolean);
      var hitQ = !q || hay.indexOf(q) !== -1;
      var hitT = !tags.length || tags.every(function (t) {
        var aliases = t.split('|').map(function (a) { return a.toLowerCase(); });
        return ctags.some(function (ct) {
          var lo = ct.toLowerCase();
          return aliases.some(function (a) { return lo === a || lo.indexOf(a) !== -1; });
        });
      });
      var show = hitQ && hitT;
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (countEl) countEl.textContent = visible + ' / ' + total + ' 门';
    if (empty) empty.classList.toggle('is-visible', visible === 0);
  }

  if (search) {
    search.addEventListener('input', function (e) {
      state.q = e.target.value;
      apply();
    });
  }

  if (chipsWrap) {
    chipsWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.syl-chip');
      if (!btn) return;
      var tag = btn.getAttribute('data-tag') || '';
      // "全部" chip: data-tag 为空 -> 清掉所有筛选
      if (!tag) {
        state.tags = [];
        Array.prototype.forEach.call(chipsWrap.querySelectorAll('.syl-chip'), function (c) {
          c.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        apply();
        return;
      }
      // 切换其他 chip 选中
      var idx = state.tags.indexOf(tag);
      if (idx >= 0) {
        state.tags.splice(idx, 1);
        btn.classList.remove('is-active');
      } else {
        state.tags.push(tag);
        btn.classList.add('is-active');
      }
      // 切换具体 chip 时,取消"全部"的 active
      var allBtn = chipsWrap.querySelector('.syl-chip[data-tag=""]');
      if (allBtn) allBtn.classList.remove('is-active');
      apply();
    });
  }

  if (emptyBtn) {
    emptyBtn.addEventListener('click', function () {
      state.q = ''; state.tags = [];
      if (search) search.value = '';
      if (chipsWrap) Array.prototype.forEach.call(chipsWrap.querySelectorAll('.syl-chip'), function (c) {
        c.classList.remove('is-active');
      });
      apply();
    });
  }

  apply();
})();
