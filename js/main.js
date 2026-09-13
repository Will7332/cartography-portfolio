document.addEventListener('DOMContentLoaded', () => {
  setupNavToggle();
  setupLightbox();
  setupVariantGallery();
  setupHeroCarousel();
});

// Crossfades the hero-split images every 6 seconds.
function setupHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;
  const imgs = Array.from(carousel.querySelectorAll('img'));
  if (imgs.length < 2) return;

  let index = imgs.findIndex((img) => img.classList.contains('is-active'));
  if (index < 0) index = 0;

  setInterval(() => {
    imgs[index].classList.remove('is-active');
    index = (index + 1) % imgs.length;
    imgs[index].classList.add('is-active');
  }, 6000);
}

// Mobile hamburger menu: slide-in nav drawer.
function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const overlay = document.querySelector('.nav-overlay');
  const nav = document.querySelector('.site-header nav');
  if (!toggle || !overlay || !nav) return;

  function closeNav() {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('nav-open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  overlay.addEventListener('click', closeNav);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

// Lightbox for images inside horizontal scroll strips and marked grids.
function setupLightbox() {
  const groups = document.querySelectorAll('.scroll-strip, .lightbox-grid');
  const individualContainers = document.querySelectorAll('.lightbox-grid-individual');
  if (!groups.length && !individualContainers.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <button type="button" class="lightbox-prev" aria-label="Previous image">&#8249;</button>
    <div class="lightbox-content">
      <img alt="">
      <p class="lightbox-caption"></p>
    </div>
    <button type="button" class="lightbox-next" aria-label="Next image">&#8250;</button>
  `;
  document.body.appendChild(lightbox);

  const imgEl = lightbox.querySelector('img');
  const captionEl = lightbox.querySelector('.lightbox-caption');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  let currentItems = [];
  let currentIndex = 0;

  function show(index) {
    currentIndex = (index + currentItems.length) % currentItems.length;
    const item = currentItems[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    captionEl.textContent = item.caption || '';
    captionEl.hidden = !item.caption;
    const multi = currentItems.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function open(items, index) {
    currentItems = items;
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function wireFigures(figs) {
    figs = figs.filter((fig) => !fig.hasAttribute('data-variants'));
    if (!figs.length) return;
    const items = figs.map((fig) => {
      const img = fig.querySelector('img');
      const caption = fig.querySelector('figcaption');
      return {
        src: img.getAttribute('src'),
        alt: img.alt,
        caption: caption ? caption.textContent : '',
      };
    });
    figs.forEach((fig, i) => {
      const img = fig.querySelector('img');
      img.addEventListener('click', () => open(items, i));
    });
  }

  groups.forEach((group) => {
    wireFigures(Array.from(group.querySelectorAll(':scope > figure')));
  });

  individualContainers.forEach((container) => {
    Array.from(container.querySelectorAll(':scope > figure')).forEach((fig) => {
      wireFigures([fig]);
    });
  });

  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));
  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
}

// Opens a main image plus a scrollable thumbnail strip of close-up variants.
function setupVariantGallery() {
  const triggers = document.querySelectorAll('[data-variants]');
  if (!triggers.length) return;

  const modal = document.createElement('div');
  modal.className = 'variant-lightbox';
  modal.hidden = true;
  modal.innerHTML = `
    <button type="button" class="variant-lightbox-close" aria-label="Close">&times;</button>
    <div class="variant-lightbox-content">
      <img class="variant-lightbox-main" alt="">
      <div class="variant-lightbox-thumbs"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const mainImg = modal.querySelector('.variant-lightbox-main');
  const thumbStrip = modal.querySelector('.variant-lightbox-thumbs');
  const closeBtn = modal.querySelector('.variant-lightbox-close');

  function showVariant(items, index, thumbs) {
    const item = items[index];
    mainImg.src = item.src;
    mainImg.alt = item.alt || '';
    thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
  }

  function open(items) {
    thumbStrip.innerHTML = '';
    const thumbs = items.map((item, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'variant-lightbox-thumb';
      thumb.innerHTML = `<img src="${item.src}" alt="${item.alt || ''}">`;
      thumbStrip.appendChild(thumb);
      return thumb;
    });
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => showVariant(items, i, thumbs));
    });
    showVariant(items, 0, thumbs);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    let items;
    try {
      items = JSON.parse(trigger.getAttribute('data-variants'));
    } catch (e) {
      return;
    }
    if (!Array.isArray(items) || !items.length) return;
    const img = trigger.querySelector('img') || trigger;
    img.addEventListener('click', () => open(items));
  });

  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.hidden && e.key === 'Escape') close();
  });
}
