const whatsappNumber = "919440630319";

const products = [
    {
        name: "Avakaya Mango Pickle",
        category: "veg",
        price: "From ₹180",
        image: "images/mango_pickle.jpg",
        description: "Classic Andhra mango pickle with mustard, chilli, and gingelly oil."
    },
    {
        name: "Tomato Pickle",
        category: "veg",
        price: "From ₹190",
        image: "images/tomato_pickle.jpg",
        description: "Tangy tomato pickle cooked down into a rich red homemade masala."
    },
    {
        name: "Lemon Pickle",
        category: "veg",
        price: "From ₹180",
        image: "images/lemon_pickle.jpg",
        description: "Bright, sharp lemon pickle made for curd rice and everyday meals."
    },
    {
        name: "Pandu Mirchi Pickle",
        category: "veg",
        price: "From ₹180",
        image: "images/pandu_mirchi_pickle.jpg",
        description: "Ripe red chilli pickle with bold heat and deep Andhra aroma."
    },
    {
        name: "Chicken Boneless Pickle",
        category: "non-veg",
        price: "From ₹360",
        image: "images/chicken_boneless_pickle.jpg",
        description: "Juicy boneless chicken pieces coated in spicy homemade pickle masala."
    },
    {
        name: "Gongura Chicken Pickle",
        category: "non-veg",
        price: "From ₹450",
        image: "images/gongura_chicken_pickle.jpg",
        description: "Chicken pickle with the sour punch of Andhra gongura leaves."
    },
    {
        name: "Prawns Pickle",
        category: "non-veg",
        price: "From ₹450",
        image: "images/prawns_pickle.jpg",
        description: "Spicy prawns pickle with a coastal-style masala finish."
    },
    {
        name: "Mutton Boneless Pickle",
        category: "non-veg",
        price: "From ₹580",
        image: "images/mutton_boneless_pickle.jpg",
        description: "Rich mutton pickle for special meals and festival gifting."
    },
    {
        name: "Boondi Laddu",
        category: "sweets",
        price: "Ask on WhatsApp",
        image: "images/flatlay_boondi_laddu.jpg",
        description: "Traditional sweet prepared in fresh batches for celebrations."
    },
    {
        name: "Chakralu",
        category: "hots",
        price: "Ask on WhatsApp",
        image: "images/flatlay_karam_podi.jpg",
        description: "Crunchy savory hots with a traditional Andhra snack texture."
    },
    {
        name: "Karam Podi",
        category: "powders",
        price: "Ask on WhatsApp",
        image: "images/flatlay_karam_podi.jpg",
        description: "Fiery podi blend for idli, dosa, rice, and ghee."
    },
    {
        name: "Karivepaku Podi",
        category: "powders",
        price: "Ask on WhatsApp",
        image: "images/flatlay_karivepaku_podi.jpg",
        description: "Curry leaf podi with roasted spices and homemade depth."
    },
    {
        name: "Veg Pickle Combo",
        category: "combos",
        price: "Ask on WhatsApp",
        image: "images/mango_pickle.jpg",
        description: "A family-friendly combo of classic Andhra veg pickle favorites."
    },
    {
        name: "Festival Family Combo",
        category: "combos",
        price: "Ask on WhatsApp",
        image: "images/andhra-hero-gk-pickles.png",
        description: "Pickles, podi, and snacks packed together for sharing at home."
    }
];

const productGrid = document.getElementById("product-grid");
const categoryButtons = document.querySelectorAll(".category-card");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const feedbackForm = document.getElementById("feedback-form");
const formStatus = document.getElementById("form-status");
const searchForm = document.querySelector(".site-search");
const searchInput = document.getElementById("product-search");
const cartToggle = document.querySelector(".cart-toggle");
const cartClose = document.querySelector(".cart-close");
const cartPanel = document.getElementById("cart-panel");
const cartCount = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items");
const cartOrder = document.getElementById("cart-order");
const shippingTicker = document.getElementById("shipping-ticker");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroSlideDots = document.querySelectorAll(".hero-slide-dots span");
const heroPrev = document.querySelector(".hero-slide-prev");
const heroNext = document.querySelector(".hero-slide-next");
let activeCategory = "veg";
let activeHeroSlide = 0;
let cartItems = [];

