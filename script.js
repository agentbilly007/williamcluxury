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

  // Collect form data
  const data = {
    first: form.fname.value,
    last: form.lname.value,
    email: form.email.value,
    phone: form.phone.value,
    interest: form.interest.value,
    message: form.message.value
  };

  // TODO: Replace with your form backend (Formspree, Netlify Forms, etc.)
  // Example Formspree: fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} })

  console.log('Form submission:', data);

  // Show success message
  form.reset();
  success.style.display = 'block';
  setTimeout(() => { success.style.display = 'none'; }, 6000);
}

// ── INTERSECTION OBSERVER: fade-in on scroll ──
const fadeEls = document.querySelectorAll('.stat, .listing-card, .testimonial-card, .search-feature, .hood-card, .about-grid, .contact-grid');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
