(function () {
  'use strict';
  var root = document.querySelector('[data-syllabus-single]');
  if (!root) return;

  // 1) 字号调节
  var content = root.querySelector('.syl-content');
  var STORAGE_KEY = 'syl-font-scale';
  var scale = parseFloat(localStorage.getItem(STORAGE_KEY) || '1');
  function applyScale() { if (content) content.style.fontSize = (16 * scale) + 'px'; }
  applyScale();
  var bigger = root.querySelector('[data-syl-font-bigger]');
  var smaller = root.querySelector('[data-syl-font-smaller]');
  if (bigger) bigger.addEventListener('click', function () { scale = Math.min(1.4, scale + 0.08); localStorage.setItem(STORAGE_KEY, scale); applyScale(); });
  if (smaller) smaller.addEventListener('click', function () { scale = Math.max(0.82, scale - 0.08); localStorage.setItem(STORAGE_KEY, scale); applyScale(); });

  // 2) 复制大纲链接
  var copyBtn = root.querySelector('[data-syl-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          copyBtn.textContent = '已复制';
          setTimeout(function () { copyBtn.textContent = '复制大纲链接'; }, 1600);
        });
      }
    });
  }

  // 3) 自动收集正文里的站内链接，渲染到右侧「关联文章」列表（合并 front matter 的 related_articles）
  var aside = root.querySelector('[data-syl-aside-related]');
  if (aside && content) {
    var seen = {};
    var links = aside.querySelectorAll('a[data-related]');
    Array.prototype.forEach.call(links, function (a) { seen[a.getAttribute('href')] = a; });
    var anchors = content.querySelectorAll('a[href^="/"]');
    var newUl = document.createElement('ul');
    var added = 0;
    Array.prototype.forEach.call(anchors, function (a) {
      var href = a.getAttribute('href');
      if (!href || seen[href]) return;
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = href;
      link.textContent = (a.textContent || href).trim();
      link.setAttribute('data-related-auto', '1');
      li.appendChild(link);
      newUl.appendChild(li);
      seen[href] = link;
      added++;
    });
    if (added > 0) {
      var sep = document.createElement('li');
      sep.className = 'syl-related-sep';
      sep.textContent = '—— 正文自动关联 ——';
      sep.style.cssText = 'margin:8px 0 4px;color:var(--muted);font-size:11px;font-family:var(--mono);letter-spacing:.06em;border-top:1px dashed var(--line);padding-top:8px;';
      newUl.insertBefore(sep, newUl.firstChild);
      aside.querySelector('ul').appendChild(newUl);
    } else {
      var empty = document.createElement('p');
      empty.style.cssText = 'margin:6px 0 0;color:var(--muted);font-size:12px;';
      empty.textContent = '（正文未额外引用站内文章）';
      aside.querySelector('ul').appendChild(empty);
    }
  }

  // 4) TOC 高亮当前章节
  var tocLinks = root.querySelectorAll('.syl-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tocMap = {};
    Array.prototype.forEach.call(tocLinks, function (a) {
      var id = a.getAttribute('href').replace('#', '');
      var target = document.getElementById(id);
      if (target) tocMap[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = tocMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(tocLinks, function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    Object.keys(tocMap).forEach(function (id) {
      var t = document.getElementById(id);
      if (t) io.observe(t);
    });
  }

  // 5) 移动端 TOC 抽屉
  var toggle = root.querySelector('[data-syl-toc-toggle]');
  var asideEl = root.querySelector('[data-syl-aside]');
  if (toggle && asideEl) {
    toggle.addEventListener('click', function () { asideEl.classList.toggle('is-collapsed'); });
  }
})();

(function () {
  // Hugo 默认输出 <nav id="TableOfContents"><ul>...</ul></nav>，
  // 这里把 nav 替换为 <ul class="syl-toc">，使其与现有 CSS 配合
  var aside = document.querySelector('.syl-aside');
  if (!aside) return;
  var tocNav = aside.querySelector('nav, #TableOfContents');
  if (!tocNav) return;
  var innerUl = tocNav.querySelector('ul');
  if (!innerUl) return;
  var wrapper = document.createElement('ul');
  wrapper.className = 'syl-toc';
  while (innerUl.firstChild) wrapper.appendChild(innerUl.firstChild);
  tocNav.parentNode.replaceChild(wrapper, tocNav);
})();
