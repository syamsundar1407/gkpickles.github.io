// --- State ---
let products = [];
let cart = [];
let wishlist = JSON.parse(localStorage.getItem('gk_wishlist')) || [];

// --- DOM Elements ---
const productsGrid = document.getElementById("products-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const cartIcon = document.getElementById("cart-icon");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const cartTotalPriceElement = document.getElementById("cart-total-price");
const emptyCartMsg = document.getElementById("empty-cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");
const upiSection = document.getElementById("upi-section");
const cancelPaymentBtn = document.getElementById("cancel-payment");
const confirmOrderBtn = document.getElementById("confirm-order");

// --- Fetch & Parse CSV Data ---
function loadMenu() {
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vShGhASwTxIa6n81GgLzS57BGlSHAIMQv6q9XBPjRjHOs81WHSINwecwA8udcpzSP4vfObD0ptbrXPg/pub?output=csv&v=" + new Date().getTime(), {
        download: true,
        header: true,
        complete: function (results) {
            products = results.data
                .filter(row => row['Product Name']) // Skip empty rows
                .map((row, index) => {
                    const price250 = parseInt((row['250g Price'] || '0').replace(/\D/g, ''));
                    const price500 = parseInt((row['500g Price'] || '0').replace(/\D/g, ''));
                    const price1000 = parseInt((row['1KG Price'] || '0').replace(/\D/g, ''));

                    return {
                        id: index + 1,
                        title: row['Product Name'],
                        price250, price500, price1000,
                        category: (row['Category'] || '').toLowerCase().replace(/[^a-z-]/g, ''),
                        image: row['Image URL'] || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop',
                        stock: row['Stock Status'] || 'In Stock',
                        bestseller: (row['Bestseller'] || '').toLowerCase() === 'yes'
                    };
                });
            renderProducts();
        }
    });
}

// --- Render Products ---
function renderProducts(filter = "all", searchQuery = "") {
    productsGrid.innerHTML = "";

    // Filter by Category, Wishlist & Search text
    const filtered = products.filter(p => {
        let matchesCategory = false;
        if (filter === "all") matchesCategory = true;
        else if (filter === "wishlist") matchesCategory = wishlist.includes(p.id);
        else matchesCategory = p.category === filter;

        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No pickles found matching your search!</p>`;
        return;
    }

    filtered.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";

        // Show category tag always and OUT OF STOCK badge if needed
        const categoryTag = `<div class="product-tag tag-${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>`;
        const stockTag = product.stock.toLowerCase().includes('out')
            ? `<div class="product-tag" style="background:var(--text-secondary); margin-left:8px;">OUT OF STOCK</div>`
            : "";

        // Render Bestseller Badge
        let bestsellerBadge = product.bestseller ? `<div class="bestseller-badge">✨ PREMIUM BESTSELLER</div>` : "";
        let isWishlisted = wishlist.includes(product.id);

        div.innerHTML = `
            <div class="product-tag-container" style="position:absolute; top:15px; left:15px; z-index:10; display:flex;">
                ${categoryTag}${stockTag}
            </div>
            ${bestsellerBadge}
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title} - Authentic Homemade Pickle" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop'">
            </div>
            <div class="product-info">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <h3 class="product-title">${product.title}</h3>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Add to wishlist" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; transition: transform 0.2s;">
                        ${isWishlisted ? '❤️' : '🤍'}
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                     <label style="font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 5px; font-weight: 600;">SELECT WEIGHT</label>
                     <select class="weight-select" id="weight-${product.id}" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); outline: none; font-family: var(--font-body); font-weight: 600; cursor: pointer;">
                         ${product.price250 > 0 ? `<option value="250g|${product.price250}">250g - ₹${product.price250}</option>` : ''}
                         ${product.price500 > 0 ? `<option value="500g|${product.price500}">500g - ₹${product.price500}</option>` : ''}
                         ${product.price1000 > 0 ? `<option value="1KG|${product.price1000}">1KG - ₹${product.price1000}</option>` : ''}
                         ${product.price250 === 0 && product.price500 === 0 && product.price1000 === 0 ? `<option value="0|0">Price Not Available</option>` : ''}
                     </select>
                </div>

                <div class="quantity-selector" style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; justify-content: center;">
                    <button onclick="changeCardQty(${product.id}, -1)" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">-</button>
                    <span id="qty-val-${product.id}" style="font-weight: 800; min-width: 25px; text-align: center;">1</span>
                    <button onclick="changeCardQty(${product.id}, 1)" style="background: var(--primary-color); border: none; color: white; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
                
                <div class="product-footer">
                    <span class="product-price">₹${product.price250 || 0}</span>
                    <div class="product-actions" ${product.stock.toLowerCase().includes('out') ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                        <a href="https://wa.me/919440630319?text=${encodeURIComponent('Hi GK Pickles, I want to order ' + product.title + ' (250g)')}" target="_blank" class="btn-whatsapp-card wa-link" id="wa-btn-${product.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                            Order Now
                        </a>
                        <button class="btn-add-cart" onclick="addToCart(${product.id})" aria-label="Add to cart" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.3s;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsGrid.appendChild(div);

        // Dynamic price & Link update when select changes
        const selectEl = div.querySelector(`#weight-${product.id}`);
        const priceDisplay = div.querySelector(`.product-price`);
        const waLink = div.querySelector(`.wa-link`);

        selectEl.addEventListener('change', () => updateCardLink(product.id));
    });
}

