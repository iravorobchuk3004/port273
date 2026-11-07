// Booking flow: space → date & time → details → review → success.
// Availability is faked deterministically so the same day always looks the same.

const params = new URLSearchParams(location.search);
const state = {
  space: spaceById(params.get('space'))?.id || null,
  date: null,
  hours: 4,
  start: null,
  type: EVENT_TYPES.includes(params.get('type')) ? params.get('type') : 'Workshop',
  guests: '', name: '', email: params.get('email') || '', phone: '', note: '',
};
let step = state.space ? 2 : 1;

const DURATIONS = [{ h: 2, label: '2 hours' }, { h: 4, label: '4 hours' }, { h: 12, label: 'Full day' }];
const STARTS = [10, 12, 14, 16, 18, 20];
const CLOSE = 22;

const today = new Date(); today.setHours(0, 0, 0, 0);
const firstDay = new Date(today); firstDay.setDate(today.getDate() + 1);
const lastDay = new Date(today); lastDay.setDate(today.getDate() + 90);
let calMonth = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1);

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDate = s => fromIso(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
const hh = h => String(h).padStart(2, '0') + ':00';
const hash = str => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const dayBusy = d => hash(state.space + iso(d)) % 6 === 0;
const slotBusy = (date, h) => hash(state.space + date + h) % 7 === 0;
function startFree(h) {
  if (state.hours === 12) return h === 10 && STARTS.every(s => !slotBusy(state.date, s));
  if (h + state.hours > CLOSE) return false;
  for (let t = h; t < h + state.hours; t += 2) if (slotBusy(state.date, t)) return false;
  return true;
}

// prefill a date from the home form if it is bookable
if (params.get('date')) {
  const d = fromIso(params.get('date'));
  if (d >= firstDay && d <= lastDay) { state.date = iso(d); calMonth = new Date(d.getFullYear(), d.getMonth(), 1); }
}

const $ = s => document.querySelector(s);
const chip = (name, value, label, checked, disabled = false) =>
  `<label class="chip"><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${label}</span></label>`;

// ---------- step 1: space ----------
function renderSpaces() {
  $('#pick-spaces').innerHTML = SPACES.map(s => `
    <label class="pick"><input type="radio" name="space" value="${s.id}" ${state.space === s.id ? 'checked' : ''}>
      <img src="${s.img}" alt="">
      <span><b>${s.name}</b><span>${s.area} m² · up to ${s.guests} guests<br>${uah(s.price)} / hour</span></span>
    </label>`).join('');
}
$('#pick-spaces').addEventListener('change', e => {
  state.space = e.target.value;
  if (state.date && dayBusy(fromIso(state.date))) state.date = null;
  state.start = null;
  update();
});

// ---------- step 2: date & time ----------
function renderCal() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(y, m + 1, 0).getDate();
  let cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => `<span class="dow">${d}</span>`).join('');
  cells += '<span></span>'.repeat(offset);
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const out = date < firstDay || date > lastDay;
    const busy = !out && dayBusy(date);
    const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) + (busy ? ', fully booked' : '');
    cells += `<button type="button" class="day${busy ? ' busy' : ''}" data-date="${iso(date)}" ${out || busy ? 'disabled' : ''} aria-pressed="${state.date === iso(date)}" aria-label="${label}">${d}</button>`;
  }
  const prevOk = new Date(y, m, 0) >= firstDay;
  const nextOk = new Date(y, m + 1, 1) <= lastDay;
  $('#cal').innerHTML = `
    <div class="cal-head">
      <button type="button" class="cal-nav" data-month="-1" ${prevOk ? '' : 'disabled'} aria-label="Previous month">←</button>
      <b>${calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b>
      <button type="button" class="cal-nav" data-month="1" ${nextOk ? '' : 'disabled'} aria-label="Next month">→</button>
    </div>
    <div class="cal-grid">${cells}</div>
    <p class="cal-legend"><span>Crossed out — fully booked</span></p>`;
}
$('#cal').addEventListener('click', e => {
  const nav = e.target.closest('[data-month]');
  if (nav) { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + Number(nav.dataset.month), 1); renderCal(); return; }
  const day = e.target.closest('.day');
  if (day && !day.disabled) { state.date = day.dataset.date; state.start = null; update(); }
});

function renderTimes() {
  $('#durations').innerHTML = DURATIONS.map(d => chip('dur', d.h, d.label, state.hours === d.h)).join('');
  if (!state.date) {
    $('#starts').innerHTML = '';
    $('#time-hint').textContent = 'Pick a date to see free times.';
    return;
  }
  if (state.start != null && !startFree(state.start)) state.start = null;
  $('#starts').innerHTML = STARTS.map(h => {
    // only offer slots that end by closing time
    const label = state.hours === 12 ? (h === 10 ? '10:00 – 22:00' : null)
      : h + state.hours <= CLOSE ? `${hh(h)} – ${hh(h + state.hours)}` : null;
    return label ? chip('start', h, label, state.start === h, !startFree(h)) : '';
  }).join('');
  const any = STARTS.some(startFree);
  $('#time-hint').textContent = any ? 'Crossed-out times are already taken.' : 'No free slots of this length that day. Try a shorter duration or another date.';
}
$('#durations').addEventListener('change', e => { state.hours = Number(e.target.value); state.start = null; update(); });
$('#starts').addEventListener('change', e => { state.start = Number(e.target.value); update(); });

// ---------- step 3: details ----------
const form = $('#details');
$('#types').innerHTML = EVENT_TYPES.map(t => chip('type', t, t, state.type === t)).join('');
$('#types').addEventListener('change', e => { state.type = e.target.value; update(); });
for (const k of ['guests', 'name', 'email', 'phone', 'note']) form.elements[k].value = state[k];
form.addEventListener('input', e => {
  state[e.target.name] = e.target.value.trim();
  if (e.target.getAttribute('aria-invalid') === 'true') checkField(e.target);
  renderSummary();
});

