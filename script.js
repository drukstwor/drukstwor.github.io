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

const grid = document.querySelector("#product-grid");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const empty = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");
let activeFilter = "all";

function cardTemplate(product) {
  return `<article class="product-card" data-id="${product.id}" style="--card-bg:${product.bg};--card-ink:${product.ink};--card-accent:${product.accent}">
    <div class="product-image">${product.label ? `<span class="product-tag">${product.label}</span>` : ""}<button class="favorite" aria-label="Dodaj ${product.name} do ulubionych">♡</button><div class="product-shape"></div></div>
    <div class="product-info"><div><h3>${product.name}</h3><span class="product-category">${categoryName(product.category)}</span></div><span class="product-price">${product.price} zł</span></div>
  </article>`;
}

function categoryName(category) {
  return {fantasy:"Fantasy",zwierzeta:"Zwierzęta",dekoracje:"Dekoracje",retro:"Retro"}[category];
}

function renderProducts() {
  const query = search.value.toLowerCase().trim();
  let visible = products.filter(product => (activeFilter === "all" || product.category === activeFilter) && `${product.name} ${categoryName(product.category)}`.toLowerCase().includes(query));
  if (sort.value === "price-low") visible.sort((a,b) => a.price - b.price);
  if (sort.value === "price-high") visible.sort((a,b) => b.price - a.price);
  if (sort.value === "name") visible.sort((a,b) => a.name.localeCompare(b.name, "pl"));
  grid.innerHTML = visible.map(cardTemplate).join("");
  empty.style.display = visible.length ? "none" : "block";
  resultCount.textContent = visible.length;
  grid.querySelectorAll(".product-card").forEach(card => card.addEventListener("click", event => {
    if (event.target.closest(".favorite")) {
      event.target.classList.toggle("active");
      event.target.textContent = event.target.classList.contains("active") ? "♥" : "♡";
      return;
    }
    openModal(Number(card.dataset.id));
  }));
}

document.querySelectorAll(".filter-tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelector(".filter-tab.active").classList.remove("active");
  tab.classList.add("active");
  activeFilter = tab.dataset.filter;
  renderProducts();
}));
search.addEventListener("input", renderProducts);
sort.addEventListener("change", renderProducts);

const modal = document.querySelector("#product-modal");
function openModal(id) {
  const product = products.find(item => item.id === id);
  document.querySelector("#modal-visual").style.cssText = `--card-bg:${product.bg};--card-ink:${product.ink};--card-accent:${product.accent}`;
  document.querySelector("#modal-visual").innerHTML = `<div class="product-shape"></div>`;
  document.querySelector("#modal-category").textContent = `${categoryName(product.category)} · ${product.label || "Kolekcja FORMA"}`;
  document.querySelector("#modal-name").textContent = product.name;
  document.querySelector("#modal-description").textContent = product.description;
  document.querySelector("#modal-material").textContent = product.material;
  document.querySelector("#modal-size").textContent = product.size;
  document.querySelector("#modal-time").textContent = product.time;
  document.querySelector("#modal-price").textContent = `${product.price} zł`;
  modal.showModal();
}
document.querySelector(".modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", event => { if (event.target === modal) modal.close(); });

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#form-status");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = (formData.get("name") || "").toString().trim();
    const subject = (formData.get("subject") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const product = (formData.get("product") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const mailTo = `mailto:biuro@drukstwór.pl?subject=${encodeURIComponent(subject || "Zapytanie z DRUKSTWÓR")}&body=${encodeURIComponent(`Imię i nazwisko: ${name}\nEmail: ${email}\nProdukt / idea: ${product || "brak"}\n\nWiadomość:\n${message}`)}`;
    formStatus.textContent = "Przekierowujemy do klienta mailowego…";
    window.location.href = mailTo;
    contactForm.reset();
    setTimeout(() => {
      formStatus.textContent = "Dziękujemy! Możesz też napisać bezpośrednio na biuro@drukstwór.pl";
    }, 500);
  });
}

renderProducts();
