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
