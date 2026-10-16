// Nirala Engineers Core Application Script

/**
 * =========================================================================
 * PREVIEW MODE CONFIGURATION FOR CUSTOMER PRESENTATION
 * =========================================================================
 * PREVIEW_MODE = true  -> Only "Home" and the header logo navigate to index.html.
 *                         All other header links stay visible but navigation is disabled.
 * PREVIEW_MODE = false -> Restores full multi-page navigation across all menu items.
 * 
 * Location: c:\Users\arjun\Desktop\Dhruv\Dhruv\nirala\code\app.js (Line 12)
 * =========================================================================
 */
const PREVIEW_MODE = false;

// Ensure NiralaStorage (IndexedDB + localStorage) is loaded across all pages
if (typeof window !== 'undefined' && !window.NiralaStorage && typeof document !== 'undefined') {
  const stScript = document.createElement('script');
  stScript.src = 'catalog-storage.js';
  document.head.appendChild(stScript);
}

document.addEventListener('DOMContentLoaded', () => {
  // 0. Customer Preview Mode Navigation Interceptor
  if (PREVIEW_MODE) {
    const siteHeader = document.getElementById('siteHeader');
    if (siteHeader) {
      siteHeader.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const rawHref = (link.getAttribute('href') || '').trim();
        const cleanHref = rawHref.split('#')[0];

        // Only "Home" and header logo navigate to homepage
        const isHome = link.classList.contains('brand') || 
                       cleanHref === 'index.html' || 
                       cleanHref === '' || 
                       cleanHref === '/' || 
                       rawHref === '#home';

        if (!isHome) {
          e.preventDefault();
          e.stopPropagation();

          // If clicking a parent dropdown item, toggle its submenu for visual inspection
          const parentDropdown = link.closest('.has-dropdown');
          if (parentDropdown && parentDropdown.querySelector('.nav-link') === link) {
            parentDropdown.classList.toggle('open');
          }
        }
      });
    }
  }

  // 1. Header scroll effect
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  // 2. Dynamic Years of Experience Counter (1961 -> Current Year)
  const currentYear = new Date().getFullYear();
  const yearSpan = document.getElementById('currentYearText');
  const yearsCountEl = document.getElementById('yearsSince1961');
  
  if (yearSpan) yearSpan.textContent = currentYear;
  
  if (yearsCountEl) {
    const targetYears = currentYear - 1961;
    let count = 0;
    const duration = 1500;
    const stepTime = Math.max(10, Math.floor(duration / targetYears));
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const timer = setInterval(() => {
            count++;
            yearsCountEl.textContent = count;
            if (count >= targetYears) {
              clearInterval(timer);
              yearsCountEl.textContent = targetYears;
            }
          }, stepTime);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(yearsCountEl);
  }

  // 3. Mobile Navigation Drawer & Submenus
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    const toggleMobileMenu = (forceClose = false) => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const shouldOpen = forceClose ? false : !isExpanded;
      
      menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      menuToggle.innerHTML = shouldOpen ? '✕' : '☰';
      navLinks.classList.toggle('open', shouldOpen);
      document.body.classList.toggle('modal-open', shouldOpen);
    };

    menuToggle.addEventListener('click', () => toggleMobileMenu());

    // Submenu toggles on mobile & keyboard focus
    const navItemsWithSub = document.querySelectorAll('.nav-item.has-dropdown');
    navItemsWithSub.forEach(item => {
      const link = item.querySelector('.nav-link');
      if (link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 992) {
            e.preventDefault();
            // Close other open submenus for clean UI
            navItemsWithSub.forEach(other => {
              if (other !== item) other.classList.remove('open');
            });
            item.classList.toggle('open');
          }
        });
      }
    });

    // Close mobile drawer when clicking sub-links or non-dropdown links
    const allNavAnchors = navLinks.querySelectorAll('a');
    allNavAnchors.forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 992 && !a.closest('.has-dropdown > .nav-link')) {
          toggleMobileMenu(true);
        }
      });
    });

    // Close mobile drawer when clicking outside header
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && navLinks.classList.contains('open')) {
        const header = document.getElementById('siteHeader');
        if (header && !header.contains(e.target)) {
          toggleMobileMenu(true);
        }
      }
    });
  }

  // 4. Scroll Reveal Animations & Parallax Video Effect
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Video Banner Parallax Zoom on Scroll
  const companyBannerVideo = document.querySelector('.company-banner-video');
  const companyVideoBanner = document.querySelector('.company-video-banner');
  if (companyBannerVideo && companyVideoBanner) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = companyVideoBanner.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const scrollDistance = Math.max(0, -rect.top);
            const scaleVal = 1 + (scrollDistance * 0.00035);
            const translateYVal = scrollDistance * 0.2;
            companyBannerVideo.style.transform = `scale(${Math.min(scaleVal, 1.15)}) translateY(${translateYVal}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Product card depth: pointer tilt, touch press, and keyboard-equivalent focus.
  const productCards = document.querySelectorAll('.product-grid-4 .product-card');
  const reduceProductMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  productCards.forEach(card => {
    let touchTimer;

    card.addEventListener('animationend', (event) => {
      if (event.animationName === 'product-card-enter') {
        card.classList.add('is-entered');
      }
    });

    card.addEventListener('pointermove', (event) => {
      if (reduceProductMotion.matches || event.pointerType === 'touch') return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const tiltX = (x - 0.5) * 7;
      const tiltY = (0.5 - y) * 6;

      card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    }, { passive: true });

    const resetTilt = () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };

    card.addEventListener('pointerleave', resetTilt, { passive: true });
    card.addEventListener('pointerdown', (event) => {
      if (reduceProductMotion.matches || event.pointerType !== 'touch') return;

      window.clearTimeout(touchTimer);
      card.classList.add('is-touch-active');
      touchTimer = window.setTimeout(() => {
        card.classList.remove('is-touch-active');
      }, 420);
    }, { passive: true });

    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      const link = card.querySelector('.product-card-link');
      if (link && link.href) {
        window.location.href = link.href;
      }
    });
  });

  // 5. Interactive Pizza-Shaped Circular Process Diagram (Outward Slice, Outside Cards & Connecting Line)
  const wedgeGroups = document.querySelectorAll('.pizza-wedge-group');
  const outsideCards = document.querySelectorAll('.pizza-outside-card');
  const pizzaWheelContainer = document.getElementById('pizzaWheelContainer');
  const pizzaWheelRotator = document.getElementById('pizzaWheelRotator');
  let activeStageId = '3'; // Default on load: Stage 03 (Gear Cutting & Hobbing)

  const wedgeColors = {
    '1': '#c7a557',
    '2': '#e86b35',
    '3': '#d9413a',
    '4': '#4a8786',
    '5': '#66767c'
  };

  const updatePizzaConnectorLine = (stageId) => {
    const connectorSvg = document.getElementById('pizzaConnectorSvg');
    const pathEl = document.getElementById('pizzaConnectPath');
    const dotEl = document.getElementById('pizzaConnectDot');
    if (!connectorSvg || !pathEl || !dotEl || !pizzaWheelContainer) return;

    if (window.innerWidth <= 1100 || !stageId) {
      pathEl.setAttribute('d', '');
      dotEl.setAttribute('opacity', '0');
      return;
    }

    const activeCard = document.querySelector(`.pizza-outside-card[data-stage="${stageId}"].active`);
    const activeDot = activeCard ? activeCard.querySelector('.card-connector-dot') : null;
    if (!activeCard || !activeDot) {
      pathEl.setAttribute('d', '');
      dotEl.setAttribute('opacity', '0');
      return;
    }

    const svgRect = connectorSvg.getBoundingClientRect();
    if (svgRect.width === 0) return;

    // Outer edge midpoints for each stage in 600x600 SVG viewBox coordinate space:
    const stageOuterCoords = {
      '1': { x: 448, y: 96 },
      '2': { x: 540, y: 378 },
      '3': { x: 300, y: 552 },
      '4': { x: 60,  y: 378 },
      '5': { x: 152, y: 96 }
    };

    const wheelSvg = document.getElementById('pizzaWheelSvg');
    const wheelRect = wheelSvg ? wheelSvg.getBoundingClientRect() : pizzaWheelContainer.getBoundingClientRect();
    const activeCoords = stageOuterCoords[stageId] || { x: 300, x: 300 };

    // Convert wheel coordinates to connector SVG viewBox space (1000x700 viewBox)
    const scaleX = 1000 / svgRect.width;
    const scaleY = 700 / svgRect.height;

    const startX = (wheelRect.left - svgRect.left + (activeCoords.x / 600) * wheelRect.width) * scaleX;
    const startY = (wheelRect.top - svgRect.top + (activeCoords.y / 600) * wheelRect.height) * scaleY;

    const dotRect = activeDot.getBoundingClientRect();
    const endX = (dotRect.left + dotRect.width / 2 - svgRect.left) * scaleX;
    const endY = (dotRect.top + dotRect.height / 2 - svgRect.top) * scaleY;

    // Curved Bezier path calculation:
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 30;

    const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

    pathEl.setAttribute('d', pathD);
    pathEl.setAttribute('stroke', wedgeColors[stageId] || '#f3dc94');

    dotEl.setAttribute('cx', endX.toFixed(1));
    dotEl.setAttribute('cy', endY.toFixed(1));
    dotEl.setAttribute('fill', wedgeColors[stageId] || '#f3dc94');
    dotEl.setAttribute('opacity', '1');
  };

  const refreshPizzaLayout = () => {
    updatePizzaConnectorLine(activeStageId);
  };

  const selectStage = (stageId) => {
    activeStageId = stageId;

    // Slight wheel rotation toward selected stage for dynamic machine feel
    if (pizzaWheelRotator) {
      const stageRotations = { '1': -12, '2': -6, '3': 0, '4': 6, '5': 12 };
      const rot = stageRotations[stageId] || 0;
      pizzaWheelRotator.style.transform = `rotate(${rot}deg)`;
    }

    wedgeGroups.forEach(group => {
      const isSelected = group.dataset.stage == stageId;
      group.classList.toggle('active', isSelected);
      group.style.opacity = isSelected ? '1' : '0.45';
    });

    outsideCards.forEach(card => {
      const isSelected = card.dataset.stage == stageId;
      card.classList.toggle('active', isSelected);
    });

    // Sync hero timeline nodes if present
    const heroNodes = document.querySelectorAll('.hero-timeline-node');
    heroNodes.forEach(node => {
      node.classList.toggle('active', node.dataset.stage == stageId);
    });

    // Sync pagination dots
    const pageDots = document.querySelectorAll('.pizza-dot');
    pageDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.stage == stageId);
    });

    window.requestAnimationFrame(refreshPizzaLayout);
  };

  wedgeGroups.forEach(group => {
    group.addEventListener('mouseenter', () => selectStage(group.dataset.stage));
    group.addEventListener('focus', () => selectStage(group.dataset.stage));
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      selectStage(group.dataset.stage);
    });
  });

  // Card Prev/Next arrows & pagination dots
  const stageNavBtns = document.querySelectorAll('.card-nav-arrow');
  stageNavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let currentNum = parseInt(activeStageId, 10);
      if (btn.classList.contains('next')) {
        currentNum = currentNum >= 5 ? 1 : currentNum + 1;
      } else {
        currentNum = currentNum <= 1 ? 5 : currentNum - 1;
      }
      selectStage(currentNum.toString());
    });
  });

  const pageDots = document.querySelectorAll('.pizza-dot');
  pageDots.forEach(dot => {
    dot.addEventListener('click', () => {
      selectStage(dot.dataset.stage);
    });
  });

  const heroNodes = document.querySelectorAll('.hero-timeline-node');
  heroNodes.forEach(node => {
    node.addEventListener('click', () => {
      selectStage(node.dataset.stage);
    });
  });

  // Drag & Touch Swipe Gesture Handler
  if (pizzaWheelContainer) {
    let startX = 0;
    let isDragging = false;

    // Desktop Mouse Drag
    pizzaWheelContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 35) {
        let currentNum = parseInt(activeStageId, 10);
        if (deltaX < 0) {
          currentNum = currentNum >= 5 ? 1 : currentNum + 1;
        } else {
          currentNum = currentNum <= 1 ? 5 : currentNum - 1;
        }
        selectStage(currentNum.toString());
      }
    });

    // Touch Mobile Swipe
    pizzaWheelContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
      }
    }, { passive: true });

    pizzaWheelContainer.addEventListener('touchend', (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const deltaX = e.changedTouches[0].clientX - startX;
      if (Math.abs(deltaX) > 35) {
        let currentNum = parseInt(activeStageId, 10);
        if (deltaX < 0) {
          currentNum = currentNum >= 5 ? 1 : currentNum + 1;
        } else {
          currentNum = currentNum <= 1 ? 5 : currentNum - 1;
        }
        selectStage(currentNum.toString());
      }
    }, { passive: true });

    // Keyboard Arrow Navigation
    pizzaWheelContainer.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        let currentNum = parseInt(activeStageId, 10);
        currentNum = currentNum >= 5 ? 1 : currentNum + 1;
        selectStage(currentNum.toString());
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        let currentNum = parseInt(activeStageId, 10);
        currentNum = currentNum <= 1 ? 5 : currentNum - 1;
        selectStage(currentNum.toString());
      }
    });
  }

  // Set Stage 03 selected by default on load
  selectStage('3');

  // Connector line position & resize listener
  setTimeout(refreshPizzaLayout, 250);
  window.addEventListener('resize', () => window.requestAnimationFrame(refreshPizzaLayout), { passive: true });
  window.addEventListener('scroll', () => window.requestAnimationFrame(refreshPizzaLayout), { passive: true });


  // 6. Circular Product Category Explorer
  const catButtons = document.querySelectorAll('.category-segment-btn');
  const catCardTitle = document.getElementById('catExplorerTitle');
  const catCardDesc = document.getElementById('catExplorerDesc');
  const catCardImg = document.getElementById('catExplorerImg');
  const catCardLink = document.getElementById('catExplorerLink');

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (catCardTitle) catCardTitle.textContent = btn.dataset.name || btn.textContent;
      if (catCardDesc) catCardDesc.textContent = btn.dataset.desc || "Precision engineered component for heavy machinery applications.";
      if (catCardImg && btn.dataset.img) catCardImg.src = btn.dataset.img;
      if (catCardLink && btn.dataset.url) catCardLink.href = btn.dataset.url;
    });
  });

  // 7. Machine Spares Instant Search
  const sparesSearchInput = document.getElementById('sparesSearchInput');
  if (sparesSearchInput) {
    sparesSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const spareTags = document.querySelectorAll('.spare-tag');

      spareTags.forEach(tag => {
        const text = tag.textContent.toLowerCase();
        if (text.includes(query)) {
          tag.style.display = 'inline-flex';
          tag.style.opacity = '1';
        } else {
          tag.style.opacity = '0.2';
        }
      });
    });
  }

  // 8. Live Desk Chat & Modal Handlers
  const chatModal = document.getElementById('chatModal');
  const chatOpenBtn = document.getElementById('chatOpenBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');

  const openModal = (modal) => {
    if (modal) {
      modal.classList.add('open');
      document.body.classList.add('modal-open');
    }
  };

  const closeModal = (modal) => {
    if (modal) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  };

  if (chatOpenBtn && chatModal) {
    chatOpenBtn.addEventListener('click', () => openModal(chatModal));
  }

  if (chatCloseBtn && chatModal) {
    chatCloseBtn.addEventListener('click', () => closeModal(chatModal));
  }

  if (chatModal) {
    chatModal.addEventListener('click', (e) => {
      if (e.target === chatModal) closeModal(chatModal);
    });
  }

  if (chatForm && chatInput && chatBody) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;

      // Add user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.textContent = msg;
      chatBody.appendChild(userBubble);
      chatInput.value = '';
      chatBody.scrollTop = chatBody.scrollHeight;

      // Bot auto response simulation
      setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        botBubble.textContent = "Thank you for reaching out to Nirala Engineers! Our technical desk has recorded your inquiry. An engineer will respond shortly.";
        chatBody.appendChild(botBubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 700);
    });
  }

  // 9. Interactive Hero Carousel Logic
  const heroEl = document.getElementById('home');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const indicatorDots = document.querySelectorAll('.hero-indicators .indicator-dot');
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const heroSlideCaptionEl = document.getElementById('heroSlideCaption');
  const heroPrevBtn = document.getElementById('heroPrevBtn');
  const heroNextBtn = document.getElementById('heroNextBtn');

  if (heroSlides.length > 0) {
    let currentSlideIndex = 0;
    const totalSlides = heroSlides.length;
    let autoPlayTimer = null;

    // Preload Slide 0 immediately
    const heroVid = heroSlides[0].querySelector('video');
    if (heroVid) {
      heroVid.play().catch(() => {});
    }

    const setHeroSlide = (index) => {
      if (index === currentSlideIndex && heroSlides[index].classList.contains('active')) return;

      const prevIndex = currentSlideIndex;
      currentSlideIndex = (index + totalSlides) % totalSlides;

      heroSlides.forEach((slide, i) => {
        slide.classList.remove('slide-up-enter', 'slide-up-exit', 'slide-down-enter', 'slide-down-exit', 'prev-slide');
        const vid = slide.querySelector('video');
        if (i === currentSlideIndex) {
          slide.classList.add('active');
          if (vid) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
          }
        } else {
          slide.classList.remove('active');
          if (i === prevIndex) {
            slide.classList.add('prev-slide');
          }
          if (vid) {
            vid.pause();
          }
        }
      });

      indicatorDots.forEach((dot, i) => {
        const isCurrent = i === currentSlideIndex;
        dot.classList.toggle('active', isCurrent);
        dot.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      if (currentSlideNumEl) {
        currentSlideNumEl.textContent = `0${currentSlideIndex + 1}`;
      }
      if (heroSlideCaptionEl && heroSlides[currentSlideIndex]) {
        heroSlideCaptionEl.textContent = heroSlides[currentSlideIndex].dataset.caption || '';
      }
    };

    const nextSlide = () => setHeroSlide(currentSlideIndex + 1);
    const prevSlide = () => setHeroSlide(currentSlideIndex - 1);

    // Auto Play Slides every 6 seconds
    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 6000);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    startAutoPlay();

    // Pause auto-play on hover or focus
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopAutoPlay);
      heroEl.addEventListener('mouseleave', startAutoPlay);
      heroEl.addEventListener('focusin', stopAutoPlay);
      heroEl.addEventListener('focusout', startAutoPlay);
    }

    // Indicator Dot Clicks
    indicatorDots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        setHeroSlide(i);
        startAutoPlay();
      });
    });

    // Arrow Navigation Clicks
    if (heroPrevBtn) {
      heroPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      });
    }

    if (heroNextBtn) {
      heroNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      });
    }

    // Touch swipe support on Hero section
    let touchStartX = 0;
    let touchStartY = 0;
    if (heroEl) {
      heroEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      heroEl.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          startAutoPlay();
        }
      }, { passive: true });

      // Keyboard arrow navigation on Hero focus
      heroEl.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          nextSlide();
          startAutoPlay();
        } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          prevSlide();
          startAutoPlay();
        }
      });
    }
  }

  // 10. Open Enquiry Form Button Handler
  const openEnquiryFormBtn = document.getElementById('openEnquiryFormBtn');
  if (openEnquiryFormBtn) {
    openEnquiryFormBtn.addEventListener('click', () => {
      const chatModal = document.getElementById('chatModal');
      if (chatModal) {
        chatModal.classList.add('open');
        document.body.classList.add('modal-open');
        const input = document.getElementById('chatInput');
        if (input) input.focus();
      } else {
        window.location.href = 'contact.html#quote';
      }
    });
  }

  // 11. Interactive 3D History Timeline Golden Center Line Scroll & Node Activation
  const timelineWrappers = document.querySelectorAll('.timeline-3d-wrapper');

  if (timelineWrappers.length > 0) {
    const updateTimelineScroll = () => {
      const windowHeight = window.innerHeight;

      timelineWrappers.forEach(wrapper => {
        const progressLine = wrapper.querySelector('.timeline-progress-line');
        const glowLight = wrapper.querySelector('.timeline-glow-light');
        const milestoneRows = wrapper.querySelectorAll('.milestone-3d-row');

        if (!progressLine) return;

        const rect = wrapper.getBoundingClientRect();
        const wrapperHeight = wrapper.offsetHeight;

        // Calculate progress from when wrapper top reaches 70% of viewport height to when it leaves top 20%
        const startPoint = windowHeight * 0.7;
        const totalDist = wrapperHeight + windowHeight * 0.4;
        const currentDist = startPoint - rect.top;

        let progress = currentDist / totalDist;
        progress = Math.min(Math.max(progress, 0), 1);

        const maxSVGLength = 1200;
        const currentY = progress * maxSVGLength;

        // Draw golden line downward
        if (progressLine.tagName.toLowerCase() === 'line') {
          progressLine.setAttribute('y2', currentY);
        } else {
          progressLine.style.strokeDasharray = maxSVGLength;
          progressLine.style.strokeDashoffset = maxSVGLength * (1 - progress);
        }

        // Position glowing gold leading light
        if (glowLight) {
          glowLight.setAttribute('cy', currentY);
          glowLight.setAttribute('opacity', progress > 0.01 && progress < 0.99 ? '1' : '0');
        }

        // Light up each milestone node and 3D card panel as the golden beam reaches it
        milestoneRows.forEach(row => {
          const rowRect = row.getBoundingClientRect();
          if (rowRect.top <= windowHeight * 0.65) {
            row.classList.add('active');
          } else {
            row.classList.remove('active');
          }
        });
      });
    };

    window.addEventListener('scroll', updateTimelineScroll, { passive: true });
    window.addEventListener('resize', updateTimelineScroll, { passive: true });
    updateTimelineScroll();
  }

  // 12. About Us - Interactive Sector Category Filtering
  const sectorFilterBtns = document.querySelectorAll('.sector-filter-btn');
  const sectorCards = document.querySelectorAll('.sector-grid .sector-card');
  if (sectorFilterBtns.length > 0 && sectorCards.length > 0) {
    sectorFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sectorFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterCategory = btn.getAttribute('data-filter');

        sectorCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (filterCategory === 'all' || cardCat === filterCategory || card.classList.contains('highlight-card')) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // 13. About Us - Interactive 3D Card Hover Depth
  const interactiveAboutCards = document.querySelectorAll('.sector-card, .about-motto-card, .about-cap-card, .about-team-card');
  interactiveAboutCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -7;
      const tiltY = (x - 0.5) * 7;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 14. About Us Subnav Active Spy
  const subnavLinks = document.querySelectorAll('.about-subnav-link');
  if (subnavLinks.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 130;
      subnavLinks.forEach(link => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            const top = targetEl.offsetTop;
            const height = targetEl.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              subnavLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
            }
          }
        }
      });
    }, { passive: true });
  }
});


// Product Details Interactive Gallery Switcher
window.switchMainProductImage = function(thumbElement, newSrc) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) {
    mainImg.style.transition = 'opacity 0.2s ease, transform 0.3s ease';
    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      mainImg.src = newSrc;
      mainImg.style.opacity = '1';
    }, 150);
  }
  const thumbs = document.querySelectorAll('.product-thumb-item');
  thumbs.forEach(t => t.classList.remove('active'));
  if (thumbElement) {
    thumbElement.classList.add('active');
  }
};

window.viewHelicalPhoto = function(imgSrc, thumbIndex) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) {
    mainImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const thumbs = document.querySelectorAll('.product-thumb-item');
    if (thumbs && typeof thumbIndex === 'number' && thumbs[thumbIndex]) {
      window.switchMainProductImage(thumbs[thumbIndex], imgSrc);
    } else {
      window.switchMainProductImage(null, imgSrc);
    }
  }
};

// URL Query Parameter Pre-fill for Contact / RFQ Form
document.addEventListener('DOMContentLoaded', () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const subjectParam = urlParams.get('subject');
    
    const subjectSelect = document.getElementById('userSubject');
    const messageTextarea = document.getElementById('userMessage');
    
    if (typeParam) {
      if (subjectSelect) {
        if (typeParam.toLowerCase().includes('sprocket') || typeParam.toLowerCase().includes('coupling')) {
          subjectSelect.value = 'Sprockets / Timing Pulleys';
        }
      }
      if (messageTextarea && !messageTextarea.value) {
        messageTextarea.value = `Inquiry regarding: ${typeParam}\nPlease provide quotation for pitch, tooth count, bore size, and material:`;
      }
    } else if (subjectParam && subjectSelect) {
      for (let opt of subjectSelect.options) {
        if (opt.value.toLowerCase().includes(subjectParam.toLowerCase())) {
          subjectSelect.value = opt.value;
          break;
        }
      }
    }
  } catch (e) {
    console.warn('URL param parse error:', e);
  }
});

// 12. Industrial Sector Matrix & Live Telemetry Inspector Controller
document.addEventListener('DOMContentLoaded', () => {
  const sectorDataMap = {
    petrochemicals: {
      title: "Petrochemicals",
      domain: "ENERGY & PROCESS",
      subtitle: "Severe chemical corrosion resistance, continuous high-temperature duty, and explosion-proof agitator gearing.",
      components: [
        "Heavy Helical Agitator Drives",
        "Hastelloy & SS316 Pump Gears",
        "High-Pressure Compressor Pinions",
        "Anti-Corrosive Worm Gear Sets"
      ],
      env: "Aggressive Chemical Vapors",
      duty: "Continuous 24/7 Base Load",
      spec: "API 677 / AGMA Class 11",
      cta: "Inquire for Petrochemicals"
    },
    refinery: {
      title: "Refinery",
      domain: "ENERGY & PROCESS",
      subtitle: "Continuous duty high-torque transfer units and turbine reduction gears engineered for high thermal expansion.",
      components: [
        "Crude Feed Pump Drive Gears",
        "Cooling Tower Spiral Bevel Sets",
        "Heavy Decoking Winch Gearing",
        "High-Speed Turbine Pinions"
      ],
      env: "Extreme Hydrocarbon Heat",
      duty: "100% Uninterrupted Duty",
      spec: "API 613 / DIN Class 6",
      cta: "Inquire for Refinery Units"
    },
    oilrings: {
      title: "Oil Rigs & Offshore Platforms",
      domain: "ENERGY & PROCESS",
      subtitle: "Ultra-heavy load handling, saltwater corrosion proofing, and mud pump high-torque planetary drives.",
      components: [
        "Offshore Mud Pump Bull Gears",
        "Top-Drive Rotary Transmission",
        "Drawworks Winch Spur Sets",
        "Anchor Handling Slewing Pinions"
      ],
      env: "Marine Salt Spray & Waves",
      duty: "Extreme Peak Shock Loads",
      spec: "DNV / ABS Marine Standard",
      cta: "Inquire for Offshore & Rig Gearing"
    },
    pumping: {
      title: "Pumping Units & Flow Stations",
      domain: "ENERGY & PROCESS",
      subtitle: "Submerged, slurry, and multi-stage pipeline transmission gearing designed for continuous hydraulic pressure.",
      components: [
        "Multi-Stage Booster Pinions",
        "Positive Displacement Rotors",
        "Slurry Pump Reduction Gears",
        "High-Volume Volute Impeller Shafts"
      ],
      env: "Abrasive Slurry & Water Ingress",
      duty: "Continuous Flow Operation",
      spec: "ISO 1328 Grade 5 / AGMA 10",
      cta: "Inquire for Pumping Units"
    },
    cement: {
      title: "Cement Factory",
      domain: "HEAVY MILLS & PLANTS",
      subtitle: "High dust ingress protection, extreme torque capacity, and kiln drive reduction built for unforgiving clinker environments.",
      components: [
        "Kiln Drive Spur Pinions",
        "Ball Mill Main Drive Sets",
        "Clinker Crusher Helical Gears",
        "Bucket Elevator Heavy Sprockets"
      ],
      env: "Severe Clinker Dust & Heat",
      duty: "Ultra-Heavy 24/7 Crushing",
      spec: "AGMA Class 10 / DIN 3962",
      cta: "Inquire for Cement Plant Systems"
    },
    sugarmill: {
      title: "Sugar Mill",
      domain: "HEAVY MILLS & PLANTS",
      subtitle: "Massive torque cane crushing drives and roller gearing built to resist highly acidic cane juice and seasonal 24-hr peaks.",
      components: [
        "Cane Crushing Mill Bull Gears",
        "Juice Extractor Pinion Sets",
        "Cane Carrier Drive Sprockets",
        "Bagasse Conveyor Reduction Drives"
      ],
      env: "Acidic Juice & Moisture",
      duty: "Peak Seasonal Crushing",
      spec: "IS 4460 / AGMA Heavy Duty",
      cta: "Inquire for Sugar Mill Drives"
    },
    textilemill: {
      title: "Textile Mill",
      domain: "HEAVY MILLS & PLANTS",
      subtitle: "High-speed synchronized spindles, minimal backlash, and lint-sealed precision gear drives for high-throughput spinning.",
      components: [
        "Spinning Frame Helical Sets",
        "Carding Machine Timing Gears",
        "Weaving Loom Planetary Ratios",
        "Drafting Roller Precision Gears"
      ],
      env: "High-Speed Airborne Lint",
      duty: "Precision Synchronization",
      spec: "DIN 7 / Sub-Micron Flank",
      cta: "Inquire for Textile Machinery"
    },
    texturising: {
      title: "Texturising Unit",
      domain: "HEAVY MILLS & PLANTS",
      subtitle: "Ultra-high RPM micro-synchronous draw gearing and yarn feed shafts with micro-honed tooth flank finishes.",
      components: [
        "Draw Texturising Roll Gears",
        "Traverse Guide Timing Pinions",
        "Yarn Feeder Synchronous Drives",
        "High-RPM Spindle Bevel Pairs"
      ],
      env: "High-RPM Vibration & Heat",
      duty: "10,000+ RPM Spindle Cycles",
      spec: "DIN Class 5-6 Ground",
      cta: "Inquire for Texturising Units"
    },
    machinetool: {
      title: "Machine Tool Manufacturing",
      domain: "MACHINERY & AUTOMATION",
      subtitle: "Sub-micron profile tooth grinding, CNC spindle drives, and precision ground anti-backlash gear racks.",
      components: [
        "CNC Spindle Headstock Gears",
        "Zero-Backlash Feed Racks",
        "Rotary Indexing Table Worm Sets",
        "Multi-Axis Precision Pinions"
      ],
      env: "Precision Machining Coolant",
      duty: "Micro-Precision Positioning",
      spec: "DIN Class 5 / JIS Grade 1",
      cta: "Inquire for Machine Tool Builders"
    },
    plastic: {
      title: "Plastic Processing",
      domain: "MACHINERY & AUTOMATION",
      subtitle: "High-thrust extruder gearboxes, co-rotating twin-screw sets, and high-pressure injection molding drive pinions.",
      components: [
        "Twin-Screw Co-Rotating Gears",
        "Extruder Thrust Bearing Hubs",
        "Injection Mold Platen Gears",
        "Blow Molding Synchronizer Sets"
      ],
      env: "High Melt Pressure & Heat",
      duty: "High Thrust Continuous Load",
      spec: "DIN 6 / Case Carburized 60 HRC",
      cta: "Inquire for Plastic Processing"
    },
    foodprocessing: {
      title: "Food Processing",
      domain: "MACHINERY & AUTOMATION",
      subtitle: "Food-grade stainless steel gearing, sanitary washdown resistance, and oil-tight containment for bakery, dairy, and confectionery.",
      components: [
        "SS304/SS316 Food Grade Gears",
        "High-Speed Bottling Starwheels",
        "Sanitary Mixer Planetary Drives",
        "Confectionery Forming Pinions"
      ],
      env: "High-Pressure Washdowns",
      duty: "Sanitary Silent Operation",
      spec: "FDA Compliant / Stainless 316",
      cta: "Inquire for Food Grade Drives"
    },
    packaging: {
      title: "Packaging Units",
      domain: "MACHINERY & AUTOMATION",
      subtitle: "Ultra-fast cycle rates, silent servo-driven tooth profiles, and synchronized multi-axis motion drives.",
      components: [
        "Form-Fill-Seal Timing Drives",
        "Continuous Rotary Knife Gears",
        "Cartoning Machine Indexers",
        "Palletizer High-Torque Pinions"
      ],
      env: "High-Speed Dynamic Cycling",
      duty: "400+ Cycles / Minute",
      spec: "DIN Class 6 Ground Flank",
      cta: "Inquire for Packaging Lines"
    },
    civilconstruction: {
      title: "Civil Construction",
      domain: "INFRASTRUCTURE & TOOLING",
      subtitle: "Heavy shock-rated gearboxes for earthmoving equipment, tower crane slewing rings, and road paver drives.",
      components: [
        "Transit Concrete Mixer Drives",
        "Tower Crane Slewing Gears",
        "Excavator Final Drive Planetary",
        "Road Roller Compactor Pinions"
      ],
      env: "Outdoor Mud, Shock & Impact",
      duty: "Extreme Dynamic Shock Loads",
      spec: "Heavy Duty AGMA Class 9-10",
      cta: "Inquire for Construction Machinery"
    },
    automobiles: {
      title: "Automobiles & Commercial Fleet",
      domain: "INFRASTRUCTURE & TOOLING",
      subtitle: "Transmission differential bevels, steering column worms, starter ring gears, and EV reduction gear pairs.",
      components: [
        "Crown Wheel & Pinion Sets",
        "Differential Planetary Gears",
        "Transmission Input/Output Shafts",
        "Transfer Case Drive Gears"
      ],
      env: "High RPM Dynamic Shock",
      duty: "Automotive Endurance Cycles",
      spec: "IATF / DIN Automotive Standards",
      cta: "Inquire for Automotive Gearing"
    },
    instruments: {
      title: "Precision Instruments",
      domain: "INFRASTRUCTURE & TOOLING",
      subtitle: "Micro-module gears, zero-backlash instrument trains, optical tracking mechanisms, and lab apparatus gearheads.",
      components: [
        "Micro-Module Miniature Gears",
        "Zero-Backlash Antibacklash Sets",
        "Optical Encoder Drive Pinions",
        "Potentiometer Calibration Racks"
      ],
      env: "Clean Laboratory / Sensor Enclosure",
      duty: "Micro-Frictional High Sensitivity",
      spec: "Sub-Module 0.3 to 1.0 / DIN 5",
      cta: "Inquire for Instrument Gears"
    },
    handtools: {
      title: "Hand Tools & Power Tools",
      domain: "INFRASTRUCTURE & TOOLING",
      subtitle: "Compact high-strength spiral bevels and planetary epicyclic gears for pneumatic and electric power tools.",
      components: [
        "Angle Grinder Spiral Bevel Sets",
        "Hammer Drill Epicyclic Gears",
        "Impact Wrench Anvil Gears",
        "Pneumatic Sander Pinions"
      ],
      env: "Extreme High RPM Compact Enclosure",
      duty: "High Torque Intermittent Duty",
      spec: "Induction Hardened Alloy Steel",
      cta: "Inquire for Power Tool Gearing"
    }
  };

  const sectorRows = document.querySelectorAll('.sector-row-item');
  const hudSectorTitle = document.getElementById('hudSectorTitle');
  const hudSectorSubtitle = document.getElementById('hudSectorSubtitle');
  const hudDomainTag = document.getElementById('hudDomainTag');
  const hudComponentsGrid = document.getElementById('hudComponentsGrid');
  const hudParamEnv = document.getElementById('hudParamEnv');
  const hudParamDuty = document.getElementById('hudParamDuty');
  const hudParamSpec = document.getElementById('hudParamSpec');
  const hudCtaBtn = document.getElementById('hudCtaBtn');

  if (sectorRows.length > 0 && hudSectorTitle) {
    const renderSectorTelemetry = (sectorKey) => {
      const data = sectorDataMap[sectorKey];
      if (!data) return;

      sectorRows.forEach(row => {
        row.classList.toggle('active', row.dataset.sectorId === sectorKey);
      });

      hudSectorTitle.textContent = data.title;
      hudSectorSubtitle.textContent = data.subtitle;
      if (hudDomainTag) hudDomainTag.textContent = data.domain;

      if (hudComponentsGrid) {
        hudComponentsGrid.innerHTML = data.components
          .map(comp => `<div class="hud-component-pill"><span class="comp-icon">⚙</span><span>${comp}</span></div>`)
          .join('');
      }

      if (hudParamEnv) hudParamEnv.textContent = data.env;
      if (hudParamDuty) hudParamDuty.textContent = data.duty;
      if (hudParamSpec) hudParamSpec.textContent = data.spec;

      if (hudCtaBtn) {
        hudCtaBtn.setAttribute('href', `contact.html?sector=${encodeURIComponent(data.title)}#quote`);
        hudCtaBtn.innerHTML = `<span>${data.cta}</span><span>→</span>`;
      }
    };

    sectorRows.forEach(row => {
      // Instant switch on hover or click for ultra-responsive feel
      row.addEventListener('mouseenter', () => {
        const sId = row.dataset.sectorId;
        if (sId) renderSectorTelemetry(sId);
      });
      row.addEventListener('click', () => {
        const sId = row.dataset.sectorId;
        if (sId) renderSectorTelemetry(sId);
      });
    });
  }

  // 13. Transmission Master Deck Controller (Zero-Lag GPU-Accelerated)
  const pillarDockBtns = document.querySelectorAll('.pillar-dock-btn');
  const stagePanels = document.querySelectorAll('.pillar-stage-panel');

  if (pillarDockBtns.length > 0 && stagePanels.length > 0) {
    const activatePillarDeck = (pillarNum) => {
      pillarDockBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pillar === String(pillarNum));
      });
      stagePanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === String(pillarNum));
      });
    };

    pillarDockBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pId = btn.dataset.pillar;
        if (pId) activatePillarDeck(pId);
      });
      // Also allow hover switch on larger screens for instant responsiveness
      btn.addEventListener('mouseenter', () => {
        if (window.innerWidth > 960 && btn.dataset.pillar) {
          activatePillarDeck(btn.dataset.pillar);
        }
      });
    });
  }

  // 14. Interactive 3D Exploding Pie Chart & Deep-Dive Stage Modal Controller
  const processPhasesData = {
    1: {
      id: 1,
      badge: "PHASE 01 // PRODUCT DEVELOPMENT",
      themeColor: "#3b82f6",
      name: "PRODUCT DEVELOPMENT",
      sectionId: "product-development",
      submenus: [
        {
          id: "warehouse",
          num: "01",
          name: "WAREHOUSE",
          title: "WAREHOUSE",
          body: "Our plant includes substantial warehouse space dedicated to storage of finished and semi- finished goods available for immediate delivery, or customization in our machine shop."
        },
        {
          id: "sample_id",
          num: "02",
          name: "SAMPLE IDENTIFICATION",
          title: "SAMPLE IDENTIFICATION",
          body: "We work with customers daily to identify different types of Gears (Spur Gears, Helical Gears ,Change Gears, Sprockets Gears,Miter Gears Worm Wheel, Worm Shaft, Straight Bevel Gears, Spiral Bevel Gears,Herringbone Gears, Timing Pulleys, Rack & Pinion etc) ) & Gear Boxes that are worn out or broken due to some other reason which are of unknown specification. Our experts use their extensive knowledge of the technical geometry & specification to manufacture the products, along with sophisticated measuring and calculation methods. This allows customers to obtain replacement parts where they might have had to replace entire gear boxes,gears, shafts, mechanical systems, or even an entire machine.\n\nWE ALSO WORK WITH THE DRAWINGS PROVIDED BY THE CUSTOMER AND ARE OEM TO VARIOUS INDUSTRIES IN VARIETY OF FIELDS SUCH AS MACHINE MANUFACTURING INDUSTRIES, CHEMICAL INDUSTRIES, PACKAGING INDUSTRIES, AGRICULTURE INDUSTRIES, TEXTIE INDUSTRIES, RAILWAYS, CRANE MFG. INDUSTRIES, AUTOMOBILE INDUSTRIES ETC"
        },
        {
          id: "dev_mgmt",
          num: "03",
          name: "DEVELOPMENT AND MANAGEMENT",
          title: "DEVELOPMENT AND MANAGEMENT",
          body: "When an order is placed with our company, firstly it is reviewed and planned by a team of individuals with combined Nirala Engineers experience of over 55 years. Work instructions, operator setting (job card) and detailed CAD drawings are produced to aid manufacturing personnel in producing high quality products with repeatability."
        }
      ]
    },
    2: {
      id: 2,
      badge: "PHASE 02 // RAW MATERIAL PREPARATION",
      themeColor: "#f97316",
      name: "RAW MATERIAL PREPARATION",
      sectionId: "raw-material",
      submenus: [
        {
          id: "hacksaw",
          num: "01",
          name: "HACKSAW CUTTING",
          title: "HACKSAW CUTTING",
          body: "WE ARE EQUIPPED WITH 3 BANDSAW MACHINES. RAW MATERIAL CUTTING FROM THE ROD ACCORDING TO THE REQUIREMENT IS DONE COMPLETELY INHOUSE."
        },
        {
          id: "welding",
          num: "02",
          name: "WELDING",
          title: "WELDING",
          body: "From simple weld jobs (boss welding, repairing gear tooth, etc) to advanced fabricated parts, Nirala Engineers can provide you with a welded product that will fulfill your needs."
        }
      ]
    },
    3: {
      id: 3,
      badge: "PHASE 03 // MACHINING",
      themeColor: "#9ca3af",
      name: "MACHINING",
      sectionId: "machining",
      submenus: [
        {
          id: "turning",
          num: "01",
          name: "TURNING",
          title: "TURNING",
          body: "Our cnc turning centres are modern and toolings are updated according to the market. All turning requirements are handled in-house for maximum control of production and quality.\n\nOur CNC machine tools utilize state-of-the-art programming providing efficiency,versatility and accuracy."
        },
        {
          id: "gear_cutting",
          num: "02",
          name: "GEAR CUTTING---",
          title: "GEAR CUTTING---",
          body: "Nirala Engineers began manufacturing gears in the mid-1960’s and started supply in 1961. That tradition expanded substantially when the Nirala Engineers expanded its product range to custom-built gearboxes in 1990, further expanded to import substitute complex cnc turned component in 2006 and to cctv surveillance systems, biometric systems & home automation system in 2015. From time to time the company has continued to expand its capabilities and knowledge base. Today the firm is among the most experienced and capable gear manufacturers in India and have vision to expand across the globe. Virtually every employee at Nirala Engineers is involved in manufacturing such world class the best products available anywhere\n\nOur gear cutting capabilities are very diverse, including all common gear types used in industry. We carry a large product range such as Spur Gears, Helical Gears ,Change Gears, Sprockets Gears,Miter Gears, Worm Wheel, Worm Shaft, Straight Bevel Gears, Spiral Bevel Gears,Herringbone Gears, Timing Pulleys, Rack & Pinion,Idler Gears etc) . We have manual as well as automatic machines for hobbing, shaping, generating, grinding and other finishing in-house itself. Our inventory of gear cutting tools, CNC cutting tools, Gear Hob cutters are extensive, covering a broad range of common and uncommon Diametrical (both Normal and Transverse), Circular, AGMA & Fellows Stub and Metric Pitches. Please inquire for additional details."
        },
        {
          id: "milling",
          num: "03",
          name: "MILLING AND DRILLING",
          title: "MILLING AND DRILLING",
          body: "Substantial milling equipment are available for meeting special machining needs of our customers. We have collaboration with vendors having dro milling machines,mechanical mill and VMC machines with extensive capabilities. We have our machine shop set up for both quick turn-around, short run jobs, as well as medium quantity production orders.\n\nExtensive drilling & tapping machinery with trained employees are available in-house for all your drilling and tapping needs."
        },
        {
          id: "keyway",
          num: "04",
          name: "KEYWAY CUTTING AND BROACHING",
          title: "KEYWAY CUTTING AND BROACHING",
          body: "Final preparations of gears for shaft mounting are made here. Keyway cutting, spline broaching, and grub screw drilling capabilities are available. CNC and mechanical lathes provide straight and tapered OD and ID turning. Please inquire for specific requirements."
        },
        {
          id: "heat_treatment",
          num: "05",
          name: "HEAT TREATMENT",
          title: "HEAT TREATMENT",
          body: "We have tie up with various heat treatment agencies/ companies which are well equipped with extensive heat treatment equipment and experience. They provide excellent quality by hardening our gears. Heat treatment of ferrous metals such as hardening, tempering, annealing, normalizing, case hardening & Heat treatment of non-ferrous metals such as annealing & solution heat treatment can be provided through cooperation with outside sources/vendors."
        },
        {
          id: "grinding",
          num: "06",
          name: "GRINDING",
          title: "GRINDING",
          body: "In addition to our gear tooth grinding abilities we also have collaboration with different companies who have substantial experience and ability with grinding other surfaces such as precision OD/ID grinding, surface grinding and honing. These companies have experience which provides us unparalleled accuracy on straightness, diameter, roundness, concentricity and surface finish."
        }
      ]
    },
    4: {
      id: 4,
      badge: "PHASE 04 // FINISHING",
      themeColor: "#eab308",
      name: "FINISHING",
      sectionId: "finishing",
      submenus: [
        {
          id: "deburring",
          num: "01",
          name: "DEBURRING & FINISHING",
          title: "DEBURRING & FINISHING",
          body: "Aesthetics plays a crucial role in the perception of the product which directly associate with the overall satisfaction of a customer & it also substantiate the innovation, quality and reliability of the product.\n\nIn the final manufacturing process, Removal of machining burrs & edges, marking of part numbers & company logo (both standard and customer specified) , sandblasting, blackening, cleaning & coating of parts for rust protection and various other mid-process and final finishing operations are carried out.\n\nWe at Nirala Engineers, right from the initial stage of development keep in mind the product aesthetics and work towards achieving it."
        },
        {
          id: "inspection",
          num: "02",
          name: "INSPECTION",
          title: "INSPECTION",
          body: "Our various products are inspected continuously throughout the manufacturing process by our machine programmers & machine operators.\n\nExperienced quality control engineers/inspectors make a final inspection before dispatched or put into inventory. Our final quality control engineers/inspectors have a combined experience of over 20 years with the company and a thorough knowledge of our manufacturing processes & products."
        }
      ]
    }
  };

  const pieSlices = document.querySelectorAll('.pie-slice-sector');
  const pieCenterHub = document.getElementById('pieCenterHub');
  const pieLegendItems = document.querySelectorAll('.pie-legend-item');
  const cockpitPhaseBadge = document.getElementById('cockpitPhaseBadge');
  const cockpitTopicTitle = document.getElementById('cockpitTopicTitle');
  const cockpitTopicSub = document.getElementById('cockpitTopicSub');
  const cockpitBodyNarrative = document.getElementById('cockpitBodyNarrative');
  const cockpitSubmenusList = document.getElementById('cockpitSubmenusList');
  const cockpitSectionJump = document.getElementById('cockpitSectionJump');
  const btnLaunchPopup = document.getElementById('btnLaunchPopup');

  // Modal elements
  const processStageModal = document.getElementById('processStageModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalPhaseBadge = document.getElementById('modalPhaseBadge');
  const modalDossierTitle = document.getElementById('modalDossierTitle');
  const modalDossierBody = document.getElementById('modalDossierBody');
  const modalQuoteBtn = document.getElementById('modalQuoteBtn');

  if (pieSlices.length > 0 && cockpitTopicTitle) {
    let currentPhase = 1;
    let currentSubmenuIndex = 0;

    // Global modal trigger callable from cards & buttons
    window.triggerProcessModal = (phaseId, submenuIdx = 0) => {
      currentPhase = phaseId;
      currentSubmenuIndex = submenuIdx;

      const phase = processPhasesData[phaseId];
      if (!phase) return;
      const sub = phase.submenus[submenuIdx] || phase.submenus[0];

      if (modalPhaseBadge) modalPhaseBadge.textContent = `${phase.badge} // ${sub.name}`;
      if (modalDossierTitle) modalDossierTitle.textContent = sub.title;
      if (modalDossierBody) {
        modalDossierBody.textContent = sub.body;
      }
      if (modalQuoteBtn) {
        modalQuoteBtn.setAttribute('href', `contact.html?process=${encodeURIComponent(sub.name)}#quote`);
      }

      if (processStageModal) {
        processStageModal.classList.add('open');
        document.body.classList.add('modal-open');
      }
    };

    const renderCockpit = (phaseId, submenuIdx = 0) => {
      currentPhase = phaseId;
      currentSubmenuIndex = submenuIdx;

      const phase = processPhasesData[phaseId];
      if (!phase) return;

      const activeSubmenu = phase.submenus[submenuIdx] || phase.submenus[0];

      // Update pie slices active state
      pieSlices.forEach(slice => {
        const pNum = Number(slice.dataset.phase);
        slice.classList.toggle('active', pNum === phaseId);
      });

      // Update legend active state
      pieLegendItems.forEach(item => {
        const pNum = Number(item.dataset.phase);
        item.classList.toggle('active', pNum === phaseId);
      });

      // Update Cockpit Meta & Title
      if (cockpitPhaseBadge) cockpitPhaseBadge.textContent = phase.badge;
      if (cockpitTopicTitle) cockpitTopicTitle.textContent = `${phase.name} SUBMENUS`;
      if (cockpitTopicSub) cockpitTopicSub.textContent = `Click any submenu below to popup animated operation dossier (${phase.submenus.length} operations)`;
      if (cockpitBodyNarrative) cockpitBodyNarrative.textContent = activeSubmenu.body;

      if (cockpitSectionJump) {
        cockpitSectionJump.setAttribute('href', `#${phase.sectionId}`);
      }

      // Render interactive submenus list
      if (cockpitSubmenusList) {
        cockpitSubmenusList.innerHTML = phase.submenus
          .map((sub, idx) => `
            <button class="pie-submenu-btn ${idx === submenuIdx ? 'active' : ''}" data-sub-idx="${idx}" type="button">
              <div class="btn-left">
                <span class="btn-num">${sub.num}</span>
                <span class="btn-name">${sub.name}</span>
              </div>
              <span class="btn-popup-tag">Open Popup ↗</span>
            </button>
          `)
          .join('');

        // Attach listeners to newly created submenu buttons
        cockpitSubmenusList.querySelectorAll('.pie-submenu-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sIdx = Number(btn.dataset.subIdx);
            currentSubmenuIndex = sIdx;
            // Update active state in dock
            cockpitSubmenusList.querySelectorAll('.pie-submenu-btn').forEach((b, i) => {
              b.classList.toggle('active', i === sIdx);
            });
            if (cockpitBodyNarrative) {
              cockpitBodyNarrative.textContent = phase.submenus[sIdx].body;
            }
            // Trigger animated popup immediately as requested
            window.triggerProcessModal(currentPhase, sIdx);
          });
        });
      }
    };

    // Attach click and hover events to 4 Pie Slices
    pieSlices.forEach(slice => {
      slice.addEventListener('click', () => {
        const pId = Number(slice.dataset.phase);
        renderCockpit(pId, 0);
      });
      slice.addEventListener('mouseenter', () => {
        if (window.innerWidth > 960) {
          const pId = Number(slice.dataset.phase);
          renderCockpit(pId, 0);
        }
      });
    });

    // Attach click to Legend items
    pieLegendItems.forEach(item => {
      item.addEventListener('click', () => {
        const pId = Number(item.dataset.phase);
        renderCockpit(pId, 0);
      });
    });

    // Modal Popup Opener & Closer
    const openDeepDiveModal = () => {
      window.triggerProcessModal(currentPhase, currentSubmenuIndex);
    };

    const closeDeepDiveModal = () => {
      if (processStageModal) {
        processStageModal.classList.remove('open');
        document.body.classList.remove('modal-open');
      }
    };

    if (btnLaunchPopup) {
      btnLaunchPopup.addEventListener('click', openDeepDiveModal);
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeDeepDiveModal);
    }

    if (processStageModal) {
      processStageModal.addEventListener('click', (e) => {
        if (e.target === processStageModal) closeDeepDiveModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && processStageModal && processStageModal.classList.contains('open')) {
        closeDeepDiveModal();
      }
    });

    // Initialize Default Phase: Phase 1 (Product Development, sub-index 0)
    renderCockpit(1, 0);
  }


  // 15. Sequential Operations Command Terminal Controller (Non-Card UI)
  const rosterTerminalData = {
    1: {
      stationNum: "01",
      stationName: "PRODUCT DEVELOPMENT",
      stationTag: "ENGINEERING PLANNING",
      themeColor: "#3b82f6",
      protocolCode: "STN-01 // AUDIT",
      protocolSpecs: [
        { label: "Engineering Lead", val: "55+ Yrs Combined Experience" },
        { label: "Dispatch Readiness", val: "Immediate Stock / Fast-Track" },
        { label: "OEM Blueprint Review", val: "100% CAD Compliance" },
        { label: "Reverse-Eng Protocol", val: "Full Pitch & Tooth Re-Calc" }
      ],
      ops: [
        {
          id: "1-1",
          num: "01.1",
          name: "Dedicated Warehouse Facility",
          badge: "IN-HOUSE STOCK",
          title: "Dedicated Plant Warehouse Facility",
          sub: "Storage of Finished & Semi-Finished Goods Ready for Immediate Delivery",
          body: "Our plant includes substantial warehouse space dedicated to storage of finished and semi-finished goods available for immediate delivery, or customization in our machine shop.",
          bullets: [
            "Immediate Stock Dispatch Readiness",
            "Semi-Finished Gear Blanks Inventory",
            "Rapid Machine Shop Customization",
            "Vast Warehouse Footprint in Makarpura GIDC"
          ],
          params: [
            { title: "Storage Scope", val: "Finished & Semi-Finished" },
            { title: "Delivery Speed", val: "Immediate Dispatch" },
            { title: "Adaptation", val: "In-House Machine Shop" },
            { title: "Facility Location", val: "Vadodara Plant Hub" }
          ]
        },
        {
          id: "1-2",
          num: "01.2",
          name: "Sample Identification & Reverse-Eng.",
          badge: "REVERSE-ENG",
          title: "Sample Identification & Reverse-Engineering",
          sub: "Re-Creating Worn or Broken Gears of Unknown Specification",
          body: "We work with customers daily to identify different types of Gears (Spur Gears, Helical Gears, Change Gears, Sprockets Gears, Miter Gears, Worm Wheel, Worm Shaft, Straight Bevel Gears, Spiral Bevel Gears, Herringbone Gears, Timing Pulleys, Rack & Pinion etc) & Gear Boxes that are worn out or broken due to some other reason which are of unknown specification. Our experts use their extensive knowledge of the technical geometry & specification to manufacture the products, along with sophisticated measuring and calculation methods. This allows customers to obtain replacement parts where they might have had to replace entire gear boxes, gears, shafts, mechanical systems, or even an entire machine.",
          bullets: [
            "Technical Geometry Reverse Calculation",
            "Obsolete & Unknown OEM Profiles Replicated",
            "Prevents Replacing Entire Machines or Gearboxes",
            "15+ Gear Families Accurately Reconstructed"
          ],
          params: [
            { title: "Gear Families", val: "Spur, Helical, Bevel, Worm, Rack" },
            { title: "Methodology", val: "Sophisticated Geometry Measurement" },
            { title: "Cost Benefit", val: "Avoids Entire Machine Replacement" },
            { title: "Fitment", val: "100% Interchangeable with OEM" }
          ]
        },
        {
          id: "1-3",
          num: "01.3",
          name: "Customer Drawings & Cross-Industry OEM",
          badge: "OEM DRAWINGS",
          title: "Customer Drawings & Cross-Industry OEM Supply",
          sub: "Precision Gear Manufacturing from Client Blueprints & Specifications",
          body: "WE ALSO WORK WITH THE DRAWINGS PROVIDED BY THE CUSTOMER AND ARE OEM TO VARIOUS INDUSTRIES IN VARIETY OF FIELDS SUCH AS MACHINE MANUFACTURING INDUSTRIES, CHEMICAL INDUSTRIES, PACKAGING INDUSTRIES, AGRICULTURE INDUSTRIES, TEXTILE INDUSTRIES, RAILWAYS, CRANE MFG. INDUSTRIES, AUTOMOBILE INDUSTRIES ETC.",
          bullets: [
            "OEM Approved Direct Supplier",
            "Machine Manufacturing & Chemical Industries",
            "Railways, Heavy Cranes & Automobiles",
            "Packaging, Agriculture & Textile Plants"
          ],
          params: [
            { title: "Input Format", val: "CAD Drawings / Blueprints" },
            { title: "Industry Reach", val: "8+ Critical Sectors" },
            { title: "OEM Status", val: "Certified Tier-1 / Direct Supplier" },
            { title: "Compliance", val: "National & Global Standards" }
          ]
        },
        {
          id: "1-4",
          num: "01.4",
          name: "Development & Management (55+ Yrs)",
          badge: "55-YR CAD",
          title: "Development & Management (55+ Years Combined)",
          sub: "Engineering Review, Work Instructions & CAD Job Cards for Repeatability",
          body: "When an order is placed with our company, firstly it is reviewed and planned by a team of individuals with combined Nirala Engineers experience of over 55 years. Work instructions, operator setting (job card) and detailed CAD drawings are produced to aid manufacturing personnel in producing high quality products with repeatability.",
          bullets: [
            "Over 55 Years Combined Engineering Experience",
            "Detailed CAD Drawings for Machine Operators",
            "Formalized Operator Settings (Job Cards)",
            "Guaranteed Batch-to-Batch Repeatability"
          ],
          params: [
            { title: "Experience", val: "55+ Years Combined Team" },
            { title: "Planning Tool", val: "Detailed CAD & Job Cards" },
            { title: "Quality Goal", val: "High Quality Repeatability" },
            { title: "Protocol", val: "Formal Work Instructions" }
          ]
        }
      ]
    },
    2: {
      stationNum: "02",
      stationName: "RAW MATERIAL PREPARATION",
      stationTag: "CUTTING & WELDING",
      themeColor: "#f59e0b",
      protocolCode: "STN-02 // ALLOY",
      protocolSpecs: [
        { label: "Bandsaw Fleet", val: "3× Heavy In-House Cutters" },
        { label: "Material Billets", val: "EN353, EN24, 8620, Forged Rods" },
        { label: "Cut Kerf Accuracy", val: "Perpendicular Low-Kerf Cut" },
        { label: "Weld Standards", val: "Thermal Stress-Relieved Joints" }
      ],
      ops: [
        {
          id: "2-1",
          num: "02.1",
          name: "Bandsaw & Hacksaw Rod Cutting",
          badge: "3× BANDSAWS",
          title: "3× Bandsaw Machines & In-House Rod Cutting",
          sub: "100% In-House Billet Preparation from Heavy Alloy Rods",
          body: "WE ARE EQUIPPED WITH 3 BANDSAW MACHINES. RAW MATERIAL CUTTING FROM THE ROD ACCORDING TO THE REQUIREMENT IS DONE COMPLETELY INHOUSE.",
          bullets: [
            "Equipped with 3 Heavy Bandsaw Cutting Machines",
            "100% In-House Billet Slicing & Preparation",
            "Round Bars, Billets & Forged Alloy Rods",
            "Clean Perpendicular Cuts with Minimal Kerf"
          ],
          params: [
            { title: "Machinery", val: "3× Heavy Bandsaw Cutters" },
            { title: "Location", val: "100% Handled In-House" },
            { title: "Materials", val: "EN353, EN24, 8620, Forged Rods" },
            { title: "Execution", val: "Custom Cut Length per Job Card" }
          ]
        },
        {
          id: "2-2",
          num: "02.2",
          name: "Welding & Tooth Reconstruction",
          badge: "WELD REPAIR",
          title: "Welding, Boss Joining & Gear Tooth Reclamation",
          sub: "From Simple Weld Repairs to Advanced Fabricated Assemblies",
          body: "From simple weld jobs (boss welding, repairing gear tooth, etc) to advanced fabricated parts, Nirala Engineers can provide you with a welded product that will fulfill your needs.",
          bullets: [
            "Hub & Boss Joining with High-Penetration Welds",
            "Broken Gear Tooth Build-Up & Reclamation",
            "Heavy Fabricated Gearbox Casings",
            "Pre-Heated & Stress-Relieved Structural Weldments"
          ],
          params: [
            { title: "Weld Scope", val: "Boss Welds, Tooth Repair, Shells" },
            { title: "Integrity", val: "High Tensile Strength Weldments" },
            { title: "Stress Relief", val: "Thermal Normalized Joints" },
            { title: "Application", val: "Custom Assemblies & Overhauls" }
          ]
        }
      ]
    },
    3: {
      stationNum: "03",
      stationName: "PRECISION MACHINING ECOSYSTEM",
      stationTag: "TURNING & GEAR CUTTING",
      themeColor: "#38bdf8",
      protocolCode: "STN-03 // CNC-HPC",
      protocolSpecs: [
        { label: "Machining Fleet", val: "Multi-Axis CNC Lathes & VMCs" },
        { label: "Hobbing Capacity", val: "Up to 1500mm / 16 Module" },
        { label: "Flank Grinding", val: "DIN Class 5-7 Mirror Accuracy" },
        { label: "Runout Tolerances", val: "Sub-Micron Concentricity" }
      ],
      ops: [
        {
          id: "3-1",
          num: "03.1",
          name: "Modern CNC Turning Centres",
          badge: "CNC TURNING",
          title: "Modern Multi-Axis CNC Turning Centres",
          sub: "All Turning Requirements Handled In-House with Updated Market Tooling",
          body: "Our CNC turning centres are modern and toolings are updated according to the market. All turning requirements are handled in-house for maximum control of production and quality. Our CNC machine tools utilize state-of-the-art programming providing efficiency, versatility and accuracy.",
          bullets: [
            "Modern Multi-Axis CNC Turning Centres",
            "Constantly Updated Market Tooling Packages",
            "100% In-House Turning Operations for Total QA",
            "State-of-the-Art Programming for Efficiency & Precision"
          ],
          params: [
            { title: "Equipment", val: "Modern CNC Turning Centres" },
            { title: "Tolerance", val: "±0.005mm Profile Turning" },
            { title: "Tooling", val: "Updated Carbide & Ceramic Inserts" },
            { title: "Operation", val: "Facing, Boring, Contouring, Grooving" }
          ]
        },
        {
          id: "3-2",
          num: "03.2",
          name: "Gear Cutting & Hobbing (Heritage 1961)",
          badge: "1961 ROOTS",
          title: "Gear Cutting, Hobbing, Shaping & Generating (Since 1961)",
          sub: "Six Decades of Transmission Craft Expanded Across Key Milestones",
          body: "Nirala Engineers began manufacturing gears in the mid-1960’s and started supply in 1961. That tradition expanded substantially when Nirala Engineers expanded its product range to custom-built gearboxes in 1990, further expanded to import substitute complex CNC turned components in 2006 and to CCTV surveillance systems, biometric systems & home automation in 2015. Today the firm is among the most experienced and capable gear manufacturers in India with a vision to expand across the globe. Virtually every employee is involved in manufacturing world-class products. Our gear cutting capabilities are very diverse: Spur, Helical, Change, Sprockets, Miter, Worm Wheel, Worm Shaft, Straight Bevel, Spiral Bevel, Herringbone, Timing Pulleys, Rack & Pinion, Idler Gears. Manual as well as automatic machines for hobbing, shaping, generating, grinding in-house. Broad inventory covering Diametrical (Normal & Transverse), Circular, AGMA & Fellows Stub, and Metric Pitches.",
          bullets: [
            "Started Supply in 1961 · Over 6 Decades of Mastery",
            "Custom Gearboxes (1990) · CNC Import Substitution (2006)",
            "Manual & Automatic Hobbing, Shaping & Generating",
            "Comprehensive Diametral, Circular, AGMA, Fellows & Metric Tooling"
          ],
          params: [
            { title: "Gear Spectrum", val: "Spur, Helical, Bevel, Worm, Herringbone" },
            { title: "Pitch Range", val: "Diametral, Circular, Metric, Fellows" },
            { title: "Standards", val: "DIN Class 6-8, AGMA Compliant" },
            { title: "Generations", val: "Mid-1960s to Present Global Reach" }
          ]
        },
        {
          id: "3-3",
          num: "03.3",
          name: "Milling, Drilling & VMC Collaboration",
          badge: "VMC MILLS",
          title: "Milling, Drilling & VMC Machining Collaboration",
          sub: "Setup for Quick Turn-Around Short Runs & Medium Quantity Orders",
          body: "Substantial milling equipment are available for meeting special machining needs of our customers. We have collaboration with vendors having DRO milling machines, mechanical mill and VMC machines with extensive capabilities. We have our machine shop set up for both quick turn-around, short run jobs, as well as medium quantity production orders. Extensive drilling & tapping machinery with trained employees are available in-house for all your drilling and tapping needs.",
          bullets: [
            "Substantial In-House Milling & Mechanical Equipment",
            "DRO Milling & High-Speed VMC Vendor Collaboration",
            "Optimized for Both Quick Short Runs & Batch Orders",
            "Extensive In-House Drilling & Tapping Machinery"
          ],
          params: [
            { title: "Milling Setup", val: "DRO Mills, Mechanical & VMCs" },
            { title: "Batch Flexibility", val: "Short-Run Quick Turn to Production" },
            { title: "Drilling Shop", val: "Multi-Spindle In-House Tapping" },
            { title: "Workforce", val: "Trained Machinists & Operators" }
          ]
        },
        {
          id: "3-4",
          num: "03.4",
          name: "Keyway Cutting & Spline Broaching",
          badge: "BROACHING",
          title: "Keyway Cutting, Spline Broaching & Shaft Mounting",
          sub: "Final Preparations of Gears with Straight & Tapered Turning",
          body: "Final preparations of gears for shaft mounting are made here. Keyway cutting, spline broaching, and grub screw drilling capabilities are available. CNC and mechanical lathes provide straight and tapered OD and ID turning. Please inquire for specific requirements.",
          bullets: [
            "Shaft Mounting Keyway Slotting to Strict Width Limits",
            "Internal Involute & Parallel Spline Broaching",
            "Grub Screw Radial Drilling & Precision Tapping",
            "Straight & Tapered OD/ID Bore Turning on Lathes"
          ],
          params: [
            { title: "Keyways", val: "Single & Double Parallel / Tapered" },
            { title: "Broaching", val: "Internal Involute & Multi-Spline" },
            { title: "Retention", val: "Grub Screw Threading & Pin Holes" },
            { title: "Shaft Fitting", val: "Interference / Transition H7/k6" }
          ]
        },
        {
          id: "3-5",
          num: "03.5",
          name: "Certified Heat Treatment Partnerships",
          badge: "58-62 HRC",
          title: "Certified Metallurgical Heat Treatment Partnerships",
          sub: "Hardening, Gas Carburizing (58-62 HRC), Tempering, Normalizing & Annealing",
          body: "We have tie up with various heat treatment agencies/companies which are well equipped with extensive heat treatment equipment and experience. They provide excellent quality by hardening our gears. Heat treatment of ferrous metals such as hardening, tempering, annealing, normalizing, case hardening & Heat treatment of non-ferrous metals such as annealing & solution heat treatment can be provided through cooperation with outside sources/vendors.",
          bullets: [
            "Tie-Up with Specialized & Well-Equipped Thermal Plants",
            "Gas Carburizing to Optimal 58-62 HRC Surface Hardness",
            "Ferrous Hardening, Tempering, Normalizing & Annealing",
            "Non-Ferrous Annealing & Solution Heat Treatment"
          ],
          params: [
            { title: "Case Hardness", val: "58 to 62 HRC Carburized" },
            { title: "Core Toughness", val: "High Impact Ductility Retained" },
            { title: "Atmosphere", val: "Sealed Controlled Gas Furnaces" },
            { title: "Certification", val: "Full Micro-Structure & Case Depth Cert" }
          ]
        },
        {
          id: "3-6",
          num: "03.6",
          name: "Tooth Flank & Precision OD/ID Grinding",
          badge: "MICRON GRIND",
          title: "Tooth Flank & Precision OD/ID Grinding Collaboration",
          sub: "Unparalleled Accuracy on Straightness, Diameter, Roundness & Concentricity",
          body: "In addition to our gear tooth grinding abilities we also have collaboration with different companies who have substantial experience and ability with grinding other surfaces such as precision OD/ID grinding, surface grinding and honing. These companies have experience which provides us unparalleled accuracy on straightness, diameter, roundness, concentricity and surface finish.",
          bullets: [
            "CNC Profile Gear Tooth Flank Grinding to DIN Class 5",
            "Precision Cylindrical OD & Bore ID Grinding",
            "Precision Surface Grinding & Mirror Honing",
            "Unparalleled Straightness, Roundness & Concentricity"
          ],
          params: [
            { title: "Tooth Flank", val: "CNC Profil-Ground Mirror Finish" },
            { title: "Cylindrical", val: "Precision OD/ID Bearing Seats" },
            { title: "Geometric Accuracy", val: "Sub-Micron Runout & Concentricity" },
            { title: "Acoustics", val: "Whisper-Quiet Mesh Under Load" }
          ]
        }
      ]
    },
    4: {
      stationNum: "04",
      stationName: "DEBURRING, FINISHING & AESTHETICS",
      stationTag: "SURFACE PROTECTION",
      themeColor: "#eab308",
      protocolCode: "STN-04 // FINISH",
      protocolSpecs: [
        { label: "Burr Removal", val: "100% Hand-Checked De-Notching" },
        { label: "Traceability Marking", val: "Part Number & Company Logo" },
        { label: "Surface Treatment", val: "Sandblast Matte / Chemical Black" },
        { label: "Corrosion Shield", val: "Preservation Anti-Rust Film" }
      ],
      ops: [
        {
          id: "4-1",
          num: "04.1",
          name: "Deburring, Sandblasting & Coating",
          badge: "COATING",
          title: "Deburring, Edge Radiusing, Sandblasting & Rust Coating",
          sub: "Comprehensive Finishing Correlating with Quality, Innovation & Trust",
          body: "Aesthetics plays a crucial role in the perception of the product which directly associate with the overall satisfaction of a customer & it also substantiate the innovation, quality and reliability of the product. In the final manufacturing process, Removal of machining burrs & edges, marking of part numbers & company logo (both standard and customer specified) , sandblasting, blackening, cleaning & coating of parts for rust protection and various other mid-process and final finishing operations are carried out.",
          bullets: [
            "Meticulous Removal of Machining Burrs & Sharp Edges",
            "Part Number & Company Logo Marking (Standard & Customer)",
            "Uniform Sandblasting & Chemical Blackening",
            "Corrosion-Inhibiting Cleaning & Anti-Rust Coating"
          ],
          params: [
            { title: "Burr Removal", val: "100% Handled & De-Notched" },
            { title: "Identification", val: "Part Number & Logo Engraved" },
            { title: "Surface Finish", val: "Sandblasted Matte / Blackened" },
            { title: "Preservation", val: "Long-Life Anti-Rust Film" }
          ]
        },
        {
          id: "4-2",
          num: "04.2",
          name: "Upfront Aesthetic Engineering",
          badge: "AESTHETICS",
          title: "Upfront Aesthetic Engineering Philosophy",
          sub: "Keeping Product Aesthetics in Mind Right from the Initial Stage",
          body: "We at Nirala Engineers, right from the initial stage of development keep in mind the product aesthetics and work towards achieving it. Superior visual aesthetics guarantees our clients world-class gear presentation and flawless mechanical meshing free of stress-concentrating sharp notches.",
          bullets: [
            "Aesthetic Criteria Baked into CAD & Tooling Design",
            "Smooth Transitions Preventing Notch-Stress Cracking",
            "World-Class Export Standard Gear Appearance",
            "Direct Enhancement of Customer Perception & Reliability"
          ],
          params: [
            { title: "Philosophy", val: "Upfront Aesthetic Planning" },
            { title: "Functional Value", val: "Notch-Free Stress Relief" },
            { title: "Customer Trust", val: "Substantiates Engineering Quality" },
            { title: "Dispatch Standard", val: "Flawless Visual Presentation" }
          ]
        }
      ]
    },
    5: {
      stationNum: "05",
      stationName: "QUALITY & INSPECTION ASSURANCE",
      stationTag: "INSPECTION PROTOCOL",
      themeColor: "#34d399",
      protocolCode: "STN-05 // QC-20YR",
      protocolSpecs: [
        { label: "Chief Inspectors", val: "Senior QC (20+ Yrs Experience)" },
        { label: "In-Process Checks", val: "Continuous Programmers & Operators" },
        { label: "Metrology Gauging", val: "Micrometers, Verniers & Bore Gauges" },
        { label: "Dispatch Signoff", val: "Certified 100% Zero-Defect Gearing" }
      ],
      ops: [
        {
          id: "5-1",
          num: "05.1",
          name: "Continuous In-Process Inspection",
          badge: "IN-PROCESS",
          title: "Continuous In-Process Machine Inspection",
          sub: "Conducted Continuously by Machine Programmers & Operators",
          body: "Our various products are inspected continuously throughout the manufacturing process by our machine programmers & machine operators. Constant micrometer, vernier, and profile checks prevent deviations at the turning and hobbing stages.",
          bullets: [
            "Continuous In-Line Checking by Programmers & Operators",
            "Mid-Process Tolerance & Center Distance Verification",
            "Tool Wear Offset Adjustments in Real-Time",
            "Zero-Defect Prevention Prior to Next Station"
          ],
          params: [
            { title: "Inspectors", val: "Programmers & Machine Operators" },
            { title: "Frequency", val: "Continuous Throughout Machining" },
            { title: "Gauging", val: "Micrometers, Verniers, Bore Gauges" },
            { title: "Objective", val: "Immediate Deviation Correction" }
          ]
        },
        {
          id: "5-2",
          num: "05.2",
          name: "Final QC Assurance (20+ Years Experience)",
          badge: "20+ YR QC",
          title: "Final QC Assurance by Veteran Inspectors (20+ Years)",
          sub: "Rigorous Pre-Dispatch Verification by Dedicated Senior QC Engineers",
          body: "Experienced quality control engineers/inspectors make a final inspection before dispatched or put into inventory. Our final quality control engineers/inspectors have a combined experience of over 20 years with the company and a thorough knowledge of our manufacturing processes & products.",
          bullets: [
            "Senior Inspectors with Over 20 Years Company Experience",
            "Thorough In-Depth Knowledge of Products & Gear Dynamics",
            "Full Pitch, Flank Roll, Runout & Dimension Verification",
            "Formal Pre-Dispatch Signoff & Inventory Quality Clearance"
          ],
          params: [
            { title: "Inspectors", val: "QC Engineers (20+ Yrs Experience)" },
            { title: "Timing", val: "Prior to Dispatch or Inventory Entry" },
            { title: "Knowledge", val: "Deep Mastery of Gear Dynamics" },
            { title: "Output", val: "Certified Zero-Defect Gearing" }
          ]
        }
      ]
    }
  };

  const pipelineStationBtns = document.querySelectorAll('.pipeline-station-pill');
  const railHeaderTitle = document.getElementById('railHeaderTitle');
  const rosterSpectrumList = document.getElementById('rosterSpectrumList');
  const protocolStationCode = document.getElementById('protocolStationCode');
  const protocolSpecsGrid = document.getElementById('protocolSpecsGrid');
  const rosterStationChip = document.getElementById('rosterStationChip');
  const rosterOpTitle = document.getElementById('rosterOpTitle');
  const rosterOpSubtitle = document.getElementById('rosterOpSubtitle');
  const rosterOpBody = document.getElementById('rosterOpBody');
  const rosterParamMatrix = document.getElementById('rosterParamMatrix');
  const rosterBulletsStrip = document.getElementById('rosterBulletsStrip');
  const rosterPrevBtn = document.getElementById('rosterPrevBtn');
  const rosterNextBtn = document.getElementById('rosterNextBtn');
  const rosterCtaBtn = document.getElementById('rosterCtaBtn');
  const rosterConsoleStage = document.querySelector('.roster-screen-console');

  if (pipelineStationBtns.length > 0 && rosterOpTitle) {
    let activeStationNum = 1;
    let activeOpIndex = 0;

    const renderRosterStage = (stNum, opIdx = 0) => {
      activeStationNum = stNum;
      activeOpIndex = opIdx;

      const station = rosterTerminalData[stNum];
      if (!station) return;

      const op = station.ops[opIdx] || station.ops[0];

      // Update Pipeline station buttons
      pipelineStationBtns.forEach(btn => {
        const sId = Number(btn.dataset.station);
        btn.classList.toggle('active', sId === stNum);
      });

      // Update Rail Header
      if (railHeaderTitle) {
        railHeaderTitle.textContent = `STATION ${station.stationNum} // ${station.stationTag}`;
      }

      // Render Left Rail Spectrum Items
      if (rosterSpectrumList) {
        rosterSpectrumList.innerHTML = station.ops
          .map((item, idx) => `
            <div class="roster-spectrum-item ${idx === opIdx ? 'active' : ''}" data-op-idx="${idx}">
              <div class="item-left">
                <span class="item-code">${item.num}</span>
                <span>${item.name}</span>
              </div>
              <span class="item-tag-badge">${item.badge}</span>
            </div>
          `)
          .join('');

        // Attach listeners to newly rendered items
        rosterSpectrumList.querySelectorAll('.roster-spectrum-item').forEach(row => {
          row.addEventListener('click', () => {
            const idx = Number(row.dataset.opIdx);
            renderRosterStage(activeStationNum, idx);
          });
          row.addEventListener('mouseenter', () => {
            if (window.innerWidth > 960) {
              const idx = Number(row.dataset.opIdx);
              renderRosterStage(activeStationNum, idx);
            }
          });
        });
      }

      // Update Station Protocol Specification Box on left rail
      if (protocolStationCode && station.protocolCode) {
        protocolStationCode.textContent = station.protocolCode;
      }
      if (protocolSpecsGrid && station.protocolSpecs) {
        protocolSpecsGrid.innerHTML = station.protocolSpecs
          .map(spec => `
            <div class="protocol-spec-row">
              <span class="spec-k">${spec.label}</span>
              <span class="spec-v">${spec.val}</span>
            </div>
          `)
          .join('');
      }

      // Update Right Telemetry Screen Console
      if (rosterStationChip) rosterStationChip.textContent = `STATION ${op.num} // ${op.badge}`;
      if (rosterOpTitle) rosterOpTitle.textContent = op.title;
      if (rosterOpSubtitle) rosterOpSubtitle.textContent = op.sub;
      if (rosterOpBody) rosterOpBody.textContent = op.body;

      if (rosterParamMatrix) {
        rosterParamMatrix.innerHTML = op.params
          .map(p => `
            <div class="roster-param-cell">
              <span class="p-title">${p.title}</span>
              <span class="p-val">${p.val}</span>
            </div>
          `)
          .join('');
      }

      if (rosterBulletsStrip) {
        rosterBulletsStrip.innerHTML = op.bullets
          .map(b => `
            <div class="roster-bullet-item">
              <span class="b-icon">✔</span>
              <span>${b}</span>
            </div>
          `)
          .join('');
      }

      if (rosterCtaBtn) {
        rosterCtaBtn.setAttribute('href', `contact.html?capability=${encodeURIComponent(op.name)}#quote`);
      }

      // Re-trigger smooth stage entrance animation
      if (rosterConsoleStage) {
        rosterConsoleStage.classList.remove('stage-active-pulse');
        void rosterConsoleStage.offsetWidth; // Force CSS reflow
        rosterConsoleStage.classList.add('stage-active-pulse');
      }
    };

    // Attach click to 5 station pills
    pipelineStationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sNum = Number(btn.dataset.station);
        renderRosterStage(sNum, 0);
      });
    });

    // Step Stepper Navigation
    if (rosterPrevBtn) {
      rosterPrevBtn.addEventListener('click', () => {
        const station = rosterTerminalData[activeStationNum];
        if (activeOpIndex > 0) {
          renderRosterStage(activeStationNum, activeOpIndex - 1);
        } else if (activeStationNum > 1) {
          const prevSt = activeStationNum - 1;
          const prevLen = rosterTerminalData[prevSt].ops.length;
          renderRosterStage(prevSt, prevLen - 1);
        }
      });
    }

    if (rosterNextBtn) {
      rosterNextBtn.addEventListener('click', () => {
        const station = rosterTerminalData[activeStationNum];
        if (activeOpIndex < station.ops.length - 1) {
          renderRosterStage(activeStationNum, activeOpIndex + 1);
        } else if (activeStationNum < 5) {
          renderRosterStage(activeStationNum + 1, 0);
        }
      });
    }

    // Initialize Station 1, Operation 0
    renderRosterStage(1, 0);
  }

  // ==========================================
  // Process Hero Banner Cinematic Video Controller
  // ==========================================
  const processMediaContainer = document.getElementById('processMediaContainer');
  const processHeroVideo = document.getElementById('processHeroVideo');
  const processAudioBtn = document.getElementById('processAudioBtn');
  const processAudioIcon = document.getElementById('processAudioIcon');
  const processAudioText = document.getElementById('processAudioText');
  const processPlayBtn = document.getElementById('processPlayBtn');
  const processPlayIcon = document.getElementById('processPlayIcon');
  const processPlayText = document.getElementById('processPlayText');
  const processFullscreenBtn = document.getElementById('processFullscreenBtn');

  if (processHeroVideo) {
    // Audio Toggle (Unmute / Mute)
    if (processAudioBtn) {
      processAudioBtn.addEventListener('click', () => {
        if (processHeroVideo.muted) {
          processHeroVideo.muted = false;
          if (processAudioIcon) processAudioIcon.textContent = '🔊';
          if (processAudioText) processAudioText.textContent = 'Mute';
          processAudioBtn.classList.add('is-unmuted');
        } else {
          processHeroVideo.muted = true;
          if (processAudioIcon) processAudioIcon.textContent = '🔇';
          if (processAudioText) processAudioText.textContent = 'Unmute';
          processAudioBtn.classList.remove('is-unmuted');
        }
      });
    }

    // Play / Pause Toggle
    if (processPlayBtn) {
      processPlayBtn.addEventListener('click', () => {
        if (processHeroVideo.paused) {
          processHeroVideo.play();
          if (processPlayIcon) processPlayIcon.textContent = '⏸';
          if (processPlayText) processPlayText.textContent = 'Pause';
        } else {
          processHeroVideo.pause();
          if (processPlayIcon) processPlayIcon.textContent = '▶';
          if (processPlayText) processPlayText.textContent = 'Play';
        }
      });

      processHeroVideo.addEventListener('play', () => {
        if (processPlayIcon) processPlayIcon.textContent = '⏸';
        if (processPlayText) processPlayText.textContent = 'Pause';
      });

      processHeroVideo.addEventListener('pause', () => {
        if (processPlayIcon) processPlayIcon.textContent = '▶';
        if (processPlayText) processPlayText.textContent = 'Play';
      });
    }

    // Fullscreen Toggle
    if (processFullscreenBtn && processMediaContainer) {
      processFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (processMediaContainer.requestFullscreen) {
            processMediaContainer.requestFullscreen();
          } else if (processHeroVideo.requestFullscreen) {
            processHeroVideo.requestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }
  }

  // ==========================================
  // Revamped Contact Page & RFQ Studio Controller
  // ==========================================
  const rfqForm = document.getElementById('rfqForm');
  if (rfqForm) {
    const hudComponent = document.getElementById('hudComponent');
    const hudMaterial = document.getElementById('hudMaterial');
    const hudHeatTreat = document.getElementById('hudHeatTreat');
    const hudQuantity = document.getElementById('hudQuantity');
    const rfqNotes = document.getElementById('rfqNotes');
    const fileDropzone = document.getElementById('fileDropzone');
    const rfqFileInput = document.getElementById('rfqFileInput');
    const browseFilesBtn = document.getElementById('browseFilesBtn');
    const attachedFilesList = document.getElementById('attachedFilesList');
    const rfqSuccessModal = document.getElementById('rfqSuccessModal');
    const closeRfqModalBtn = document.getElementById('closeRfqModalBtn');
    const rfqTicketRef = document.getElementById('rfqTicketRef');
    const modalForwardWhatsappBtn = document.getElementById('modalForwardWhatsappBtn');
    const rfqSubmitBtn = document.getElementById('rfqSubmitBtn');
    const rfqSpinner = document.getElementById('rfqSpinner');
    const rfqBtnText = document.getElementById('rfqBtnText');

    let currentSelection = {
      component: 'Helical Gear',
      material: '20MnCr5 (Case Hardening)',
      heattreat: 'Case Hardening 58-62 HRC',
      quantity: '20 - 100 Pcs (Batch)'
    };

    // Generic Chip Group Click Handler
    function setupChipGroup(groupId, hudElement, paramKey) {
      const container = document.getElementById(groupId);
      if (!container) return;
      const chips = container.querySelectorAll('.param-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const val = chip.getAttribute('data-value') || chip.textContent.trim();
          currentSelection[paramKey] = val;
          if (hudElement) {
            hudElement.textContent = val;
          }
        });
      });
    }

    setupChipGroup('componentChipGroup', hudComponent, 'component');
    setupChipGroup('materialChipGroup', hudMaterial, 'material');
    setupChipGroup('heatTreatChipGroup', hudHeatTreat, 'heattreat');
    setupChipGroup('quantityChipGroup', hudQuantity, 'quantity');

    // Quick Technical Tags Injection
    const quickTagBtns = document.querySelectorAll('.quick-tag-btn');
    quickTagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const insertText = btn.getAttribute('data-insert');
        if (rfqNotes && insertText) {
          const val = rfqNotes.value;
          const separator = val.length > 0 && !val.endsWith('\n') ? '\n' : '';
          rfqNotes.value = val + separator + insertText;
          rfqNotes.focus();
        }
      });
    });

    // File Upload & Drag-and-Drop
    let uploadedFiles = [];

    function renderFilesList() {
      if (!attachedFilesList) return;
      attachedFilesList.innerHTML = '';
      uploadedFiles.forEach((file, index) => {
        const chip = document.createElement('div');
        chip.className = 'file-item-chip';
        const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
        chip.innerHTML = `<span>📎 ${file.name} (${sizeStr})</span>`;
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'file-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove file';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          uploadedFiles.splice(index, 1);
          renderFilesList();
        });
        chip.appendChild(removeBtn);
        attachedFilesList.appendChild(chip);
      });
    }

    if (browseFilesBtn && rfqFileInput) {
      browseFilesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        rfqFileInput.click();
      });
    }

    if (rfqFileInput) {
      rfqFileInput.addEventListener('change', (e) => {
        if (e.target.files) {
          Array.from(e.target.files).forEach(file => uploadedFiles.push(file));
          renderFilesList();
        }
      });
    }

    if (fileDropzone) {
      fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropzone.classList.add('drag-over');
      });
      fileDropzone.addEventListener('dragleave', () => {
        fileDropzone.classList.remove('drag-over');
      });
      fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropzone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) {
          Array.from(e.dataTransfer.files).forEach(file => uploadedFiles.push(file));
          renderFilesList();
        }
      });
    }

    // RFQ Form Submission
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const compName = document.getElementById('rfqCompanyName').value.trim();
      const personName = document.getElementById('rfqContactPerson').value.trim();
      const phone = document.getElementById('rfqPhone').value.trim();

      if (rfqSpinner) rfqSpinner.style.display = 'inline-block';
      if (rfqBtnText) rfqBtnText.textContent = 'Transmitting Specifications to Vadodara Plant...';
      if (rfqSubmitBtn) rfqSubmitBtn.disabled = true;

      setTimeout(() => {
        if (rfqSpinner) rfqSpinner.style.display = 'none';
        if (rfqBtnText) rfqBtnText.textContent = 'Transmit Technical RFQ to Vadodara Plant';
        if (rfqSubmitBtn) rfqSubmitBtn.disabled = false;

        const randomRef = 'NE-RFQ-2026-' + Math.floor(1000 + Math.random() * 9000);
        if (rfqTicketRef) rfqTicketRef.textContent = randomRef;

        const whatsappMsg = `Hello Nirala Engineers Vadodara, I have submitted an RFQ (${randomRef}) on your portal.%0A` +
          `*Company:* ${encodeURIComponent(compName)}%0A` +
          `*Contact:* ${encodeURIComponent(personName)} (${encodeURIComponent(phone)})%0A` +
          `*Component:* ${encodeURIComponent(currentSelection.component)}%0A` +
          `*Material:* ${encodeURIComponent(currentSelection.material)}%0A` +
          `*Heat Treat:* ${encodeURIComponent(currentSelection.heattreat)}%0A` +
          `*Quantity:* ${encodeURIComponent(currentSelection.quantity)}%0A` +
          `Please confirm receipt and estimated turnaround.`;

        if (modalForwardWhatsappBtn) {
          modalForwardWhatsappBtn.href = `https://wa.me/917991991055?text=${whatsappMsg}`;
        }

        if (rfqSuccessModal) {
          rfqSuccessModal.classList.add('show');
          rfqSuccessModal.setAttribute('aria-hidden', 'false');
        }
      }, 900);
    });

    if (closeRfqModalBtn && rfqSuccessModal) {
      closeRfqModalBtn.addEventListener('click', () => {
        rfqSuccessModal.classList.remove('show');
        rfqSuccessModal.setAttribute('aria-hidden', 'true');
      });
      rfqSuccessModal.addEventListener('click', (e) => {
        if (e.target === rfqSuccessModal) {
          rfqSuccessModal.classList.remove('show');
          rfqSuccessModal.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  // Toast Trigger Helper
  function showContactToast(msg) {
    const toast = document.getElementById('contactToast');
    const toastMsg = document.getElementById('contactToastMsg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
  window.showContactToast = showContactToast;

  // Copy-To-Clipboard Buttons
  const copyButtons = document.querySelectorAll('.copy-action, .copy-pill-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showContactToast(`Copied: ${textToCopy}`);
        }).catch(() => {
          showContactToast(`Copied: ${textToCopy}`);
        });
      }
    });
  });

  // ==========================================
  // Product Catalog Interactive Filter & Search & Dynamic Hydration
  // ==========================================
  const productFilterPills = document.querySelectorAll('.product-filter-pill');
  let productCards = document.querySelectorAll('.product-item-card');
  const productSearchInput = document.getElementById('productSearchInput');
  const productCountVal = document.getElementById('productCountVal');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterProductCatalog() {
    let visibleCount = 0;
    const q = searchQuery.toLowerCase().trim();

    productCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = (card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const tags = Array.from(card.querySelectorAll('.stage-tag-pill')).map(t => t.textContent.toLowerCase()).join(' ');

      const matchesCat = (currentCategory === 'all' || category === currentCategory);
      const matchesQuery = !q || title.includes(q) || desc.includes(q) || tags.includes(q);

      if (matchesCat && matchesQuery) {
        card.classList.remove('is-hidden');
        card.classList.add('is-visible');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
        card.classList.remove('is-visible');
      }
    });

    if (productCountVal) {
      productCountVal.textContent = visibleCount;
    }
  }

  if (productCards.length > 0 || document.getElementById('productCardsGrid')) {
    productFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        productFilterPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        currentCategory = pill.getAttribute('data-category') || 'all';
        filterProductCatalog();
      });
    });

    if (productSearchInput) {
      productSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterProductCatalog();
      });
    }

    // Dynamic Backend Hydration (JSON & API)
    async function hydrateProducts() {
      const grid = document.getElementById('productCardsGrid');
      if (!grid) return;

      let list = null;
      if (window.NiralaStorage) {
        try {
          list = await window.NiralaStorage.getProducts();
        } catch (e) {}
      }

      // Prioritize localStorage to see user's latest photo uploads and edits immediately
      if (!list) {
        try {
          const local = localStorage.getItem('nirala_products');
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
          }
        } catch (err) {}
      }

      if (!list) {
        try {
          const res = await fetch('/api/products', { cache: 'no-store' });
          if (res.ok) list = await res.json();
        } catch (err) {}
      }

      if (!list) {
        try {
          const res = await fetch('data/products.json', { cache: 'no-store' });
          if (res.ok) list = await res.json();
        } catch (err) {}
      }

      if (Array.isArray(list) && list.length > 0) {
        grid.innerHTML = list.map((item, index) => {
          const idTag = item.id || '#' + String(index + 1).padStart(2, '0');
          const catLabel = item.categoryLabel || (item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Precision');
          const tagsHtml = (item.tags || []).map(t => `<span class="stage-tag-pill">${t}</span>`).join('\n                ');
          const link = item.link || 'spur-gear.html';
          return `
          <article class="product-item-card reveal" data-category="${item.category || 'cylindrical'}" data-title="${item.title}">
            <div class="product-card-top-bar">
              <span class="product-index-tag">${idTag}</span>
              <span class="product-category-chip">${catLabel}</span>
            </div>
            <div class="product-item-img-wrap">
              <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='images/stage-1-inspection.jpg'" />
            </div>
            <div class="product-item-body">
              <h3>${item.title}</h3>
              <p>${item.description}</p>
              <div class="stage-tags-row">
                ${tagsHtml}
              </div>
              <div class="product-card-actions">
                <a href="${link}" class="product-item-cta">
                  <span>EXPLORE PRODUCT</span>
                  <span class="cta-arrow">→</span>
                </a>
                <a href="contact.html#quote" class="product-quote-cta">Quick RFQ ↗</a>
              </div>
            </div>
          </article>`;
        }).join('\n');

        productCards = document.querySelectorAll('#productCardsGrid .product-item-card');
        filterProductCatalog();
      }
    }

    hydrateProducts();
  }

  // Global Product Gallery Image Switcher
  window.__activeProductGallery = [];

  window.switchMainProductImageByIndex = function(idx) {
    const list = window.__activeProductGallery || [];
    if (list[idx]) {
      const mainImg = document.getElementById('mainProductImg');
      if (mainImg) mainImg.src = list[idx];
      document.querySelectorAll('.product-gallery-thumbs .product-thumb-item').forEach((b, i) => {
        b.classList.toggle('active', i === idx);
      });
    }
  };

  window.switchMainProductImage = function(btn, src) {
    const mainImg = document.getElementById('mainProductImg');
    if (mainImg && src) {
      mainImg.src = src;
    }
    if (btn) {
      const parent = btn.closest('.product-gallery-thumbs');
      if (parent) {
        parent.querySelectorAll('.product-thumb-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
  };

  // Dynamic Product Detail Page Hydration (Spur Gear, Helical Gear, etc.)
  async function hydrateProductDetailPage() {
    const detailGrid = document.querySelector('.product-detail-grid');
    if (!detailGrid) return;

    const currentPath = window.location.pathname.split('/').pop() || 'spur-gear.html';
    
    let list = null;
    if (window.NiralaStorage) {
      try {
        list = await window.NiralaStorage.getProducts();
      } catch (e) {}
    }

    // Prioritize localStorage for instant updates and uploaded photos
    if (!list) {
      try {
        const local = localStorage.getItem('nirala_products');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        }
      } catch (err) {}
    }

    if (!list) {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) list = await res.json();
      } catch (err) {}
    }

    if (!list) {
      try {
        const res = await fetch('data/products.json', { cache: 'no-store' });
        if (res.ok) list = await res.json();
      } catch (err) {}
    }

    if (!Array.isArray(list) || list.length === 0) return;

    // Find matching product by link or filename
    const product = list.find(p => p.link === currentPath || (p.link && currentPath.includes(p.link)));
    if (!product) return;

    // 1. Update Main Product Image
    const mainImg = document.getElementById('mainProductImg');
    if (mainImg && product.image) {
      mainImg.src = product.image;
    }

    // 2. Update Multi-Photo Gallery Thumbnails
    const thumbsContainer = document.querySelector('.product-gallery-thumbs');
    const imagesToUse = (Array.isArray(product.images) && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
    window.__activeProductGallery = imagesToUse;

    if (thumbsContainer && imagesToUse.length > 0) {
      thumbsContainer.innerHTML = imagesToUse.map((imgSrc, idx) => `
        <button type="button" class="product-thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchMainProductImageByIndex(${idx})" onmouseover="switchMainProductImageByIndex(${idx})" title="${product.title} View #${idx + 1}">
          <img src="${imgSrc}" alt="${product.title} Photo #${idx + 1}" onerror="this.onerror=null; this.src='images/stage-1-inspection.jpg'" />
        </button>
      `).join('');
    }

    // 3. Update Specification & Customization Parameters
    const paramsUl = detailGrid.querySelector('.spares-group-card ul');
    if (paramsUl && Array.isArray(product.parameters) && product.parameters.length > 0) {
      paramsUl.innerHTML = product.parameters.map((param, i) => {
        const isLast = (i === product.parameters.length - 1);
        const borderStyle = isLast ? 'padding-bottom: 8px;' : 'border-bottom: 1px solid var(--ink-border); padding-bottom: 10px;';
        return `
          <li style="${borderStyle} display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--gold-light);">${param.key}:</span>
            <span style="color: var(--paper); font-weight: 600;">${param.val}</span>
          </li>`;
      }).join('');
    }

    // 4. Update Official Capability Matrix Table
    const specTable = document.querySelector('.product-spec-table');
    if (specTable && product.matrix) {
      const tbody = specTable.querySelector('tbody');
      if (tbody) {
        const materialsList = (product.matrix.materials || []).map(m => `<li><span class="spec-bullet">•</span> ${m}</li>`).join('');
        tbody.innerHTML = `
          <tr>
            <td class="col-gear">
              <span class="product-spec-gear-name">${product.title.toUpperCase()}</span>
            </td>
            <td class="col-dim"><span class="product-spec-val-text">${product.matrix.dimensions || ''}</span></td>
            <td class="col-pitch"><span class="product-spec-val-text">${(product.matrix.pitchSize || '').replace(/;\s*/g, ';<br>')}</span></td>
            <td class="col-mat">
              ${product.matrix.materialsHeader ? `<div style="font-weight: 600; color: #38bdf8; margin-bottom: 6px;">${product.matrix.materialsHeader}</div>` : ''}
              <ul class="spec-materials-list">
                ${materialsList}
              </ul>
            </td>
          </tr>
        `;
      }
    }
  }

  hydrateProductDetailPage();

  // FAQ Accordion
  const faqAccordion = document.getElementById('faqAccordion');
  if (faqAccordion) {
    const faqItems = faqAccordion.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(other => {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          });
          if (!isActive) {
            item.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // ==========================================
  // Deluxe Gallery Video Theater & Lightbox Controller
  // ==========================================
  const galleryMainVideo = document.getElementById('galleryMainVideo');
  const theaterPlayBtn = document.getElementById('theaterPlayBtn');
  const theaterMuteBtn = document.getElementById('theaterMuteBtn');
  const theaterFullscreenBtn = document.getElementById('theaterFullscreenBtn');
  const mainScreenContainer = document.getElementById('mainScreenContainer');
  const playlistItems = document.querySelectorAll('.playlist-item-card');
  const mainVideoTag = document.getElementById('mainVideoTag');
  const mainVideoDuration = document.getElementById('mainVideoDuration');
  const mainVideoTitle = document.getElementById('mainVideoTitle');
  const mainVideoDesc = document.getElementById('mainVideoDesc');

  if (galleryMainVideo) {
    if (theaterPlayBtn) {
      theaterPlayBtn.addEventListener('click', () => {
        if (galleryMainVideo.paused) {
          galleryMainVideo.play();
          theaterPlayBtn.textContent = '⏸';
          theaterPlayBtn.title = 'Pause Video';
        } else {
          galleryMainVideo.pause();
          theaterPlayBtn.textContent = '▶';
          theaterPlayBtn.title = 'Play Video';
        }
      });

      galleryMainVideo.addEventListener('play', () => {
        theaterPlayBtn.textContent = '⏸';
      });

      galleryMainVideo.addEventListener('pause', () => {
        theaterPlayBtn.textContent = '▶';
      });
    }

    if (theaterMuteBtn) {
      theaterMuteBtn.addEventListener('click', () => {
        galleryMainVideo.muted = !galleryMainVideo.muted;
        theaterMuteBtn.textContent = galleryMainVideo.muted ? '🔇' : '🔊';
        theaterMuteBtn.title = galleryMainVideo.muted ? 'Unmute Audio' : 'Mute Audio';
      });
    }

    if (theaterFullscreenBtn && mainScreenContainer) {
      theaterFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (mainScreenContainer.requestFullscreen) {
            mainScreenContainer.requestFullscreen();
          } else if (galleryMainVideo.requestFullscreen) {
            galleryMainVideo.requestFullscreen();
          }
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }

    // Playlist Selection Switching
    playlistItems.forEach(card => {
      card.addEventListener('click', () => {
        playlistItems.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');

        const videoSrc = card.getAttribute('data-video-src');
        const tag = card.getAttribute('data-video-tag');
        const duration = card.getAttribute('data-video-duration');
        const title = card.getAttribute('data-video-title');
        const desc = card.getAttribute('data-video-desc');

        if (videoSrc) {
          galleryMainVideo.src = videoSrc;
          galleryMainVideo.load();
          galleryMainVideo.play().catch(() => {});
        }
        if (mainVideoTag && tag) mainVideoTag.textContent = tag;
        if (mainVideoDuration && duration) mainVideoDuration.textContent = duration;
        if (mainVideoTitle && title) mainVideoTitle.textContent = title;
        if (mainVideoDesc && desc) mainVideoDesc.textContent = desc;

        // Smooth visual flash on video frame
        const frame = galleryMainVideo.closest('.theater-video-frame');
        if (frame) {
          frame.style.opacity = '0.5';
          setTimeout(() => { frame.style.opacity = '1'; }, 200);
        }
      });
    });
  }

  // Gallery Dynamic Hydration & Filter
  const galleryFilterPills = document.querySelectorAll('.gallery-filter-pill');
  const galleryCountVal = document.getElementById('galleryCountVal');
  const videosSection = document.getElementById('videos');
  const photoGrid = document.getElementById('galleryPhotoGrid');

  async function hydrateGallery() {
    if (!photoGrid) return;

    let gallery = null;
    if (window.NiralaStorage && typeof window.NiralaStorage.getGallery === 'function') {
      try {
        gallery = await window.NiralaStorage.getGallery();
      } catch (e) {}
    }

    if (!gallery) {
      try {
        const local = localStorage.getItem('nirala_gallery');
        if (local) gallery = JSON.parse(local);
      } catch (e) {}
    }

    if (!gallery) {
      try {
        const res = await fetch('data/gallery.json', { cache: 'no-store' });
        if (res.ok) gallery = await res.json();
      } catch (e) {}
    }

    if (gallery && Array.isArray(gallery.photos) && gallery.photos.length > 0) {
      photoGrid.innerHTML = gallery.photos.map(p => `
          <article class="gallery-card is-visible" data-category="${p.category || 'gears'}" data-title="${p.title || ''}" data-desc="${p.desc || ''}" data-badge="${p.badge || 'WORKSHOP'}" data-img="${p.img}">
            <div class="gallery-card-media-wrap">
              <img src="${p.img}" alt="${p.title || 'Precision Component'}" loading="lazy" onerror="this.onerror=null; this.src='images/stage-2-turning.jpg'" />
              <span class="gallery-card-badge">${p.badge || 'WORKSHOP'}</span>
              <div class="gallery-card-zoom-trigger" title="Enlarge Photography">🔍</div>
            </div>
            <div class="gallery-card-body">
              <h4>${p.title || 'Precision Component'}</h4>
              <p>${p.desc || ''}</p>
              <div class="gallery-card-meta-row">
                <span>${p.stage || 'STAGE'}</span>
                <span>${p.badge || 'COMPONENT'} ↗</span>
              </div>
            </div>
          </article>`).join('\n');

      const allCards = photoGrid.querySelectorAll('.gallery-card');
      if (galleryCountVal) galleryCountVal.textContent = allCards.length;
    }
  }

  // Filter Tabs Setup
  if (galleryFilterPills.length > 0 && photoGrid) {
    galleryFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        galleryFilterPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        const targetCat = pill.getAttribute('data-gallery-filter') || 'all';
        const allCards = photoGrid.querySelectorAll('.gallery-card');

        if (targetCat === 'video') {
          if (videosSection) {
            videosSection.scrollIntoView({ behavior: 'smooth' });
          }
          allCards.forEach(c => {
            c.classList.remove('is-hidden');
            c.classList.add('is-visible');
          });
          if (galleryCountVal) galleryCountVal.textContent = allCards.length;
          return;
        }

        let visibleCount = 0;
        allCards.forEach(card => {
          const cat = card.getAttribute('data-category') || '';
          if (targetCat === 'all' || cat === targetCat) {
            card.classList.remove('is-hidden');
            card.classList.add('is-visible');
            visibleCount++;
          } else {
            card.classList.add('is-hidden');
            card.classList.remove('is-visible');
          }
        });

        if (galleryCountVal) {
          galleryCountVal.textContent = visibleCount;
        }
      });
    });
  }

  // Gallery Interactive Lightbox (with Event Delegation)
  const galleryLightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxBadge = document.getElementById('lightboxBadge');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  if (galleryLightbox && photoGrid) {
    let currentLightboxIndex = 0;
    let visibleCardsList = [];

    function updateVisibleCards() {
      const allCards = Array.from(photoGrid.querySelectorAll('.gallery-card'));
      visibleCardsList = allCards.filter(c => !c.classList.contains('is-hidden'));
      if (visibleCardsList.length === 0) visibleCardsList = allCards;
    }

    function renderLightboxItem(index) {
      updateVisibleCards();
      if (visibleCardsList.length === 0) return;
      if (index < 0) index = visibleCardsList.length - 1;
      if (index >= visibleCardsList.length) index = 0;
      currentLightboxIndex = index;

      const card = visibleCardsList[index];
      if (!card) return;

      const imgSrc = card.getAttribute('data-img') || card.querySelector('img')?.getAttribute('src');
      const title = card.getAttribute('data-title') || card.querySelector('h4')?.textContent || '';
      const desc = card.getAttribute('data-desc') || card.querySelector('p')?.textContent || '';
      const badge = card.getAttribute('data-badge') || 'PRECISION COMPONENT';

      if (lightboxImg && imgSrc) {
        lightboxImg.src = imgSrc;
        lightboxImg.alt = title;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxDesc) lightboxDesc.textContent = desc;
      if (lightboxBadge) lightboxBadge.textContent = badge;
      if (lightboxCounter) lightboxCounter.textContent = `Item ${index + 1} of ${visibleCardsList.length}`;
    }

    // Delegated click on photoGrid - works for both static and hydrated cards
    photoGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.gallery-card');
      if (!card) return;

      updateVisibleCards();
      const cardIndex = visibleCardsList.indexOf(card);
      renderLightboxItem(cardIndex >= 0 ? cardIndex : 0);
      galleryLightbox.classList.add('show');
      galleryLightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });

    const closeLightbox = () => {
      galleryLightbox.classList.remove('show');
      galleryLightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox) closeLightbox();
    });

    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderLightboxItem(currentLightboxIndex - 1);
      });
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderLightboxItem(currentLightboxIndex + 1);
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!galleryLightbox.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') renderLightboxItem(currentLightboxIndex - 1);
      if (e.key === 'ArrowRight') renderLightboxItem(currentLightboxIndex + 1);
    });
  }

  // Trigger dynamic hydration
  hydrateGallery();

});



