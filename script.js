(() => {
  const frames = [...document.querySelectorAll('.frame')];
  const layers = [...document.querySelectorAll('#layers li')];

  /* ---------- reading progress bar ---------- */
  // Desktop scrolls inside .canvas; phones scroll the whole page.
  const canvasEl = document.getElementById('canvas');
  const bar = document.getElementById('readBar');
  function updateBar() {
    const inner = canvasEl.scrollHeight > canvasEl.clientHeight + 1;
    const top = inner ? canvasEl.scrollTop : window.scrollY;
    const max = inner ? canvasEl.scrollHeight - canvasEl.clientHeight
                      : document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, top / max) : 0) + ')';
  }
  canvasEl.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();

  /* ---------- animate "currently learning" bars when visible ---------- */
  if ('IntersectionObserver' in window) {
    const lio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); lio.unobserve(e.target); }
    }), { threshold: 0.5 });
    document.querySelectorAll('.learn').forEach(l => lio.observe(l));
  }

  /* ---------- theme ---------- */
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
  } catch (_) {}
  document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
  });

  /* ---------- highlight current section ---------- */
  function highlight(id) {
    frames.forEach(f => f.classList.toggle('selected', f.id === id));
    layers.forEach(l => l.classList.toggle('selected', l.dataset.target === id));
  }

  layers.forEach(l => l.addEventListener('click', () => {
    const target = document.getElementById(l.dataset.target);
    target.scrollIntoView({ block: 'start' });
    highlight(target.id);
  }));

  // Follow the section the reader is looking at
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, bestRatio = 0;
      visible.forEach((r, id) => { if (r > bestRatio) { bestRatio = r; best = id; } });
      if (best) highlight(best);
    }, { threshold: [0.2, 0.4, 0.6, 0.8] });
    frames.forEach(f => io.observe(f));
  } else {
    highlight(frames[0].id);
  }

  // Direct links like /#work: the canvas is its own scroll area, so scroll it explicitly
  if (location.hash) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  /* ---------- toast ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- copy email ---------- */
  const copyBtn = document.getElementById('copyEmail');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      document.getElementById('copyLabel').textContent = 'Copied ✓';
      toast('Email copied — paste it in your email app');
      setTimeout(() => { document.getElementById('copyLabel').textContent = 'Copy'; }, 2500);
    } catch (_) {
      location.href = 'mailto:' + email;
    }
  });

  /* ---------- "Discover my work" details ---------- */
  const DETAILS = {
    tests: {
      ico: '🧪', c: '#ffcd29', meta: 'Test automation',
      title: 'Most of a 1,100+ test suite',
      did: 'I wrote 616 of the 1,118 automatic tests in the product\'s test suite — for the website and for the iPhone and Android apps. I was the most active contributor to the testing code.',
      why: 'Automatic tests click through the product like a real user, in minutes. Every time developers change something, these tests confirm nothing else broke.',
      result: '55% of the whole test suite is my work.',
      tools: ['Playwright', 'Robot Framework', 'Appium']
    },
    payments: {
      ico: '💳', c: '#0d99ff', meta: 'Payments & accounts',
      title: 'Keeping payments & accounts safe',
      did: 'I built automatic checks for the parts users trust the most: logging in, paying, subscriptions and the notifications sent after a payment — for every type of user account. I also double-checked payments and wallets directly in the database.',
      why: 'If a payment fails or an account is wrong, users lose money and trust. These checks catch those problems before a release.',
      result: 'The payment & account checks pass 98% of the time.',
      tools: ['Postman', 'REST API', 'OAuth 2.0', 'Stripe', 'MySQL']
    },
    report: {
      ico: '📊', c: '#14ae5c', meta: 'Reporting',
      title: 'A quality report for the whole team',
      did: 'I wrote a program (about 2,300 lines of Python) that, after every test run, publishes how many tests passed, how that changes over time, and which of the 23 main product flows are covered — to Google Sheets and an admin dashboard.',
      why: 'Managers and developers can see the product\'s health at a glance, without reading technical logs.',
      result: 'Quality is visible to everyone, automatically, after every run.',
      tools: ['Python', 'Google Sheets', 'Dashboards']
    },
    pipeline: {
      ico: '⚙️', c: '#9747ff', meta: 'CI/CD',
      title: 'Tests that run on their own',
      did: 'I set up the first automated pipeline for the testing project: tests start by themselves, the Android app is built and tested, results are checked and reported. iPhone tests run on 4 simulators at the same time.',
      why: 'Nobody has to remember to run the tests — they run every time, and faster thanks to running in parallel.',
      result: 'The project\'s first automated test pipeline, set up from scratch.',
      tools: ['GitHub Actions', 'Android', 'iOS simulators']
    },
    countries: {
      ico: '🌍', c: '#ff7262', meta: 'Manual testing',
      title: 'Testing in 4 countries',
      did: 'I tested the product by hand — exploring it like a real user — on five test environments and on the live site, for Romania, Spain, the USA and Germany, including that every text is correctly translated.',
      why: 'Each market has its own language, currency and rules. Testing each one makes sure every customer gets a correct experience.',
      result: '299 test reports and 160 problems reported — 155 already fixed.',
      tools: ['Manual testing', 'Localization', 'Jira']
    },
    tools: {
      ico: '🛠️', c: '#f24e1e', meta: 'Tooling',
      title: '13 tools that make testing faster',
      did: 'I built 13 small helper tools for the QA team — for example one that protects the live site from test actions, one that reads verification codes from emails automatically, and an AI assistant (built with Claude Code) that helps with manual testing.',
      why: 'Repetitive tasks become one click, so the team spends its time finding real problems.',
      result: '13 internal tools, including an AI-powered testing helper.',
      tools: ['Python', 'AWS', 'Claude Code', 'SQL']
    }
  };

  const dialog = document.getElementById('detail');
  const keys = Object.keys(DETAILS);
  let current = 0;
  const $ = id => document.getElementById(id);

  function showDetail(i) {
    current = (i + keys.length) % keys.length;
    const d = DETAILS[keys[current]];
    $('dIco').textContent = d.ico;
    $('dIco').style.setProperty('--c', d.c);
    $('dMeta').textContent = d.meta + '  ·  ' + (current + 1) + ' of ' + keys.length;
    $('dTitle').textContent = d.title;
    $('dDid').textContent = d.did;
    $('dWhy').textContent = d.why;
    $('dResult').textContent = d.result;
    $('dTools').innerHTML = '';
    d.tools.forEach(t => { const s = document.createElement('span'); s.textContent = t; $('dTools').appendChild(s); });
    if (!dialog.open) dialog.showModal();
  }
  document.querySelectorAll('.work-card').forEach(card =>
    card.addEventListener('click', () => showDetail(keys.indexOf(card.dataset.detail))));
  $('dClose').addEventListener('click', () => dialog.close());
  $('dNext').addEventListener('click', () => showDetail(current + 1));
  $('dPrev').addEventListener('click', () => showDetail(current - 1));
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') showDetail(current + 1);
    if (e.key === 'ArrowLeft') showDetail(current - 1);
  });

  /* ---------- "How I work" steps ---------- */
  const STEPS = [
    { title: '1 · Understand the product',
      text: 'I start by learning how the product works and who uses it — talking with developers and the product owner to understand what matters most and what could go wrong.',
      chips: ['Requirements', 'Risk analysis', 'Agile / Scrum'] },
    { title: '2 · Plan what to test',
      text: 'I write a clear test plan: which features to check, with which data, on which devices and in which countries. The riskiest parts — like payments and logins — come first.',
      chips: ['Test plans', 'Test cases', 'Risk-based testing'] },
    { title: '3 · Test by hand & automate',
      text: 'I explore the product like a real user to find problems, then turn the important checks into automatic tests for the website, the API and the iPhone & Android apps — so they re-run on their own after every change.',
      chips: ['Playwright', 'Robot Framework', 'Appium', 'Postman', 'GitHub Actions'] },
    { title: '4 · Report & follow up',
      text: 'Every problem gets a clear report with steps to reproduce it. I follow it until it is fixed and re-tested, and I share easy-to-read reports so the whole team knows the product\'s health.',
      chips: ['Jira', 'Dashboards', 'Re-testing'] }
  ];
  const stepBtns = [...document.querySelectorAll('.flow-step')];
  function showStep(i) {
    stepBtns.forEach((b, j) => {
      b.classList.toggle('active', i === j);
      b.setAttribute('aria-selected', i === j);
    });
    const s = STEPS[i], box = $('flowDetail');
    $('fdTitle').textContent = s.title;
    $('fdText').textContent = s.text;
    $('fdChips').innerHTML = '';
    s.chips.forEach(c => { const el = document.createElement('span'); el.textContent = c; $('fdChips').appendChild(el); });
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
  }
  stepBtns.forEach((b, i) => b.addEventListener('click', () => showStep(i)));
  showStep(0);

  /* ---------- count-up numbers ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    }), { threshold: 0.6 });
    counters.forEach(c => io.observe(c));
  }
})();
