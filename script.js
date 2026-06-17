document.addEventListener('DOMContentLoaded', () => {
    // State management
    let cart = JSON.parse(localStorage.getItem('cyber_cart')) || [];

    // UI Elements
    const productGrid = document.getElementById('product-grid');
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const searchInput = document.getElementById('product-search');

    // Sample Products Data
    const products = [
        {
            id: 1,
            title: "Neural Link VR",
            price: 599.99,
            image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=600",
            class: "large"
        },
        {
            id: 2,
            title: "Cyberpunk Jacket",
            price: 129.99,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
            class: ""
        },
        {
            id: 3,
            title: "Neon Mechanical Keyboard",
            price: 189.99,
            image: "https://images.unsplash.com/photo-1618384881928-bbcd59f71b2a?auto=format&fit=crop&q=80&w=600",
            class: ""
        },
        {
            id: 4,
            title: "Obsidian Drone X",
            price: 899.00,
            image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=600",
            class: "wide"
        },
        {
            id: 5,
            title: "Holographic Watch",
            price: 349.50,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
            class: ""
        },
        {
            id: 6,
            title: "Sonic Pulse Headphones",
            price: 249.99,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
            class: ""
        }
    ];

    // Functions
    function renderProducts(productsToRender) {
        if (!productGrid) return;
        productGrid.innerHTML = '';

        productsToRender.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = `product-card ${product.class}`;
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            `;
            productGrid.appendChild(productElement);
        });

        // Re-attach listeners to new buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                addToCart(id);
            });
        });
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        updateCart();
        openCartSidebar();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    function updateCart() {
        // Persist
        localStorage.setItem('cyber_cart', JSON.stringify(cart));

        // Update Count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update Sidebar
        renderCartItems();

        // Update Total
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalAmount.textContent = `$${totalAmount.toFixed(2)}`;
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Attach remove listeners
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                removeFromCart(id);
            });
        });
    }

    function openCartSidebar() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event Listeners
    cartBtn.addEventListener('click', openCartSidebar);
    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(p =>
            p.title.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Initial Load
    renderProducts(products);
    updateCart();

    // Scroll reveal for header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.background = 'rgba(5, 5, 5, 0.95)';
        } else {
            header.style.padding = '1rem 0';
            header.style.background = 'rgba(5, 5, 5, 0.8)';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
});
