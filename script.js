const products = [];

const sellLink = "https://allegro.pl";

function cardTemplate(product) {
  const image = product.image
    ? `<img src="${product.image}" alt="${product.name}" class="product-photo">`
    : '<div class="product-figure"></div>';
  const olxLink = product.olxLink
    ? `<a class="buy-link" href="${product.olxLink}" target="_blank" rel="noopener noreferrer">KUP NA OLX</a>`
    : "";
  return `
    <article class="product-card" data-id="${product.id}" data-image="${product.image || ""}" style="--card-bg:${product.bg || "#eae6e1"}; --card-ink:${product.ink || "#ed7415"}; --card-accent:${product.accent || "#ed7415"};">
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
          <span class="product-category">Produkt 3D</span>
          <div class="product-actions">
            <a class="buy-link" href="${product.link || sellLink}" target="_blank" rel="noopener noreferrer">KUP NA ALLEGRO</a>
            ${olxLink}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const productGrid = document.querySelector("#products-grid");
  const emptyState = document.querySelector("#products-empty");
  const manualProducts = productGrid ? [...productGrid.querySelectorAll(".manual-product-card")] : [];

  if (productGrid) {
    productGrid.innerHTML = products.map(cardTemplate).join("");
    manualProducts.forEach(card => productGrid.appendChild(card));
  }

  if (emptyState) {
    emptyState.hidden = Boolean(productGrid && productGrid.children.length);
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

  const displayCategory = "Produkt 3D";
  document.querySelector("#modal-category").textContent = `${displayCategory} · ${productData.label || "Kolekcja DrukStwór"}`;
  document.querySelector("#modal-name").textContent = productData.name;
  document.querySelector("#modal-description").textContent = productData.description;
  document.querySelector("#modal-material").textContent = productData.material;
  document.querySelector("#modal-size").textContent = productData.size;
  document.querySelector("#modal-time").textContent = productData.time;
  document.querySelector("#modal-price").textContent = `${productData.price} zł`;

  const modalLink = document.querySelector("#modal-link");
  modalLink.href = manualProduct ? manualProduct.link || sellLink : product.link || sellLink;
  modalLink.setAttribute("target", "_blank");
  modalLink.setAttribute("rel", "noopener noreferrer");

  const modalOlxLink = document.querySelector("#modal-olx-link");
  if (modalOlxLink) {
    const olxLink = manualProduct ? manualProduct.olxLink : product.olxLink;
    modalOlxLink.hidden = !olxLink;
    if (olxLink) {
      modalOlxLink.href = olxLink;
    }
  }

  modal.showModal();
}

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const themeToggle = document.querySelector(".theme-toggle");

function setTheme(theme, persist = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Włącz ${isDark ? "jasny" : "ciemny"} motyw`);
    themeToggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☀" : "☾";
    themeToggle.querySelector(".theme-toggle-label").textContent = isDark ? "Jasny motyw" : "Ciemny motyw";
  }

  if (persist) {
    try {
      localStorage.setItem("drukstwor-theme", isDark ? "dark" : "light");
    } catch (error) {
      console.warn("Nie udało się zapisać wybranego motywu.", error);
    }
  }
}

if (themeToggle) {
  setTheme(document.documentElement.dataset.theme || "light");
  themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
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

const footerYear = document.querySelector("#footer-year");
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

renderProducts();
