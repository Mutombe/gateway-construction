/* Gateway Construction — main.js (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const P = window.GW_PROJECTS || [];
  const R = window.GW_REGIONS || {};
  const img = (n, sm) => `assets/img/projects/${n}${sm ? '-sm' : ''}.webp`;
  const arrow = '<i class="ph-duotone ph-arrow-up-right" aria-hidden="true"></i>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));

  /* ---------- nav: active page, sticky bar, drawer ---------- */
  const page = document.body.dataset.page;
  $$(`[data-nav="${page}"]`).forEach(a => a.setAttribute('aria-current', 'page'));
  const sticky = $('.nav-sticky');
  const heroEl = $('.hero, .page-hero');
  if (sticky && heroEl) {
    new IntersectionObserver(([e]) => sticky.classList.toggle('is-on', !e.isIntersecting), { rootMargin: '-120px 0px 0px 0px' }).observe(heroEl);
  }
  const drawer = $('.drawer');
  $$('[data-drawer]').forEach(b => b.addEventListener('click', () => {
    const open = !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', open);
    drawer.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    $$('[data-drawer="open"]').forEach(x => x.setAttribute('aria-expanded', open));
    if (open) $('[data-drawer="close"]', drawer).focus();
  }));
  if (drawer) drawer.inert = true;

  /* ---------- headings split into lines ---------- */
  $$('[data-split]').forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l, i) => `<span class="split-line" style="--i:${i}"><span>${l.trim()}</span></span>`).join('');
  });

  /* ---------- project renderers ---------- */
  const card = (p, i) => `
    <article class="proj-card" data-sector="${esc(p.sector)}" ${i !== undefined ? `data-reveal style="--d:${(i % 3) * 0.08}s"` : ''}>
      <button class="open" type="button" data-open="${p.slug}" aria-label="View ${esc(p.title)} gallery">
        <div class="ph"><img src="${img(p.img[0], true)}" srcset="${img(p.img[0], true)} 800w, ${img(p.img[0])} 1600w" sizes="(max-width: 640px) 90vw, 33vw" alt="${esc(p.title)}" ${i === undefined ? 'decoding="async"' : 'loading="lazy"'}>
          <span class="tag tag--plain">${esc(p.sector)}</span><span class="arrow-circle">${arrow}</span></div>
        <div class="meta"><div><h3><span class="t-long">${esc(p.title)}</span><span class="t-short">${esc(p.short || p.title)}</span></h3><p class="loc">${esc(p.location)}</p></div><span class="sector">${p.img.length} photos</span></div>
      </button>
    </article>`;
  $$('[data-projects="rail"]').forEach(el => { el.innerHTML = P.map(p => card(p)).join(''); });
  $$('[data-projects="grid"]').forEach(el => { el.innerHTML = P.map((p, i) => card(p, i)).join(''); });

  /* filters */
  const filters = $('[data-filters]');
  if (filters) {
    const sectors = [...new Set(P.map(p => p.sector))];
    const count = s => P.filter(p => s === 'All' || p.sector === s).length;
    filters.innerHTML = ['All', ...sectors].map((s, i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-f="${esc(s)}">${esc(s)} <span>${count(s)}</span></button>`).join('');
    filters.addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      $$('.chip', filters).forEach(c => c.setAttribute('aria-pressed', c === b));
      const f = b.dataset.f;
      $$('.proj-grid .proj-card').forEach(c => {
        const show = f === 'All' || c.dataset.sector === f;
        c.classList.add('is-fading');
        setTimeout(() => { c.classList.toggle('is-hidden', !show); requestAnimationFrame(() => c.classList.remove('is-fading')); }, 260);
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    e.target.dispatchEvent(new CustomEvent('reveal'));
    io.unobserve(e.target);
  }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], .img-reveal, [data-split], .map-card, .phases, .meter, [data-chart]').forEach(el => io.observe(el));

  /* touch: mirror hover states while a card crosses the middle of the screen */
  if (touch) {
    const mid = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-inview', e.isIntersecting)), { rootMargin: '-38% 0px -38% 0px' });
    $$('.service-item, .svc, .card, .proj-grid .proj-card, .shape-card, .value, .photo-card, .photo-label, .awards figure, .contact-card').forEach(el => mid.observe(el));
  }

  /* fail-safe: anything already scrolled past (anchor jumps, fast flicks) is shown, never left blank */
  const sweep = () => $$('[data-reveal]:not(.is-in), .img-reveal:not(.is-in), [data-split]:not(.is-in), .map-card:not(.is-in), .phases:not(.is-in), .meter:not(.is-in), [data-chart]:not(.is-in)').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight * 0.96 && !el.closest('[hidden], .is-hidden')) { el.classList.add('is-in'); el.dispatchEvent(new CustomEvent('reveal')); }
  });
  addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
  addEventListener('load', sweep); setTimeout(sweep, 1200);

  /* ---------- patterns: fading textures in chosen corners ---------- */
  $$('[data-pattern]').forEach(el => {
    const span = document.createElement('span');
    span.className = `pattern pattern--${el.dataset.pattern} pattern--${el.dataset.patternPos || 'tr'}`;
    span.setAttribute('aria-hidden', 'true');
    if (el.matches('.on-dark, .panel--ink, .shape-card--ink, .card--green')) el.classList.add('is-dark-pattern');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.prepend(span);
  });

  /* ---------- logo strip: flows on its own, drag or swipe either way ---------- */
  $$('[data-marquee]').forEach(sc => {
    const track = sc.firstElementChild;
    [...track.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelector('img').alt = ''; track.appendChild(c); });
    const speed = reduce ? 0 : +(sc.dataset.speed || 0.45);
    let pos = 0, dir = 1, hold = 0, self = false, last = 0, down = false, sx = 0, sp = 0;
    const half = () => track.scrollWidth / 2;
    const wrap = () => { const h = half(); if (pos >= h) pos -= h; if (pos < 0) pos += h; };
    const set = () => { self = true; sc.scrollLeft = pos; };
    sc.addEventListener('scroll', () => {
      if (self) { self = false; return; }
      const d = sc.scrollLeft - pos; if (Math.abs(d) > .5) dir = d > 0 ? 1 : -1;  // keep flowing the way the user pushed
      pos = sc.scrollLeft; wrap(); if (pos !== sc.scrollLeft) set(); hold = performance.now() + 1400;
    }, { passive: true });
    sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sp = pos; sc.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!down) return; const d = sx - e.clientX; dir = d > 0 ? 1 : -1; pos = sp + d; wrap(); set(); hold = performance.now() + 1400; });
    addEventListener('pointerup', () => { down = false; sc.classList.remove('is-drag'); });
    sc.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') sc.dataset.hover = '1'; });
    sc.addEventListener('pointerleave', () => { delete sc.dataset.hover; });
    sc.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { dir = e.key === 'ArrowRight' ? 1 : -1; pos += dir * 160; wrap(); sc.scrollTo({ left: pos, behavior: 'smooth' }); hold = performance.now() + 1400; } });
    const tiles = $$('.logo-tile', track);
    const tick = t => {
      const dt = Math.min(t - last, 50); last = t;
      if (!down && t > hold && !sc.dataset.hover) { pos += speed * dir * dt / 16.7; wrap(); set(); }
      if (touch) {  // touch twin of hover: the tile passing the centre shows its colours
        const r = sc.getBoundingClientRect(), c = r.left + r.width / 2;
        tiles.forEach(el => { const b = el.getBoundingClientRect(); el.classList.toggle('is-inview', Math.abs(b.left + b.width / 2 - c) < b.width * .6); });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(t => { last = t; tick(t); });
  });

  /* rail: swipe hint (the touch twin of the desktop "Drag" cursor) fades after the first swipe */
  $$('.proj-rail').forEach(r => r.addEventListener('scroll', () => r.closest('[data-rail]')?.querySelector('.rail-hint')?.classList.add('is-gone'), { passive: true, once: true }));

  /* ---------- counters ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, dur = 1800;
    el.textContent = reduce ? to : '0';
    if (reduce) return;
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const tick = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .5 });
    o.observe(el);
  });

  /* ---------- hero slider (tabs + vertical indicator) ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero-slide', hero), tabs = $$('.hero-tab', hero);
    const ind = $('.hero-indicator .track i', hero), cur = $('.hero-indicator .cur', hero);
    const titles = $$('[data-slide-copy]', hero);
    const DUR = 7000; let idx = 0, t0 = performance.now(), paused = false;
    const go = i => {
      idx = (i + slides.length) % slides.length; t0 = performance.now();
      slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
      tabs.forEach((t, k) => { t.classList.toggle('is-active', k === idx); t.setAttribute('aria-selected', k === idx); $('.bar', t).style.width = '0'; });
      titles.forEach((t, k) => t.hidden = k !== idx);
      if (cur) cur.textContent = String(idx + 1).padStart(2, '0');
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => go(k)));
    hero.addEventListener('pointerenter', () => paused = true);
    hero.addEventListener('pointerleave', () => { paused = false; t0 = performance.now() - (tabs[idx] ? parseFloat($('.bar', tabs[idx]).style.width) / 100 * DUR || 0 : 0); });
    const loop = t => {
      if (!paused && !reduce) {
        const k = Math.min((t - t0) / DUR, 1);
        if (tabs[idx]) $('.bar', tabs[idx]).style.width = k * 100 + '%';
        if (ind) ind.style.height = ((idx + k) / slides.length) * 100 + '%';
        if (k >= 1) go(idx + 1);
      }
      requestAnimationFrame(loop);
    };
    go(0); requestAnimationFrame(loop);
  }

  /* hero parallax: pointer drift and slower scroll */
  const heroBox = $('.hero');
  if (heroBox && !reduce && !touch) heroBox.addEventListener('pointermove', e => {
    const r = heroBox.getBoundingClientRect();
    heroBox.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    heroBox.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });
  const parallaxEls = $$('.hero, .page-hero');
  if (parallaxEls.length && !reduce) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { const y = Math.min(scrollY, innerHeight); parallaxEls.forEach(el => el.style.setProperty('--sy', (y * .18).toFixed(1) + 'px')); ticking = false; });
    }, { passive: true });
  }

  /* ---------- project rail: drag, buttons, progress ---------- */
  $$('[data-rail]').forEach(wrap => {
    const rail = $('.proj-rail', wrap), bar = $('.rail-progress i', wrap);
    const step = () => rail.firstElementChild.getBoundingClientRect().width + 16;
    $('[data-prev]', wrap)?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('[data-next]', wrap)?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth;
      bar.style.width = vis * 100 + '%';
      bar.style.transform = `translateX(${(max ? rail.scrollLeft / max : 0) * (1 / vis - 1) * 100}%)`;
    };
    rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-drag'); } rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('is-drag'), 0); });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* cursor bubble over draggable rails */
  const dot = $('.cursor-dot');
  if (dot && !touch) {
    addEventListener('pointermove', e => { dot.style.translate = `${e.clientX}px ${e.clientY}px`; }, { passive: true });
    $$('.proj-rail').forEach(r => { r.addEventListener('pointerenter', () => dot.classList.add('is-on')); r.addEventListener('pointerleave', () => dot.classList.remove('is-on')); });
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox');
  if (lb) {
    let proj, i = 0, last;
    const stage = $('.lb-stage img', lb), thumbs = $('.lb-thumbs', lb), side = $('.lb-side', lb);
    const show = k => {
      i = (k + proj.img.length) % proj.img.length;
      stage.style.opacity = 0;
      const n = new Image(); n.src = img(proj.img[i]);
      n.onload = n.onerror = () => { stage.src = n.src; stage.alt = `${proj.title}, photo ${i + 1} of ${proj.img.length}`; stage.style.opacity = 1; };
      $$('button', thumbs).forEach((b, j) => b.setAttribute('aria-current', j === i));
    };
    const open = (slug, k = 0) => {
      proj = P.find(p => p.slug === slug); if (!proj) return;
      last = document.activeElement;
      side.innerHTML = `<span class="tag tag--dark">${esc(proj.sector)}</span><h2 class="h3" id="lb-title">${esc(proj.title)}</h2><p style="color:rgba(255,255,255,.72);font-size:.95rem">${esc(proj.summary)}</p>
        <dl><dt>Client</dt><dd>${esc(proj.client)}</dd><dt>Location</dt><dd>${esc(proj.location)}</dd><dt>Sector</dt><dd>${esc(proj.sector)}</dd><dt>Scope</dt><dd>${esc(proj.scope)}</dd></dl>
        <a class="btn" href="contact.html" style="align-self:flex-start;margin-top:8px">Discuss a similar project</a>`;
      thumbs.innerHTML = proj.img.map((n, j) => `<button type="button" aria-label="Photo ${j + 1}"><img src="${img(n, true)}" alt="" loading="lazy"></button>`).join('');
      $$('button', thumbs).forEach((b, j) => b.addEventListener('click', () => show(j)));
      lb.classList.add('is-open'); lb.inert = false; document.body.style.overflow = 'hidden';
      show(k); $('.lb-close', lb).focus();
    };
    const close = () => { lb.classList.remove('is-open'); lb.inert = true; document.body.style.overflow = ''; last?.focus(); };
    lb.inert = true;
    document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) { e.preventDefault(); open(b.dataset.open); } });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-nav.prev', lb).addEventListener('click', () => show(i - 1));
    $('.lb-nav.next', lb).addEventListener('click', () => show(i + 1));
    addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1);
    });
    const q = new URLSearchParams(location.search).get('project'); if (q) open(q);
  }

  /* ---------- polygonal Zimbabwe map ---------- */
  // Border and provinces: assets/js/zim-geo.js (generated from geoBoundaries / ZIMSTAT)
  const G = window.GW_GEO;
  const CITIES = [['Bulawayo',28.58,-20.15],['Mutare',32.67,-18.97,'end'],['Gweru',29.82,-19.45],['Masvingo',30.83,-20.07],['Kariba',28.8,-16.52],['Victoria Falls',25.84,-17.93,'below'],['Chinhoyi',30.2,-17.36,'end'],['Hwange',26.5,-18.36]];
  const px = (lon, lat) => G ? [G.proj.pad + (lon - G.proj.lon0) * G.proj.kx, G.proj.pad + (G.proj.lat0 - lat) * G.proj.ky] : [0, 0];
  const inside = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  if (G) $$('[data-map]').forEach(host => {
    const poly = G.ring;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pts = [];
    for (let y = 20; y < G.h; y += 30) for (let x = 20; x < G.w; x += 30) {
      const p = [x + (rnd() - .5) * 22, y + (rnd() - .5) * 22];
      if (inside(p[0], p[1], poly)) pts.push(p);
    }
    poly.filter((_, i) => i % 6 === 0).forEach(p => pts.push(p));
    const lines = new Set(); let L = '';
    pts.forEach((a, i) => {
      pts.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2]).filter(d => d[0] !== i).sort((m, n) => m[1] - n[1]).slice(0, 3).forEach(([j, d]) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (d < 2400 && !lines.has(k)) { lines.add(k); L += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${pts[j][0].toFixed(1)}" y2="${pts[j][1].toFixed(1)}"/>`; }
      });
    });
    const dots = pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(1 + rnd() * 1.4).toFixed(2)}"/>`).join('');
    const H = px(R.harare.lon, R.harare.lat);
    const curve = (a, b) => { const mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * .18, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * .18; return `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`; };
    const routes = Object.keys(R).filter(k => k !== 'harare').map(k => `<path class="route" d="${curve(H, px(R[k].lon, R[k].lat))}"/>`).join('');
    // label side per city keeps names off the pins, the border and province names
    const cities = CITIES.map(([n, a, b, side]) => { const [x, y] = px(a, b); const [tx, ty, ta] = side === 'end' ? [x - 8, y + 4, 'end'] : side === 'below' ? [x + 4, y + 22, 'start'] : [x + 8, y + 4, 'start']; return `<g class="city${['Hwange', 'Chinhoyi'].includes(n) ? ' city--minor' : ''}"><circle cx="${x}" cy="${y}" r="2.5"/><text x="${tx}" y="${ty}" text-anchor="${ta}">${n.toUpperCase()}</text></g>`; }).join('');
    const pins = Object.entries(R).map(([k, r]) => {
      const [x, y] = px(r.lon, r.lat), n = P.filter(p => p.region === k).length, left = false;
      return `<g class="pin" data-region="${k}" tabindex="0" role="button" aria-label="${esc(r.name)}: ${n} projects"><circle class="halo" cx="${x}" cy="${y}" r="22"/><circle class="core" cx="${x}" cy="${y}" r="8"/>
        <text x="${left ? x - 16 : x + 16}" y="${y - 2}" text-anchor="${left ? 'end' : 'start'}">${esc(r.name)}</text><text class="sub" x="${left ? x - 16 : x + 16}" y="${y + 13}" text-anchor="${left ? 'end' : 'start'}">${n} PROJECT${n > 1 ? 'S' : ''}</text></g>`;
    }).join('');
    const provs = G.provinces.map(p => `<path d="${p.d}"/>`).join('');
    const NUDGE = { 'Mashonaland East': [18, 52], 'Manicaland': [-16, 66] };  // clear of the Harare pin and Mutare
    const provLabels = G.provinces.filter(p => !['Harare', 'Bulawayo'].includes(p.name)).map(p => `<text x="${p.cx + (NUDGE[p.name]?.[0] || 0)}" y="${p.cy + (NUDGE[p.name]?.[1] || 0)}" text-anchor="middle">${esc(p.name.toUpperCase())}</text>`).join('');
    host.innerHTML = `<svg viewBox="0 0 ${G.w} ${G.h + 70}" role="img" aria-label="Map of Zimbabwe and its provinces, showing Gateway Construction project locations">
      <path class="land" d="${G.outline}"/>
      <g class="mesh">${L}${dots}</g>
      <g class="provinces">${provs}</g><g class="prov-labels">${provLabels}</g>
      <path class="outline-glow" d="${G.outline}"/><path class="outline" d="${G.outline}"/>
      ${routes}${cities}${pins}</svg>
      <div class="map-glass"><span class="mg-text"><b data-map-name>Harare Metropolitan</b><i class="sep"> · </i><span class="mg-note" data-map-note>${esc(R.harare.note)}</span></span><span class="mono" data-map-count></span></div>`;
    host.closest('.map-card')?.classList.add('has-map');
    const list = $('[data-map-list]');
    if (list) list.innerHTML = Object.entries(R).map(([k, r], i) => { const n = P.filter(p => p.region === k).length; return `<li><button type="button" data-region="${k}"><span class="n">0${i + 1}</span><span><b>${esc(r.name)}</b><small>${esc(r.note)}</small></span><span class="count">${n}</span></button></li>`; }).join('');
    const detail = $('[data-map-detail]');
    const select = k => {
      const r = R[k], ps = P.filter(p => p.region === k);
      $$('[data-region]').forEach(el => el.classList.toggle('is-active', el.dataset.region === k));
      $('[data-map-name]', host).textContent = r.name; $('[data-map-note]', host).textContent = r.note;
      $('[data-map-count]', host).textContent = `${ps.length} / ${P.length}`;
      if (detail) detail.innerHTML = ps.map(p => `<a class="map-chip" href="projects.html?project=${p.slug}">${esc(p.short || p.title)}</a>`).join('');
    };
    document.addEventListener('click', e => { const t = e.target.closest('[data-region]'); if (t) select(t.dataset.region); });
    host.addEventListener('keydown', e => { const t = e.target.closest('.pin'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(t.dataset.region); } });
    select('harare');
  });

  /* ---------- sector bar chart (single series) ---------- */
  $$('[data-chart="sectors"]').forEach(host => {
    const rows = Object.entries(P.reduce((m, p) => (m[p.sector] = (m[p.sector] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const W = 640, LW = 130, bh = 26, gap = 14, H = rows.length * (bh + gap) + 24, max = Math.max(...rows.map(r => r[1]));
    const sx = v => (W - LW - 40) * v / max;
    const grid = Array.from({ length: max + 1 }, (_, v) => `<line x1="${LW + sx(v)}" x2="${LW + sx(v)}" y1="0" y2="${H - 24}"/>`).join('');
    const ticks = Array.from({ length: max + 1 }, (_, v) => `<text x="${LW + sx(v)}" y="${H - 6}" text-anchor="middle">${v}</text>`).join('');
    const bars = rows.map(([s, v], i) => {
      const y = i * (bh + gap), w = sx(v), r = 4;
      return `<g class="bar-g" tabindex="0" data-tip="${esc(s)}|${v}">
        <rect class="hit" x="0" y="${y - gap / 2}" width="${W}" height="${bh + gap}"/>
        <text class="lbl" x="${LW - 14}" y="${y + bh / 2 + 4}" text-anchor="end">${esc(s)}</text>
        <path class="bar" d="M${LW},${y} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${bh - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${w - r}Z" style="transform-origin:${LW}px 0;transform:scaleX(0);transition:transform 1.2s cubic-bezier(.16,1,.3,1) ${i * .08}s"/>
        <text class="val" x="${LW + w + 8}" y="${y + bh / 2 + 4}">${v}</text></g>`;
    }).join('');
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Featured projects by sector"><g class="grid">${grid}</g><g class="axis">${ticks}</g>${bars}</svg><div class="chart-tip" role="status"></div>`;
    const tbl = host.parentElement.querySelector('[data-chart-table]');
    if (tbl) tbl.innerHTML = `<thead><tr><th>Sector</th><th>Projects</th></tr></thead><tbody>${rows.map(([s, v]) => `<tr><td>${esc(s)}</td><td>${v}</td></tr>`).join('')}</tbody>`;
    host.addEventListener('reveal', () => $$('.bar', host).forEach(b => b.style.transform = 'scaleX(1)'));
    const tip = $('.chart-tip', host);
    const on = g => { const [s, v] = g.dataset.tip.split('|'); const r = g.querySelector('.bar').getBoundingClientRect(), h = host.getBoundingClientRect(); tip.innerHTML = `<b>${s}</b> · ${v} featured project${v > 1 ? 's' : ''} · ${Math.round(v / P.length * 100)}%`; tip.style.left = (r.right - h.left) + 'px'; tip.style.top = (r.top - h.top) + 'px'; tip.classList.add('is-on'); };
    $$('.bar-g', host).forEach(g => { g.addEventListener('pointerenter', () => on(g)); g.addEventListener('focus', () => on(g)); g.addEventListener('pointerleave', () => tip.classList.remove('is-on')); g.addEventListener('blur', () => tip.classList.remove('is-on')); });
  });
  $$('.chart-table-toggle').forEach(b => b.addEventListener('click', () => { const t = b.nextElementSibling; t.hidden = !t.hidden; b.setAttribute('aria-expanded', !t.hidden); b.textContent = t.hidden ? 'Show as table' : 'Hide table'; }));

  /* ring meters */
  $$('.meter').forEach(m => m.addEventListener('reveal', () => { const c = $('.fg', m), r = +c.getAttribute('r'), L = 2 * Math.PI * r; c.style.strokeDasharray = `${L * (+m.dataset.value / 100)} ${L}`; }));

  /* ---------- forms ---------- */
  const form = $('[data-contact]');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const body = `Name: ${d.get('name')}\nCompany: ${d.get('company') || '-'}\nPhone: ${d.get('phone') || '-'}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\nBudget: ${d.get('budget') || '-'}\n\n${d.get('message')}`;
    location.href = `mailto:qs@gatewayconstruction.co.zw?subject=${encodeURIComponent('Project enquiry — ' + d.get('name'))}&body=${encodeURIComponent(body)}`;
    $('.form-note', form).textContent = 'Opening your email app with your enquiry ready to send…';
  });
  $$('[data-news]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const v = f.querySelector('input').value; location.href = `mailto:qs@gatewayconstruction.co.zw?subject=${encodeURIComponent('Add me to Gateway project updates')}&body=${encodeURIComponent(v)}`; }));
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
