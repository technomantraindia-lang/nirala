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
          if (window.innerWidth <= 900) {
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
        if (window.innerWidth <= 900 && !a.closest('.has-dropdown > .nav-link')) {
          toggleMobileMenu(true);
        }
      });
    });

    // Close mobile drawer when clicking outside header
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && navLinks.classList.contains('open')) {
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
  });

  // 5. Interactive Pizza-Shaped Circular Process Diagram (Outward Slice, Outside Cards & Connecting Line)
  const wedgeGroups = document.querySelectorAll('.pizza-wedge-group');
  const outsideCards = document.querySelectorAll('.pizza-outside-card');
  const closeButtons = document.querySelectorAll('.pizza-outside-card .popover-close-btn');
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

  // 9. Scroll-Controlled Hero Image Carousel Logic
  const heroWrapper = document.getElementById('heroScrollWrapper');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const indicatorDots = document.querySelectorAll('.hero-indicators .indicator-dot');
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const heroSlideCaptionEl = document.getElementById('heroSlideCaption');

  if (heroWrapper && heroSlides.length > 0) {
    let currentSlideIndex = 0;
    const totalSlides = heroSlides.length;

    // Lazy load background image
    const lazyLoadSlide = (slide) => {
      const bgEl = slide.querySelector('.slide-bg');
      if (bgEl && bgEl.dataset.bg && !bgEl.style.backgroundImage) {
        bgEl.style.backgroundImage = `url('${bgEl.dataset.bg}')`;
      }
    };

    // Preload Slide 0 immediately
    lazyLoadSlide(heroSlides[0]);

    let lastScrollProgress = 0;

    const setHeroSlide = (index, isDownwards = true) => {
      if (index === currentSlideIndex && heroSlides[index].classList.contains('active')) return;
      
      const prevIndex = currentSlideIndex;
      currentSlideIndex = index;

      heroSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'slide-up-enter', 'slide-up-exit', 'slide-down-enter', 'slide-down-exit');
        if (i === currentSlideIndex) {
          lazyLoadSlide(slide);
          slide.classList.add('active');
          if (isDownwards) {
            slide.classList.add('slide-up-enter');
          } else {
            slide.classList.add('slide-down-enter');
          }
        } else if (i === prevIndex) {
          if (isDownwards) {
            slide.classList.add('slide-up-exit');
          } else {
            slide.classList.add('slide-down-exit');
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

    // Scroll listener: maps vertical scroll progress of heroScrollWrapper to slide index & tracks scroll direction
    const updateSlideFromScroll = () => {
      const rect = heroWrapper.getBoundingClientRect();
      const scrollableDist = heroWrapper.offsetHeight - window.innerHeight;
      if (scrollableDist <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollableDist, 0), 0.999);
      const isDownwards = progress >= lastScrollProgress;
      lastScrollProgress = progress;

      const targetIndex = Math.floor(progress * totalSlides);

      setHeroSlide(targetIndex, isDownwards);
    };

    window.addEventListener('scroll', updateSlideFromScroll, { passive: true });
    updateSlideFromScroll();

    // Click indicator dots to scroll page to corresponding slide position
    indicatorDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const scrollableDist = heroWrapper.offsetHeight - window.innerHeight;
        const targetScrollTop = heroWrapper.offsetTop + (i / totalSlides) * scrollableDist;
        window.scrollTo({
          top: targetScrollTop + 10,
          behavior: 'smooth'
        });
      });
    });

    // Touch swipe support on Hero section
    let touchStartY = 0;
    let touchStartX = 0;
    const heroEl = document.getElementById('home');
    if (heroEl) {
      heroEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      heroEl.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          const scrollableDist = heroWrapper.offsetHeight - window.innerHeight;
          if (deltaX < 0 && currentSlideIndex < totalSlides - 1) {
            // Swipe Left -> next slide
            window.scrollTo({
              top: heroWrapper.offsetTop + ((currentSlideIndex + 1) / totalSlides) * scrollableDist + 10,
              behavior: 'smooth'
            });
          } else if (deltaX > 0 && currentSlideIndex > 0) {
            // Swipe Right -> prev slide
            window.scrollTo({
              top: heroWrapper.offsetTop + ((currentSlideIndex - 1) / totalSlides) * scrollableDist + 10,
              behavior: 'smooth'
            });
          }
        }
      }, { passive: true });

      // Keyboard arrow navigation on Hero focus
      heroEl.addEventListener('keydown', (e) => {
        const scrollableDist = heroWrapper.offsetHeight - window.innerHeight;
        if (['ArrowRight', 'ArrowDown'].includes(e.key) && currentSlideIndex < totalSlides - 1) {
          e.preventDefault();
          window.scrollTo({
            top: heroWrapper.offsetTop + ((currentSlideIndex + 1) / totalSlides) * scrollableDist + 10,
            behavior: 'smooth'
          });
        } else if (['ArrowLeft', 'ArrowUp'].includes(e.key) && currentSlideIndex > 0) {
          e.preventDefault();
          window.scrollTo({
            top: heroWrapper.offsetTop + ((currentSlideIndex - 1) / totalSlides) * scrollableDist + 10,
            behavior: 'smooth'
          });
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

