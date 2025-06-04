// universal.js

// Theme Toggle Functionality
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '🌙'; // Moon for dark theme
    } else {
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '☀️'; // Sun for light theme
    }
}

// Initialize Theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️'; // Sun for light theme
    } else {
        themeToggle.textContent = '🌙'; // Moon for dark theme
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Smooth Scroll Functionality
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        observer.observe(el);
    });
});

// Header Scroll Animation
function headerScrollAnimation() {
    const header = document.querySelector('header');
    const scrollThreshold = 50;
    const pinThreshold = 300;

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;

            // Add/remove scrolled class
            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Add/remove pinned class
            if (currentScroll > pinThreshold) {
                header.classList.add('pinned');
            } else {
                header.classList.remove('pinned');
            }
        });
    }
}
// Add to your universal.js
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        const bookmark = document.querySelector('.header-bookmark');
        
        if (currentScroll > lastScrollTop) {
            // Scrolling down
            header.classList.add('scrolled');
            if (currentScroll > 100) {
                bookmark.classList.add('visible');
            }
        } else {
            // Scrolling up
            if (currentScroll < 100) {
                header.classList.remove('scrolled');
                bookmark.classList.remove('visible');
            }
        }
        lastScrollTop = currentScroll;
    }
});

// Scroll Reveal Animation
function scrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        observer.observe(el);
    });
}


