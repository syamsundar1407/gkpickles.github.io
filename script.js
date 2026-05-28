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
    }
];

const productGrid = document.getElementById("product-grid");
const categoryButtons = document.querySelectorAll(".category-card");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const feedbackForm = document.getElementById("feedback-form");
const formStatus = document.getElementById("form-status");

function orderLink(productName) {
    const message = `Hi GK Pickles, I want to order ${productName}. Please share availability, quantity options, and delivery details.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function renderProducts(category = "all") {
    const visibleProducts = category === "all"
        ? products
        : products.filter((product) => product.category === category);

    productGrid.innerHTML = visibleProducts.map((product) => `
        <article class="product-card reveal visible" data-product-category="${product.category}">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-body">
                <div class="product-meta">
                    <span class="pill">${categoryLabel(product.category)}</span>
                    <span class="price">${product.price}</span>
                </div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <a class="btn whatsapp-card" href="${orderLink(product.name)}" target="_blank" rel="noopener">Order through WhatsApp</a>
            </div>
        </article>
    `).join("");
}

function categoryLabel(category) {
    return {
        veg: "Veg Pickles",
        "non-veg": "Non-Veg",
        sweets: "Sweets",
        hots: "Hots",
        powders: "Powders"
    }[category] || "GK Pickles";
}

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        categoryButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderProducts(button.dataset.category);
        document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
});

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
