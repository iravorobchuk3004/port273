// Shared: footer, space cards, mobile menu, home "Plan your event" form

const LOGO = '<svg viewBox="0 0 46 28" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M0 0h37v8h9v6.5c0 3.6-2.9 6-6.5 6H11V28H0zM11 9v4h24V9z"/></svg>';

const footer = document.querySelector('.footer');
if (footer) {
  footer.innerHTML = `
    <div class="wrap">
      <div class="footer-top">
        <a href="index.html" class="footer-logo" aria-label="PORT-273 home">${LOGO}</a>
        <div class="footer-contacts">
          <p>Address<br>273 Creative District<br>Kyiv, Ukraine</p>
          <p>Contact<br><a href="mailto:hello@port273.com">hello@port273.com</a><br><a href="tel:+380000000000">+380 00 000 00 00</a></p>
        </div>
      </div>
      <p class="footer-kicker">Have a project in mind?</p>
      <a href="book.html" class="footer-cta"><span>Let’s create.</span>
        <svg viewBox="0 0 70 70" aria-hidden="true"><path d="M8 62L62 8M16 8h46v46"/></svg></a>
    </div>`;
}

document.querySelectorAll('[data-spaces]').forEach(grid => {
  grid.innerHTML = SPACES.map(s => `
    <a class="space-card" href="space.html?id=${s.id}">
      <span class="space-img"><img src="${s.img}" alt="${s.name}" loading="lazy"></span>
      <span class="space-row"><b>${s.name}</b><span>${s.area} m²</span></span>
      <span class="space-desc">${s.short}</span>
    </a>`).join('');
});

// Header turns compact and solid once the page is scrolled
const onScroll = () => document.body.classList.toggle('scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  const setMenu = open => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
}

// Hero motion: 500+ counts up and drifts after the cursor, the button leans toward it
const stat = document.querySelector('.hero-stat b');
const heroBtn = document.querySelector('.hero-btn');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (stat && !calm) {
  const to = Number(stat.dataset.count);
  stat.style.minWidth = stat.offsetWidth + 'px'; // keep the caption still while digits change
  const t0 = performance.now(), dur = 3200;
  const tick = now => {
    const p = Math.min(1, (now - t0) / dur);
    stat.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + '+';
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const hero = document.querySelector('.hero');
if (hero && stat && finePointer && !calm) {
  let tx = 0, ty = 0, x = 0, y = 0, running = false;
  const follow = () => {
    x += (tx - x) * 0.04; y += (ty - y) * 0.04;
    stat.style.setProperty('--mx', x.toFixed(1) + 'px');
    stat.style.setProperty('--my', y.toFixed(1) + 'px');
    running = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1;
    if (running) requestAnimationFrame(follow);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(follow); } };
  hero.addEventListener('mousemove', e => {
    const r = stat.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    // pulled toward the cursor, but never more than ~60px away from its place
    const d = Math.hypot(dx, dy) || 1, pull = Math.min(60, d * 0.12);
    tx = dx / d * pull; ty = dy / d * pull * 0.6;
    kick();
  });
  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; kick(); });
}

if (heroBtn && finePointer && !calm) {
  heroBtn.addEventListener('mousemove', e => {
    const r = heroBtn.getBoundingClientRect();
    heroBtn.style.setProperty('--bx', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'px');
    heroBtn.style.setProperty('--by', ((e.clientY - r.top) / r.height - 0.5) * 10 + 'px');
  });
  heroBtn.addEventListener('mouseleave', () => { heroBtn.style.setProperty('--bx', '0px'); heroBtn.style.setProperty('--by', '0px'); });
}

// Home form hands its answers to the booking flow
const planForm = document.getElementById('plan-form');
if (planForm) {
  planForm.addEventListener('submit', e => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(planForm)) if (v) params.set(k, v);
    location.href = 'book.html' + (params.toString() ? '?' + params : '');
  });
}
