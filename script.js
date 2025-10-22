// ===================================
// FILOSTUDY - Portal de Estudos Filogenéticos
// ===================================

// Dados dos registros filogenéticos
let filoRecords = JSON.parse(localStorage.getItem("filoRecords")) || [
  {
    id: "1a2b3c",
    latitude: -23.5505,
    longitude: -46.6333,
    filo: "Tardigrada",
    classe: "Eutardigrada",
    ordem: "Ramazzottiida",
    familia: "Ramazzottiidae",
    genero: "Ramazzottius",
    especie: "oberhaeuseri",
    quantidade: 15,
    tamanho: 0.3,
    localidade: "Parque Ibirapuera, SP",
    habitat: "Terrestre",
    pesquisador: "Ana Silva",
    instituicao: "USP",
    caracteristicas:
      "Tardígrado com cutícula lisa, garras duplas bem desenvolvidas",
    observacoes: "Encontrado em musgo de árvore. Resistente à dessecação.",
    fotos: [],
    data: "2025-09-22T19:00:00Z",
  },
  {
    id: "4d5e6f",
    latitude: -15.7801,
    longitude: -47.9292,
    filo: "Arthropoda",
    classe: "Insecta",
    ordem: "Lepidoptera",
    familia: "Nymphalidae",
    genero: "Morpho",
    especie: "menelaus",
    quantidade: 3,
    tamanho: 120,
    localidade: "Parque Nacional de Brasília, DF",
    habitat: "Terrestre",
    pesquisador: "João Costa",
    instituicao: "UnB",
    caracteristicas: "Borboleta com asas azuis iridescentes, dimorfismo sexual",
    observacoes: "Observado durante voo nupcial no período matutino.",
    fotos: [],
    data: "2025-09-23T19:00:00Z",
  },
  {
    id: "7g8h9i",
    latitude: -8.0476,
    longitude: -34.877,
    filo: "Cnidaria",
    classe: "Anthozoa",
    ordem: "Scleractinia",
    familia: "Mussidae",
    genero: "Mussismilia",
    especie: "braziliensis",
    quantidade: 25,
    tamanho: 80,
    localidade: "Porto de Galinhas, PE",
    habitat: "Aquático Marinho",
    pesquisador: "Maria Santos",
    instituicao: "UFPE",
    caracteristicas: "Coral pétreo com pólipos grandes, esqueleto calcário",
    observacoes: "Colônia em formação recifal, boa condição de saúde.",
    fotos: [],
    data: "2025-09-24T19:00:00Z",
  },
];

// Estado da aplicação
let currentSection = "home";
let currentKeyStep = "start";
let keyHistory = [];

// Referências a elementos do DOM
const mapElement = document.getElementById("map");
const form = document.getElementById("form");
const recordsTableBody = document.getElementById("records-body");
const totalRegistrosSpan = document.getElementById("total-registros");
const totalFilosSpan = document.getElementById("total-filos");
const totalEspeciesSpan = document.getElementById("total-especies");
const filoFilter = document.getElementById("filo-filter");
const fotoInput = document.getElementById("foto");
const previewContainer = document.getElementById("image-preview");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const getLocationBtn = document.getElementById("getLocation");
const notification = document.getElementById("notification");

// Inicialização do Mapa Leaflet
const map = L.map(mapElement).setView([-15.7801, -47.9292], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ===================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ===================================

function showSection(sectionId) {
  // Fechar menu mobile se estiver aberto
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Esconde todas as seções
  const sections = document.querySelectorAll(".section, .hero-section");
  sections.forEach((section) => {
    section.classList.remove("active");
    section.classList.add("hidden");
  });

  // Mostra a seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden");
    targetSection.classList.add("active");
    currentSection = sectionId;

    // Se for o mapa, inicializa/atualiza o mapa
    if (sectionId === "mapa-filos") {
      setTimeout(() => {
        map.invalidateSize();
        renderAll();
      }, 100);
    }

    // Scroll suave para o topo
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Adicionar animação de entrada
    targetSection.style.opacity = "0";
    targetSection.style.transform = "translateY(20px)";

    setTimeout(() => {
      targetSection.style.transition = "all 0.4s ease-out";
      targetSection.style.opacity = "1";
      targetSection.style.transform = "translateY(0)";
    }, 50);
  }
}

// ===================================
// CHAVE DICOTÔMICA
// ===================================

