// Wait for full page load to hide loader
window.addEventListener("load", function() {
  document.getElementById("loader").style.display = "none";
});

// Make hero section visible immediately (avoid initial opacity issue)
document.addEventListener("DOMContentLoaded", function() {
  const heroSection = document.getElementById('home');
  if (heroSection) heroSection.classList.add('visible');
});

// DOM elements
const body = document.body;
const getStartedBtn = document.getElementById('getStartedBtn');
const navHome = document.getElementById('nav-home');
const navServices = document.getElementById('nav-services');
const navAbout = document.getElementById('nav-about');
const navContact = document.getElementById('nav-contact');
const navApproach = document.getElementById('nav-approach');
const navWork = document.getElementById('nav-work');
const backBtn = document.getElementById('backToTop');

// Helper: switch to slide 2 (all content)
function goToSlide2() {
  body.classList.add('show-slide-2', 'scroll-allowed');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: back to slide 1 (hero only)
function goToSlide1() {
  body.classList.remove('show-slide-2', 'scroll-allowed');
  window.scrollTo({ top: 0 });
}

// Helper: scroll to a specific section after ensuring we're on slide 2
function scrollToSection(sectionId) {
  if (!body.classList.contains('show-slide-2')) {
    goToSlide2();
    // slight delay to allow DOM to settle before scrolling
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  } else {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Event listeners for navigation
if (getStartedBtn) getStartedBtn.addEventListener('click', goToSlide2);
if (navHome) navHome.addEventListener('click', goToSlide1);

if (navServices) {
  navServices.addEventListener('click', () => scrollToSection('services'));
}
if (navAbout) {
  navAbout.addEventListener('click', () => scrollToSection('about'));
}
if (navContact) {
  navContact.addEventListener('click', () => scrollToSection('contact'));
}
if (navApproach) {
  navApproach.addEventListener('click', () => scrollToSection('vision'));
}
if (navWork) {
  navWork.addEventListener('click', () => scrollToSection('connect'));
}

// Intersection Observer for scroll animations (only sections inside slide 2)
const sections = document.querySelectorAll('#slide-2 section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

sections.forEach(section => observer.observe(section));

// Back to Top button logic
window.addEventListener('scroll', () => {
  if (body.classList.contains('scroll-allowed') && window.scrollY > 400) {
    backBtn.classList.add('show');
  } else {
    backBtn.classList.remove('show');
  }
});

if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Optional: Formspree already handles submission, but we can add a simple alert for demo
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    // No need to prevent default - Formspree will handle it.
    // Just a small console log.
    console.log('Form submitted to Formspree');
  });
}
// WhatsApp button click tracking (optional)
const whatsappBtn = document.querySelector('.whatsapp-float');
if (whatsappBtn) {
  whatsappBtn.addEventListener('click', () => {
    console.log('WhatsApp consultation clicked');
    // You could add Google Analytics or custom event here
  });
}
const navTestimonials = document.getElementById('nav-testimonials');
if (navTestimonials) {
  navTestimonials.addEventListener('click', () => {
    if (!body.classList.contains('show-slide-2')) {
      goToSlide2();
      setTimeout(() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });
    }
  });
}