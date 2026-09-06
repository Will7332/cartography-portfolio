// Lightbox for images inside horizontal scroll strips.
document.addEventListener('DOMContentLoaded', () => {
  const strips = document.querySelectorAll('.scroll-strip');
  if (!strips.length) return;

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
    imgEl.alt = item.caption;
    captionEl.textContent = item.caption;
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

  strips.forEach((strip) => {
    const figs = Array.from(strip.querySelectorAll('.scroll-item'));
    const items = figs.map((fig) => {
      const img = fig.querySelector('img');
      const caption = fig.querySelector('figcaption');
      return {
        src: img.getAttribute('src'),
        caption: caption ? caption.textContent : img.alt,
      };
    });
    figs.forEach((fig, i) => {
      const img = fig.querySelector('img');
      img.addEventListener('click', () => open(items, i));
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
});