const dichotomousKeyData = {
  start: {
    question: "O organismo possui células organizadas em tecidos verdadeiros?",
    options: [
      { text: "Sim - Possui tecidos organizados", next: "tecidos-sim" },
      { text: "Não - Células não organizadas em tecidos", next: "tecidos-nao" },
    ],
  },
  "tecidos-nao": {
    result: "Porifera",
    description:
      "Filo Porifera - Esponjas. Organismos aquáticos simples sem tecidos verdadeiros, com sistema de canais e poros para filtração de água.",
  },
  "tecidos-sim": {
    question: "O organismo possui simetria bilateral?",
    options: [
      { text: "Sim - Simetria bilateral", next: "bilateral" },
      { text: "Não - Simetria radial ou irregular", next: "radial" },
    ],
  },
  radial: {
    result: "Cnidaria",
    description:
      "Filo Cnidaria - Águas-vivas, corais, anêmonas. Organismos com simetria radial, cnidócitos (células urticantes) e duas camadas germinativas.",
  },
  bilateral: {
    question: "O organismo possui cavidade corporal (celoma)?",
    options: [
      { text: "Sim - Possui celoma", next: "celoma-sim" },
      { text: "Não - Acelomado ou pseudocelomado", next: "celoma-nao" },
    ],
  },
  "celoma-nao": {
    question: "O organismo possui forma corporal achatada?",
    options: [
      { text: "Sim - Corpo achatado dorsoventralmente", next: "achatado" },
      { text: "Não - Corpo cilíndrico ou fusiforme", next: "cilindrico" },
    ],
  },
  achatado: {
    result: "Platyhelminthes",
    description:
      "Filo Platyhelminthes - Vermes achatados. Organismos acelomados com corpo achatado, sistema digestório incompleto ou ausente.",
  },
  cilindrico: {
    result: "Nematoda",
    description:
      "Filo Nematoda - Vermes cilíndricos. Organismos pseudocelomados com corpo cilíndrico, sistema digestório completo e cutícula protetora.",
  },
  "celoma-sim": {
    question: "O organismo possui patas articuladas?",
    options: [
      { text: "Sim - Possui patas articuladas", next: "articuladas" },
      { text: "Não - Sem patas articuladas", next: "sem-articuladas" },
    ],
  },
  articuladas: {
    result: "Arthropoda",
    description:
      "Filo Arthropoda - Artrópodes. Organismos com exoesqueleto quitinoso, patas articuladas e corpo segmentado. Inclui insetos, crustáceos, aracnídeos.",
  },
  "sem-articuladas": {
    question: "O organismo possui concha externa?",
    options: [
      { text: "Sim - Possui concha", next: "concha" },
      { text: "Não - Sem concha externa", next: "sem-concha" },
    ],
  },
  concha: {
    result: "Mollusca",
    description:
      "Filo Mollusca - Moluscos. Organismos com corpo mole, frequentemente com concha calcária, pé muscular e manto. Inclui caracóis, ostras, lulas.",
  },
  "sem-concha": {
    question: "O organismo possui notocorda ou coluna vertebral?",
    options: [
      { text: "Sim - Possui notocorda ou vértebras", next: "cordados" },
      { text: "Não - Sem estruturas axiais", next: "outros-filos" },
    ],
  },
  cordados: {
    result: "Chordata",
    description:
      "Filo Chordata - Cordados. Organismos com notocorda, tubo neural dorsal e fendas faríngeas. Inclui peixes, anfíbios, répteis, aves e mamíferos.",
  },
  "outros-filos": {
    result: "Outros Filos",
    description:
      "Podem ser diversos outros filos como Tardigrada (tardígrados), Annelida (minhocas), Echinodermata (estrelas-do-mar), entre outros. Características específicas são necessárias para identificação precisa.",
  },
};

function nextStep(stepId) {
  const stepData = dichotomousKeyData[stepId];
  const currentStep = dichotomousKeyData[currentKeyStep];

  // Adiciona ao histórico
  if (currentStep && currentStep.question) {
    const selectedOption = currentStep.options.find(
      (opt) => opt.next === stepId
    );
    if (selectedOption) {
      keyHistory.push({
        question: currentStep.question,
        choice: selectedOption.text,
      });
      updateKeyHistory();
    }
  }

  currentKeyStep = stepId;

  if (stepData.result) {
    // Mostra resultado final
    showKeyResult(stepData);
  } else {
    // Mostra próximo passo
    showKeyStep(stepData);
  }
}

