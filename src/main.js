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
  // Reels Slider Controls
  const reelsSlideshow = document.querySelector('.reels-slideshow');
  const prevBtnReels = document.querySelector('.prev-btn-reels');
  const nextBtnReels = document.querySelector('.next-btn-reels');
  if (reelsSlideshow && prevBtnReels && nextBtnReels) {
    nextBtnReels.addEventListener('click', () => {
      const slide = reelsSlideshow.querySelector('.reels-slide');
      if(slide) {
        const slideWidth = slide.offsetWidth + (window.innerWidth * 0.02);
        reelsSlideshow.scrollBy({ left: slideWidth, behavior: 'smooth' });
      }
    });
    prevBtnReels.addEventListener('click', () => {
      const slide = reelsSlideshow.querySelector('.reels-slide');
      if(slide) {
        const slideWidth = slide.offsetWidth + (window.innerWidth * 0.02);
        reelsSlideshow.scrollBy({ left: -slideWidth, behavior: 'smooth' });
      }
    });
  }

  // Cinematic About Reveal Sequence
  const aboutTextEl = document.querySelector('.about-reveal-text');
  if (aboutTextEl) {
    // Custom robust word-splitter preserving nested span tags
    const wrapWords = (node) => {
      let html = '';
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) { // Text Node
          const words = child.nodeValue.split(/\s+/).filter(w => w.trim() !== '');
          words.forEach(word => {
            html += `<span class="word">${word}</span> `;
          });
        } else if (child.nodeType === 1) { // Element Node
          html += `<${child.tagName.toLowerCase()} class="${child.className}">`;
          html += wrapWords(child);
          html += `</${child.tagName.toLowerCase()}> `;
        }
      });
      return html;
    };
    
    if (!aboutTextEl.classList.contains('is-split')) {
      aboutTextEl.innerHTML = wrapWords(aboutTextEl);
      aboutTextEl.classList.add('is-split');
    }

    gsap.to('.about-reveal-text .word', {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about-reveal-section',
        start: 'top 50%',
        end: 'bottom 90%',
        scrub: 1.2
      }
    });
  }

  // Reels Showcase Cinematic Assembly
  const showcaseSection = document.querySelector('.reels-showcase-section');
  if (showcaseSection) {
    const showcaseTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.reels-showcase-section',
        start: 'top top',
        end: '+=200%', // Scrub over 200vh
        scrub: 1.5,
        pin: true
      }
    });

    // Animate Header
    showcaseTl.to('.showcase-header', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out'
    }, 0);

    // Staggered Collage Assembly
    showcaseTl.to('.collage-item', {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      y: 0,
      stagger: {
        amount: 2.5,
        from: 'random' // Assembles randomly for organic feel
      },
      duration: 2,
      ease: 'power3.out'
    }, 0.5);

    // Subtle parallax on scroll for depth
    showcaseTl.to('.collage-1', { y: -60, duration: 4 }, 1);
    showcaseTl.to('.collage-2', { y: -100, duration: 4 }, 1);
    showcaseTl.to('.collage-4', { y: -40, duration: 4 }, 1);
    showcaseTl.to('.collage-5', { y: -80, duration: 4 }, 1);
  }

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
