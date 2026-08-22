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

const excerptModal = document.querySelector('.excerpt-modal');
const excerptDialog = document.querySelector('.excerpt-dialog');
const excerptTitle = document.querySelector('[data-excerpt-title]');
const excerptKicker = document.querySelector('[data-excerpt-kicker]');
const excerptCopy = document.querySelector('[data-excerpt-copy]');
let lastExcerptTrigger = null;

const excerpts = {
  stark: {
    kicker: 'Chapter 1 / Courage',
    title: 'Stark Reality!',
    paragraphs: [
      'Courage in the face of adversity.',
      'In the cold, windy hours of an unforgettable night in August — shaky hands and trembling feet — he stood outside the building where he had just lost his employment, cut off from work in a faraway land distant from home.',
      'The cold winds whistled over his face. Frozen in thought, trying to keep it together, too many thoughts surged like a flood of hailstorm through his mind, too many thoughts trying to drown him within. But like a duck on a pond — motionless, yet beneath the murky waters, feet racing miles to stay afloat — he worked his mind quickly for solutions.',
      'He thought of the final eviction notice served him a couple of weeks earlier, now due today. He thought of his two beautiful kids at home with the babysitter. He knew that he could not let them down; they depended wholly on him. The stark reality of the moment grew ever stronger. It felt like a bolstering storm with no harbor in sight.',
      'This is the courage to seek a rebound out of the most impossible real-life situations: strength, resilience, and an utter resolve and determination to defy the most compelling odds.'
    ]
  },
  grief: {
    kicker: '02 / Grief',
    title: 'Rebound from grief.',
    paragraphs: [
      'The sharpest edge of grief is forged from the memories that linger, the words left unsaid, the time never spent enough, and the emotions never expressed adequately. You wish you thanked more. You wish you laughed more with them. The unoffered apologies, the unexpressed gratitude, the laughter that was cut short — you carry a heavy ledger of moments that will now sadly remain eternally unfinished.',
      'Life moves on. Traffic continues. Bills arrive. The demands of work force you to compartmentalize the grief in safe recesses somewhere deep within you. Birthdays arrive, weddings arrive, and while grieving, you still find yourself happy for the new blessings in your family. People laugh; and somehow you find a way to as well, but you never quite forget.',
      'Moving forward can feel unsettling. The initial stages of healing bring an unexpected wave of guilt. You feel as though letting go of the pain means letting go of the memory, or letting go of the people — that smiling again is a betrayal of what you lost. It makes the heart heavy, and sometimes the tears gently flow down the face again even when you try to fight them back.',
      'Rebounding from deep grief is not about forgetting or getting over it. You do not shrink the loss; instead, you build a larger life around it. You embrace your dreams harder, pursue life with greater drive, and bravely, intentionally move. You carry the weight of the memories until your shoulders gracefully grow strong enough to bear without breaking, transforming that pain into strength, purpose, and grace.'
    ]
  },
  purpose: {
    kicker: 'Chapter 11 / Purpose',
    title: 'Rebounding into Purpose.',
    paragraphs: [
      'There is a Japanese art known as Kintsugi — the practice of repairing broken pottery with liquid gold. The master craftsman does not hide the fractures; rather, the cracks are illuminated, emphasized, and celebrated. The vessel becomes infinitely stronger, more valuable, and more beautiful precisely because it was broken.',
      'The “brokenness” birthed purpose. This is the ultimate destination of the rebound.',
      'The Transformation of Scars: you are no longer the naive, unbroken person who walked blindly into the storm. You carry scars — visible to your soul, etched into your history. But those scars are no longer marks of shame; they are your credentials, an intrinsic part of your core, your essence.',
      'They are proof that you walked through the fire and refused to burn to ash.'
    ]
  },
  spirit: {
    kicker: '04 / Spiritual Rebound',
    title: 'The spiritual rebound.',
    paragraphs: [
      'A complete, high-end rebound cannot exist solely on the material or physical planes. You can possess a pristine bank account and an athletic body, yet remain utterly hollow if your spirit is fractured and detached from a higher source.',
      'Severe trauma strips away the surface level of human existence. It exposes the terrifying truth that human effort alone, no matter how disciplined or intelligent, is insufficient to navigate the deepest valleys of the human experience. When every human pillar breaks — when partners abandon you, money evaporates, and your own mind betrays you — you are forced to look upward.',
      'You realize that your pain was not merely a random, chaotic tragedy; it was a violent, spiritual dismantling designed to wake you up from a shallow existence.',
      'Reconnecting with your spiritual core requires stepping into a state of intentional devotion, prayerfulness, and quiet surrender.',
      'Faith is not the absence of doubt or the denial of suffering. Faith is the radical, unyielding choice to believe that there is a divine order, a higher intelligence, and an ultimate purpose working through your life, even when you are standing in the middle of a burning room.'
    ]
  }
};

function setExcerptModal(open) {
  if (!excerptModal) return;
  excerptModal.classList.toggle('open', open);
  excerptModal.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
  if (open) {
    excerptDialog.focus();
  } else if (lastExcerptTrigger) {
    lastExcerptTrigger.focus();
  }
}

document.querySelectorAll('[data-excerpt]').forEach(button => {
  button.addEventListener('click', () => {
    const excerpt = excerpts[button.dataset.excerpt];
    if (!excerpt || !excerptModal) return;
    lastExcerptTrigger = button;
    excerptKicker.textContent = excerpt.kicker;
    excerptTitle.textContent = excerpt.title;
    excerptCopy.innerHTML = excerpt.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    setExcerptModal(true);
  });
});

document.querySelectorAll('[data-excerpt-close]').forEach(element => {
  element.addEventListener('click', () => setExcerptModal(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && excerptModal?.classList.contains('open')) {
    setExcerptModal(false);
  }
});

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
