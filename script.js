const products = [
  {id:1,name:"Leśny duch",category:"fantasy",label:"Bestseller",price:89,material:"PLA premium",size:"12 cm",time:"9 h",description:"Cichy strażnik leśnych zakamarków. Leśny duch łączy organiczne kształty z odrobiną magii.",bg:"#dbe2ab",ink:"#34362e",accent:"#d8f26b"},
  {id:2,name:"Kot astronauta",category:"zwierzeta",label:"Nowość",price:79,material:"PLA premium",size:"10 cm",time:"7 h",description:"Mały krok dla kota, wielki skok dla Twojej półki. Idealny prezent dla fanów kosmosu i mruczenia.",bg:"#d5dfeb",ink:"#344452",accent:"#f1c95c"},
  {id:3,name:"Smok z północy",category:"fantasy",label:"Limitowana",price:129,material:"Żywica",size:"16 cm",time:"18 h",description:"Detaliczny smok inspirowany nordyckimi sagami. Każdy egzemplarz ma swój własny charakter.",bg:"#e4c8ba",ink:"#482f2a",accent:"#ee754d"},
  {id:4,name:"Głowa Dawida",category:"dekoracje",label:"Klasyk",price:99,material:"PLA kamień",size:"15 cm",time:"12 h",description:"Klasyka w nowoczesnym wydaniu. Minimalistyczny akcent do biura, pracowni lub salonu.",bg:"#deddd8",ink:"#8e8a80",accent:"#f4f2ec"},
  {id:5,name:"Żaba zen",category:"zwierzeta",label:"Bestseller",price:69,material:"PLA premium",size:"9 cm",time:"6 h",description:"Oddychaj. Puść. Uśmiechnij się. Żaba zen pilnuje, żeby na biurku było trochę spokojniej.",bg:"#d1e4b4",ink:"#4f713f",accent:"#d8f26b"},
  {id:6,name:"Rycerz pikseli",category:"retro",label:"Nowość",price:109,material:"PLA premium",size:"13 cm",time:"11 h",description:"Hołd dla 8-bitowych bohaterów. Wyrazista figurka dla graczy i kolekcjonerów retro.",bg:"#d5c7e3",ink:"#403358",accent:"#ee754d"},
  {id:7,name:"Księżycowy lis",category:"fantasy",label:"",price:84,material:"PLA premium",size:"11 cm",time:"8 h",description:"Lis, który zna drogę nawet wtedy, gdy światło księżyca jest jedynym drogowskazem.",bg:"#d8d9e8",ink:"#404466",accent:"#f1c95c"},
  {id:8,name:"Monstera mini",category:"dekoracje",label:"",price:59,material:"PLA roślinny",size:"14 cm",time:"5 h",description:"Roślina, której nie trzeba podlewać. Delikatny, botaniczny detal do każdego wnętrza.",bg:"#c9dfd4",ink:"#37604b",accent:"#d8f26b"},
  {id:9,name:"Robot 1984",category:"retro",label:"Limitowana",price:119,material:"PLA premium",size:"14 cm",time:"13 h",description:"Futurystyczny klasyk z przymrużeniem oka. Robot, który zdecydowanie nie przejmie Twojej pracy.",bg:"#e2d3be",ink:"#575044",accent:"#ee754d"},
  {id:10,name:"Golem kamienny",category:"fantasy",label:"",price:139,material:"PLA kamień",size:"18 cm",time:"20 h",description:"Surowy i monumentalny golem, który wnosi do wnętrza odrobinę przygody.",bg:"#d3d5d0",ink:"#4c514c",accent:"#f1c95c"},
  {id:11,name:"Wieloryb",category:"zwierzeta",label:"",price:74,material:"PLA premium",size:"12 cm",time:"8 h",description:"Spokojny olbrzym z głębin. Miękka forma i łagodny charakter w kompaktowym rozmiarze.",bg:"#c5dfe5",ink:"#335a64",accent:"#d8f26b"},
  {id:12,name:"Wazon Orbita",category:"dekoracje",label:"",price:89,material:"PLA premium",size:"19 cm",time:"15 h",description:"Funkcjonalna forma inspirowana ruchem planet. Na kwiaty, patyczki lub po prostu dobry design.",bg:"#ecd0c5",ink:"#70483e",accent:"#f4f2ec"}
];

const halloweenProducts = products.filter(product => ["fantasy", "retro"].includes(product.category));
const gadgetProducts = products.filter(product => !halloweenProducts.includes(product));
const sellLink = "https://allegro.pl";

function categoryName(category) {
  return { fantasy: "Fantasy", zwierzeta: "Zwierzęta", dekoracje: "Dekoracje", retro: "Retro" }[category];
}

function cardTemplate(product) {
  return `
    <article class="product-card" data-id="${product.id}" style="--card-bg:${product.bg}; --card-ink:${product.ink}; --card-accent:${product.accent};">
      <div class="product-image">
        ${product.label ? `<span class="product-badge">${product.label}</span>` : ""}
        <div class="product-figure"></div>
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
    bg: manualProduct.bg || "#2a1b12",
    ink: manualProduct.ink || "#ffffff",
    accent: manualProduct.accent || "#ff7900"
  };

  const modalVisual = document.querySelector("#modal-visual");
  modalVisual.style.setProperty("--card-bg", productData.bg);
  modalVisual.style.setProperty("--card-ink", productData.ink);
  modalVisual.style.setProperty("--card-accent", productData.accent);
  modalVisual.innerHTML = '<div class="product-figure"></div>';

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
    const product = (formData.get("product") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    const mailTo = `mailto:polopfir@gmail.com?subject=${encodeURIComponent(subject || "Zapytanie z DRUKSTWÓR")}&body=${encodeURIComponent(`Imię i nazwisko: ${name}\nEmail: ${email}\nProdukt / idea: ${product || "brak"}\n\nWiadomość:\n${message}`)}`;

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