function orderLink(productName) {
    const message = `Hi GK Pickles, I want to order ${productName}. Please share availability, quantity options, and delivery details.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productRating(category) {
    return {
        veg: "4.8 (128)",
        "non-veg": "4.8 (96)",
        sweets: "4.7 (64)",
        hots: "4.6 (52)",
        powders: "4.7 (84)",
        combos: "4.9 (72)"
    }[category] || "4.8 (128)";
}

function productSlug(productName) {
    return productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function selectedQuantity(form) {
    return [...form.querySelectorAll('input[type="radio"]')]
        .find((input) => input.checked)?.value || "250g";
}

function openCart() {
    if (!cartPanel || !cartToggle) return;
    cartPanel.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartToggle.setAttribute("aria-expanded", "true");
}

function closeCart() {
    if (!cartPanel || !cartToggle) return;
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartToggle.setAttribute("aria-expanded", "false");
}

function cartMessage() {
    const lines = ["Hi GK Pickles, I want to order these items:"];
    cartItems.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name} - ${item.quantity}`);
    });
    lines.push("Please share availability, price, and delivery details.");
    return lines.join("\n");
}

function updateCart() {
    if (!cartCount || !cartItemsList || !cartOrder) return;
    cartCount.textContent = String(cartItems.length);

    if (!cartItems.length) {
        cartItemsList.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
        cartOrder.classList.add("is-disabled");
        cartOrder.setAttribute("href", "#");
        return;
    }

    cartItemsList.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong>
                <small>${item.quantity}</small>
            </div>
            <button class="cart-remove" type="button" data-cart-index="${index}">Remove</button>
        </div>
    `).join("");
    cartOrder.classList.remove("is-disabled");
    cartOrder.setAttribute("href", `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(cartMessage())}`);
}

function addToCart(productName, quantity) {
    cartItems.push({ name: productName, quantity });
    updateCart();
    openCart();
}

function renderProducts(category = activeCategory) {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const categoryProducts = category === "all"
        ? products
        : products.filter((product) => product.category === category);
    const visibleProducts = searchTerm
        ? categoryProducts.filter((product) => {
            const searchableText = `${product.name} ${product.description} ${categoryLabel(product.category)}`.toLowerCase();
            return searchableText.includes(searchTerm);
        })
        : categoryProducts;

    if (!visibleProducts.length) {
        productGrid.innerHTML = `<div class="no-results">No products found. Try mango, chicken, lemon, prawns, or podi.</div>`;
        return;
    }

    productGrid.innerHTML = visibleProducts.map((product) => {
        const slug = productSlug(product.name);
        return `
        <article class="product-card reveal visible" data-product-category="${product.category}">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-body">
                <div class="product-meta">
                    <span class="pill">${categoryLabel(product.category)}</span>
                    <span class="price">${product.price}</span>
                </div>
                <h3>${product.name}</h3>
                <p class="product-rating">⭐ ${productRating(product.category)}</p>
                <form class="quick-order-form" data-product-name="${product.name}">
                    <fieldset>
                        <legend>Select Quantity</legend>
                        <label><input type="radio" name="quantity-${slug}" value="250g" checked> 250g</label>
                        <label><input type="radio" name="quantity-${slug}" value="500g"> 500g</label>
                        <label><input type="radio" name="quantity-${slug}" value="1 Kg"> 1 Kg</label>
                    </fieldset>
                    <label>Name<input type="text" name="customerName" placeholder="Your name" required></label>
                    <label>Phone<input type="tel" name="customerPhone" placeholder="Phone number" required></label>
                    <label>Address<textarea name="customerAddress" rows="2" placeholder="Delivery address" required></textarea></label>
                    <div class="product-actions">
                        <button class="btn add-cart-card" type="button">Add to Cart</button>
                        <button class="btn whatsapp-card" type="submit">Order</button>
                    </div>
                </form>
            </div>
        </article>
    `;
    }).join("");
}

function categoryLabel(category) {
    return {
        veg: "Veg Pickles",
        "non-veg": "Non-Veg",
        sweets: "Sweets",
        hots: "Hots",
        powders: "Powders",
        combos: "Combos"
    }[category] || "GK Pickles";
}

function renderCategoryStatus() {
    categoryButtons.forEach((button) => {
        const category = button.dataset.category;
        const count = category === "all"
            ? products.length
            : products.filter((product) => product.category === category).length;
        button.querySelector(".category-status")?.remove();
        const action = button.querySelector(".category-action");
        const statusMarkup = `
            <div class="category-status">
                <span class="category-count">${count} ${count === 1 ? "Product" : "Products"}</span>
            </div>
        `;
        if (action) {
            action.insertAdjacentHTML("beforebegin", statusMarkup);
        } else {
            button.insertAdjacentHTML("beforeend", statusMarkup);
        }
    });
}

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        categoryButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeCategory = button.dataset.category;
        renderProducts(activeCategory);
        document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

if (searchInput) {
    searchInput.addEventListener("input", () => {
        renderProducts(activeCategory);
    });
}

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderProducts(activeCategory);
        document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

if (productGrid) {
    productGrid.addEventListener("click", (event) => {
        const addButton = event.target.closest(".add-cart-card");
        if (!addButton) return;

        const form = addButton.closest(".quick-order-form");
        if (!form) return;

        addToCart(form.dataset.productName, selectedQuantity(form));
    });

    productGrid.addEventListener("submit", (event) => {
        const form = event.target.closest(".quick-order-form");
        if (!form) return;

        event.preventDefault();

        const formData = new FormData(form);
        const productName = form.dataset.productName;
        const quantity = selectedQuantity(form);
        const name = formData.get("customerName");
        const phone = formData.get("customerPhone");
        const address = formData.get("customerAddress");
        const message = [
            `Hi GK Pickles, I want to order ${productName}.`,
            `Quantity: ${quantity}`,
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Address: ${address}`
        ].join("\n");

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
}

