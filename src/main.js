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
const initCoverflow = (filterValue = 'all') => {
  const container = document.querySelector('.coverflow-container');
  if(!container) return;

  // Clean up any existing clones from previous filter runs
  const existingClones = container.querySelectorAll('.is-clone');
  existingClones.forEach(clone => clone.remove());

  // Handle Filtering and Identify Visible Items
  const allItems = Array.from(container.children);
  const visibleItems = allItems.filter(item => {
    const category = item.getAttribute('data-category');
    const isVisible = filterValue === 'all' || category === filterValue;
    item.style.display = isVisible ? 'block' : 'none';
    return isVisible;
  });
  
  if(!visibleItems.length) return;
  
  // Clone before and after for seamless looping
  const fragmentBefore = document.createDocumentFragment();
  const fragmentAfter = document.createDocumentFragment();

  visibleItems.forEach(item => {
    const cloneBefore = item.cloneNode(true);
    const cloneAfter = item.cloneNode(true);
    cloneBefore.classList.add('is-clone');
    cloneAfter.classList.add('is-clone');
    fragmentBefore.appendChild(cloneBefore);
    fragmentAfter.appendChild(cloneAfter);
  });

  container.insertBefore(fragmentBefore, visibleItems[0]);
  container.appendChild(fragmentAfter);

  // Re-query all visible items + new clones
  const items = Array.from(container.querySelectorAll('.coverflow-item')).filter(item => item.style.display !== 'none');
  const totalOriginal = visibleItems.length;
  
  // Update state on the container to be shared with listeners
  container.cfState = {
    items: items,
    totalOriginal: totalOriginal,
    currentIndex: totalOriginal + Math.floor(totalOriginal / 2),
    isMoving: false
  };

  const updateLayout = (idx, instant = false) => {
    const state = container.cfState;
    if(!state || !state.items) return;

    const isMobile = window.innerWidth <= 768;
    const baseOffset = isMobile ? 70 : 25; 
    
    state.items.forEach((item, index) => {
      const offset = index - idx;
      const zIndex = 100 - Math.round(Math.abs(offset) * 10);
      const scale = offset === 0 ? 1 : (isMobile ? 0.9 : 0.85);
      const baseTransl = offset * baseOffset;
      const tweak = offset === 0 ? 0 : (offset > 0 ? (isMobile ? -20 : -10) : (isMobile ? 20 : 10));
      const translateX = baseTransl + tweak;
      
      const opacity = Math.abs(offset) > 2 ? 0 : 1;
      const isVisible = Math.abs(offset) <= 2;

      gsap.to(item, {
        x: `${translateX}vw`,
        scale: scale,
        zIndex: zIndex,
        opacity: opacity,
        pointerEvents: isVisible ? 'auto' : 'none',
        duration: instant ? 0 : 0.8,
        ease: instant ? "none" : "power3.out",
        overwrite: true,
        onComplete: () => {
          if(!instant && state) state.isMoving = false;
        }
      });

      if(Math.abs(offset) < 0.1) {
         item.classList.remove('dimmed');
      } else {
         item.classList.add('dimmed');
      }
    });
  };

  // Initial Layout
  updateLayout(container.cfState.currentIndex, true);

  // Navigation - Attach ONCE and use container.cfState
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (prevBtn && !prevBtn.hasListener) {
    prevBtn.addEventListener('click', () => {
      const state = container.cfState;
      if(!state || state.isMoving) return;
      state.isMoving = true;
      state.currentIndex--;
      updateLayout(state.currentIndex);
      
      if (state.currentIndex < state.totalOriginal) {
        setTimeout(() => {
          if(!container.cfState) return;
          container.cfState.currentIndex += container.cfState.totalOriginal;
          updateLayout(container.cfState.currentIndex, true);
        }, 810);
      }
    });
    prevBtn.hasListener = true;
  }

  if (nextBtn && !nextBtn.hasListener) {
    nextBtn.addEventListener('click', () => {
      const state = container.cfState;
      if(!state || state.isMoving) return;
      state.isMoving = true;
      state.currentIndex++;
      updateLayout(state.currentIndex);

      if (state.currentIndex >= state.totalOriginal * 2) {
        setTimeout(() => {
          if(!container.cfState) return;
          container.cfState.currentIndex -= container.cfState.totalOriginal;
          updateLayout(container.cfState.currentIndex, true);
        }, 810);
      }
    });
    nextBtn.hasListener = true;
  }

  // Exposed helper for filter logic
  container.triggerLayout = () => updateLayout(container.cfState.currentIndex);
  
  prevBtn.hasListener = true;
  nextBtn.hasListener = true;
};

// Gallery Filter Logic
const initGalleryFilters = () => {
  const filterBtns = document.querySelectorAll('.tag-btn');
  const container = document.querySelector('.coverflow-container');
  if(!container) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      initCoverflow(filterValue);
    });
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

  // Reels Showcase Cinematic Assembly (Moved up to match DOM order)
  const showcaseSection = document.querySelector('.reels-showcase-section');
  if (showcaseSection) {
    // 1. Entrance Assembly Timeline (Starts before it pins)
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.reels-showcase-section',
        start: 'top 85%', // Assemble exactly as the user scrolls into it
        end: 'top 20%',  
        scrub: 1
      }
    });

    // Animate Header
    entranceTl.to('.showcase-header', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out'
    }, 0);

    // Staggered Collage Assembly
    entranceTl.to('.collage-item', {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      y: 0,
      stagger: {
        amount: 1.5,
        from: 'random'
      },
      duration: 2,
      ease: 'power3.out'
    }, 0.2);

    // 2. Parallax Pinning Timeline (Takes over when it reaches the top)
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.reels-showcase-section',
        start: 'top top',
        end: '+=150%', // Hold the pin for scroll length
        scrub: 1.5,
        pin: true,
        anticipatePin: 1
      }
    });

    // Parallax on scroll for depth while pinned
    pinTl.to('.collage-1', { y: -60, duration: 4 }, 0);
    pinTl.to('.collage-2', { y: -100, duration: 4 }, 0);
    pinTl.to('.collage-4', { y: -40, duration: 4 }, 0);
    pinTl.to('.collage-5', { y: -80, duration: 4 }, 0);
    pinTl.to('.collage-6', { y: -110, duration: 4 }, 0);
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
        start: 'top 60%', // Adjusted for better trigger timing
        end: 'bottom 80%',
        scrub: 1.2
      }
    });
  }

  // Refresh ScrollTrigger to account for dynamic heights/pinning
  ScrollTrigger.refresh();

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
  initGalleryFilters();
  initScrollAnimations();
});
