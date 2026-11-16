/* GPUaaS / Knowledge behaviour. Vanilla ES2020, no dependencies. Each module is isolated so one failure cannot stop the rest. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var el = function (tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var status = $('#status');
  function announce(msg) { if (!status) return; status.textContent = ''; setTimeout(function () { status.textContent = msg; }, 30); }
  function mod(name, fn) { try { fn(); } catch (e) { console.warn('[gpuaas] ' + name + ' failed', e); } }
  var isApple = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* base URL: the site root, from data-base (works at / and /samsblog/, any depth) */
  var BASE = new URL((body.dataset.base || '.').replace(/\/?$/, '/'), location.href);

  /* skip link: move focus for real */
  mod('skip', function () {
    var s = $('[data-skip]'); if (!s) return;
    s.addEventListener('click', function (e) { var m = $('#main'); if (m) { e.preventDefault(); m.focus(); m.scrollIntoView(); } });
  });

  /* theme toggle */
  mod('theme', function () {
    var b = $('#theme'); if (!b) return;
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var effective = function () { return root.dataset.theme || (mq.matches ? 'dark' : 'light'); };
    var sync = function () { b.setAttribute('aria-pressed', String(effective() === 'dark')); };
    b.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('gpuaas-theme', next); } catch (e) { /* private mode: session only */ }
      sync();
    });
    if (mq.addEventListener) mq.addEventListener('change', sync);
    sync();
  });

  /* mobile menu */
  mod('menu', function () {
    var d = $('.menu'); if (!d) return;
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.open) { d.open = false; $('summary', d).focus(); } });
    d.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) d.open = false; });
    matchMedia('(min-width:1024px)').addEventListener('change', function (m) { if (m.matches) d.open = false; });
  });

  /* TOC: collapse below 1280px, scroll spy */
  mod('toc', function () {
    var t = $('.toc'); if (!t) return;
    var mq = matchMedia('(min-width:1400px)');
    var set = function () { t.open = mq.matches; };
    set(); mq.addEventListener('change', set);
    var links = $$('a', t), map = {};
    links.forEach(function (a) { map[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[en.target.id]; if (a) a.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-72px 0px -70% 0px' });
    $$('.prose h2[id]').forEach(function (h) { if (map[h.id]) io.observe(h); });
  });

  /* heading anchors */
  mod('anchors', function () {
    $$('.prose h2[id], .prose h3[id]').forEach(function (h) {
      var a = el('a', 'anchor', '#'); a.href = '#' + h.id; a.setAttribute('aria-label', 'Link to this section'); h.appendChild(a);
    });
  });

  /* tables: label from preceding heading; focusable only while it overflows */
  mod('tables', function () {
    $$('.table-wrap').forEach(function (w) {
      var h = w, label = 'Table';
      while ((h = h.previousElementSibling)) { if (/^H[1-6]$/.test(h.tagName)) { label = 'Table: ' + h.textContent.replace(/#$/, '').trim(); break; } }
      w.setAttribute('aria-label', label);
      var hint = null;
      var check = function () {
        var over = w.scrollWidth > w.clientWidth + 1;
        if (over) {
          w.setAttribute('role', 'region'); w.setAttribute('tabindex', '0');
          if (!hint) { hint = el('p', 'table-hint', 'Scroll for more columns →'); w.after(hint); }
        } else {
          w.removeAttribute('role'); w.removeAttribute('tabindex');
          if (hint) { hint.remove(); hint = null; }
        }
      };
      check();
      if ('ResizeObserver' in window) new ResizeObserver(check).observe(w); else addEventListener('resize', check);
    });
  });

  /* code copy */
  mod('copy', function () {
    $$('.highlight, .prose > pre').forEach(function (box) {
      var pre = box.tagName === 'PRE' ? box : $('pre', box); if (!pre) return;
      var scroller = pre;
      var upd = function () { if (scroller.scrollWidth > scroller.clientWidth) scroller.tabIndex = 0; else scroller.removeAttribute('tabindex'); };
      upd();
      var wrap = box;
      if (box.tagName === 'PRE') { wrap = el('div', 'highlight'); box.replaceWith(wrap); wrap.appendChild(box); }
      var b = el('button', 'copy', 'Copy'); b.type = 'button'; b.setAttribute('aria-label', 'Copy code');
      b.addEventListener('click', function () {
        var text = pre.innerText.replace(/\n$/, '');
        var done = function (ok) {
          b.textContent = ok ? 'Copied' : 'Copy failed'; announce(ok ? 'Copied to clipboard' : 'Copy failed');
          setTimeout(function () { b.textContent = 'Copy'; }, 2000);
        };
        var fallback = function () {
          var ta = el('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; body.appendChild(ta); ta.select();
          var ok = false; try { ok = doc.execCommand('copy'); } catch (e) { console.warn('[gpuaas] copy failed', e); }
          ta.remove(); done(ok);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
      });
      wrap.appendChild(b);
    });
  });

  /* task list labels */
  mod('tasks', function () {
    $$('.task-list-item').forEach(function (li) {
      var i = $('input', li); if (!i) return;
      var t = li.textContent.trim(); if (t) i.setAttribute('aria-label', t);
    });
  });

  /* search */
  mod('search', function () {
    var dlg = $('#search'); if (!dlg || typeof dlg.showModal !== 'function') return;
    var input = $('#q'), list = $('#results'), empty = $('#empty'), count = $('#count'), sugg = $('#suggested');
    var items = null, loading = null, active = -1, opener = null;
    var hints = $$('[data-hint]');
    hints.forEach(function (h) { h.textContent = isApple ? '⌘K' : 'Ctrl K'; });

    var decode = function (h) { return new DOMParser().parseFromString(h || '', 'text/html').body.textContent || ''; };
    function load() {
      if (loading) return loading;
      loading = fetch(new URL('search.json', BASE)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
        items = (j.items || []).filter(function (it) { return it.location !== ''; }).map(function (it, i) {
          var t = decode(it.title), x = decode(it.text).replace(/\s+/g, ' ').trim();
          var level = it.location.indexOf('#') > -1 ? 2 : 1;
          var path = it.path || [];
          var row = level === 1 ? t : ((path[1] && path[1] !== 'Overview' ? path[1] : path[0]) || '') + ' › ' + t;
          return { i: i, title: t, tl: t.toLowerCase(), text: x, xl: x.toLowerCase(), level: level, row: row, section: path[0] || '', loc: it.location };
        });
      }).catch(function (e) { console.warn('[gpuaas] search index unavailable', e); items = false; });
      return loading;
    }
    function wp(s, term) { return new RegExp('(^|[^a-z0-9])' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(s); }
    function rank(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean); if (!terms.length) return [];
      var out = [];
      items.forEach(function (it) {
        var score = 0, ok = true, allTitle = true;
        terms.forEach(function (t) {
          var s = 0;
          if (wp(it.tl, t)) s = 10; else if (it.tl.indexOf(t) > -1) s = 5; else if (wp(it.xl, t)) s = 2; else if (it.xl.indexOf(t) > -1) s = 1;
          if (!s) ok = false;
          if (it.tl.indexOf(t) === -1) allTitle = false;
          score += s;
        });
        if (!ok) return;
        if (allTitle) score += 6;
        if (it.level === 1) score += 2;
        out.push({ it: it, score: score });
      });
      out.sort(function (a, b) { return b.score - a.score || a.it.level - b.it.level || a.it.i - b.it.i; });
      return out.slice(0, 8).map(function (o) { return o.it; });
    }
    function mark(parent, text, terms) {
      if (!terms.length) { parent.appendChild(doc.createTextNode(text)); return; }
      var re = new RegExp('(' + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'ig');
      text.split(re).forEach(function (part, k) {
        if (k % 2) { var m = el('mark'); m.textContent = part; parent.appendChild(m); } else if (part) parent.appendChild(doc.createTextNode(part));
      });
    }
    function snippet(it, terms) {
      var lo = it.xl, at = -1;
      terms.forEach(function (t) { var p = lo.indexOf(t); if (p > -1 && (at < 0 || p < at)) at = p; });
      if (at < 0) return it.text.slice(0, 120);
      var s = Math.max(0, at - 40), e = Math.min(it.text.length, s + 120);
      return (s > 0 ? '…' : '') + it.text.slice(s, e) + (e < it.text.length ? '…' : '');
    }
    function setActive(n) {
      var opts = $$('li', list); if (!opts.length) { active = -1; input.removeAttribute('aria-activedescendant'); return; }
      active = (n + opts.length) % opts.length;
      opts.forEach(function (o, k) { o.setAttribute('aria-selected', String(k === active)); });
      input.setAttribute('aria-activedescendant', opts[active].id);
      opts[active].scrollIntoView({ block: 'nearest' });
    }
    function render(rows, terms, showSuggested) {
      list.textContent = ''; empty.textContent = ''; empty.hidden = true; sugg.hidden = !showSuggested; active = -1;
      input.removeAttribute('aria-activedescendant');
      rows.forEach(function (it, k) {
        var li = el('li'); li.id = 'r-' + k; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false');
        li.dataset.href = new URL(it.loc, BASE).href;
        var t = el('span', 'r-t'); mark(t, it.row, terms);
        var s = el('span', 'r-s', it.section);
        li.appendChild(t); li.appendChild(s);
        if (!showSuggested) { var x = el('span', 'r-x'); mark(x, snippet(it, terms), terms); li.appendChild(x); }
        li.addEventListener('mousemove', function () { if (active !== k) setActive(k); });
        li.addEventListener('click', function () { location.assign(li.dataset.href); });
        list.appendChild(li);
      });
      input.setAttribute('aria-expanded', String(rows.length > 0));
    }
    function noResults(q) {
      render([], [], false);
      empty.hidden = false;
      empty.appendChild(el('p', null, 'No results for “' + q + '”. Try:'));
      var wrap = el('div', 'sugg');
      ['approved versions', 'burn-in', 'validation', 'stop conditions'].forEach(function (s) {
        var b = el('button', null, s); b.type = 'button';
        b.addEventListener('click', function () { input.value = s; update(); input.focus(); });
        wrap.appendChild(b);
      });
      empty.appendChild(wrap);
      input.setAttribute('aria-expanded', 'false');
      count.textContent = 'No results';
    }
    function unavailable() {
      render([], [], false); empty.hidden = false;
      empty.appendChild(el('p', null, 'Search is unavailable. Browse the sections below.'));
      var wrap = el('div', 'sugg');
      $$('.primary a').filter(function (a) { return !a.classList.contains('primary__home'); }).forEach(function (a) {
        var l = el('a', null, a.textContent); l.href = a.href; l.className = 'chip'; wrap.appendChild(l);
      });
      empty.appendChild(wrap);
    }
    function update() {
      if (items === false) return unavailable();
      if (!items) return;
      var q = input.value.trim();
      if (!q) {
        var sg = ['burn-in procedure', 'approved versions', 'deployment guide', 'validation procedure', 'benchmarking procedure', 'onboarding process'];
        var rows = sg.map(function (n) { return items.filter(function (it) { return it.level === 1 && it.tl.indexOf(n.split(' ')[0]) > -1; })[0]; }).filter(Boolean);
        render(rows, [], true); count.textContent = ''; return;
      }
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean), res = rank(q);
      if (!res.length) return noResults(q);
      render(res, terms, false);
      count.textContent = res.length + ' result' + (res.length === 1 ? '' : 's') + ' for ' + q;
    }
    function open(e) {
      opener = doc.activeElement;
      if (!dlg.open) dlg.showModal();
      input.focus(); input.select();
      load().then(update);
    }
    $$('[data-search-open]').forEach(function (b) {
      b.addEventListener('click', open);
      b.addEventListener('pointerenter', load); b.addEventListener('focus', load);
    });
    $('[data-search-close]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener && opener.focus) opener.focus(); });
    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active < 0 ? -1 : active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); var o = $$('li', list)[active < 0 ? 0 : active]; if (o) location.assign(o.dataset.href); }
    });
    doc.addEventListener('keydown', function (e) {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) { e.preventDefault(); open(); return; }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !dlg.open) {
        var t = e.target; if (t && t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
        e.preventDefault(); open();
      }
    });
  });
})();