function fieldError(el) {
  const v = el.value.trim();
  const s = spaceById(state.space);
  if (el.name === 'guests') {
    if (!v || Number(v) < 1) return 'How many people are coming?';
    if (s && Number(v) > s.guests) return `${s.name} fits up to ${s.guests} guests.`;
  }
  if (el.name === 'name' && v.length < 2) return 'Please add your name.';
  if (el.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter an email like you@studio.com.';
  if (el.name === 'phone' && v.replace(/\D/g, '').length < 9) return 'Enter a phone number we can call.';
  return '';
}
function checkField(el) {
  const msg = fieldError(el);
  const err = el.parentElement.querySelector('.err');
  el.setAttribute('aria-invalid', String(!!msg));
  err.textContent = msg; err.hidden = !msg;
  return !msg;
}

// ---------- step 4: review ----------
function reviewRows(withEdit) {
  const s = spaceById(state.space);
  const edit = n => withEdit ? `<button class="edit" data-goto="${n}">Edit</button>` : '';
  const rows = [
    ['Space', `${s.name}, ${s.area} m²`, 1],
    ['Date', fmtDate(state.date), 2],
    ['Time', `${hh(state.start)} – ${hh(state.start + state.hours)}`, 2],
    ['Event', `${state.type}, ${state.guests} guests`, 3],
    ['Contact', `${state.name}<br>${state.email}<br>${state.phone}`, 3],
  ];
  if (state.note) rows.push(['Note', state.note.replace(/</g, '&lt;'), 3]);
  return rows.map(([k, v, n]) => `<div><dt>${k}</dt><dd>${v}${edit(n)}</dd></div>`).join('');
}
$('#review').addEventListener('click', e => { const b = e.target.closest('[data-goto]'); if (b) go(Number(b.dataset.goto)); });
$('#agree').addEventListener('change', () => { $('#confirm').disabled = !$('#agree').checked; });

// ---------- summary ----------
function renderSummary() {
  const s = spaceById(state.space);
  $('#sum-img').src = s ? s.img : 'img/s1.jpg';
  if (!s) { $('#sum-body').innerHTML = '<h3>Your booking</h3><p class="note">Choose a space to start. Your first booking is on us.</p>'; return; }
  const sub = s.price * state.hours;
  const ready = state.date && state.start != null;
  $('#sum-body').innerHTML = `
    <h3>${s.name}</h3>
    <dl>
      <div><dt>Date</dt><dd>${state.date ? fmtDate(state.date) : '—'}</dd></div>
      <div><dt>Time</dt><dd>${state.start != null ? `${hh(state.start)} – ${hh(state.start + state.hours)}` : '—'}</dd></div>
      <div><dt>Event</dt><dd>${state.type}${state.guests ? `, ${state.guests} guests` : ''}</dd></div>
    </dl>
    <dl class="price-lines">
      <div><dt>${uah(s.price)} × ${state.hours} h</dt><dd>${uah(sub)}</dd></div>
      <div class="free"><dt>First booking</dt><dd>−${uah(sub)}</dd></div>
    </dl>
    <p class="total"><span>Total</span><b>${uah(0)}</b></p>`;
  $('#sum-body').classList.toggle('show-total', !!ready);
}

// ---------- navigation ----------
function canLeave(n) {
  if (n === 1) return !!state.space;
  if (n === 2) return !!state.date && state.start != null;
  if (n === 3) return [...form.querySelectorAll('input[required]')].map(checkField).every(Boolean);
  return true;
}
function update() {
  document.querySelectorAll('.step').forEach(el => { el.hidden = Number(el.dataset.step) !== step; });
  document.querySelectorAll('.steps li').forEach(li => {
    const n = Number(li.dataset.step);
    li.className = n < step ? 'done' : n === step ? 'current' : '';
    li.toggleAttribute('aria-current', n === step);
  });
  if (step === 1) renderSpaces();
  if (step === 2) { renderCal(); renderTimes(); }
  if (step === 4) $('#review').innerHTML = reviewRows(true);
  const next = document.querySelector(`.step[data-step="${step}"] [data-next]`);
  if (next) next.disabled = step < 3 && !canLeave(step);
  renderSummary();
}
function go(n) {
  step = n;
  update();
  document.querySelector('.steps').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => {
  if (!canLeave(step)) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
  go(step + 1);
}));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => go(step - 1)));

// ---------- confirm ----------
$('#confirm').addEventListener('click', () => {
  const s = spaceById(state.space);
  const id = 'PRT-' + String(hash(state.email + state.date + state.start) % 9000 + 1000);
  $('#success-text').innerHTML = `Booking <b>${id}</b> is reserved for you. We’ll confirm by email at ${state.email} within 24 hours — your first booking is on us.`;
  $('#success-review').innerHTML = reviewRows(false);

  const d = state.date.replace(/-/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PORT-273//Booking//EN', 'BEGIN:VEVENT',
    `UID:${id}@port273`, `DTSTART:${d}T${hh(state.start).replace(':', '')}00`, `DTEND:${d}T${hh(state.start + state.hours).replace(':', '')}00`,
    `SUMMARY:${state.type} at PORT-273 · ${s.name}`, 'LOCATION:273 Creative District\\, Kyiv', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  $('#ics').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);

  $('#flow-wrap').hidden = true;
  $('#success').hidden = false;
  scrollTo({ top: 0 });
  $('#success').focus({ preventScroll: true });
});

update();