// Cart Management System
const cart = {
    items: [],
    
    init() {
        try {
            // Load items from storage
            this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Initialize cart icon
            this.initCartIcon();
            
            // Update cart display if on cart page
            const isCartPage = window.location.pathname.includes('/cart.html');
            if (isCartPage && document.readyState === 'complete') {
                this.displayCart();
            }
        } catch (error) {
            console.error('Cart initialization error:', error);
            this.items = [];
        }
    },

    initCartIcon() {
        const headerLeft = document.querySelector('.header-left');
        if (!headerLeft || document.querySelector('.cart-icon')) return;

        const cartWrapper = document.createElement('div');
        cartWrapper.classList.add('cart-wrapper');
        
        const cartIcon = document.createElement('a');
        cartIcon.href = '/ever/cart.html';
        cartIcon.classList.add('cart-icon');
        cartIcon.innerHTML = `
            <span class="cart-count">${this.getTotalItems()}</span>
            🛒
        `;
        
        cartWrapper.appendChild(cartIcon);
        headerLeft.appendChild(cartWrapper);
    },

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    displayCart() {
        const cartContainer = document.getElementById('cart-items');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Browse our products and add items to your cart</p>
                </div>
            `;
            if (subtotalElement) subtotalElement.textContent = '₹0';
            if (totalElement) totalElement.textContent = '₹0';
            return;
        }

        const cartHTML = this.items.map(item => this.renderCartItem(item)).join('');
        cartContainer.innerHTML = cartHTML;

        // Update totals
        const subtotal = this.getSubtotal();
        if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (totalElement) totalElement.textContent = `₹${(subtotal + 499).toLocaleString('en-IN')}`;
    },

    renderCartItem(item) {
        const isPC = item.type === 'custom-pc' || item.type === 'pre-built';
        const detailsButton = isPC ? `
            <button class="details-btn" onclick="cart.showBuildDetails('${item.id}')">
                More Details
            </button>
        ` : '';

        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" 
                     onerror="this.src='/part/default.jpg'" 
                     alt="${item.name}" 
                     class="category-icon">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.type}</p>
                    <span class="item-price">₹${item.price.toLocaleString('en-IN')}</span>
                </div>
                <div class="quantity-controls">
                    <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                ${detailsButton}
                <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
            </div>
        `;
    },

    parseCustomPCSpecs(description) {
        const parts = description.split(', ');
        return parts.map(part => {
            const [type, id] = part.split(': ');
            return {
                label: type,
                value: id
            };
        });
    },

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const newItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                type: product.type,
                quantity: 1
            };

            // Handle custom PC builds
            if (product.type === 'custom-pc') {
                newItem.description = product.description;
                // Extract case ID from the description
                const caseInfo = product.description.split(', ').find(part => part.startsWith('CASE:'));
                const caseId = caseInfo ? caseInfo.split(': ')[1] : 'default';
                newItem.image = `/part/cabinets/${caseId}.jpg`;
                // Add specs for custom PC builds
                newItem.specs = this.parseCustomPCSpecs(product.description);
            } else {
                // Regular product image path
                newItem.image = `/part/${product.type}/${product.id}.jpg`;
            }

            this.items.push(newItem);
        }
        
        this.save();
        this.updateCartCount();
        this.showNotification(`Added ${product.name} to cart`);
        
        // Update cart display if we're on the cart page
        if (window.location.pathname.includes('/cart.html')) {
            this.updateCartDisplay();
        }
    },

    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            this.save();
            this.updateCartCount();
            this.updateCartDisplay();
            this.showNotification(`Removed ${item.name} from cart`);
        }
    },

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            // Instead of returning, remove the item
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.save();
            this.updateCartDisplay();
        }
    },

    save() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    },

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('cart-notification');
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },
    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const subtotal = this.getSubtotal();

        // Handle empty cart
        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Browse our products and add items to your cart</p>
                </div>
            `;
            if (subtotalElement) subtotalElement.textContent = '₹0';
            if (totalElement) totalElement.textContent = '₹0';
            return;
        }

        // Render cart items
        cartContainer.innerHTML = this.items.map(item => {
            const isPC = item.type === 'custom-pc' || item.type === 'pre-built';
            const detailsButton = isPC ? `
                <button class="details-btn" onclick="cart.showBuildDetails('${item.id}')">
                    More Details
                </button>
            ` : '';

            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" 
                         onerror="this.src='/part/default.jpg'" 
                         alt="${item.name}" 
                         class="category-icon">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>${item.type}</p>
                        <span class="item-price">₹${item.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    ${detailsButton}
                    <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
                </div>
            `;
        }).join('');

        // Update totals
        if (subtotalElement) {
            subtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        }
        if (totalElement) {
            const total = subtotal + 499;
            totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
        }
    },
    showBuildDetails(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        const dialog = document.createElement('div');
        dialog.className = 'build-details-modal';
        
        let content = '';
        if (item.type === 'custom-pc') {
            const parts = item.description.split(', ');
            content = `
                <div class="modal-header">
                    <h3>Custom PC Build Components</h3>
                    <p class="build-price">Total: ₹${item.price.toLocaleString('en-IN')}</p>
                </div>
                <div class="components-list">
                    ${parts.map(part => {
                        const [type, id] = part.split(': ');
                        const partType = type.toLowerCase();
                        const imagePath = partType === 'case' ? 
                            `/part/cabinets/${id}.jpg` : 
                            `/part/${partType}/${id}.jpg`;
                        
                        return `
                            <div class="component-item">
                                <img src="${imagePath}" 
                                     alt="${type}"
                                     onerror="this.src='/part/default.jpg'">
                                <div class="component-details">
                                    <h4>${type}</h4>
                                    <p>${id}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (item.type === 'pre-built') {
            content = `
                <div class="modal-header">
                    <h3>${item.name} Specifications</h3>
                    <p class="build-price">Price: ₹${item.price.toLocaleString('en-IN')}</p>
                </div>
                <div class="build-specs">
                    <img src="/build-images/${item.id}.jpg" 
                         alt="${item.name}"
                         class="build-image"
                         onerror="this.src='/part/default.jpg'">
                    <div class="specs-list">
                        ${item.specs ? item.specs.map(spec => `
                            <div class="spec-item">
                                <span class="spec-label">${spec.label}:</span>
                                <span class="spec-value">${spec.value}</span>
                            </div>
                        `).join('') : '<p>Specifications not available</p>'}
                    </div>
                </div>
            `;
        }

        dialog.innerHTML = `
            <div class="modal-content">
                ${content}
                <button class="close-modal" onclick="this.closest('.build-details-modal').remove()">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(dialog);
    }
};

// Make cart globally available
window.cart = cart;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    smoothScroll();
    headerScrollAnimation();
    scrollReveal();
    cart.init(); // This will handle everything cart-related
    
    // Only run this if we're on the parts page
    if (document.getElementById('parts-grid')) {
        generatePartCards('all');
    }
});

// Add a load event listener specifically for the cart page
window.addEventListener('load', () => {
    if (window.location.pathname.includes('/cart.html')) {
        cart.displayCart();
    }
});

// Clerk Authentication
async function initializeClerk() {
    await Clerk.load();

    const userAuthDiv = document.getElementById('user-auth');
    if (!userAuthDiv) return;

    if (Clerk.user) {
        // User is signed in, show user button
        Clerk.mountUserButton(userAuthDiv, {
            afterSignOutUrl: window.location.href,
            appearance: {
                elements: {
                    rootBox: {
                        boxShadow: 'none',
                        backgroundColor: 'transparent'
                    },
                    avatarBox: {
                        width: '32px',
                        height: '32px'
                    }
                }
            }
        });
    } else {
        // User is signed out, show sign in button
        const signInButton = document.createElement('button');
        signInButton.className = 'auth-button';
        signInButton.textContent = 'Sign In';
        signInButton.onclick = () => Clerk.openSignIn();
        userAuthDiv.appendChild(signInButton);
    }
}

// Initialize Clerk when the window loads
window.addEventListener('load', initializeClerk);

// Scroll to top functionality
const scrollButton = document.querySelector('.scroll-top');
let isScrolling = false;

// Throttle scroll event
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Show/hide button with throttling
window.addEventListener('scroll', throttle(() => {
    if (window.innerWidth <= 768) {
        if (window.scrollY > window.innerHeight / 2) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }
}, 100));

// Smooth scroll to top
scrollButton.addEventListener('click', () => {
    if (isScrolling) return;
    
    isScrolling = true;
    scrollButton.style.transform = 'scale(0.9)';
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Reset button state after scroll
    const checkIfScrolled = setInterval(() => {
        if (window.scrollY === 0) {
            isScrolling = false;
            scrollButton.style.transform = '';
            clearInterval(checkIfScrolled);
        }
    }, 100);
});

// Floating brand functionality
const floatingBrand = document.querySelector('.floating-brand');
let lastScrollY = 0;

// Throttle scroll event for performance
const throttleScroll = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Show/hide floating brand
window.addEventListener('scroll', throttleScroll(() => {
    if (window.innerWidth <= 768) {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        const headerHeight = header.offsetHeight;
        
        if (currentScroll > headerHeight + 50) { // Show brand just 20px after header height
            floatingBrand.classList.add('visible');
        } else {
            floatingBrand.classList.remove('visible');
        }
        
        lastScrollY = currentScroll;
    }
}, 100));

// Add to universal.js
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    
    if (splashScreen) {
        // Force display splash screen
        splashScreen.style.display = 'flex';
        splashScreen.style.visibility = 'visible';
        splashScreen.style.opacity = '1';
        
        // Remove splash after animations complete
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            
            // Clean up after transition
            splashScreen.addEventListener('transitionend', () => {
                splashScreen.style.display = 'none';
            }, { once: true });
        }, 3000);
    }
    
    // Prevent FOUC (Flash of Unstyled Content)
    document.documentElement.style.visibility = 'visible';
});

// Haptic feedback utility with richer patterns
function triggerHaptic(pattern = 'light') {
    if (!navigator.vibrate) return;
    
    const patterns = {
        light: [8], // Subtle tap
        medium: [12], // Slight press
        heavy: [20, 10], // Firm press with feedback
        double: [8, 20, 8], // Gentle double tap
        success: [10, 15, 10], // Soft confirmation
        error: [40, 20], // Attention grabbing but not harsh
        warning: [20, 30], // Gentle alert
        select: [5], // Very light touch
        press: [15], // Button press feedback
        swipe: [8, 12], // Smooth transition
        impact: [25], // Noticeable but not jarring
        bounce: [10, 8, 12] // Playful but subtle
    };
    
    navigator.vibrate(patterns[pattern] || patterns.light);
}

// Enhanced haptic feedback implementation
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle - subtle impact
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => triggerHaptic('press'));
    
    // Navigation - gentle transition
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => triggerHaptic('light'));
    });
    
    // Action buttons - firm but not overwhelming
    document.querySelectorAll('.hero-button').forEach(button => {
        button.addEventListener('click', () => triggerHaptic('medium'));
    });
    
    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => triggerHaptic('select'));
    });
    
    // Cart interactions - satisfying feedback
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => triggerHaptic('success'));
    });
    
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', () => triggerHaptic('press'));
    });
    
    // Utility buttons - minimal feedback
    const scrollButton = document.querySelector('.scroll-top');
    scrollButton?.addEventListener('click', () => triggerHaptic('light'));
    
    // Interactive elements - very subtle
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('touchstart', () => triggerHaptic('select'));
    });
    
    // Quantity controls - quick feedback
    document.querySelectorAll('.quantity-controls button').forEach(button => {
        button.addEventListener('click', () => triggerHaptic('light'));
    });
});

// iOS haptic feedback (requires user interaction)
function requestIOSHaptics() {
    if (window.navigator.userAgent.includes('iPhone')) {
        document.addEventListener('touchstart', () => {
            // Enable haptics for iOS
            if (window.Taptic) window.Taptic.impact();
        }, { once: true });
    }
}

// Call this when page loads
requestIOSHaptics();