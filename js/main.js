document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('[data-nav]');
  const yearElements = document.querySelectorAll('[data-year]');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const counterElements = document.querySelectorAll('[data-counter]');
  const roomGrid = document.querySelector('[data-room-grid]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const bookingForm = document.querySelector('[data-booking-form]');
  const roomSelect = document.querySelector('[data-room-select]');
  const nightPrice = document.querySelector('[data-night-price]');
  const totalPrice = document.querySelector('[data-total-price]');
  const bookingNote = document.querySelector('[data-booking-note]');
  const checkInInput = document.querySelector('[data-check-in]');
  const checkOutInput = document.querySelector('[data-check-out]');
  const contactForm = document.querySelector('[data-contact-form]');
  const contactNote = document.querySelector('[data-contact-note]');

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const formatDate = (date) => date.toISOString().split('T')[0];

  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  counterElements.forEach((element) => {
    const targetValue = Number(element.dataset.counter);
    const isDecimal = !Number.isInteger(targetValue);
    const duration = 1100;
    const startTime = performance.now();

    const animateCounter = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const value = targetValue * easedProgress;

      element.textContent = isDecimal
        ? value.toFixed(1)
        : Math.floor(value).toString();

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        element.textContent = isDecimal
          ? targetValue.toFixed(1)
          : String(targetValue);
      }
    };

    requestAnimationFrame(animateCounter);
  });

  if (roomGrid) {
    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));

      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
          item.classList.remove('is-active');
          item.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');

        roomGrid.querySelectorAll('[data-category]').forEach((card) => {
          const shouldShow = filter === 'all' || card.dataset.category === filter;
          card.hidden = !shouldShow;
        });
      });
    });
  }

  if (bookingForm && roomSelect && nightPrice && totalPrice && bookingNote) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (checkInInput && checkOutInput) {
      checkInInput.min = formatDate(today);
      checkOutInput.min = formatDate(tomorrow);

      checkInInput.addEventListener('change', () => {
        const nextDay = new Date(checkInInput.value);

        if (!Number.isNaN(nextDay.getTime())) {
          nextDay.setDate(nextDay.getDate() + 1);
          checkOutInput.min = formatDate(nextDay);

          if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
            checkOutInput.value = formatDate(nextDay);
          }
        }
      });
    }

    const updateNightPrice = () => {
      nightPrice.textContent = currency.format(Number(roomSelect.value));
    };

    const calculateTotal = (event) => {
      event.preventDefault();
      const formData = new FormData(bookingForm);
      const checkIn = new Date(String(formData.get('checkIn')));
      const checkOut = new Date(String(formData.get('checkOut')));
      const guests = Number(formData.get('guests')) || 1;
      const pricePerNight = Number(roomSelect.value);

      if (
        Number.isNaN(checkIn.getTime()) ||
        Number.isNaN(checkOut.getTime()) ||
        checkOut <= checkIn
      ) {
        bookingNote.textContent =
          'Chiqish sanasi kirish sanasidan keyin bo‘lishi kerak.';
        totalPrice.textContent = currency.format(0);
        return;
      }

      const nights = Math.max(Math.round((checkOut - checkIn) / 86400000), 1);
      const total = nights * pricePerNight;

      bookingNote.textContent = `${nights} tun, ${guests} mehmon uchun taxminiy narx.`;
      totalPrice.textContent = currency.format(total);
    };

    roomSelect.addEventListener('change', updateNightPrice);
    bookingForm.addEventListener('submit', calculateTotal);
    updateNightPrice();
  }

  if (contactForm && contactNote) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      contactNote.textContent =
        'Xabaringiz qabul qilindi. Reception jamoasi tez orada bog‘lanadi.';
      contactForm.reset();
    });
  }
});
