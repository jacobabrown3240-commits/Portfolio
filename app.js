// Small, dependency-free interactions for the site.

// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu after tapping a link (mobile)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Current year in the footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form → submit to Formspree via fetch, show inline success.
// If JS is unavailable, the form still POSTs normally (and _next redirects
// to the branded thanks page), so this is pure progressive enhancement.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const successPanel = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (errorEl) errorEl.hidden = true;

    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        contactForm.hidden = true;
        if (successPanel) successPanel.hidden = false;
        return;
      }

      let message = 'Something went wrong. Please try again, or email me directly at BrownForgeIT@gmail.com.';
      try {
        const data = await response.json();
        if (data && Array.isArray(data.errors) && data.errors.length) {
          message = data.errors.map((e) => e.message).join(' ');
        }
      } catch (_) { /* keep default message */ }
      if (errorEl) { errorEl.textContent = message; errorEl.hidden = false; }
    } catch (_) {
      if (errorEl) {
        errorEl.textContent = 'Network error — please email me at BrownForgeIT@gmail.com.';
        errorEl.hidden = false;
      }
    } finally {
      if (submitBtn && !contactForm.hidden) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  });
}

// Project cards → open a lightbox with the enlarged image + details.
// Cards are <button>s, so clicking never navigates or scrolls the page.
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbMedia = document.getElementById('lbMedia');
  const lbTitle = document.getElementById('lbTitle');
  const lbDesc = document.getElementById('lbDesc');
  const lbTags = document.getElementById('lbTags');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  let lastFocused = null;

  const openLightbox = (card) => {
    const img = card.querySelector('.project-thumb img');
    const icon = card.querySelector('.project-thumb .ico');
    const title = card.querySelector('h3');
    const desc = card.querySelector('.project-body p');

    lbMedia.innerHTML = '';
    if (img) {
      const big = document.createElement('img');
      big.src = img.src;
      big.alt = img.alt || '';
      lbMedia.appendChild(big);
    } else if (icon) {
      lbMedia.appendChild(icon.cloneNode(true));
    }
    lbTitle.textContent = title ? title.textContent : '';
    lbDesc.textContent = desc ? desc.textContent : '';
    lbTags.innerHTML = '';
    card.querySelectorAll('.tags li').forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t.textContent;
      lbTags.appendChild(li);
    });

    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    if (closeBtn) closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove('lb-open');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('click', () => openLightbox(card));
  });
  lightbox.querySelectorAll('[data-lb-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

// Fade elements in as they scroll into view.
// Everything stays fully visible if JS or IntersectionObserver is unavailable —
// the hidden state is only applied once we know we can reveal it.
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.card, .project, .cert, .faq-item, .hero-stats');

if (revealEls.length && 'IntersectionObserver' in window && !prefersReduced) {
  document.documentElement.classList.add('js-reveal');
  revealEls.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => io.observe(el));
}

// Back-to-top (and the brand logo) link to #top. The header has id="top" but
// is position: sticky, so it's always on screen — meaning the plain #top anchor
// won't scroll anywhere. Handle it in JS so it reliably jumps to the very top.
document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
});
