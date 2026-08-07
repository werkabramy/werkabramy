(() => {
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const page = body.dataset.page;
  document.querySelector(`[data-nav="${page}"]`)?.setAttribute('aria-current','page');

  toggle?.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => body.classList.remove('menu-open')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') body.classList.remove('menu-open');
  });

  const revealEls = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        io.unobserve(e.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px -40px'});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  const form = document.querySelector('[data-email-form]');
  const status = document.getElementById('formStatus');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    required.forEach(field => field.closest('.field')?.classList.toggle('invalid', !field.checkValidity()));
    if (!form.checkValidity()) {
      if (status) status.textContent = 'Uzupełnij wymagane pola i zaznacz zgodę.';
      form.querySelector(':invalid')?.focus();
      return;
    }
    const fd = new FormData(form);
    const v = n => String(fd.get(n) || '').trim();
    const msg = [
      'Dzień dobry, proszę o wstępną wycenę Werka Bramy.', '',
      `Imię i nazwisko: ${v('name')}`,
      `Telefon: ${v('phone')}`,
      `Miejscowość: ${v('city')}`,
      `Zakres: ${v('service')}`,
      `Szerokość wjazdu: ${v('width') || 'nie podano'}`,
      `Kontakt: ${v('contact')}`,
      `Opis: ${v('message') || 'do ustalenia'}`, '',
      'Za chwilę dołączę zdjęcie miejsca realizacji.'
    ].join('\n');
    const subject = `Wycena Werka Bramy — ${v('service') || 'zapytanie'} — ${v('city') || 'bez miejscowości'}`;
    if (status) status.textContent = 'Gotowe — otwieram wiadomość e-mail do Werka Bramy.';
    window.location.href = `mailto:werkabramy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
  });

  /* Tylko zdjęcia, które dobrze prezentują się w galerii. Odrzucone są kadry z palcami
     na obiektywie i najsłabsze/mało czytelne ujęcia. */
  const groups = [
    {key:'przesuwne',label:'Brama przesuwna',files:['przesuwna-03.webp','przesuwna-06.webp','przesuwna-07.webp','przesuwna-08.webp','przesuwna-12.webp','przesuwna-14.webp','przesuwna-16.webp','przesuwna-20.webp','przesuwna-21.webp','przesuwna-22.webp','przesuwna-24.webp']},
    {key:'dwuskrzydlowe',label:'Brama dwuskrzydłowa',files:['dwuskrzydlowa-01.webp','dwuskrzydlowa-02.webp','dwuskrzydlowa-03.webp','dwuskrzydlowa-04.webp','dwuskrzydlowa-05.webp','dwuskrzydlowa-06.webp','dwuskrzydlowa-07.webp','dwuskrzydlowa-08.webp','dwuskrzydlowa-10.webp','dwuskrzydlowa-18.webp','dwuskrzydlowa-21.webp','dwuskrzydlowa-22.webp','dwuskrzydlowa-23.webp','dwuskrzydlowa-25.webp','dwuskrzydlowa-27.webp','dwuskrzydlowa-28.webp','dwuskrzydlowa-30.webp','dwuskrzydlowa-32.webp','dwuskrzydlowa-39.webp','dwuskrzydlowa-40.webp']},
    {key:'furtki',label:'Furtka / ogrodzenie',files:['furtka-03.webp','furtka-04.webp','furtka-06.webp','furtka-07.webp','furtka-08.webp','furtka-09.webp','furtka-10.webp','furtka-14.webp']},
    {key:'inne',label:'Element stalowy',files:['inne-03.webp','inne-04.webp','inne-05.webp','inne-07.webp','inne-08.webp','inne-09.webp','inne-10.webp','inne-11.webp','inne-12.webp','inne-13.webp','inne-16.webp','inne-18.webp','inne-19.webp','inne-21.webp']}
  ];

  const grid = document.getElementById('portfolioGrid');
  const buttons = document.querySelectorAll('.filter-button');
  const more = document.getElementById('loadMoreButton');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let filter = 'all', visible = 15, items = [], lbIndex = 0;
  const all = [];
  const max = Math.max(...groups.map(g => g.files.length));
  for (let i = 0; i < max; i++) groups.forEach(g => {
    if (g.files[i]) all.push({src:g.files[i], category:g.key, label:g.label});
  });
  const current = () => filter === 'all' ? all : all.filter(x => x.category === filter);
  const render = () => {
    if (!grid) return;
    items = current();
    grid.innerHTML = '';
    items.slice(0, visible).forEach((x, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'portfolio-item';
      b.dataset.index = i;
      b.innerHTML = `<img src="${x.src}" loading="lazy" alt="${x.label}"><span>${x.label}</span>`;
      grid.appendChild(b);
    });
    if (more) more.hidden = visible >= items.length;
  };
  buttons.forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter || 'all';
    visible = 15;
    buttons.forEach(x => x.classList.toggle('active', x === b));
    render();
  }));
  more?.addEventListener('click', () => { visible += 12; render(); });

  const show = i => {
    if (!items.length || !lightboxImage || !lightboxCaption) return;
    lbIndex = (i + items.length) % items.length;
    const x = items[lbIndex];
    lightboxImage.src = x.src;
    lightboxImage.alt = x.label;
    lightboxCaption.textContent = `${x.label} — ${lbIndex + 1}/${items.length}`;
  };
  const open = i => {
    if (!lightbox) return;
    show(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    body.classList.add('lightbox-open');
  };
  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    body.classList.remove('lightbox-open');
  };
  grid?.addEventListener('click', e => {
    const item = e.target.closest('.portfolio-item');
    if (item) open(Number(item.dataset.index));
  });
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', close);
  lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => show(lbIndex - 1));
  lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => show(lbIndex + 1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(lbIndex - 1);
    if (e.key === 'ArrowRight') show(lbIndex + 1);
  });
  render();

  const techInfoTitle = document.getElementById("techInfoTitle");
  const techInfoText = document.getElementById("techInfoText");
  const techInfoIndex = document.getElementById("techInfoIndex");
  const techHotspots = document.querySelectorAll(".property-view .hotspot[data-title]");
  const activateTech = (button) => {
    if (!button || !techInfoTitle || !techInfoText || !techInfoIndex) return;
    techHotspots.forEach((item) => item.classList.toggle("is-active", item === button));
    techInfoIndex.textContent = button.dataset.index || "";
    techInfoTitle.textContent = button.dataset.title || "";
    techInfoText.textContent = button.dataset.text || "";
  };
  techHotspots.forEach((button) => {
    button.addEventListener("mouseenter", () => activateTech(button));
    button.addEventListener("focus", () => activateTech(button));
    button.addEventListener("click", () => activateTech(button));
  });
  if (techHotspots[0]) activateTech(techHotspots[0]);

  /* FINAL WOW INTERACTIONS */
  const progress = document.createElement('div');
  progress.className = 'site-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progress.style.transform = `scaleX(${value})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  if (!reducedMotion) {
    const heroStage = document.querySelector('body[data-page="start"] .hero-stage');
    const heroImage = heroStage?.querySelector('.hero-media img');
    if (heroStage && heroImage && window.matchMedia('(pointer:fine)').matches) {
      heroStage.addEventListener('pointermove', (event) => {
        const rect = heroStage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
        heroImage.style.setProperty('--hero-x', `${x}px`);
        heroImage.style.setProperty('--hero-y', `${y}px`);
      });
      heroStage.addEventListener('pointerleave', () => {
        heroImage.style.setProperty('--hero-x', '0px');
        heroImage.style.setProperty('--hero-y', '0px');
      });
    }

    document.querySelectorAll('.button, .header-cta').forEach((el) => {
      if (!window.matchMedia('(pointer:fine)').matches) return;
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.06;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
        el.style.setProperty('--mag-x', `${x}px`);
        el.style.setProperty('--mag-y', `${y}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      });
    });

    document.querySelectorAll('.offer-grid, .gallery-preview, .process-grid, .reviews-wide, .portfolio-grid').forEach((group) => {
      [...group.children].forEach((child, index) => child.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`));
    });
  }
})();

