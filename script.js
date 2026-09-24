const products = [];

const halloweenProducts = products.filter(product => ["fantasy", "retro"].includes(product.category));
const gadgetProducts = products.filter(product => !halloweenProducts.includes(product));
const sellLink = "https://allegro.pl";

function categoryName(category) {
  return { fantasy: "Fantasy", zwierzeta: "Zwierzęta", dekoracje: "Dekoracje", retro: "Retro" }[category];
}

function cardTemplate(product) {
  const image = product.image
    ? `<img src="${product.image}" alt="${product.name}" class="product-photo">`
    : '<div class="product-figure"></div>';
  return `
    <article class="product-card" data-id="${product.id}" data-image="${product.image || ""}" style="--card-bg:${product.bg}; --card-ink:${product.ink}; --card-accent:${product.accent};">
      <div class="product-image">
        ${product.label ? `<span class="product-badge">${product.label}</span>` : ""}
        ${image}
      </div>
      <div class="product-content">
        <div class="product-head">
          <h3 class="product-name">${product.name}</h3>
          <span class="product-price">${product.price} zł</span>
        </div>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-category">${categoryName(product.category)}</span>
          <a class="buy-link" href="${sellLink}" target="_blank" rel="noopener noreferrer">KUP NA ALLEGRO</a>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const halloweenGrid = document.querySelector("#halloween-grid");
  const gadgetsGrid = document.querySelector("#gadgets-grid");
  const manualHalloweenProducts = halloweenGrid ? halloweenGrid.querySelectorAll(".manual-product-card") : [];
  const manualGadgetProducts = gadgetsGrid ? gadgetsGrid.querySelectorAll(".manual-product-card") : [];

  if (halloweenGrid) {
    halloweenGrid.innerHTML = halloweenProducts.map(cardTemplate).join("");
    manualHalloweenProducts.forEach(card => halloweenGrid.appendChild(card));
  }

  if (gadgetsGrid) {
    gadgetsGrid.innerHTML = gadgetProducts.map(cardTemplate).join("");
    manualGadgetProducts.forEach(card => gadgetsGrid.appendChild(card));
  }

  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest(".buy-link")) {
        return;
      }
      openModal(card.dataset.id);
    });
  });
}

const modal = document.querySelector("#product-modal");

function openModal(id) {
  const product = products.find(item => item.id === id);
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  const manualProduct = card && card.dataset.manual === "true" ? card.dataset : null;
  if ((!product && !manualProduct) || !modal) return;

  const productData = product || {
    name: manualProduct.name,
    category: manualProduct.category,
    label: manualProduct.label,
    price: manualProduct.price,
    material: manualProduct.material || "Informacja u sprzedawcy",
    size: manualProduct.size || "—",
    time: manualProduct.time || "—",
    description: manualProduct.description,
    image: manualProduct.image,
    bg: manualProduct.bg || "#2a1b12",
    ink: manualProduct.ink || "#ffffff",
    accent: manualProduct.accent || "#ff7900"
  };

  const modalVisual = document.querySelector("#modal-visual");
  modalVisual.style.setProperty("--card-bg", productData.bg);
  modalVisual.style.setProperty("--card-ink", productData.ink);
  modalVisual.style.setProperty("--card-accent", productData.accent);
  modalVisual.innerHTML = productData.image
    ? `<img src="${productData.image}" alt="${productData.name}" class="modal-product-photo">`
    : '<div class="product-figure"></div>';

  const displayCategory = product ? categoryName(productData.category) : productData.category;
  document.querySelector("#modal-category").textContent = `${displayCategory} · ${productData.label || "Kolekcja DrukStwór"}`;
  document.querySelector("#modal-name").textContent = productData.name;
  document.querySelector("#modal-description").textContent = productData.description;
  document.querySelector("#modal-material").textContent = productData.material;
  document.querySelector("#modal-size").textContent = productData.size;
  document.querySelector("#modal-time").textContent = productData.time;
  document.querySelector("#modal-price").textContent = `${productData.price} zł`;

  const modalLink = document.querySelector("#modal-link");
  modalLink.href = manualProduct && manualProduct.link ? manualProduct.link : sellLink;
  modalLink.setAttribute("target", "_blank");
  modalLink.setAttribute("rel", "noopener noreferrer");

  modal.showModal();
}

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = (formData.get("name") || "").toString().trim();
    const subject = (formData.get("subject") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    const mailTo = `mailto:polopfir@gmail.com?subject=${encodeURIComponent(subject || "Zapytanie z DRUKSTWÓR")}&body=${encodeURIComponent(`Imię i nazwisko: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`)}`;

    formStatus.textContent = "Przekierowujemy do klienta mailowego…";
    window.location.href = mailTo;
    contactForm.reset();

    setTimeout(() => {
      formStatus.textContent = "Dziękujemy! Możesz też napisać bezpośrednio na polopfir@gmail.com";
    }, 500);
  });
}

if (modal) {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.close();
    }
  });

  const closeButton = modal.querySelector(".modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => modal.close());
  }
}

window.addEventListener("scroll", () => {
  document.body.classList.toggle("header-scrolled", window.scrollY > 20);
});

renderProducts();