cartToggle?.addEventListener("click", () => {
    if (cartPanel?.classList.contains("open")) {
        closeCart();
    } else {
        openCart();
    }
});

cartClose?.addEventListener("click", closeCart);

cartItemsList?.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".cart-remove");
    if (!removeButton) return;
    const index = Number(removeButton.dataset.cartIndex);
    cartItems = cartItems.filter((_, itemIndex) => itemIndex !== index);
    updateCart();
});

menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 18);
    updateShippingTicker();
});

window.addEventListener("hashchange", updateShippingTicker);
window.addEventListener("load", updateShippingTicker);

function showHeroSlide(index) {
    if (!heroSlides.length) return;
    activeHeroSlide = index % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === activeHeroSlide);
    });
    heroSlideDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeHeroSlide);
    });
}

if (heroSlides.length) {
    heroSlideDots.forEach((dot, index) => {
        dot.addEventListener("click", () => showHeroSlide(index));
    });
    heroPrev?.addEventListener("click", () => showHeroSlide(activeHeroSlide - 1 + heroSlides.length));
    heroNext?.addEventListener("click", () => showHeroSlide(activeHeroSlide + 1));
    setInterval(() => showHeroSlide(activeHeroSlide + 1), 4200);
}

function updateShippingTicker() {
    const activeHash = ["#home", "#order"].includes(window.location.hash);
    const activeScroll = !window.location.hash && ["home", "order"].some((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect && rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.25;
    });
    shippingTicker?.classList.toggle("show", activeHash || activeScroll);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(feedbackForm);
    const name = formData.get("name");
    const contact = formData.get("contact");
    const message = formData.get("message");
    const text = `Hi GK Pickles, I have feedback.%0AName: ${encodeURIComponent(name)}%0AContact: ${encodeURIComponent(contact)}%0AMessage: ${encodeURIComponent(message)}`;

    formStatus.textContent = "Opening WhatsApp with your feedback...";
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener");
    feedbackForm.reset();
});

renderProducts();
renderCategoryStatus();
updateCart();
updateShippingTicker();
