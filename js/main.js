/* Scheffler Immobilien — Designentwurf. No dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- scroll lock (iOS-safe: pin the body, restore the exact offset) ---------- */
  let lockY = 0, locks = 0;
  const lock = () => {
    if (locks++) return;
    lockY = scrollY;
    document.body.style.top = `-${lockY}px`;
    document.body.classList.add('is-locked');
  };
  const unlock = () => {
    if (!locks || --locks) return;
    document.body.classList.remove('is-locked');
    document.body.style.top = '';
    root.style.scrollBehavior = 'auto';
    scrollTo(0, lockY);
    root.style.scrollBehavior = '';
  };

  /* ---------- preloader + hero bars (SMIL waits for the preloader) ---------- */
  const heroSvgs = $$('svg.bars');
  const startHero = () => heroSvgs.forEach(s => {
    if (reduce) { s.pauseAnimations?.(); s.setCurrentTime?.(10); return; }
    s.setCurrentTime?.(0); s.unpauseAnimations?.();
  });
  heroSvgs.forEach(s => { s.pauseAnimations?.(); s.setCurrentTime?.(0); });
  const pre = $('.preloader');
  if (pre && !root.classList.contains('no-preload') && !reduce) {
    const t0 = performance.now();
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      pre.classList.add('is-done');
      try { sessionStorage.setItem('si-seen', '1'); } catch (e) {}
      setTimeout(startHero, 150);
    };
    const ready = () => setTimeout(finish, Math.max(0, 1300 - (performance.now() - t0)));
    if (document.readyState === 'complete') ready(); else addEventListener('load', ready, { once: true });
    setTimeout(finish, 2600); // failsafe
  } else {
    pre?.classList.add('is-done');
    startHero();
  }

  /* ---------- header: gliding hover block ---------- */
  const nav = $('.nav');
  const glider = $('.nav__glider');
  const desktop = matchMedia('(min-width: 64.01rem)');
  if (nav && glider) {
    let visible = false;
    const moveTo = (a) => {
      if (!desktop.matches) return;
      const n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      if (!visible) glider.classList.add('no-anim');
      glider.style.width = `${r.width}px`;
      glider.style.transform = `translate(${r.left - n.left}px, ${r.top - n.top}px)`;
      glider.style.height = `${r.height}px`;
      glider.style.top = '0';
      if (!visible) { glider.offsetWidth; glider.classList.remove('no-anim'); }
      glider.classList.add('is-on'); visible = true;
    };
    $$('.nav__link', nav).forEach(a => {
      a.addEventListener('mouseenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    nav.addEventListener('mouseleave', () => { glider.classList.remove('is-on'); visible = false; });
    nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) { glider.classList.remove('is-on'); visible = false; } });
  }

  /* ---------- phone menu: the strip grows into a sheet ---------- */
  const burger = $('.burger');
  const backdrop = $('.backdrop');
  const setMenu = (open) => {
    if (open === root.classList.contains('is-menu-open')) return;
    root.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    open ? lock() : unlock();
  };
  burger?.addEventListener('click', () => setMenu(!root.classList.contains('is-menu-open')));
  backdrop?.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  desktop.addEventListener?.('change', () => setMenu(false));
  $$('.nav a').forEach(a => a.addEventListener('click', (e) => {
    if (!root.classList.contains('is-menu-open')) return;
    const url = new URL(a.href, location.href);
    const samePage = url.pathname === location.pathname && url.hash;
    setMenu(false); // unlock first, then jump
    if (samePage) {
      e.preventDefault();
      requestAnimationFrame(() => $(url.hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    }
  }));

  /* ---------- office status (Europe/Berlin) ---------- */
  const HOURS = { 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18] };
  const berlin = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { day, h: +p.hour + +p.minute / 60 };
  };
  const updateStatus = () => {
    const { day, h } = berlin();
    const today = HOURS[day];
    const open = today && h >= today[0] && h < today[1];
    let text;
    if (open) text = `Jetzt geöffnet · bis ${today[1]} Uhr`;
    else if (today && h < today[0]) text = `Geschlossen · öffnet heute ${today[0]} Uhr`;
    else {
      let d = (day + 1) % 7, n = 1;
      while (!HOURS[d] && n < 7) { d = (d + 1) % 7; n++; }
      const names = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      text = `Geschlossen · öffnet ${n === 1 ? 'morgen' : names[d]} ${HOURS[d][0]} Uhr`;
    }
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', !!open);
      const t = $('[data-status-text]', el); if (t) t.textContent = text;
    });
    $$('[data-hours] [data-days]').forEach(row => row.classList.toggle('is-today', row.dataset.days.split(',').includes(String(day))));
  };
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- custom select (combobox + listbox, synced to a hidden input) ---------- */
  let selBackdrop;
  const phone = matchMedia('(max-width: 37.5rem)');
  $$('[data-select]').forEach((sel, idx) => {
    const btn = $('.select__btn', sel), list = $('.select__list', sel), input = $('input[type=hidden]', sel);
    const val = $('.select__value', sel), opts = $$('.select__opt', sel);
    const listId = list.id || `sel-list-${idx}`;
    list.id = listId;
    btn.setAttribute('aria-controls', listId);
    opts.forEach((o, i) => { o.id = o.id || `${listId}-o${i}`; });
    let active = Math.max(0, opts.findIndex(o => o.getAttribute('aria-selected') === 'true'));
    let typed = '', typedT;

    const setActive = (i) => {
      active = (i + opts.length) % opts.length;
      opts.forEach((o, k) => o.classList.toggle('is-active', k === active));
      list.setAttribute('aria-activedescendant', opts[active].id);
      opts[active].scrollIntoView({ block: 'nearest' });
    };
    const choose = (i, silent) => {
      opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === i)));
      input.value = opts[i].dataset.value;
      val.textContent = opts[i].textContent.trim();
      val.classList.toggle('is-placeholder', opts[i].dataset.value === '');
      sel.closest('.field')?.classList.remove('is-invalid');
      if (!silent) input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const open = () => {
      $$('[data-select].is-open').forEach(o => o !== sel && o.__close());
      sel.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      setActive(Math.max(0, opts.findIndex(o => o.getAttribute('aria-selected') === 'true')));
      list.focus({ preventScroll: true });
      if (phone.matches) {
        selBackdrop = selBackdrop || Object.assign(document.body.appendChild(document.createElement('div')), { className: 'select-backdrop' });
        selBackdrop.classList.add('is-on'); selBackdrop.onclick = close; lock();
      }
    };
    const close = (refocus = true) => {
      if (!sel.classList.contains('is-open')) return;
      sel.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      if (selBackdrop?.classList.contains('is-on')) { selBackdrop.classList.remove('is-on'); unlock(); }
      if (refocus) btn.focus({ preventScroll: true });
    };
    sel.__close = () => close(false);
    sel.__set = (v) => { const i = opts.findIndex(o => o.dataset.value === v); if (i > -1) choose(i, true); };

    btn.addEventListener('click', () => sel.classList.contains('is-open') ? close() : open());
    btn.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
    });
    list.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(opts.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); close(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab') { close(false); }
      else if (e.key.length === 1) {
        typed += e.key.toLowerCase(); clearTimeout(typedT); typedT = setTimeout(() => (typed = ''), 600);
        const i = opts.findIndex(o => o.textContent.trim().toLowerCase().startsWith(typed));
        if (i > -1) setActive(i);
      }
    });
    opts.forEach((o, i) => {
      o.addEventListener('click', () => { choose(i); close(); });
      o.addEventListener('mousemove', () => active !== i && setActive(i));
    });
    document.addEventListener('pointerdown', (e) => { if (!sel.contains(e.target) && !phone.matches) close(false); });
  });

  /* ---------- URL params → finder, filters, forms ---------- */
  const params = new URLSearchParams(location.search);

  /* ---------- listings filter (immobilien.html) ---------- */
  const board = $('[data-board]');
  if (board) {
    const cards = $$('.listing', board);
    const chips = $$('[data-art]');
    const zweckInputs = $$('input[name="zweck-filter"]');
    const empty = $('[data-empty]');
    const note = $('[data-result]');
    const label = { wohnen: 'Wohnimmobilien', gewerbe: 'Gewerbeimmobilien', grundstueck: 'Grundstücke', ferien: 'Ferienwohnungen', alle: 'Objekte' };
    let art = params.get('art') || 'alle';
    let zweck = params.get('zweck') || 'alle';
    if (!label[art]) art = 'alle';
    if (!['alle', 'kaufen', 'mieten'].includes(zweck)) zweck = 'alle';

    const apply = (push) => {
      let n = 0;
      cards.forEach(c => {
        const show = (art === 'alle' || c.dataset.type === art) && (zweck === 'alle' || c.dataset.deal === zweck);
        c.hidden = !show; if (show) n++;
      });
      chips.forEach(ch => {
        ch.setAttribute('aria-pressed', String(ch.dataset.art === art));
        const count = cards.filter(c => (ch.dataset.art === 'alle' || c.dataset.type === ch.dataset.art) && (zweck === 'alle' || c.dataset.deal === zweck)).length;
        const el = $('.count', ch); if (el) el.textContent = count;
      });
      zweckInputs.forEach(i => (i.checked = i.value === zweck));
      const what = label[art];
      const deal = zweck === 'kaufen' ? ' zum Kauf' : zweck === 'mieten' ? ' zur Miete' : '';
      if (note) note.textContent = n ? `${n} ${n === 1 && art === 'alle' ? 'Objekt' : what}${deal}` : `Keine ${what}${deal}`;
      if (empty) {
        empty.hidden = n > 0;
        const t = $('[data-empty-what]', empty); if (t) t.textContent = `${what}${deal}`;
        const link = $('a[data-empty-link]', empty);
        if (link) link.href = `kontakt.html?art=${art}&zweck=${zweck === 'alle' ? 'kaufen' : zweck}#anfrage`;
      }
      if (push) {
        const q = new URLSearchParams();
        if (art !== 'alle') q.set('art', art);
        if (zweck !== 'alle') q.set('zweck', zweck);
        history.replaceState(null, '', `${location.pathname}${q.toString() ? `?${q}` : ''}`);
      }
    };
    chips.forEach(ch => ch.addEventListener('click', () => { art = ch.dataset.art; apply(true); }));
    zweckInputs.forEach(i => i.addEventListener('change', () => { zweck = i.value; apply(true); }));
    apply(false);
  }

  /* ---------- forms: prefill, validation, simulated send (production: Web3Forms) ---------- */
  $$('form[data-form]').forEach(form => {
    const obj = params.get('objekt');
    const msg = $('textarea[name="nachricht"]', form);
    if (obj && msg && !msg.value) msg.value = `Ich interessiere mich für das Objekt ${obj} und bitte um das Exposé.`;
    const artSel = $('[data-select][data-name="art"]', form);
    if (artSel && params.get('art') && params.get('art') !== 'alle') artSel.__set?.(params.get('art'));
    const z = params.get('zweck');
    if (z) { const r = $(`input[type=radio][value="${z}"]`, form); if (r) r.checked = true; }

    const rules = {
      required: (el) => (el.type === 'checkbox' ? el.checked : el.value.trim() !== ''),
      email: (el) => !el.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()),
      tel: (el) => !el.value.trim() || /^[+()\d\s/-]{6,}$/.test(el.value.trim()),
    };
    const check = (el) => {
      const field = el.closest('.field'); if (!field) return true;
      let ok = true;
      if (el.hasAttribute('required') || el.dataset.required !== undefined) ok = rules.required(el);
      if (ok && el.type === 'email') ok = rules.email(el);
      if (ok && el.type === 'tel') ok = rules.tel(el);
      field.classList.toggle('is-invalid', !ok);
      return ok;
    };
    const fields = $$('input:not([type=hidden]):not(.hp), textarea, input[type=hidden][data-required]', form);
    fields.forEach(el => {
      el.addEventListener('blur', () => el.closest('.field')?.classList.contains('is-invalid') && check(el));
      el.addEventListener('input', () => el.closest('.field')?.classList.contains('is-invalid') && check(el));
      el.addEventListener('change', () => check(el));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('.hp', form)?.value) return;
      const bad = fields.filter(el => !check(el));
      if (bad.length) {
        const f = bad[0].closest('.field');
        (f.querySelector('.select__btn, input:not([type=hidden]), textarea') || f).focus({ preventScroll: true });
        f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      // Entwurf: kein Versand. Für den Livebetrieb vorbereitet: fetch('https://api.web3forms.com/submit', …)
      form.reset();
      $$('[data-select]', form).forEach(s => s.__set?.(''));
      openModal();
    });
  });

  const modal = $('#sent');
  let lastFocus;
  const openModal = () => {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false; requestAnimationFrame(() => modal.classList.add('is-open'));
    lock(); $('[data-close]', modal).focus();
  };
  const closeModal = () => {
    modal.classList.remove('is-open'); unlock();
    setTimeout(() => (modal.hidden = true), 250); lastFocus?.focus?.();
  };
  modal?.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal(); });

  /* ---------- accordion: one open at a time, first open by default ---------- */
  $$('[data-acc]').forEach(acc => {
    const items = $$('.acc__item', acc);
    const set = (item) => items.forEach(it => {
      const on = it === item;
      it.classList.toggle('is-open', on);
      $('.acc__btn', it).setAttribute('aria-expanded', String(on));
    });
    items.forEach(it => $('.acc__btn', it).addEventListener('click', () => set(it.classList.contains('is-open') ? null : it)));
    // reserve the tallest open state, so nothing below jumps
    const reserve = () => {
      const closed = items.reduce((h, it) => h + $('.acc__btn', it).offsetHeight + 2, 0);
      const gap = parseFloat(getComputedStyle(acc).rowGap) || 0;
      const tallest = Math.max(...items.map(it => $('.acc__panel > div', it).scrollHeight));
      acc.style.minHeight = `${closed + gap * (items.length - 1) + tallest}px`;
    };
    reserve(); addEventListener('resize', reserve);
  });

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('is-in'));

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
})();
