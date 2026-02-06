// Small interactions: set year, handle smooth scroll and form
document.addEventListener('DOMContentLoaded', function () {
  // Update year
  const yearElement = document.getElementById('year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Mobile Menu Toggle (Simple implementation)
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Simple form handling
  const form = document.querySelector('.contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'الرجاء تعبئة جميع الحقول.';
        status.style.color = '#dc2626'; // Error color
        return;
      }

      // Fake submit
      status.textContent = 'جاري إرسال الرسالة...';
      status.style.color = 'var(--primary)';

      setTimeout(function () {
        status.textContent = 'تم إرسال الرسالة بنجاح. سنتواصل معك قريباً.';
        form.reset();
      }, 1500);
    });
  }
});