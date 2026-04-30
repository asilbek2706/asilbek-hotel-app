/**
 * Grand Hotel Uzbekistan - Main JavaScript
 * Senior Level JS: Modular, Robust, and Performant
 */

const App = (() => {
  // --- Constants & Config ---
  const CONFIG = {
    revealThreshold: 0.15,
    scrollOffset: 80,
    animationDuration: 1000,
    transitionNormal: 300,
    currencyFormatter: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }),
  };

  // --- State ---
  const state = {
    isNavOpen: false,
    currentFilter: 'all',
  };

  // --- DOM Elements Cache ---
  const UI = {
    nav: document.querySelector('[data-nav]'),
    navToggle: document.querySelector('.nav-toggle'),
    yearElements: document.querySelectorAll('[data-year]'),
    revealItems: document.querySelectorAll('[data-reveal]'),
    counters: document.querySelectorAll('[data-counter]'),
    roomGrid: document.querySelector('[data-room-grid]'),
    filterBtns: document.querySelectorAll('[data-filter]'),
    bookingForm: document.querySelector('[data-booking-form]'),
    contactForm: document.querySelector('[data-contact-form]'),
  };

  // --- Modules ---

  /**
   * Navigation Module
   */
  const Navigation = {
    init() {
      if (!UI.navToggle || !UI.nav) return;

      UI.navToggle.addEventListener('click', this.toggleNav.bind(this));

      // Close nav when clicking outside or on a link
      document.addEventListener('click', (e) => {
        if (state.isNavOpen && !UI.nav.contains(e.target) && !UI.navToggle.contains(e.target)) {
          this.closeNav();
        }
      });

      UI.nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.closeNav());
      });
    },

    toggleNav() {
      state.isNavOpen = !state.isNavOpen;
      UI.nav.querySelector('.nav-list').classList.toggle('is-open', state.isNavOpen);
      UI.navToggle.setAttribute('aria-expanded', state.isNavOpen);
    },

    closeNav() {
      state.isNavOpen = false;
      UI.nav.querySelector('.nav-list').classList.remove('is-open');
      UI.navToggle.setAttribute('aria-expanded', 'false');
    }
  };

  /**
   * Scroll Reveal Module
   */
  const ScrollReveal = {
    init() {
      if (!UI.revealItems.length) return;

      const observerOptions = {
        threshold: CONFIG.revealThreshold,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // If it's a counter, trigger it when visible
            const counter = entry.target.querySelector('[data-counter]');
            if (counter) Counters.animate(counter);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      UI.revealItems.forEach(item => observer.observe(item));
    }
  };

  /**
   * Counters Animation Module
   */
  const Counters = {
    animate(el) {
      const target = parseFloat(el.dataset.counter);
      const isDecimal = !Number.isInteger(target);
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / CONFIG.animationDuration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const current = target * ease;
        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = isDecimal ? target.toFixed(1) : target;
        }
      };

      requestAnimationFrame(update);
    }
  };

  /**
   * Room Filter Module
   */
  const RoomFilter = {
    init() {
      if (!UI.roomGrid || !UI.filterBtns.length) return;

      UI.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;
          this.applyFilter(filter, btn);
        });
      });
    },

    applyFilter(filter, activeBtn) {
      UI.filterBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn === activeBtn);
        btn.setAttribute('aria-selected', btn === activeBtn);
      });

      const cards = UI.roomGrid.querySelectorAll('.room-card');
      cards.forEach(card => {
        const category = card.dataset.category;
        const isMatch = filter === 'all' || category === filter;

        if (isMatch) {
          card.style.display = 'block';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', CONFIG.transitionNormal);
        }
      });
    }
  };

  /**
   * Booking Calculator Module
   */
  const Booking = {
    init() {
      if (!UI.bookingForm) return;

      this.roomSelect = UI.bookingForm.querySelector('[data-room-select]');
      this.checkIn = UI.bookingForm.querySelector('[data-check-in]');
      this.checkOut = UI.bookingForm.querySelector('[data-check-out]');
      this.nightPriceDisplay = document.querySelector('[data-night-price]');
      this.totalPriceDisplay = document.querySelector('[data-total-price]');
      this.noteDisplay = document.querySelector('[data-booking-note]');

      this.setupDates();
      this.addEventListeners();
      this.updateUI();
    },

    setupDates() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      this.checkIn.min = today.toISOString().split('T')[0];
      this.checkOut.min = tomorrow.toISOString().split('T')[0];
    },

    addEventListeners() {
      this.roomSelect.addEventListener('change', () => this.updateUI());
      this.checkIn.addEventListener('change', () => {
        const cin = new Date(this.checkIn.value);
        const cout = new Date(cin);
        cout.setDate(cin.getDate() + 1);
        this.checkOut.min = cout.toISOString().split('T')[0];
        if (new Date(this.checkOut.value) <= cin) {
          this.checkOut.value = cout.toISOString().split('T')[0];
        }
        this.updateUI();
      });
      this.checkOut.addEventListener('change', () => this.updateUI());
      UI.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateTotal();
      });
    },

    updateUI() {
      const price = parseFloat(this.roomSelect.value);
      if (this.nightPriceDisplay) {
        this.nightPriceDisplay.textContent = CONFIG.currencyFormatter.format(price);
      }
      this.calculateTotal();
    },

    calculateTotal() {
      const cin = new Date(this.checkIn.value);
      const cout = new Date(this.checkOut.value);
      const price = parseFloat(this.roomSelect.value);

      if (isNaN(cin) || isNaN(cout) || cout <= cin) {
        if (this.totalPriceDisplay) this.totalPriceDisplay.textContent = '$0';
        return;
      }

      const diff = cout - cin;
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const total = nights * price;

      if (this.totalPriceDisplay) {
        this.totalPriceDisplay.textContent = CONFIG.currencyFormatter.format(total);
      }
      if (this.noteDisplay) {
        this.noteDisplay.textContent = `${nights} tun uchun hisoblangan narx.`;
      }
    }
  };

  /**
   * Contact Form Module
   */
  const Contact = {
    init() {
      if (!UI.contactForm) return;

      UI.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const note = document.querySelector('[data-contact-note]');
        if (note) {
          note.textContent = 'Xabaringiz yuborildi! Tez orada siz bilan bog‘lanamiz.';
          note.style.color = 'var(--color-accent)';
        }
        UI.contactForm.reset();
      });
    }
  };

  // --- Initialization ---
  const init = () => {
    // Set current year
    UI.yearElements.forEach(el => el.textContent = new Date().getFullYear());

    Navigation.init();
    ScrollReveal.init();
    RoomFilter.init();
    Booking.init();
    Contact.init();
  };

  return { init };
})();

// Launch App
document.addEventListener('DOMContentLoaded', App.init);