function showKeyStep(stepData) {
  const stepElement = document.getElementById("key-step");
  const resultElement = document.getElementById("key-result");

  if (stepElement) stepElement.style.display = "block";
  if (resultElement) resultElement.style.display = "none";

  const stepTitle = document.getElementById("step-title");
  if (stepTitle) stepTitle.textContent = `Passo ${keyHistory.length + 1}`;

  const stepContent = document.getElementById("step-content");
  if (stepContent) {
    stepContent.innerHTML = `
            <div class="key-question">
                <p><strong>${stepData.question}</strong></p>
            </div>
            <div class="key-options">
                ${stepData.options
                  .map(
                    (option) => `
                    <button class="key-option" onclick="nextStep('${option.next}')">
                        <i class="fas fa-arrow-right"></i>
                        ${option.text}
                    </button>
                `
                  )
                  .join("")}
            </div>
        `;
  }
}

function showKeyResult(resultData) {
  const stepElement = document.getElementById("key-step");
  const resultElement = document.getElementById("key-result");

  if (stepElement) stepElement.style.display = "none";
  if (resultElement) resultElement.style.display = "block";

  const resultContent = document.getElementById("result-content");
  if (resultContent) {
    resultContent.innerHTML = `
            <div class="result-filo">
                <h2>${resultData.result}</h2>
                <p>${resultData.description}</p>
            </div>
        `;
  }
}

function resetKey() {
  currentKeyStep = "start";
  keyHistory = [];
  updateKeyHistory();

  const startStep = dichotomousKeyData["start"];
  showKeyStep(startStep);
}

function updateKeyHistory() {
  const historyList = document.getElementById("choice-history");
  if (historyList) {
    historyList.innerHTML = keyHistory
      .map(
        (item, index) => `
            <li>
                <strong>${index + 1}.</strong> ${item.question}<br>
                <span style="color: var(--primary); margin-left: 20px;">→ ${
                  item.choice
                }</span>
            </li>
        `
      )
      .join("");
  }
}

// ===================================
// FUNÇÕES DE DADOS E RENDERIZAÇÃO
// ===================================

function showNotification(message, type = "success") {
  if (!notification) return;

  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  notification.style.transform = "translateX(0)";

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      notification.style.display = "none";
    }, 300);
  }, 3000);
}

function updateStats() {
  const totalRegistros = filoRecords.length;
  const filosUnicos = new Set(filoRecords.map((record) => record.filo)).size;
  const especiesUnicas = new Set(
    filoRecords.map((record) => record.genero + " " + record.especie)
  ).size;

  if (totalRegistrosSpan) totalRegistrosSpan.textContent = totalRegistros;
  if (totalFilosSpan) totalFilosSpan.textContent = filosUnicos;
  if (totalEspeciesSpan) totalEspeciesSpan.textContent = especiesUnicas;
}