// --- Card Quantity Helper ---
function changeCardQty(id, delta) {
    const qtyEl = document.getElementById(`qty-val-${id}`);
    let currentQty = parseInt(qtyEl.innerText);
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    qtyEl.innerText = currentQty;
    updateCardLink(id);
}

function updateCardLink(id) {
    const product = products.find(p => p.id === id);
    const selectEl = document.getElementById(`weight-${id}`);
    const qtyVal = document.getElementById(`qty-val-${id}`).innerText;
    const priceDisplay = document.querySelector(`#weight-${id}`).closest('.product-card').querySelector('.product-price');
    const waLink = document.getElementById(`wa-btn-${id}`);

    const [size, price] = selectEl.value.split('|');
    const totalSelectedPrice = parseInt(price) * parseInt(qtyVal);
    
    priceDisplay.innerText = `₹${totalSelectedPrice}`;
    const message = `Hi GK Pickles, I want to order ${qtyVal} x ${product.title} (${size}) for a total of ₹${totalSelectedPrice}`;
    waLink.href = `https://wa.me/919440630319?text=${encodeURIComponent(message)}`;
}

// --- Wishlist Logic ---
function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(itemId => itemId !== id);
    } else {
        wishlist.push(id);
    }
    localStorage.setItem('gk_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();

    // Maintain current filter state
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const activeCategory = activeFilterBtn ? activeFilterBtn.dataset.filter : "all";
    const currentSearchQuery = document.getElementById("product-search") ? document.getElementById("product-search").value : "";
    renderProducts(activeCategory, currentSearchQuery);
}

function updateWishlistUI() {
    const badge = document.getElementById("wishlist-count-badge");
    if (badge) {
        badge.innerText = wishlist.length;
    }
}

// --- Cart Logic ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const select = document.getElementById("weight-" + id);
    const qtyVal = parseInt(document.getElementById(`qty-val-${id}`).innerText);
    const [size, priceStr] = select.value.split("|");
    const price = parseInt(priceStr);
    const cartItemId = id + "-" + size;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    if (existingItem) {
        existingItem.qty += qtyVal;
    } else {
        cart.push({ ...product, cartItemId, size, price, qty: qtyVal });
    }
    updateCartUI();
    openCart(); // Show the cart drawer for feedback

    // Tiny animation on cart icon
    cartIcon.style.transform = "scale(1.2)";
    setTimeout(() => cartIcon.style.transform = "scale(1)", 200);
}

