document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Active nav item
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.side nav a').forEach(a => a.getAttribute('href') === here && a.setAttribute('aria-current', 'page'));

  // Mobile drawer (scroll lock, Esc, focus return)
  const side = $('#side'), btn = $('#menuBtn'), scrim = $('#scrim');
  const toggle = open => {
    side.classList.toggle('open', open); scrim.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open); btn.setAttribute('aria-expanded', open);
  };
  btn.addEventListener('click', () => toggle(!side.classList.contains('open')));
  scrim.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) { toggle(false); btn.focus(); } });
  matchMedia('(min-width: 901px)').addEventListener('change', () => toggle(false));

  // Dark / light theme (saved choice, else follows the system setting)
  const root = document.documentElement, meta = $('meta[name="theme-color"]');
  const stored = () => { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    meta && meta.setAttribute('content', dark ? '#0e131d' : '#f7f8fc');
    $$('.theme-toggle,.theme-icon').forEach(b => {
      b.setAttribute('aria-pressed', dark); b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const i = $('i', b); i && (i.className = 'fa-solid ' + (dark ? 'fa-sun' : 'fa-moon'));
    });
    const l = $('.theme-toggle .tlabel'); l && (l.textContent = dark ? 'Light mode' : 'Dark mode');
  };
  const setTheme = (t, save) => {
    if (!reduce) { root.classList.add('theme-anim'); setTimeout(() => root.classList.remove('theme-anim'), 450); }
    root.dataset.theme = t; sync();
    if (save) try { localStorage.setItem('theme', t); } catch (e) {}
  };
  const flip = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  const tg = document.createElement('button');
  tg.type = 'button'; tg.className = 'theme-toggle';
  tg.innerHTML = '<span><i class="fa-solid fa-moon"></i><b class="tlabel">Dark mode</b></span><span class="track"></span>';
  $('.side-foot').prepend(tg);
  const ti = document.createElement('button');
  ti.type = 'button'; ti.className = 'theme-icon'; ti.innerHTML = '<i class="fa-solid fa-moon"></i>';
  const grp = document.createElement('div'); grp.className = 'top-actions'; btn.before(grp); grp.append(ti, btn);
  tg.addEventListener('click', flip); ti.addEventListener('click', flip);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!stored()) setTheme(e.matches ? 'dark' : 'light', false); });
  sync();

  // One rAF-throttled scroll handler: progress bar, parallax, mobile top bar hide/show
  const bar = $('#progress'), top = $('.topbar'), par = $$('.project-card img, .orb');
  let lastY = scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (!reduce) par.forEach(el => {
      const box = el.closest('.project-card') || el, r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const k = el.classList.contains('orb') ? .08 : .06, lim = el.classList.contains('orb') ? 30 : 24;
      const y = Math.max(-lim, Math.min(lim, (r.top + r.height / 2 - innerHeight / 2) * -k));
      el.style.setProperty('--py', y.toFixed(1) + 'px');
    });
    const dy = scrollY - lastY;
    if (Math.abs(dy) > 6) { top.classList.toggle('hide', dy > 0 && scrollY > 120 && !side.classList.contains('open')); lastY = scrollY; }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update); update();

  // Reveal on scroll with automatic stagger + eased counters
  $$('.reveal').forEach(el => {
    const i = $$(':scope > .reveal', el.parentElement).indexOf(el);
    if (i > 0 && !reduce) el.style.transitionDelay = Math.min(i, 4) * 90 + 'ms';
  });
  $$('[data-count]').forEach(el => { if (!reduce) el.textContent = 0; });
  const count = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1200;
    if (reduce) return (el.textContent = end);
    const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); p < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const t = e.target; t.classList.add('visible'); $$('[data-count]', t).forEach(count); io.unobserve(t);
    setTimeout(() => (t.style.transitionDelay = ''), 1400);
  }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // Spotlight hover + magnetic buttons + custom cursor (mouse only)
  if (fine) {
    $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));
    if (!reduce) $$('.button').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--tx', (e.clientX - r.left - r.width / 2) * .18 + 'px');
        b.style.setProperty('--ty', (e.clientY - r.top - r.height / 2) * .28 + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); });
    });

    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cur-dot'; ring.className = 'cur-ring'; document.body.append(dot, ring);
    document.documentElement.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const loop = () => {
      rx += (mx - rx) * (reduce ? 1 : .18); ry += (my - ry) * (reduce ? 1 : .18);
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      raf = Math.abs(mx - rx) + Math.abs(my - ry) > .2 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`;
      const t = e.target, off = t.closest && t.closest('dialog,input,textarea,select');
      dot.classList.toggle('cur-hide', !!off); ring.classList.toggle('cur-hide', !!off);
      ring.classList.toggle('hover', !!(t.closest && t.closest('a,button,.spot')));
      raf || (raf = requestAnimationFrame(loop));
    }, { passive: true });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    document.addEventListener('mouseleave', () => { dot.classList.add('cur-hide'); ring.classList.add('cur-hide'); });
    document.addEventListener('mouseenter', () => { dot.classList.remove('cur-hide'); ring.classList.remove('cur-hide'); });
  }

  // Page transitions between internal pages (skips same-page links)
  $$('a[href$=".html"]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target || reduce || a.pathname === location.pathname) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => (location.href = a.href), 200);
  }));
  addEventListener('pageshow', e => e.persisted && document.body.classList.remove('leaving'));

  // Project filters (+ last visible odd card spans full width)
  const fl = $('#filters');
  if (fl) {
    const cards = $$('#projects .project-card');
    const layout = () => {
      const v = cards.filter(c => !c.hidden);
      cards.forEach(c => c.classList.toggle('wide', v.length % 2 === 1 && c === v[v.length - 1]));
    };
    const cats = ['All', ...new Set(cards.map(c => c.dataset.cat))];
    fl.innerHTML = cats.map((c, i) => `<button type="button" aria-pressed="${!i}" data-f="${c}">${c}</button>`).join('');
    fl.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', fl).forEach(x => x.setAttribute('aria-pressed', x === b));
      cards.forEach(c => { c.hidden = b.dataset.f !== 'All' && c.dataset.cat !== b.dataset.f; });
      layout(); update();
    });
    layout();
  }

  // Certificate lightbox
  const d = $('#certificateModal');
  if (d) {
    const f = $('#certificateFrame');
    $$('[data-certificate]').forEach(c => c.addEventListener('click', () => {
      const u = encodeURI(c.dataset.certificate);
      $('#certificateTitle').textContent = c.dataset.title; f.src = u; $('#certificateDownload').href = u; d.showModal();
    }));
    $('#closeCertificate').addEventListener('click', () => d.close());
    d.addEventListener('click', e => e.target === d && d.close());
    d.addEventListener('close', () => (f.src = ''));
  }

  // Contact form -> opens the visitor's mail app with the message prefilled
  const form = $('#contactForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(form));
    const body = `${v.message}\n\n— ${v.name} (${v.email})`;
    location.href = `mailto:edilmarwpdev@gmail.com?subject=${encodeURIComponent(v.topic)}&body=${encodeURIComponent(body)}`;
    $('#formNote').textContent = 'Opening your email app… if nothing happens, email edilmarwpdev@gmail.com directly.';
  });

  $('#currentYear').textContent = new Date().getFullYear();
});