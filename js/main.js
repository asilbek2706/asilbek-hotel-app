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
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  counterElements.forEach((element) => {
    const targetValue = Number(element.dataset.counter);
    const isDecimal = Number.isInteger(targetValue) === false;
    const duration = 1200;
    const startTime = performance.now();

    const animateCounter = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = targetValue * progress;
      element.textContent = isDecimal
        ? value.toFixed(1)
        : Math.floor(value).toString();

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      }
    };

    requestAnimationFrame(animateCounter);
  });

  if (roomGrid) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');

        roomGrid.querySelectorAll('[data-category]').forEach((card) => {
          const shouldShow =
            filter === 'all' || card.dataset.category === filter;
          card.style.display = shouldShow ? '' : 'none';
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
      const formatDate = (date) => date.toISOString().split('T')[0];
      checkInInput.min = formatDate(today);
      checkOutInput.min = formatDate(tomorrow);
    }

    const updateNightPrice = () => {
      nightPrice.textContent = `$${Number(roomSelect.value)}`;
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
          "Iltimos, ketish sanasi kelish sanasidan keyin bo'lishi kerak.";
        totalPrice.textContent = '$0';
        return;
      }

      const nights = Math.max(Math.round((checkOut - checkIn) / 86400000), 1);
      const total = nights * pricePerNight;

      bookingNote.textContent = `${nights} kecha va ${guests} mehmon uchun taxminiy hisob.`;
      totalPrice.textContent = `$${total}`;
    };

    roomSelect.addEventListener('change', updateNightPrice);
    bookingForm.addEventListener('submit', calculateTotal);
    updateNightPrice();
  }

  if (contactForm && contactNote) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      contactNote.textContent = 'Hotel qabulxonasi xabaringizni qabul qildi.';
      contactForm.reset();
    });
  }
});
