// ── NAVBAR scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HAMBURGER menu ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ── CONTACT FORM ──
function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const btn = form.querySelector('button[type="submit"]');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const data = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  })
  .then(res => {
    if (res.ok) {
      form.reset();
      success.style.display = 'block';
      btn.textContent = 'Send Message';
      btn.disabled = false;
      setTimeout(() => { success.style.display = 'none'; }, 8000);
    } else {
      res.json().then(data => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        alert('There was a problem sending your message. Please call or email directly.');
      });
    }
  })
  .catch(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    alert('There was a problem sending your message. Please call or email directly.');
  });
}

// ── MORTGAGE CALCULATOR ──
function formatCurrency(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function calcMortgage() {
  const price = parseFloat(document.getElementById('home-price')?.value) || 0;
  const down = parseFloat(document.getElementById('down-payment')?.value) || 0;
  const rate = parseFloat(document.getElementById('interest-rate')?.value) || 0;
  const term = parseInt(document.getElementById('loan-term')?.value) || 30;
  const tax = parseFloat(document.getElementById('property-tax')?.value) || 0;
  const ins = parseFloat(document.getElementById('insurance')?.value) || 0;

  const loan = Math.max(0, price - down);
  const monthlyRate = rate / 100 / 12;
  const n = term * 12;
  let pi = 0;
  if (monthlyRate > 0 && loan > 0) {
    pi = loan * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }
  const monthlyTax = tax / 12;
  const monthlyIns = ins / 12;
  const total = pi + monthlyTax + monthlyIns;
  const totalInterest = (pi * n) - loan;

  document.getElementById('res-pi').textContent = formatCurrency(pi);
  document.getElementById('res-tax').textContent = formatCurrency(monthlyTax);
  document.getElementById('res-ins').textContent = formatCurrency(monthlyIns);
  document.getElementById('res-total').textContent = formatCurrency(total);
  document.getElementById('monthly-total').textContent = formatCurrency(total);
  document.getElementById('res-loan').textContent = formatCurrency(loan);
  document.getElementById('res-interest').textContent = formatCurrency(Math.max(0, totalInterest));
}

// Sync down payment $ and %
function syncDown(source) {
  const price = parseFloat(document.getElementById('home-price').value) || 0;
  if (source === 'amount') {
    const amt = parseFloat(document.getElementById('down-payment').value) || 0;
    document.getElementById('down-pct').value = price > 0 ? (amt / price * 100).toFixed(1) : 0;
  } else {
    const pct = parseFloat(document.getElementById('down-pct').value) || 0;
    document.getElementById('down-payment').value = Math.round(price * pct / 100);
  }
  calcMortgage();
}

document.addEventListener('DOMContentLoaded', () => {
  const calcInputs = ['home-price', 'interest-rate', 'loan-term', 'property-tax', 'insurance'];
  calcInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcMortgage);
  });
  document.getElementById('down-payment')?.addEventListener('input', () => syncDown('amount'));
  document.getElementById('down-pct')?.addEventListener('input', () => syncDown('pct'));
  document.getElementById('home-price')?.addEventListener('input', () => syncDown('pct'));
  calcMortgage();
});

// ── EXIT INTENT POPUP ──
(function() {
  // Only show on main pages, not home-value page itself
  if (window.location.pathname.includes('home-value')) return;

  let shown = false;
  let timeOnPage = 0;
  const timer = setInterval(() => { timeOnPage++; }, 1000);

  function showPopup() {
    if (shown) return;
    shown = true;
    clearInterval(timer);
    const popup = document.getElementById('exit-popup');
    if (popup) popup.classList.add('active');
  }

  // Desktop: mouse leaves top of browser
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 10 && timeOnPage >= 15) showPopup();
  });

  // Mobile: back button / scroll up aggressively
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', function() {
    const currentY = window.scrollY;
    if (lastScrollY - currentY > 80 && currentY < 200 && timeOnPage >= 20) showPopup();
    lastScrollY = currentY;
  });

  // Close handlers
  document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('exit-popup-close');
    const overlay = document.getElementById('exit-popup');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('active');
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') overlay && overlay.classList.remove('active');
    });
  });
})();

// ── INTERSECTION OBSERVER: fade-in on scroll ──
const fadeEls = document.querySelectorAll('.listing-card, .testimonial-card, .search-feature, .hood-card, .about-grid, .contact-grid, .blog-card, .area-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  observer.observe(el);
});

// ── ANIMATED STAT COUNTERS ──
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1600;
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isDecimal
      ? (target * eased).toFixed(1)
      : Math.floor(target * eased);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.dataset.target) animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => statsObserver.observe(el));
