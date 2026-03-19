import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const setupCursor = () => {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  if (!cursorDot || !cursorOutline) return;

  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows directly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with lag
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  });

  // Adding hover effect for interactive elements
  const links = document.querySelectorAll('a, button');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-state'));
    link.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-state'));
  });
};

// Hero Entrance Animations
const animateHero = () => {
  const tl = gsap.timeline();

  tl.to('.reveal-text', {
    y: '0%',
    duration: 1.5,
    ease: 'power4.out',
    stagger: 0.2,
    delay: 0.5
  })
  .to('.hero-subtitle', {
    opacity: 1,
    duration: 1,
    ease: 'power2.out'
  }, "-=1")
  .to('.scroll-indicator', {
    opacity: 1,
    duration: 1,
    ease: 'power2.out'
  }, "-=0.5");
};

// Coverflow Logic
const initCoverflow = () => {
  const items = document.querySelectorAll('.coverflow-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if(!items.length) return;

  let currentIndex = 2;

  const layout = () => {
    items.forEach((item, index) => {
      const offset = index - currentIndex;
      const zIndex = 100 - Math.abs(offset);
      const scale = offset === 0 ? 1 : 0.85;
      const baseTransl = offset * 25; // vw
      const tweak = offset === 0 ? 0 : (offset > 0 ? -10 : 10);
      const translateX = baseTransl + tweak;
      
      gsap.to(item, {
        x: `${translateX}vw`,
        scale: scale,
        zIndex: zIndex,
        opacity: Math.abs(offset) > 2 ? 0 : 1,
        duration: 0.8,
        ease: "power3.out"
      });

      if(offset !== 0) {
         item.classList.add('dimmed');
      } else {
         item.classList.remove('dimmed');
      }
    });
  };

  layout();

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      layout();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < items.length - 1) {
      currentIndex++;
      layout();
    }
  });
};

// ScrollTrigger Animations
const initScrollAnimations = () => {
  // Section Titles Reveal
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.fromTo(title, {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Reels Gallery Stagger
  gsap.fromTo('.reel-card', {
    y: 100,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.reels-gallery',
      start: 'top 80%',
    }
  });

  // About Section Parallax
  gsap.to('.about-image', {
    y: '15%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.about-image-wrapper',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  setupCursor();
  animateHero();
  initCoverflow();
  initScrollAnimations();
});