/* cookie preferences + consent-gated Google Maps */
(() => {
  const CONSENT_KEY = 'werka_cookie_consent_v1';
  const getConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const setConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch {}
  };

  const createBanner = () => {
    if (document.querySelector('.cookie-banner')) return document.querySelector('.cookie-banner');
    const banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Ustawienia prywatności i cookies');
    banner.innerHTML = `
      <div class="cookie-banner-copy">
        <strong>Prywatność i cookies</strong>
        <p>Strona zapisuje wyłącznie wybór ustawień prywatności. Treści zewnętrzne, takie jak Google Maps, są ładowane dopiero po Twojej zgodzie. <a href="polityka-prywatnosci.html">Dowiedz się więcej</a>.</p>
      </div>
      <div class="cookie-banner-actions">
        <button class="button cookie-essential" type="button" data-cookie-choice="essential">Tylko niezbędne</button>
        <button class="button" type="button" data-cookie-choice="external">Akceptuję</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-cookie-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.dataset.cookieChoice;
        setConsent(value);
        banner.classList.remove('is-visible');
        if (value === 'external') enableMaps();
      });
    });
    return banner;
  };

  const enableMap = (holder) => {
    if (!holder || holder.classList.contains('has-map')) return;
    const src = holder.dataset.mapSrc;
    if (!src) return;
    const iframe = document.createElement('iframe');
    iframe.title = 'Mapa Ruda Śląska';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = src;
    holder.innerHTML = '';
    holder.appendChild(iframe);
    holder.classList.add('has-map');
  };

  function enableMaps() {
    document.querySelectorAll('[data-cookie-map]').forEach(enableMap);
  }

  const banner = createBanner();
  const consent = getConsent();
  if (consent === 'external') enableMaps();
  if (!consent) requestAnimationFrame(() => banner.classList.add('is-visible'));

  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', () => banner.classList.add('is-visible'));
  });
  document.querySelectorAll('[data-enable-map]').forEach((button) => {
    button.addEventListener('click', () => {
      setConsent('external');
      banner.classList.remove('is-visible');
      enableMaps();
    });
  });
})();
