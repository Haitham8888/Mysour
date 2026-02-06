// Small interactions: set year, handle smooth scroll and form
document.addEventListener('DOMContentLoaded', function () {
  // Update year
  const yearElement = document.getElementById('year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // Handle Active Link & Smooth Scroll
  const navLinks = document.querySelectorAll('.nav-list a');

  navLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      // Add active class to clicked link
      this.classList.add('active');

      const href = this.getAttribute('href');

      // Smooth scroll if it's an internal link
      if (href.startsWith('#') && href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      // Close mobile menu if open
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
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