(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const menuLinks = document.querySelectorAll('.nav-links a');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const closeMenu = () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation menu');
    navLinks?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navToggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
    navLinks.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  menuLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Hero image slider
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  let activeSlide = 0;
  let slideTimer;
  const showSlide = index => {
    activeSlide = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-pressed', String(active));
    });
  };
  const startSlider = () => {
    if (reducedMotion || slides.length < 2) return;
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide((activeSlide + 1) % slides.length), 6500);
  };
  dots.forEach(dot => dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.target));
    startSlider();
  }));
  startSlider();

  // Identity tabs
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const activateTab = (name, focus = false) => {
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activateTab(tabs[next].dataset.tab, true);
    });
  });

  // Then/now image comparison
  const range = document.getElementById('compare-range');
  const afterWrap = document.getElementById('compare-after-wrap');
  const divider = document.getElementById('compare-divider');
  if (range && afterWrap && divider) {
    const updateCompare = () => {
      const value = `${range.value}%`;
      afterWrap.style.width = value;
      divider.style.left = value;
    };
    range.addEventListener('input', updateCompare);
    updateCompare();
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px' });
    reveals.forEach(el => observer.observe(el));
  }

  // Counter animation (only for smaller values; 1986 stays legible as a year)
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = el => {
    const target = Number(el.dataset.counter);
    if (target >= 1000 || reducedMotion) return;
    const duration = 900;
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: .6 });
    counters.forEach(el => counterObserver.observe(el));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
