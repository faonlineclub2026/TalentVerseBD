// Navbar scroll effect
window.addEventListener('scroll', function() {
  var nav = document.getElementById('navbar');
  if(nav) {
    if(window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
});

// Mobile menu toggle
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  if(menu) menu.classList.toggle('open');
}

// Close menu on link click
document.addEventListener('DOMContentLoaded', function() {
  var links = document.querySelectorAll('.mobile-menu a');
  links.forEach(function(link) {
    link.addEventListener('click', function() {
      var menu = document.getElementById('mobileMenu');
      if(menu) menu.classList.remove('open');
    });
  });
});
