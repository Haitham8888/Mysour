// Small interactions: set year, handle smooth scroll and form
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // simple form handling
  var form = document.querySelector('.contact-form');
  var status = form.querySelector('.form-status');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();
    if(!name || !email || !message){
      status.textContent = 'الرجاء تعبئة جميع الحقول.';
      return;
    }
    // Fake submit
    status.textContent = 'جاري إرسال الرسالة...';
    setTimeout(function(){
      status.textContent = 'تم إرسال الرسالة بنجاح. سنتواصل معك قريباً.';
      form.reset();
    }, 1000);
  });
});