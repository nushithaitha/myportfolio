// nushithaitha.com · progressive enhancement only. The page is fully readable without this file.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ---------- theme ---------- */
function initTheme() {
  const btn = $('#themeBtn');
  const current = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const label = () => btn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  label();
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme still applies for this visit */ }
    label();
  });
}

/* ---------- top bar: hero state, hide on scroll down, progress, current section ---------- */
function initTopbar() {
  const bar = $('#topbar'), hero = $('#home'), prog = $('#progress');
  const num = $('#whereNum'), name = $('#whereName');
  const sections = $$('main section[data-num]');
  const links = $$('.menu-nav a');
  let lastY = scrollY, ticking = false;

  function update() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    bar.classList.toggle('on-hero', hero.getBoundingClientRect().bottom > 64);
    // Hide while reading downward; bring it back on any upward scroll.
    if (!document.body.classList.contains('menu-open')) bar.classList.toggle('hide', y > lastY && y > innerHeight * 0.6);
    lastY = y;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Current section → top bar label and aria-current in the menu.
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const s = e.target;
      num.textContent = s.dataset.num;
      name.textContent = s.dataset.name;
      links.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + s.id ? 'true' : 'false'));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ---------- full-screen menu ---------- */
function initMenu() {
  const menu = $('#menu'), openBtn = $('#menuBtn'), closeBtn = $('#menuClose');
  let lastFocus = null;
  const focusables = () => $$('a, button', menu);

  function open() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    openBtn.setAttribute('aria-expanded', 'true');
    ($('.menu-nav a[aria-current="true"]', menu) || focusables()[1]).focus();
  }
  function close(returnFocus = true) {
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    openBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && lastFocus) lastFocus.focus();
  }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(false); });
  document.addEventListener('keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the open menu
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ---------- reveal on scroll + count-up facts ---------- */
function initReveal() {
  const els = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  // Stagger siblings that share a parent, so grids cascade in.
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + 'ms';
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => {
    // Anything already above the fold (or jumped past via an anchor) shows at once.
    if (el.getBoundingClientRect().top < innerHeight * 0.9) el.classList.add('in'); else io.observe(el);
  });
}

function initCounters() {
  if (reduceMotion) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length, t0 = performance.now(), dur = 1100;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => io.observe(el));
}

/* ---------- hero air canvas: a fading ink trail that follows the pointer ---------- */
function initAirCanvas() {
  const cv = $('#air'), hero = $('#home');
  if (!cv?.getContext) return;
  const ctx = cv.getContext('2d');
  const life = 1600;
  let pts = [], raf = null, dpr = 1;

  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(now) {
    ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    pts = pts.filter(p => now - p.t < life);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      if (b.t - a.t > 80) continue; // separate strokes
      const age = Math.max(0, 1 - (now - b.t) / life);
      ctx.strokeStyle = `rgba(215,243,107,${age})`;
      ctx.lineWidth = (b.down ? 9 : 5) * Math.max(0.25, age);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    raf = pts.length ? requestAnimationFrame(draw) : null;
  }
  function add(e) {
    if (reduceMotion) return;
    const r = cv.getBoundingClientRect();
    pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now(), down: e.pointerType !== 'mouse' || e.buttons > 0 });
    if (pts.length > 400) pts.shift();
    if (!raf) raf = requestAnimationFrame(draw);
  }
  size();
  addEventListener('resize', size);
  // Listen on the whole hero so the trail also follows over the text (which ignores pointer events).
  hero.addEventListener('pointermove', add);
  hero.addEventListener('pointerdown', add);
  $('#clearAir').addEventListener('click', () => { pts = []; ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight); });
  if (reduceMotion) $('.hint').hidden = true;
}

/* ---------- contact form (Web3Forms) ---------- */
function initForm() {
  const form = $('#contactForm');
  if (!form) return;
  const status = $('#formStatus'), msg = $('#f-msg'), count = $('#count');
  const btn = $('.send', form), label = $('.send-label', form);
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / 1000`; });

  const rules = {
    'f-name': v => v.trim() ? '' : 'Please enter your name.',
    'f-email': v => !v.trim() ? 'Please enter your email.' : (/^\S+@\S+\.\S+$/.test(v) ? '' : 'That email address doesn\'t look right.'),
    'f-phone': v => !v.trim() || /^[0-9+()\-.\s]{7,30}$/.test(v) ? '' : 'Use digits, spaces and + ( ) - only.',
    'f-msg': v => v.trim().length >= 10 ? '' : 'Please write at least 10 characters.'
  };
  const errId = { 'f-name': 'e-name', 'f-email': 'e-email', 'f-phone': 'e-phone', 'f-msg': 'e-msg' };
  const check = id => {
    const field = $('#' + id), problem = rules[id](field.value);
    $('#' + errId[id]).textContent = problem;
    field.setAttribute('aria-invalid', problem ? 'true' : 'false');
    return !problem;
  };
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => { if ($('#' + id).value) check(id); }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status'; status.textContent = '';
    const bad = Object.keys(rules).filter(id => !check(id));
    if (bad.length) { $('#' + bad[0]).focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    data.access_key = form.dataset.accessKey;
    data.replyto = data.email;
    btn.disabled = true; btn.classList.add('busy'); label.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
      form.reset(); count.textContent = '0 / 1000';
      status.classList.add('ok'); status.textContent = "Thanks! Your message is on its way, and I'll reply by email.";
    } catch (err) {
      status.classList.add('err'); status.textContent = 'Something went wrong. Please email aithanushith@gmail.com directly.';
    } finally {
      btn.disabled = false; btn.classList.remove('busy'); label.textContent = 'Send message';
    }
  });
}

/* ---------- boot ---------- */
$('#year').textContent = new Date().getFullYear();
initTheme();
initTopbar();
initMenu();
initReveal();
initCounters();
initAirCanvas();
initForm();