function updateQty(cartItemId, change) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(p => p.cartItemId !== cartItemId);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        emptyCartMsg.style.display = "block";
        checkoutBtn.style.display = "none";
        upiSection.style.display = "none";
    } else {
        emptyCartMsg.style.display = "none";
        checkoutBtn.style.display = "block";

        cart.forEach(item => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.image}" class="cart-item-img" alt="GK Pickles | ${item.title}" onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop'">
                <div class="cart-item-details">
                    <div class="cart-item-title" style="font-size: 0.95rem;">${item.title} <span style="color:var(--primary-color);">(${item.size})</span></div>
                    <div class="cart-item-price">₹${item.price} x ${item.qty}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQty('${item.cartItemId}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty('${item.cartItemId}', 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotalPriceElement.innerText = `₹${total}`;

    // Shipping Progress Logic
    const shippingProgressContainer = document.getElementById("shipping-progress-container");
    const shippingAmountLeft = document.getElementById("shipping-amount-left");
    const shippingProgressBar = document.getElementById("shipping-progress-bar");
    const shippingMessage = document.getElementById("shipping-message");

    const freeShippingThreshold = 1000;

    if (cart.length === 0) {
        if (shippingProgressContainer) shippingProgressContainer.style.display = "none";
    } else if (shippingProgressContainer) {
        shippingProgressContainer.style.display = "block";
        const difference = freeShippingThreshold - total;
        let percentage = (total / freeShippingThreshold) * 100;
        if (percentage > 100) percentage = 100;

        if (shippingProgressBar) shippingProgressBar.style.width = percentage + "%";

        if (total >= freeShippingThreshold) {
            if (shippingMessage) shippingMessage.innerHTML = `🎉 Congratulations! You have unlocked <span style="color:var(--accent-color)">Free Express Shipping!</span>`;
            if (shippingProgressBar) shippingProgressBar.style.background = "var(--whatsapp-color)";
        } else {
            if (shippingMessage) shippingMessage.innerHTML = `Add ₹<span id="shipping-amount-left">${difference}</span> more for <span style="color:var(--accent-color)">FREE Express Shipping!</span>📦`;
            if (shippingProgressBar) shippingProgressBar.style.background = "var(--primary-color)";
        }
    }

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountElement.innerText = count;

    // Update Sticky mobile cart
    const stickyCartCount = document.getElementById("sticky-cart-count");
    const stickyMobileCart = document.getElementById("sticky-mobile-cart");
    if (stickyCartCount && stickyMobileCart) {
        stickyCartCount.innerText = count;
        if (count > 0) {
            stickyMobileCart.classList.add('visible');
        } else {
            stickyMobileCart.classList.remove('visible');
        }
    }
}

// --- Drawer Events ---
function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
    // Reset payment view
    upiSection.style.display = "none";
    if (cart.length > 0) checkoutBtn.style.display = "block";
}

cartIcon.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// --- Checkout & UPI Simulation ---
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    checkoutBtn.style.display = "none";
    upiSection.style.display = "block";

    // Generate UPI URL dynamically with total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const dynamicQr = document.getElementById("dynamic-qr");
    dynamicQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=gkpickles@ybl&pn=GK%20Pickles&cu=INR&am=${total}`;
});

cancelPaymentBtn.addEventListener("click", () => {
    upiSection.style.display = "none";
    checkoutBtn.style.display = "block";
});

confirmOrderBtn.addEventListener("click", () => {
    cart = [];
    updateCartUI();

    // Show amazing visual confirmation instead of empty cart message
    emptyCartMsg.style.display = "none";
    upiSection.style.display = "none";
    checkoutBtn.style.display = "none";

    cartItemsContainer.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">Order Placed!</h3>
            <p style="color: var(--text-secondary)">Your authentic GK Pickles are on their way. We'll contact you shortly for dispatch details.</p>
        </div>
    `;
    cartCountElement.innerText = 0;
});

// --- Announcement Bar Logic ---
const announcementBar = document.getElementById("announcement-bar");
const closeAnnouncementBtn = document.getElementById("close-announcement");
const navbar = document.getElementById("navbar");
let isAnnouncementClosed = false;

if (closeAnnouncementBtn) {
    closeAnnouncementBtn.addEventListener("click", () => {
        announcementBar.style.display = "none";
        navbar.classList.add("no-announcement");
        isAnnouncementClosed = true;
    });
}

// --- Initialize ---
// Navbar solid on scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.style.background = "rgba(15, 14, 14, 0.98)";
        navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
        if (!isAnnouncementClosed) {
            navbar.classList.add("scrolled");
            announcementBar.style.transform = "translateY(-100%)";
        }
    } else {
        navbar.style.background = "rgba(15, 14, 14, 0.85)";
        navbar.style.boxShadow = "none";
        if (!isAnnouncementClosed) {
            navbar.classList.remove("scrolled");
            announcementBar.style.transform = "translateY(0)";
        }
    }
});

// Initial Render
updateWishlistUI();
loadMenu();
updateCartUI();

// --- Search Filter Logic ---
const searchInput = document.getElementById("product-search");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const activeFilterBtn = document.querySelector(".filter-btn.active");
        const activeCategory = activeFilterBtn ? activeFilterBtn.dataset.filter : "all";
        renderProducts(activeCategory, e.target.value);
    });
}

// Update Category Buttons to work alongside Search
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        const currentSearchQuery = searchInput ? searchInput.value : "";
        renderProducts(filter, currentSearchQuery);
    });
});

// --- FAQ Accordion Logic ---
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    questionBtn.addEventListener("click", () => {
        // Close others
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains("active")) {
                otherItem.classList.remove("active");
            }
        });
        // Toggle current
        item.classList.toggle("active");
    });
});
