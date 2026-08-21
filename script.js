const loader = document.querySelector('.loader');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggle = document.querySelector('.theme-toggle');
const countdown = document.querySelector('[data-countdown]');
const cursor = document.querySelector('#cursor');

window.addEventListener('load', () => {
  window.setTimeout(() => loader.classList.add('done'), reduced ? 0 : 1450);
});

const storedTheme = window.localStorage.getItem('rebound-theme');

function setTheme(theme) {
  const light = theme === 'light';
  document.body.classList.toggle('light-theme', light);
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  themeToggle.querySelector('span').textContent = light ? 'Dark' : 'Light';
  window.localStorage.setItem('rebound-theme', theme);
}

setTheme(storedTheme === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('light-theme') ? 'dark' : 'light'));

if (cursor && !reduced) {
  let cursorX = -50;
  let cursorY = -50;
  let targetX = cursorX;
  let targetY = cursorY;

  window.addEventListener('mousemove', event => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.style.opacity = '1';
  });

  function renderCursor() {
    cursorX += (targetX - cursorX) * .22;
    cursorY += (targetY - cursorY) * .22;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
}

document.querySelectorAll('.circle-link, .pill, .text-link, .event-card a, .direct-email, .send-email, .tier-card, .use-custom, .checkout-button').forEach(element => {
  element.addEventListener('pointermove', event => {
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--magnet-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--magnet-y', `${event.clientY - rect.top}px`);
  });
});

function updateCountdown() {
  if (!countdown) return;
  const target = new Date(countdown.dataset.countdown).getTime();
  const remaining = Math.max(0, target - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const pad = value => String(value).padStart(2, '0');
  countdown.querySelector('[data-days]').textContent = pad(days);
  countdown.querySelector('[data-hours]').textContent = pad(hours);
  countdown.querySelector('[data-minutes]').textContent = pad(minutes);
  countdown.querySelector('[data-seconds]').textContent = pad(seconds);
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', String(!open));
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .13 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const form = document.querySelector('.signup-form');
if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const message = form.querySelector('#message');
    const service = form.querySelector('#service');
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const requiredFields = [...form.querySelectorAll('input[required], textarea[required], select[required]')];
    const firstInvalid = requiredFields.find(field => !field.checkValidity());
    if (firstInvalid) {
      status.textContent = 'Please complete the required fields before sending.';
      firstInvalid.focus();
      return;
    }

    submitButton.disabled = true;
    status.textContent = 'Sending your message...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Form delivery failed');

      status.textContent = 'Message sent. Thank you — the Rebound team will reply soon.';
      form.reset();
    } catch (error) {
      const subject = encodeURIComponent('Rebound inquiry');
      const serviceLine = service ? `Service: ${service.value}\n` : '';
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\nPhone: ${phone.value}\n${serviceLine}\nMessage:\n${message.value}`);
      status.textContent = 'Direct send needs activation, opening your email app instead.';
      window.location.href = `mailto:email.reboundbysol@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      submitButton.disabled = false;
    }
  });
}
