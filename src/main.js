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

  // Adding Custom Play Icon Cursor on Canvas Reels
  document.querySelectorAll('.canvas-reel').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering-reel'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-reel'));
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
  .to('.hero-circle path', {
    strokeDashoffset: 0,
    duration: 1.5,
    ease: 'power2.inOut'
  }, "-=0.5")
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
    const isMobile = window.innerWidth <= 768;
    const baseOffset = isMobile ? 70 : 25; // Spacing in VWs

    items.forEach((item, index) => {
      const offset = index - currentIndex;
      const zIndex = 100 - Math.abs(offset);
      const scale = offset === 0 ? 1 : (isMobile ? 0.9 : 0.85);
      const baseTransl = offset * baseOffset; // vw
      const tweak = offset === 0 ? 0 : (offset > 0 ? (isMobile ? -20 : -10) : (isMobile ? 20 : 10));
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

  // Experimental Reels Parallax
  let mm = gsap.matchMedia();
  mm.add("(min-width: 769px)", () => {
    gsap.utils.toArray('.canvas-reel').forEach(reel => {
      const speed = reel.getAttribute('data-speed');
      gsap.fromTo(reel, 
        { y: 150 }, 
        {
          y: () => (1 - parseFloat(speed)) * (window.innerHeight * 0.8),
          ease: 'none',
          scrollTrigger: {
            trigger: '.reels-experimental-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });
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

  // Timeline Animation
  gsap.utils.toArray('.timeline-anim').forEach((node) => {
    gsap.fromTo(node, {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: node,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
};

// Mobile Menu Logic
const setupMobileMenu = () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  if (menuBtn && overlay) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      overlay.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        overlay.classList.remove('open');
      });
    });
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupCursor();
  animateHero();
  initCoverflow();
  initScrollAnimations();
});