function renderTable() {
  if (!recordsTableBody) return;

  let filteredRecords = filoRecords;

  // Aplica filtro se estiver selecionado
  if (filoFilter && filoFilter.value) {
    filteredRecords = filoRecords.filter(
      (record) => record.filo === filoFilter.value
    );
  }

  recordsTableBody.innerHTML = filteredRecords
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 10)
    .map((record) => {
      const date = new Date(record.data);
      const timeAgo =
        typeof moment !== "undefined"
          ? moment(date).fromNow()
          : date.toLocaleDateString();
      return `
                <tr>
                    <td>${record.filo}</td>
                    <td>${record.classe}</td>
                    <td><em>${record.genero} ${record.especie}</em></td>
                    <td>${record.localidade}</td>
                    <td>${record.pesquisador}</td>
                    <td>${timeAgo}</td>
                    <td>
                        <button class="btn-delete" data-id="${record.id}" title="Excluir registro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    })
    .join("");
}

function renderMap() {
  if (!map) return;

  // Limpa marcadores existentes
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });

  let filteredRecords = filoRecords;

  // Aplica filtro se estiver selecionado
  if (filoFilter && filoFilter.value) {
    filteredRecords = filoRecords.filter(
      (record) => record.filo === filoFilter.value
    );
  }

  // Cores por filo
  const filoColors = {
    Porifera: "#FF6B6B",
    Cnidaria: "#4ECDC4",
    Platyhelminthes: "#45B7D1",
    Nematoda: "#96CEB4",
    Arthropoda: "#FECA57",
    Mollusca: "#FF9FF3",
    Chordata: "#54A0FF",
    Tardigrada: "#5F27CD",
  };

  filteredRecords.forEach((record) => {
    const color = filoColors[record.filo] || "#666";

    const marker = L.circleMarker([record.latitude, record.longitude], {
      color: color,
      fillColor: color,
      fillOpacity: 0.7,
      radius: 8,
    }).addTo(map);

    const date = new Date(record.data);
    const formattedDate =
      typeof moment !== "undefined"
        ? moment(date).format("DD/MM/YYYY")
        : date.toLocaleDateString();

    marker.bindPopup(`
            <div class="popup-content">
                <h3>${record.filo}</h3>
                <p><strong>Espécie:</strong> <em>${record.genero} ${record.especie}</em></p>
                <p><strong>Classe:</strong> ${record.classe}</p>
                <p><strong>Local:</strong> ${record.localidade}</p>
                <p><strong>Habitat:</strong> ${record.habitat}</p>
                <p><strong>Pesquisador:</strong> ${record.pesquisador}</p>
                <p><strong>Quantidade:</strong> ${record.quantidade}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
            </div>
        `);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(form);
  const newRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    latitude: parseFloat(formData.get("latitude")),
    longitude: parseFloat(formData.get("longitude")),
    filo: formData.get("filo"),
    classe: formData.get("classe"),
    ordem: formData.get("ordem") || "",
    familia: formData.get("familia") || "",
    genero: formData.get("genero"),
    especie: formData.get("especie"),
    quantidade: parseInt(formData.get("quantidade")),
    tamanho: parseFloat(formData.get("tamanho")) || null,
    localidade: formData.get("localidade"),
    habitat: formData.get("habitat"),
    pesquisador: formData.get("pesquisador"),
    instituicao: formData.get("instituicao") || "",
    caracteristicas: formData.get("caracteristicas"),
    observacoes: formData.get("observacoes") || "",
    fotos: [],
    data: new Date().toISOString(),
  };

  filoRecords.push(newRecord);
  localStorage.setItem("filoRecords", JSON.stringify(filoRecords));

  showNotification("Registro salvo com sucesso!", "success");
  form.reset();
  if (previewContainer) previewContainer.innerHTML = "";
  renderAll();
}

function handleDeleteRecord(id) {
  if (confirm("Tem certeza que deseja excluir este registro?")) {
    filoRecords = filoRecords.filter((record) => record.id !== id);
    localStorage.setItem("filoRecords", JSON.stringify(filoRecords));
    showNotification("Registro excluído com sucesso!", "success");
    renderAll();
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (latitudeInput && longitudeInput) {
          latitudeInput.value = position.coords.latitude.toFixed(6);
          longitudeInput.value = position.coords.longitude.toFixed(6);
        }
        map.setView([position.coords.latitude, position.coords.longitude], 13);
        showNotification("Localização obtida!", "success");
      },
      (error) => {
        showNotification("Erro ao obter localização. Clique no mapa.", "error");
        console.error("Geolocation error:", error);
      }
    );
  } else {
    showNotification(
      "Geolocalização não é suportada por este navegador.",
      "error"
    );
  }
}

function renderAll() {
  updateStats();
  renderTable();
  renderMap();
}

// ===================================
// INICIALIZAÇÃO
// ===================================

function init() {
  // Mostra a página inicial
  showSection("home");

  // Adiciona evento de clique no mapa para preencher coordenadas
  if (map) {
    map.on("click", (e) => {
      if (latitudeInput && longitudeInput) {
        latitudeInput.value = e.latlng.lat.toFixed(6);
        longitudeInput.value = e.latlng.lng.toFixed(6);
      }
    });
  }

  // Event listeners
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getLocation);
  }

  if (filoFilter) {
    filoFilter.addEventListener("change", renderAll);
  }

  if (fotoInput && previewContainer) {
    fotoInput.addEventListener("change", () => {
      previewContainer.innerHTML = "";
      const files = fotoInput.files;
      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.width = "100px";
            img.style.height = "100px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "8px";
            img.style.margin = "4px";
            previewContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  if (recordsTableBody) {
    recordsTableBody.addEventListener("click", (e) => {
      const target = e.target.closest(".btn-delete");
      if (target) {
        const id = target.dataset.id;
        handleDeleteRecord(id);
      }
    });
  }

  // Inicializa a chave dicotômica
  if (document.getElementById("chave-dicotomica")) {
    setTimeout(() => resetKey(), 100);
  }

  // Renderiza dados iniciais
  renderAll();
}

// Inicializa a aplicação
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ===== MELHORIAS DE PERFORMANCE E UX =====

// Debounce para redimensionamento de janela
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Otimizar redimensionamento
const optimizedResize = debounce(() => {
  if (window.innerWidth >= 768 && isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Reajustar mapa se existir
  if (typeof map !== "undefined" && map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
}, 250);

window.addEventListener("resize", optimizedResize);

// Melhorar navegação com teclado
document.addEventListener("keydown", (e) => {
  // Fechar menu mobile com ESC
  if (e.key === "Escape" && isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Navegação com TAB no menu mobile
  if (isMobileMenuOpen && e.key === "Tab") {
    const focusableElements = document.querySelectorAll(
      ".mobile-nav-item, .mobile-nav-close"
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
});

// Adicionar feedback tátil em dispositivos móveis
function addHapticFeedback() {
  if ("vibrate" in navigator) {
    navigator.vibrate(10); // Vibração leve
  }
}

// Melhorar performance do scroll
let ticking = false;
function updateOnScroll() {
  const navbar = document.querySelector(".navbar");
  const scrollY = window.scrollY;

  if (scrollY > 100) {
    navbar.style.backdropFilter = "blur(25px)";
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
  } else {
    navbar.style.backdropFilter = "blur(20px)";
    navbar.style.background = "rgba(255, 255, 255, 0.25)";
  }

  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateOnScroll);
    ticking = true;
  }
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });

// Lazy loading para imagens
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Detectar tipo de dispositivo
function detectDevice() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isTablet =
    /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  document.documentElement.classList.toggle("is-mobile", isMobile);
  document.documentElement.classList.toggle("is-tablet", isTablet);
  document.documentElement.classList.toggle("is-touch", isTouchDevice);

  // Otimizações específicas para cada dispositivo
  if (isMobile) {
    // Otimizar para mobile
    document.body.style.overscrollBehavior = "none";
  }

  if (isTouchDevice) {
    // Adicionar classes para otimizar interações touch
    document.body.classList.add("touch-device");
  }
}

// Melhorar carregamento de fontes
function preloadFonts() {
  const fonts = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  ];

  fonts.forEach((font) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = font;
    link.as = "style";
    link.onload = () => {
      link.rel = "stylesheet";
    };
    document.head.appendChild(link);
  });
}

// Inicializar melhorias
document.addEventListener("DOMContentLoaded", () => {
  detectDevice();
  lazyLoadImages();
  preloadFonts();

  // Adicionar indicadores de carregamento
  document.body.classList.add("loaded");
});

// Service Worker para PWA (opcional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registrado com sucesso");
      })
      .catch((registrationError) => {
        console.log("Falha ao registrar SW");
      });
  });
}

// Arquivo finalizado com melhorias de responsividade implementadas

  isMobileMenuOpen = !isMobileMenuOpen;

  if (isMobileMenuOpen) {
    mobileNav.classList.add("active");
    mobileMenuBtn.classList.add("active");
    document.body.style.overflow = "hidden"; // Previne scroll do body
  } else {
    mobileNav.classList.remove("active");
    mobileMenuBtn.classList.remove("active");
    document.body.style.overflow = "auto";
  }

// Fechar menu mobile ao clicar fora
document.addEventListener("click", (e) => {
  const mobileNav = document.getElementById("mobile-nav");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");

  if (
    isMobileMenuOpen &&
    !mobileNav.contains(e.target) &&
    !mobileMenuBtn.contains(e.target)
  ) {
    toggleMobileMenu();
  }
});

// Fechar menu mobile ao redimensionar para desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen) {
    toggleMobileMenu();
  }
});

// Função duplicada removida - usando a versão melhorada acima

// Adicionar listeners para navegação desktop e mobile
document.addEventListener("DOMContentLoaded", () => {
  // Desktop navigation
  const desktopNavLinks = document.querySelectorAll(".desktop-nav a");
  desktopNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Mobile navigation
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-item");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Mostrar seção inicial
  showSection("home");
});
