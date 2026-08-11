// Haven — original interaction layer: hero intro, sticky nav, scroll reveal,
// animated stat counters, FAQ accordion.

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- hero line reveal ----
  const hero = document.querySelector('.hero');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  // ---- hero video: respect reduced-motion by freezing on the poster frame ----
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  // ---- sticky nav background swap ----
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- active nav link tracking (scroll-spy) ----
  // Previously "active" was hard-coded on the Home link in the HTML and
  // nothing ever changed it. This tracks real scroll position instead: for
  // each nav link with a matching #id on the page, pick whichever target's
  // offsetTop is the closest one at-or-above the current scroll position.
  // That ordering logic (not DOM/array order) is what makes it work even for
  // "Services", which is an anchor nested inside the About section rather
  // than a separate top-level section.
  const navSpyLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .map((link) => ({ link, id: link.getAttribute('href').slice(1) }))
    .filter((item) => item.id && document.getElementById(item.id));

  // liquid pill that slides behind whichever link is active
  const navPill = document.querySelector('.nav-pill');
  function positionNavPill(link) {
    if (!navPill || !link) return;
    // pill is display:none below 1000px, where links stack vertically
    if (getComputedStyle(navPill).display === 'none') return;
    const wrap = link.closest('.nav-links-wrap');
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navPill.style.width = `${linkRect.width}px`;
    navPill.style.transform = `translateX(${linkRect.left - wrapRect.left}px)`;
    navPill.style.opacity = '1';
  }

  function updateActiveNav() {
    if (!navSpyLinks.length) return;
    const scrollPos = window.scrollY + 160; // clears the fixed nav + a little lead
    let current = navSpyLinks[0];
    let bestTop = -Infinity;
    for (const item of navSpyLinks) {
      const top = document.getElementById(item.id).offsetTop;
      if (top <= scrollPos && top > bestTop) {
        bestTop = top;
        current = item;
      }
    }
    // near the very bottom of the page, force the last link active even if
    // its section is shorter than the scroll-lead offset
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    const target = atBottom ? navSpyLinks[navSpyLinks.length - 1] : current;
    navSpyLinks.forEach((item) => item.link.classList.toggle('active', item === target));
    positionNavPill(target.link);
  }

  let navSpyTicking = false;
  window.addEventListener('scroll', () => {
    if (navSpyTicking) return;
    navSpyTicking = true;
    requestAnimationFrame(() => {
      updateActiveNav();
      navSpyTicking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });
  updateActiveNav();

  // ---- mobile nav burger ----
  // State lives in a single .is-open class on .nav (CSS owns all the styling).
  // The previous version pushed inline styles onto .nav-links with `cssText +=`,
  // which re-appended the same declarations on every open and fought the
  // stylesheet's own breakpoints.
  const burger = document.querySelector('.nav-burger');
  const MOBILE_NAV = window.matchMedia('(max-width: 1000px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) {
      nav.querySelectorAll('.nav-dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
    }
  }

  burger?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!nav.classList.contains('is-open'));
  });

  // "Pages" is hover-opened on desktop; on touch it needs an explicit tap
  document.querySelector('.nav-dropdown-toggle')?.addEventListener('click', (e) => {
    if (!MOBILE_NAV.matches) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.closest('.nav-dropdown').classList.toggle('is-open');
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger?.focus();
    }
  });
  // leaving the mobile breakpoint should never strand the panel open
  MOBILE_NAV.addEventListener('change', (e) => { if (!e.matches) setMenu(false); });

  // ---- scroll reveal: text/content blocks ----
  // One reveal per logical block. Never nested inside another [data-reveal]
  // ancestor, so every section fades in exactly once, the same way.
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---- scroll reveal: image/media grids ----
  // Every [data-reveal-group] (gallery-strip, project-grid, team-strip) reveals
  // its [data-reveal-img] children with the same stagger, so all three grids
  // on the site behave identically instead of each fading in differently.
  const STAGGER_MS = 100;
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-reveal-img]');
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * STAGGER_MS}ms`;
    });
  });
  const imgRevealEls = document.querySelectorAll('[data-reveal-img]');
  const imgRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        imgRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  imgRevealEls.forEach((el) => imgRevealObserver.observe(el));

  // ---- animated stat counters ----
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => counterObserver.observe(el));

  // ---- before/after compare slider ----
  document.querySelectorAll('[data-compare-frame]').forEach((frame) => {
    const afterWrap = frame.querySelector('[data-compare-after]');
    const handle = frame.querySelector('[data-compare-handle]');
    let dragging = false;

    function setValue(pct) {
      const clamped = Math.min(100, Math.max(0, pct));
      afterWrap.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left = `${clamped}%`;
      frame.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }

    function pctFromEvent(e) {
      const rect = frame.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    frame.addEventListener('pointerdown', (e) => {
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      setValue(pctFromEvent(e));
    });
    frame.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setValue(pctFromEvent(e));
    });
    frame.addEventListener('pointerup', (e) => {
      dragging = false;
      frame.releasePointerCapture(e.pointerId);
    });
    frame.addEventListener('pointercancel', () => { dragging = false; });

    frame.addEventListener('keydown', (e) => {
      const current = parseFloat(frame.getAttribute('aria-valuenow')) || 50;
      const step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft') { setValue(current - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setValue(current + step); e.preventDefault(); }
      else if (e.key === 'Home') { setValue(0); e.preventDefault(); }
      else if (e.key === 'End') { setValue(100); e.preventDefault(); }
    });

    setValue(50);
  });

  // ---- FAQ accordion ----
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.closest('.accordion').querySelectorAll('.accordion-item').forEach((i) => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

  // ---- smooth-scroll for in-page anchors, closes mobile menu ----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setMenu(false);
        }
      }
    });
  });
});
