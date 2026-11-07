// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

function setMenu(open) {
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.firstChild.textContent = open ? 'Close ' : 'Menu ';
  document.body.classList.toggle('menu-open', open);
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

// Booking form: validate email, then show the success state
const form = document.getElementById('booking');
const success = document.querySelector('.success');
const email = form.elements.email;
const emailError = email.parentElement.querySelector('.error');

function checkEmail() {
  const ok = email.validity.valid && email.value.trim() !== '';
  email.setAttribute('aria-invalid', String(!ok));
  emailError.hidden = ok;
  return ok;
}
email.addEventListener('input', () => { if (email.getAttribute('aria-invalid') === 'true') checkEmail(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!checkEmail()) { email.focus(); return; }
  const d = new FormData(form);
  const date = d.get('date') ? new Date(d.get('date')).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'a date to be agreed';
  const guests = d.get('guests') ? ` for ${d.get('guests')} guests` : '';
  success.querySelector('.success-summary').textContent =
    `${d.get('type')} · ${d.get('space')} · ${date}${guests}. We’ll reply to ${d.get('email')}.`;
  form.hidden = true;
  success.hidden = false;
  success.focus();
});

document.getElementById('again').addEventListener('click', () => {
  form.reset();
  success.hidden = true;
  form.hidden = false;
});
