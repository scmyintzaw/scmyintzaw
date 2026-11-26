/* Shwe Chee Myint Zaw — portfolio interactions. Plain JS, no dependencies. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Split hero letters for the intro animation ---------- */
  $$('[data-split]').forEach((el, li) => {
    const t = el.textContent;
    el.textContent = '';
    [...t].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      s.style.animationDelay = (0.15 + li * 0.12 + i * 0.035) + 's';
      el.appendChild(s);
    });
  });
  /* Word-by-word rise for project titles */
  $$('[data-balance]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'); o.className = 'w';
      const n = document.createElement('span'); n.textContent = w;
      n.style.animationDelay = (0.1 + i * 0.08) + 's';
      o.appendChild(n); el.appendChild(o); el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Fit oversized type to its container width ---------- */
  const fit = () => {
    $$('.fit').forEach(el => {
      const box = el.parentElement;
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      if (w) el.style.fontSize = Math.max(24, (100 * avail / w) * 0.995) + 'px';
    });
  };
  fit();
  if (document.fonts) document.fonts.ready.then(() => { fit(); layoutAll(); });

  /* ---------- Clock ---------- */
  const clock = $('[data-clock]');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Los_Angeles' });
    const tick = () => { clock.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Hero reveal lens ---------- */
  const hero = $('.hero[data-lens]');
  if (hero && !reduced) {
    const imgs = JSON.parse(hero.dataset.lens);
    const layer = $('.lens-img', hero);
    let idx = 0, raf = 0, px = 0, py = 0;
    imgs.forEach(src => { const i = new Image(); i.src = src; });   // warm cache
    const setImg = () => { layer.style.backgroundImage = `url("${imgs[idx % imgs.length]}")`; };
    setImg();
    const move = (x, y) => {
      px = x; py = y;
      if (!raf) raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--x', (px - r.left) + 'px');
        hero.style.setProperty('--y', (py - r.top) + 'px');
        raf = 0;
      });
    };
    const on = () => hero.classList.add('lens-on');
    const off = () => { hero.classList.remove('lens-on'); idx++; setTimeout(setImg, 450); };
    hero.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { move(e.clientX, e.clientY); on(); } });
    hero.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); });
    hero.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') off(); });
    hero.addEventListener('click', () => { idx++; setImg(); });
    // Touch: the lens drifts on its own; press and drag to steer it
    if (!finePointer) {
      let drift = true, t0 = performance.now(), last = 0, resume;
      hero.style.setProperty('--r', '30vmin');
      const wander = now => {
        if (drift) {
          const r = hero.getBoundingClientRect(), t = (now - t0) / 1000;
          hero.style.setProperty('--x', (r.width * (0.5 + 0.36 * Math.sin(t * 0.55))) + 'px');
          hero.style.setProperty('--y', (r.height * (0.55 + 0.2 * Math.sin(t * 0.83 + 1))) + 'px');
          if (now - last > 4200) { last = now; idx++; setImg(); }
        }
        requestAnimationFrame(wander);
      };
      on(); requestAnimationFrame(wander);
      hero.addEventListener('touchstart', e => { drift = false; clearTimeout(resume); const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });
      hero.addEventListener('touchmove', e => { const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });
      hero.addEventListener('touchend', () => { resume = setTimeout(() => { drift = true; }, 1600); }, { passive: true });
    }
  }

  /* ---------- Horizontal scroll sections ---------- */
  const scrollers = $$('[data-hscroll]').map(root => ({
    root,
    sticky: $('.hs-sticky', root),
    track: $('.hs-track', root),
    bars: $$('.hs-bar i', root),
    cur: $('[data-cur]', root),
    figs: $$('.fig', root),
    dist: 0,
  }));
  const useNative = () => reduced || window.innerWidth <= 760 || !finePointer;

  function layout(s) {
    const native = useNative();
    s.root.classList.toggle('native', native);
    s.track.style.transform = '';
    if (native) { s.root.style.height = ''; return; }
    s.dist = Math.max(0, s.track.scrollWidth - window.innerWidth);
    s.root.style.height = (s.sticky.offsetHeight + s.dist) + 'px';
  }
  function layoutAll() { scrollers.forEach(layout); update(); }

  function setProgress(s, p) {
    s.bars.forEach(b => b.style.setProperty('--p', p.toFixed(4)));
    if (s.cur && s.figs.length) {
      // Figure whose centre is closest to the viewport centre
      const mid = window.innerWidth / 2;
      let best = 0, bd = Infinity;
      s.figs.forEach((f, i) => { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      s.cur.textContent = String(best + 1).padStart(2, '0');
    }
  }
  function update() {
    scrollers.forEach(s => {
      if (s.root.classList.contains('native')) {
        const max = s.track.scrollWidth - s.track.clientWidth;
        setProgress(s, max > 0 ? s.track.scrollLeft / max : 0);
        return;
      }
      const top = s.root.getBoundingClientRect().top - ($('.topbar')?.offsetHeight || 0);
      const p = s.dist ? Math.min(1, Math.max(0, -top / s.dist)) : 0;
      s.track.style.transform = `translate3d(${-p * s.dist}px,0,0)`;
      setProgress(s, p);
    });
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } };
  addEventListener('scroll', onScroll, { passive: true });
  scrollers.forEach(s => s.track.addEventListener('scroll', onScroll, { passive: true }));
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { fit(); layoutAll(); }, 120); });
  layoutAll();

  // Shift+wheel or horizontal trackpad swipes inside a sticky section move the page
  scrollers.forEach(s => s.sticky.addEventListener('wheel', e => {
    if (s.root.classList.contains('native')) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); scrollBy(0, e.deltaX); }
  }, { passive: false }));

  // Cards reveal themselves when they reach the middle of the screen on touch devices
  if (!finePointer && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('in-view', en.isIntersecting)),
      { root: null, threshold: 0.6 });
    $$('.card').forEach(c => io.observe(c));
  }

  /* ---------- Cursor-following image preview ---------- */
  const prev = $('.cursor-preview');
  if (prev && finePointer) {
    const pimg = $('img', prev);
    let tx = -999, ty = -999, x = -999, y = -999, vx = 0, loop = 0;
    const animate = () => {
      const nx = x + (tx - x) * 0.18, ny = y + (ty - y) * 0.18;
      vx = nx - x; x = nx; y = ny;
      prev.style.setProperty('--cx', (x + 24) + 'px');
      prev.style.setProperty('--cy', (y - prev.offsetHeight / 2) + 'px');
      prev.style.setProperty('--rot', Math.max(-8, Math.min(8, vx * 0.4)) + 'deg');
      loop = requestAnimationFrame(animate);
    };
    $$('[data-preview]').forEach(a => {
      a.addEventListener('mouseenter', e => {
        pimg.src = a.dataset.preview;
        if (x < -900) { x = e.clientX; y = e.clientY; }
        prev.classList.add('on');
        if (!loop) loop = requestAnimationFrame(animate);
      });
      a.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      a.addEventListener('mouseleave', () => { prev.classList.remove('on'); });
    });
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  }

  /* ---------- Lightbox ---------- */
  const lb = $('.lightbox');
  const btns = $$('.fig-btn');
  if (lb && btns.length) {
    const limg = $('img', lb), lcap = $('figcaption', lb);
    let i = 0, lastFocus = null;
    const show = n => {
      i = (n + btns.length) % btns.length;
      const im = $('img', btns[i]);
      limg.src = im.dataset.full; limg.alt = im.alt;
      lcap.innerHTML = btns[i].nextElementSibling.innerHTML;
    };
    const open = n => { lastFocus = document.activeElement; show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; limg.src = ''; lastFocus && lastFocus.focus({ preventScroll: true }); };
    btns.forEach((b, n) => b.addEventListener('click', () => open(n)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(i - 1));
    $('.lb-next', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ---------- Expandable text boxes ---------- */
  $$('.textbox').forEach(box => {
    const btn = $('.tb-toggle', box), label = $('span', btn);
    btn.addEventListener('click', () => {
      const open = !box.classList.contains('open');
      box.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      label.textContent = open ? 'Collapse' : 'Read full text';
      if (!open) box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      layoutAll();
    });
  });

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied ✓'; b.classList.add('done'); }
    catch { location.href = 'mailto:' + b.dataset.copy; }
    setTimeout(() => { b.textContent = 'Copy email'; b.classList.remove('done'); }, 1800);
  }));

  /* ---------- Back to top ---------- */
  $$('[data-top]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }));

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.15 });
    $$('.rv').forEach(el => io.observe(el));
  } else $$('.rv').forEach(el => el.classList.add('in'));
})();
