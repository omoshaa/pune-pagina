// ===================================
// TARDISTUDY - Portal de Estudos de Tardigrada
// Script principal da aplicação
// ===================================

// ============================================================
// MENU MOBILE E NAVEGAÇÃO RESPONSIVA
// ============================================================
let isMobileMenuOpen = false;
function toggleMobileMenu() {
  const mobileNav = document.getElementById("mobile-nav");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  if (!mobileNav || !mobileMenuBtn) return;
  isMobileMenuOpen = !isMobileMenuOpen;
  if (isMobileMenuOpen) {
    mobileNav.classList.add("active");
    mobileMenuBtn.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    mobileNav.classList.remove("active");
    mobileMenuBtn.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// ============================================================
// NAVEGAÇÃO ENTRE SEÇÕES (SPA - Single Page Application)
// ============================================================
function showSection(sectionId) {
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }
  const sections = document.querySelectorAll(
    "main > .section, main > .hero-section"
  );
  sections.forEach((section) => {
    section.classList.add("hidden");
  });

  // Seção "home" é a hero-section
  if (sectionId === "home") {
    document.getElementById("home").classList.remove("hidden");
  } else {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove("hidden");
    }
  }

  // Lógica pós-exibição
  setTimeout(() => {
    if (sectionId === "mapa-tardigrada" && !map) {
      initMap();
      renderAll();
    } else if (sectionId === "mapa-tardigrada" && map) {
      map.invalidateSize();
      renderAll(); // Garante que filtros e tabela sejam atualizados
    }
    if (sectionId === "chave-dicotomica") {
      resetKey();
    }
    if (sectionId === "guia-estruturas") {
      renderStructures();
    }
  }, 300);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ============================================================
// DADOS DOS REGISTROS DE TARDIGRADA
// ============================================================
let tardiRecords = JSON.parse(localStorage.getItem("tardiRecords")) || [
  {
    id: "1a2b3c",
    latitude: -23.5505,
    longitude: -46.6333,
    classe: "Eutardigrada",
    ordem: "Parachela",
    superfamilia: "Macrobiotoidea",
    familia: "Macrobiotidae",
    genero: "Macrobiotus",
    especie: "harmsworthi", // Adicionado
    localidade: "Parque Ibirapuera, SP",
    habitat: "Terrestre - Musgo",
    pesquisador: "Ana Silva",
    instituicao: "USP",
    fotos: [],
    data: "2025-09-22T19:00:00Z",
  },
  {
    id: "4d5e6f",
    latitude: -15.7801,
    longitude: -47.9292,
    classe: "Heterotardigrada",
    ordem: "Echiniscoidea",
    superfamilia: "",
    familia: "Echiniscidae",
    genero: "Echiniscus",
    especie: "testudo", // Adicionado
    localidade: "Parque Nacional de Brasília, DF",
    habitat: "Terrestre - Líquen",
    pesquisador: "João Costa",
    instituicao: "UnB",
    fotos: [],
    data: "2025-09-23T19:00:00Z",
  },
  {
    id: "7g8h9i",
    latitude: -22.9068,
    longitude: -43.1729,
    classe: "Eutardigrada",
    ordem: "Apochela",
    superfamilia: "",
    familia: "Milnesiidae",
    genero: "Milnesium",
    especie: "tardigradum", // Adicionado
    localidade: "Tijuca, Rio de Janeiro, RJ",
    habitat: "Terrestre - Folhiço",
    pesquisador: "Maria Santos",
    instituicao: "UFRJ",
    fotos: [],
    data: "2025-09-24T19:00:00Z",
  },
  // === NOVOS DADOS ADICIONADOS ===
  // Escola Gonzaga (SP) - Coordenadas aproximadas da Penha, SP
  {
    id: "gonzaga1",
    latitude: -23.5284,
    longitude: -46.5432,
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
    genero: "Mesobiotus",
    especie: "",
    localidade: "Escola Estadual Prof. Aprígio Gonzaga (SP)",
    habitat: "Terrestre - Musgo",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Gonzaga",
    fotos: [],
    data: "2025-10-29T10:00:00Z",
  },
  {
    id: "gonzaga2",
    latitude: -23.5285,
    longitude: -46.5433,
    classe: "Heterotardigrada",
    ordem: "Echiniscoidea",
    familia: "Echiniscidae",
    genero: "Pseudoechiniscus",
    especie: "",
    localidade: "Escola Estadual Prof. Aprígio Gonzaga (SP)",
    habitat: "Terrestre - Líquen",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Gonzaga",
    fotos: [],
    data: "2025-10-29T10:01:00Z",
  },
  {
    id: "gonzaga3",
    latitude: -23.5286,
    longitude: -46.5434,
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
    genero: "Paramacrobiotus",
    especie: "",
    localidade: "Escola Estadual Prof. Aprígio Gonzaga (SP)",
    habitat: "Terrestre - Musgo",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Gonzaga",
    fotos: [],
    data: "2025-10-29T10:02:00Z",
  },
  {
    id: "gonzaga4",
    latitude: -23.5287,
    longitude: -46.5435,
    classe: "Eutardigrada",
    ordem: "Apochela",
    familia: "Milnesiidae",
    genero: "Milnesium",
    especie: "",
    localidade: "Escola Estadual Prof. Aprígio Gonzaga (SP)",
    habitat: "Terrestre - Folhiço",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Gonzaga",
    fotos: [],
    data: "2025-10-29T10:03:00Z",
  },
  // Julio Mesquita (Campinas) - Coordenadas aproximadas de Campinas
  {
    id: "julio1",
    latitude: -22.9345,
    longitude: -47.0461,
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
    genero: "Paramacrobiotus",
    especie: "",
    localidade: "Escola Estadual Julio de Mesquita (Campinas)",
    habitat: "Terrestre - Musgo",
    pesquisador: "Danilo de Castro Santos",
    instituicao: "EE Julio de Mesquita",
    fotos: [],
    data: "2025-10-29T11:00:00Z",
  },
  // Maria de Lourdes (Campinas) - Coordenadas aproximadas de Campinas
  {
    id: "maria1",
    latitude: -22.9715,
    longitude: -47.1082,
    classe: "Eutardigrada",
    ordem: "Apochela",
    familia: "Milnesiidae",
    genero: "Milnesium",
    especie: "",
    localidade: "EE Maria de Lourdes (Campinas)",
    habitat: "Terrestre - Musgo",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Maria de Lourdes",
    fotos: [],
    data: "2025-10-29T12:00:00Z",
  },
  {
    id: "maria2",
    latitude: -22.9716,
    longitude: -47.1083,
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
    genero: "Paramacrobiotus",
    especie: "",
    localidade: "EE Maria de Lourdes (Campinas)",
    habitat: "Terrestre - Líquen",
    pesquisador: "Aluno PUNE",
    instituicao: "EE Maria de Lourdes",
    fotos: [],
    data: "2025-10-29T12:01:00Z",
  },
];

// ============================================================
// MAPA DE TAXONOMIA (Para formulário simplificado)
// ============================================================
const GENUS_TAXONOMY_MAP = {
  Macrobiotus: {
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
  },
  Echiniscus: {
    classe: "Heterotardigrada",
    ordem: "Echiniscoidea",
    familia: "Echiniscidae",
  },
  Milnesium: {
    classe: "Eutardigrada",
    ordem: "Apochela",
    familia: "Milnesiidae",
  },
  Mesobiotus: {
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
  },
  Pseudoechiniscus: {
    classe: "Heterotardigrada",
    ordem: "Echiniscoidea",
    familia: "Echiniscidae",
  },
  Paramacrobiotus: {
    classe: "Eutardigrada",
    ordem: "Parachela",
    familia: "Macrobiotidae",
  },
  Outro: {
    classe: "Indeterminado",
    ordem: "Indeterminado",
    familia: "Indeterminado",
  },
  // Adicionar outros gêneros da chave aqui...
};

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
let map = null;
let markers = [];
let currentStep = "1"; // Usar string para IDs
let choiceHistory = [];

// ============================================================
// MAPA INTERATIVO LEAFLET
// ============================================================
function initMap() {
  if (typeof L === "undefined") {
    console.log("Leaflet não está carregado");
    return;
  }
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.log("Elemento do mapa não encontrado");
    return;
  }
  try {
    map = L.map("map").setView([-15.7942, -47.8822], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(map);
    setTimeout(() => {
      renderMarkers();
      map.invalidateSize();
    }, 500);
    console.log("Mapa inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar o mapa:", error);
  }
}

function renderMarkers() {
  if (!map) return;
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  const filteredRecords = getFilteredRecords();
  filteredRecords.forEach((record) => {
    const popupHtml = `
      <div class="popup-content">
        <h4>${escapeHtml(record.classe)} - <i>${escapeHtml(
      record.genero
    )}</i></h4>
        <p><strong>Gênero:</strong> <i>${escapeHtml(
          record.genero
        )} ${escapeHtml(record.especie)}</i></p>
        <p><strong>Local:</strong> ${escapeHtml(record.localidade)}</p>
        <p><strong>Pesquisador:</strong> ${escapeHtml(record.pesquisador)}</p>
        <p><strong>Data:</strong> ${new Date(record.data).toLocaleDateString(
          "pt-BR"
        )}</p>
      </div>
    `;
    const marker = L.marker([record.latitude, record.longitude])
      .addTo(map)
      .bindPopup(popupHtml);
    markers.push(marker);
  });
}

function getFilteredRecords() {
  const grupoFilter = document.getElementById("grupo-filter")?.value;
  const generoFilter = document.getElementById("genero-filter")?.value;

  return tardiRecords.filter((record) => {
    const grupoMatch =
      !grupoFilter ||
      record.classe === grupoFilter ||
      record.ordem === grupoFilter;
    const generoMatch = !generoFilter || record.genero === generoFilter;
    return grupoMatch && generoMatch;
  });
}

// Popula o filtro de Gênero
function populateGeneroFilter() {
  const generoFilter = document.getElementById("genero-filter");
  if (!generoFilter) return;

  const generos = [...new Set(tardiRecords.map((r) => r.genero))]
    .filter((g) => g && g.trim() !== "" && g !== "Outro")
    .sort();

  // Limpa opções antigas (exceto a primeira "Todos")
  generoFilter.innerHTML = '<option value="">Todos os Gêneros</option>';

  generos.forEach((genero) => {
    const option = document.createElement("option");
    option.value = genero;
    option.textContent = genero;
    generoFilter.appendChild(option);
  });
}

// ============================================================
// ESTATÍSTICAS (Cards de contadores)
// ============================================================
function updateStats() {
  const totalRegistros = tardiRecords.length;
  const totalGrupos = [...new Set(tardiRecords.map((r) => r.classe))].filter(
    (g) => g !== "Indeterminado"
  ).length;
  const totalGeneros = [...new Set(tardiRecords.map((r) => r.genero))].filter(
    (g) => g !== "Outro"
  ).length;

  document.getElementById("total-registros").textContent = totalRegistros;
  document.getElementById("total-grupos").textContent = totalGrupos;
  document.getElementById("total-especies").textContent = totalGeneros; // ID no HTML ainda é "total-especies", mas agora conta Gêneros
}

// ============================================================
// FORMULÁRIO DE CADASTRO (Atualizado)
// ============================================================
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const genero = formData.get("genero");
  const taxonomia = GENUS_TAXONOMY_MAP[genero] || GENUS_TAXONOMY_MAP["Outro"];

  const newRecord = {
    id: generateId(),
    latitude: parseFloat(formData.get("latitude")),
    longitude: parseFloat(formData.get("longitude")),

    // Preenchido automaticamente pelo GENUS_TAXONOMY_MAP
    classe: taxonomia.classe,
    ordem: taxonomia.ordem,
    familia: taxonomia.familia,

    // Preenchido pelo formulário
    genero: genero,
    especie: formData.get("especie") || "",

    localidade: formData.get("localidade"),
    habitat: formData.get("habitat"),
    pesquisador: formData.get("pesquisador"),
    instituicao: formData.get("instituicao") || "",

    fotos: [], // O preview de fotos não é salvo no localStorage
    data: new Date().toISOString(),
  };

  tardiRecords.push(newRecord);
  localStorage.setItem("tardiRecords", JSON.stringify(tardiRecords));

  showNotification("Registro salvo com sucesso!", "success");
  e.target.reset();

  // Limpa o preview de imagens
  const previewContainer = document.getElementById("image-preview");
  if (previewContainer) {
    previewContainer.innerHTML = "";
  }

  renderAll(); // Atualiza mapa, tabela e filtros
  showSection("mapa-tardigrada"); // Leva o usuário ao mapa
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById("latitude").value =
          position.coords.latitude.toFixed(6);
        document.getElementById("longitude").value =
          position.coords.longitude.toFixed(6);
        showNotification("Localização obtida!", "success");
      },
      () => showNotification("Erro ao obter localização", "error")
    );
  } else {
    showNotification("Geolocalização não suportada.", "error");
  }
}

// NOVO: Função para preview de imagens
function handleImagePreview(event) {
  const previewContainer = document.getElementById("image-preview");
  if (!previewContainer) return;

  previewContainer.innerHTML = ""; // Limpa previews anteriores

  const files = event.target.files;
  if (files.length > 5) {
    showNotification("Você só pode enviar até 5 fotos.", "error");
    event.target.value = ""; // Limpa a seleção
    return;
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = "Preview da imagem";
      img.classList.add("preview-image"); // (Estilo será adicionado no CSS)
      previewContainer.appendChild(img);
    };

    reader.readAsDataURL(file);
  }
}

// CHAVE DICOTÔMICA COMPLETA - TARDIGRADA
// ============================================================
// Baseada em: Damborenea, C., Rogers, D. C., & Thorp, J. H. (2020).
// Thorp and Covich's Freshwater Invertebrates (Fourth Edition)
// Volume 3: Keys to Nearctic Fauna, Chapter 25: Phylum Tardigrada, p. 679–696.
// Adaptado por: Prof. Danilo de Castro Santos (PUNE/TardiStudy)

const keySteps = {
  // ============================================================
  // PASSO INICIAL: FILO TARDIGRADA → CLASSES
  // ============================================================
  1: {
    title: "Filo Tardigrada: Classes",
    question: "1. Observe a presença de cirros laterais A na cabeça (Fig. 1):",
    options: [
      {
        text: "1. Cirros laterais A presentes.",
        next: "heterotardigrada_ordens",
        image: "assets/key-images/fig1-cirros-A-presentes.jpg",
      },
      {
        text: "1'. Cirros laterais A ausentes.",
        next: "eutardigrada_ordens",
        image: "assets/key-images/fig1-cirros-A-ausentes.jpg",
      },
    ],
  },

  // ============================================================
  // CLASSE HETEROTARDIGRADA
  // ============================================================

  // HETEROTARDIGRADA: Ordens
  heterotardigrada_ordens: {
    title: "Classe Heterotardigrada: Ordens",
    question: "1. Observe o cirro mediano e a inserção das garras (Fig. 2):",
    options: [
      {
        text: "1. Cirro mediano geralmente presente; dígitos ou garras inseridos diretamente na perna.",
        next: "arthrotardigrada_result",
        image: "assets/key-images/fig2-arthrotardigrada.jpg",
      },
      {
        text: "1'. Cirro mediano ausente; cada garra e uma papila inserida na perna.",
        next: "echiniscoidea_familias",
        image: "assets/key-images/fig2-echiniscoidea.jpg",
      },
    ],
  },

  // ORDEM ARTHROTARDIGRADA (resultado final)
  arthrotardigrada_result: {
    title: "Resultado: Ordem Arthrotardigrada",
    result: "Ordem Arthrotardigrada",
    description:
      "Uma espécie: Styraconyx hallasi. Tardigrado marinho encontrado acidentalmente em fontes da Groenlândia.",
    image: "assets/key-results/Styraconyx.jpg",
  },

  // ORDEM ECHINISCOIDEA: Famílias
  echiniscoidea_familias: {
    title: "Ordem Echiniscoidea: Famílias",
    question:
      "1. Observe o número de garras por perna e as placas dorsais (Fig. 3):",
    options: [
      {
        text: "1. Quatro garras por perna em adultos; com placas dorsais-laterais.",
        next: "echiniscidae_generos_1",
        image: "assets/key-images/fig3-4garras-placas.jpg",
      },
      {
        text: "1'. Duas garras nas pernas I–III, uma garra na perna IV em adultos; cutícula sem placas dorsais.",
        next: "carphaniidae_result",
        image: "assets/key-images/fig3-2garras-sem-placas.jpg",
      },
    ],
  },

  // FAMÍLIA CARPHANIIDAE (resultado final)
  carphaniidae_result: {
    title: "Resultado: Família Carphaniidae",
    result: "Gênero Carphania",
    description:
      "Um gênero: Carphania. Duas garras nas pernas I–III, uma garra na perna IV; cutícula sem placas dorsais; cirrus A muito curto.",
    image: "assets/tardigrade-icon.png",
  },

  // FAMÍLIA ECHINISCIDAE: Chave para gêneros
  echiniscidae_generos_1: {
    title: "Família Echiniscidae: Gêneros (1/2)",
    question: "1. Observe a placa pseudosegmentar (Fig. 4):",
    options: [
      {
        text: "1. Placa pseudosegmentar ausente.",
        next: "echiniscidae_generos_2",
        image: "assets/key-images/fig4-pseudosegmentar-ausente.jpg",
      },
      {
        text: "1'. Placa pseudosegmentar presente (entre a segunda placa em pares e a placa terminal).",
        next: "pseudechiniscus_result",
        image: "assets/key-images/fig4-pseudosegmentar-presente.jpg",
      },
    ],
  },

  pseudechiniscus_result: {
    title: "Resultado: Gênero Pseudechiniscus",
    result: "Gênero Pseudechiniscus",
    description:
      "Placa pseudosegmentar presente entre a segunda placa em pares e a placa terminal (Fig. 4).",
    image: "assets/key-results/Pseudechiniscus.jpg",
  },

  echiniscidae_generos_2: {
    title: "Família Echiniscidae: Gêneros (2/2)",
    question: "2(1). Observe a placa terminal (Fig. 5):",
    options: [
      {
        text: "2. Placa terminal entalhada.",
        next: "echiniscus_result",
        image: "assets/key-images/fig5-placa-entalhada.jpg",
      },
      {
        text: "2'. Placa terminal dividida por suturas; olhos em manchas pretas.",
        next: "hypechiniscus_result",
        image: "assets/key-images/fig5-placa-dividida.jpg",
      },
    ],
  },

  echiniscus_result: {
    title: "Resultado: Gênero Echiniscus",
    result: "Gênero Echiniscus",
    description: "Placa terminal entalhada (Fig. 5).",
    image: "assets/key-results/Echiniscus.jpg",
  },

  hypechiniscus_result: {
    title: "Resultado: Gênero Hypechiniscus",
    result: "Gênero Hypechiniscus",
    description:
      "Placa terminal dividida por suturas; olhos em manchas pretas (Fig. 5).",
    image: "assets/key-results/Hypechiniscus.jpg",
  },

  // ============================================================
  // CLASSE EUTARDIGRADA
  // ============================================================

  // EUTARDIGRADA: Ordens
  eutardigrada_ordens: {
    title: "Classe Eutardigrada: Ordens",
    question: "1. Observe as papilas cefálicas e os ganchos (Fig. 6):",
    options: [
      {
        text: "1. Cabeça sem papilas cefálicas; geralmente 2 ganchos duplos por perna.",
        next: "parachela_superfamilias",
        image: "assets/key-images/fig6-sem-papilas.jpg",
      },
      {
        text: "1'. Cabeça com papilas cefálicas (incluindo duas papilas laterais); ganchos com ramo secundário não conectado ao primário.",
        next: "milnesium_result",
        image: "assets/key-images/fig6-com-papilas.jpg",
      },
    ],
  },

  // ORDEM APOCHELA (resultado final)
  milnesium_result: {
    title: "Resultado: Ordem Apochela",
    result: "Gênero Milnesium",
    description:
      "Cabeça com papilas cefálicas; ganchos com ramo secundário não conectado ao primário; ovos lisos colocados dentro do exúvio; limnoterrestre (Fig. 7).",
    image: "assets/key-results/Milnesium.jpg",
  },

  // ============================================================
  // ORDEM PARACHELA
  // ============================================================

  // PARACHELA: Superfamílias
  parachela_superfamilias: {
    title: "Ordem Parachela: Superfamílias",
    question:
      "1. Observe a simetria das garras duplas (sequência de garras nas pernas I–IV) (Fig. 8):",
    options: [
      {
        text: '1. Garras duplas "assimétricas" (sequência 2-1-2-1); tubo bucal sem lâmina ventral.',
        next: "hypsibioidea_isohypsibioidea",
        image: "assets/key-images/fig8-garras-assimetricas.jpg",
      },
      {
        text: '1\'. Garras duplas "simétricas" (sequência 2-1-1-2); tubo bucal com lâmina ventral.',
        next: "macrobiotoidea_familias",
        image: "assets/key-images/fig8-garras-simetricas.jpg",
      },
    ],
  },

  // ============================================================
  // SUPERFAMÍLIAS HYPSIBIOIDEA & ISOHYPSIBIOIDEA
  // ============================================================

  hypsibioidea_isohypsibioidea: {
    title: "Superfamílias Isohypsibioidea e Hypsibioidea",
    question: "2(1). Observe a forma das garras internas e externas (Fig. 9):",
    options: [
      {
        text: "2. Garras internas e externas de tamanho e forma semelhantes (tipo Isohypsibius, com ramos formando ângulo reto).",
        next: "isohypsibiidae_generos_1",
        image: "assets/key-images/fig9-garras-isohypsibius.jpg",
      },
      {
        text: "2'. Garras internas e externas de tamanho e forma claramente diferentes (tipo Hypsibius, com ramo secundário formando um arco).",
        next: "hypsibiidae_generos_1",
        image: "assets/key-images/fig9-garras-hypsibius.jpg",
      },
    ],
  },

  // ============================================================
  // FAMÍLIA ISOHYPSIBIIDAE
  // ============================================================

  isohypsibiidae_generos_1: {
    title: "Família Isohypsibiidae: Gêneros (1/4)",
    question: "1. Observe o tipo de garras (Fig. 9):",
    options: [
      {
        text: "1. Ramo secundário de cada garra formando um ângulo reto com o ramo primário (tipo Isohypsibius).",
        next: "isohypsibiidae_generos_2",
        image: "assets/key-images/fig9-garras-isohypsibius.jpg",
      },
      {
        text: "1'. Garra externa do tipo Hypsibius com ramo primário extremamente longo e esbelto; garra interna do tipo Isohypsibius.",
        next: "ramajendas_result",
        image: "assets/key-results/Ramajendas.jpg",
      },
    ],
  },

  ramajendas_result: {
    title: "Resultado: Gênero Ramajendas",
    result: "Gênero Ramajendas",
    description:
      "Garra externa do tipo Hypsibius com ramo primário extremamente longo e esbelto; garra interna do tipo Isohypsibius.",
    image: "assets/key-results/Ramajendas.jpg",
  },

  isohypsibiidae_generos_2: {
    title: "Família Isohypsibiidae: Gêneros (2/4)",
    question: "2(1). Observe a lâmina ventral no tubo bucal (Fig. 10):",
    options: [
      {
        text: "2. Lâmina ventral ausente.",
        next: "isohypsibiidae_generos_3",
        image: "assets/key-images/fig10-lamina-ventral-ausente.jpg",
      },
      {
        text: "2'. Lâmina ventral presente.",
        next: "doryphoribius_result",
        image: "assets/key-images/fig10-lamina-ventral-presente.jpg",
      },
    ],
  },

  doryphoribius_result: {
    title: "Resultado: Gênero Doryphoribius",
    result: "Gênero Doryphoribius",
    description:
      "Lâmina ventral presente no tubo bucal (Fig. 10); limnoterrestre.",
    image: "assets/key-results/Doryphoribius.jpg",
  },

  isohypsibiidae_generos_3: {
    title: "Família Isohypsibiidae: Gêneros (3/4)",
    question:
      "3(2). Observe as lamelas peribuccais ao redor da abertura bucal (Fig. 11):",
    options: [
      {
        text: "3. Lamelas peribuccais ausentes.",
        next: "isohypsibius_result",
        image: "assets/key-images/fig11-lamelas-ausentes.jpg",
      },
      {
        text: "3'. Lamelas peribuccais presentes (pode ser difícil de ver).",
        next: "isohypsibiidae_generos_4",
        image: "assets/key-images/fig11-lamelas-presentes.jpg",
      },
    ],
  },

  isohypsibius_result: {
    title: "Resultado: Gênero Isohypsibius",
    result: "Gênero Isohypsibius",
    description:
      "Lamelas peribuccais ao redor da abertura bucal ausentes (Fig. 11).",
    image: "assets/key-results/Isohypsibius.jpg",
  },

  isohypsibiidae_generos_4: {
    title: "Família Isohypsibiidae: Gêneros (4/4)",
    question: "4(3). Conte as lamelas peribuccais (Fig. 11):",
    options: [
      {
        text: "4. Cerca de 30 lamelas peribuccais presentes.",
        next: "pseudobiotus_result",
        image: "assets/key-results/Pseudobiotus.jpg",
      },
      {
        text: "4'. Doze lamelas peribuccais presentes, frequentemente fundidas.",
        next: "thulinius_result",
        image: "assets/key-results/Thulinius.jpg",
      },
    ],
  },

  pseudobiotus_result: {
    title: "Resultado: Gênero Pseudobiotus",
    result: "Gênero Pseudobiotus",
    description: "Cerca de 30 lamelas peribuccais presentes (Fig. 11).",
    image: "assets/key-results/Pseudobiotus.jpg",
  },

  thulinius_result: {
    title: "Resultado: Gênero Thulinius",
    result: "Gênero Thulinius",
    description:
      "Doze lamelas peribuccais presentes, frequentemente fundidas; uma ou duas barras cuticulares sob as bases das garras (Fig. 11).",
    image: "assets/key-results/Thulinius.jpg",
  },

  // ============================================================
  // FAMÍLIA HYPSIBIIDAE
  // ============================================================

  hypsibiidae_generos_1: {
    title: "Família Hypsibiidae: Gêneros (1/5)",
    question: "1. Observe o tipo das garras externas (Fig. 9):",
    options: [
      {
        text: "1. Garras externas do tipo Isohypsibius (ramo secundário formando ângulo reto).",
        next: "hypsibiidae_generos_2",
        image: "assets/key-images/fig9-garras-isohypsibius.jpg",
      },
      {
        text: "1'. Garras externas do tipo Hypsibius (ramo secundário formando arco).",
        next: "hypsibiidae_generos_3",
        image: "assets/key-images/fig9-garras-hypsibius.jpg",
      },
    ],
  },

  hypsibiidae_generos_2: {
    title: "Família Hypsibiidae: Gêneros (2/5)",
    question: "2(1). Observe o tipo das garras internas (Fig. 9):",
    options: [
      {
        text: "2. Garras internas do tipo Isohypsibius modificado (ângulo > 90 graus); apofises assimétricas.",
        next: "mixibius_result",
        image: "assets/key-results/Mixibius.jpg",
      },
      {
        text: "2'. Garras internas do tipo Hypsibius; apofises simétricas.",
        next: "acutuncus_result",
        image: "assets/key-results/Acutuncus.jpg",
      },
    ],
  },

  mixibius_result: {
    title: "Resultado: Gênero Mixibius",
    result: "Gênero Mixibius",
    description:
      "Garras internas do tipo Isohypsibius modificado (ângulo > 90 graus); apofises assimétricas (Fig. 9).",
    image: "assets/key-results/Mixibius.jpg",
  },

  acutuncus_result: {
    title: "Resultado: Gênero Acutuncus",
    result: "Gênero Acutuncus",
    description:
      "Garras internas do tipo Hypsibius; apofises simétricas; ovos com processos postos livremente (Fig. 9).",
    image: "assets/key-results/Acutuncus.jpg",
  },

  hypsibiidae_generos_3: {
    title: "Família Hypsibiidae: Gêneros (3/5)",
    question: "3(1). Observe a estrutura do tubo bucal (Fig. 12):",
    options: [
      {
        text: "3. Tubo bucal rígido, sem parte posterior de composição flexível e espiral.",
        next: "hypsibius_result",
        image: "assets/key-images/fig12-tubo-rigido.jpg",
      },
      {
        text: "3'. Tubo bucal com parte posterior de composição flexível e espiral (tubo faríngeo).",
        next: "hypsibiidae_generos_4",
        image: "assets/key-images/fig12-tubo-flexivel.jpg",
      },
    ],
  },

  hypsibius_result: {
    title: "Resultado: Gênero Hypsibius",
    result: "Gênero Hypsibius",
    description:
      "Tubo bucal rígido, sem parte posterior de composição flexível e espiral (Fig. 12); limnoterrestre.",
    image: "assets/key-results/Hypsibius.jpg",
  },

  hypsibiidae_generos_4: {
    title: "Família Hypsibiidae: Gêneros (4/5)",
    question:
      "4(3). Observe o espessamento em forma de gota no tubo bucal (Fig. 12):",
    options: [
      {
        text: "4. Espessamento em forma de gota (entre as porções rígidas e flexíveis) AUSENTE.",
        next: "adropion_result",
        image: "assets/key-images/fig12-sem-gota.jpg",
      },
      {
        text: "4'. Espessamento em forma de gota (entre as porções rígidas e flexíveis) PRESENTE.",
        next: "hypsibiidae_generos_5",
        image: "assets/key-images/fig12-com-gota.jpg",
      },
    ],
  },

  adropion_result: {
    title: "Resultado: Gênero Adropion",
    result: "Gênero Adropion",
    description:
      "Espessamento em forma de gota entre as porções rígidas e flexíveis do tubo bucal ausente (Fig. 12).",
    image: "assets/key-results/Adropion.jpg",
  },

  hypsibiidae_generos_5: {
    title: "Família Hypsibiidae: Gêneros (5/5)",
    question:
      "5(4). Observe os macroplacóides (estruturas na faringe) (Fig. 13):",
    options: [
      {
        text: "5. Dois macroplacóides semelhantes em comprimento, organizados em fileiras (parecem parênteses); septo presente.",
        next: "pilatobius_result",
        image: "assets/key-images/fig13-dois-macroplacoides-septo.jpg",
      },
      {
        text: "5'. Dois macroplacóides sem septo OU três macroplacóides com ou sem septo.",
        next: "diphascon_result",
        image: "assets/key-images/fig13-macroplacoides-variados.jpg",
      },
    ],
  },

  pilatobius_result: {
    title: "Resultado: Gênero Pilatobius",
    result: "Gênero Pilatobius",
    description:
      "Dois macroplacóides semelhantes em comprimento, organizados em fileiras (parecem parênteses); septo presente (Fig. 13).",
    image: "assets/key-results/Pilatobius.jpg",
  },

  diphascon_result: {
    title: "Resultado: Gênero Diphascon",
    result: "Gênero Diphascon",
    description:
      "Dois macroplacóides sem septo ou três macroplacóides com ou sem septo (Fig. 13).",
    image: "assets/key-results/Diphascon.jpg",
  },

  // ============================================================
  // SUPERFAMÍLIA MACROBIOTOIDEA
  // ============================================================

  macrobiotoidea_familias: {
    title: "Superfamília Macrobiotoidea: Famílias",
    question: "1. Observe o formato das garras e a lâmina ventral (Fig. 14):",
    options: [
      {
        text: "1. Garras em formato L ou V (ramos das garras divergindo desde a base); gancho evidente na lâmina ventral.",
        next: "murrayidae_generos",
        image: "assets/key-images/fig14-garras-L-V.jpg",
      },
      {
        text: "1'. Garras em formato Y (ramos das garras fundidos por um trecho); sem gancho evidente na lâmina ventral.",
        next: "macrobiotidae_generos_1",
        image: "assets/key-images/fig14-garras-Y.jpg",
      },
    ],
  },

  // ============================================================
  // FAMÍLIA MURRAYIDAE
  // ============================================================

  murrayidae_generos: {
    title: "Família Murrayidae: Gêneros",
    question: "1. Observe as garras e espessamentos cuticulares (Fig. 14):",
    options: [
      {
        text: "1. Garras em forma de L muito bem desenvolvidas, com espessamentos cuticulares conectando a base das garras em cada perna.",
        next: "dactylobiotus_result",
        image: "assets/key-results/Dactylobiotus.jpg",
      },
      {
        text: "1'. Garras em forma de V, sem espessamentos cuticulares conectando a base das garras em cada perna, com lunulas.",
        next: "murrayon_result",
        image: "assets/key-results/Murrayon.jpg",
      },
    ],
  },

  dactylobiotus_result: {
    title: "Resultado: Gênero Dactylobiotus",
    result: "Gênero Dactylobiotus",
    description:
      "Garras em forma de L muito bem desenvolvidas, com espessamentos cuticulares conectando a base das garras em cada perna (Fig. 14); limnoterrestres.",
    image: "assets/key-results/Dactylobiotus.jpg",
  },

  murrayon_result: {
    title: "Resultado: Gênero Murrayon",
    result: "Gênero Murrayon",
    description:
      "Garras em forma de V, sem espessamentos cuticulares conectando a base das garras em cada perna, com lunulas (Fig. 14); limnoterrestres.",
    image: "assets/key-results/Murrayon.jpg",
  },

  // ============================================================
  // FAMÍLIA MACROBIOTIDAE
  // ============================================================

  macrobiotidae_generos_1: {
    title: "Família Macrobiotidae: Gêneros (1/3)",
    question: "1. Conte os macroplacóides na faringe (Fig. 13):",
    options: [
      {
        text: "1. Três macroplacóides.",
        next: "macrobiotidae_generos_2",
        image: "assets/key-images/fig13-tres-macroplacoides.jpg",
      },
      {
        text: "1'. Dois macroplacóides; microplacóide, se presente, próximo ao segundo macroplacóide.",
        next: "macrobiotus_result",
        image: "assets/key-results/Macrobiotus.jpg",
      },
    ],
  },

  macrobiotus_result: {
    title: "Resultado: Gênero Macrobiotus",
    result: "Gênero Macrobiotus",
    description:
      "Dois macroplacóides; microplacóide, se presente, próximo ao segundo macroplacóide; cutícula com ou sem poros; ovos com processos de vários tipos (Fig. 13).",
    image: "assets/key-results/Macrobiotus.jpg",
  },

  macrobiotidae_generos_2: {
    title: "Família Macrobiotidae: Gêneros (2/3)",
    question:
      "2(1). Observe a forma dos macroplacóides e lamelas bucais (Fig. 13):",
    options: [
      {
        text: "2. Macroplacóides em forma de haste; lamelas bucais presentes.",
        next: "macrobiotidae_generos_3",
        image: "assets/key-images/fig13-macroplacoides-haste.jpg",
      },
      {
        text: "2'. Macroplacóides redondos; microplacóide presente; lamelas bucais ausentes.",
        next: "minibiotus_result",
        image: "assets/key-results/Minibiotus.jpg",
      },
    ],
  },

  minibiotus_result: {
    title: "Resultado: Gênero Minibiotus",
    result: "Gênero Minibiotus",
    description:
      "Macroplacóides redondos; microplacóide presente; lamelas bucais ausentes; pápulas presentes (Fig. 13).",
    image: "assets/key-results/Minibiotus.jpg",
  },

  macrobiotidae_generos_3: {
    title: "Família Macrobiotidae: Gêneros (3/3)",
    question:
      "3(2). Observe a posição do microplacóide (se presente) (Fig. 13):",
    options: [
      {
        text: "3. Microplacóide sempre presente e claramente próximo ao terceiro macroplacóide (menos que seu comprimento).",
        next: "mesobiotus_result",
        image: "assets/key-results/Mesobiotus.jpg",
      },
      {
        text: "3'. Microplacóide, se presente, distante do terceiro macroplacóide (mais que seu comprimento).",
        next: "paramacrobiotus_result",
        image: "assets/key-results/Paramacrobiotus.jpg",
      },
    ],
  },

  mesobiotus_result: {
    title: "Resultado: Gênero Mesobiotus",
    result: "Gênero Mesobiotus",
    description:
      "Microplacóide sempre presente e claramente próximo ao terceiro macroplacóide (menos que seu comprimento); garra característica com septo interno (Fig. 13).",
    image: "assets/key-results/Mesobiotus.jpg",
  },

  paramacrobiotus_result: {
    title: "Resultado: Gênero Paramacrobiotus",
    result: "Gênero Paramacrobiotus",
    description:
      "Microplacóide, se presente, distante do terceiro macroplacóide (mais que seu comprimento); ovos sempre com grandes processos reticulados (Fig. 13).",
    image: "assets/key-results/Paramacrobiotus.jpg",
  },
};

function nextStep(stepId) {
  const step = keySteps[stepId];
  if (!step) {
    console.error("Passo da chave não encontrado:", stepId);
    return;
  }

  const currentStepData = keySteps[currentStep];
  if (currentStepData && currentStepData.question) {
    const chosenOption = currentStepData.options?.find(
      (opt) => opt.next === stepId
    );
    const response = chosenOption
      ? chosenOption.text
      : "Resposta não identificada";

    // Adiciona ao histórico
    choiceHistory.push({
      question: currentStepData.question,
      answer: response,
    });
  }

  // Atualiza o passo atual
  currentStep = stepId;

  if (step.result) {
    showResult(step);
  } else {
    showStep(step);
  }
}

function showStep(step) {
  document.getElementById("step-title").textContent = step.title;
  const content = document.getElementById("step-content");
  content.innerHTML = `
    <div class="key-question">
      <p><strong>${escapeHtml(step.question)}</strong></p>
    </div>
    <div class="key-options">
      ${step.options
        .map(
          (option) => `
        <button class="key-option" data-step="${option.next}">
          <img src="${
            option.image || "assets/tardigrade-icon.png"
          }" alt="Imagem para ${escapeHtml(
            option.text
          )}" class="key-option-image">
          <div class="key-option-text">${escapeHtml(option.text)}</div>
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

// (Função showResult ATUALIZADA para incluir "Parabéns!")
function showResult(step) {
  document.getElementById("key-step").style.display = "none";
  document.getElementById("key-result").style.display = "block";

  // Adiciona a mensagem de "Parabéns"
  let parabensMsg = "";
  if (step.result.toLowerCase().includes("gênero")) {
    parabensMsg = `<h4>Parabéns, você achou o ${escapeHtml(step.result)}!</h4>`;
  }

  document.getElementById("result-content").innerHTML = `
    <div class="result-card">
      ${parabensMsg}
      <h4>Identificação: ${escapeHtml(step.result)}</h4>
      <p>${escapeHtml(step.description)}</p>
      <img src="${
        step.image || "assets/tardigrade-icon.png"
      }" alt="Imagem de ${escapeHtml(step.result)}" class="result-image">
    </div>
  `;
  // Não atualiza o histórico aqui, pois o histórico é atualizado no nextStep
}

function resetKey() {
  currentStep = "1"; // Reseta para o passo inicial (string "1")
  choiceHistory = [];
  document.getElementById("key-step").style.display = "block";
  document.getElementById("key-result").style.display = "none";

  const pathDisplay = document.getElementById("path-display");
  const pathBtn = document.getElementById("path-btn");
  if (pathDisplay) {
    pathDisplay.style.display = "none";
  }
  if (pathBtn) {
    pathBtn.innerHTML = '<i class="fas fa-route"></i> Mostrar Caminho';
  }

  // Mostra o primeiro passo
  if (keySteps[currentStep]) {
    showStep(keySteps[currentStep]);
  } else {
    console.error("Passo inicial '1' não encontrado na chave.");
  }
}

// ============================================================
// TABELA DE REGISTROS (Atualizada)
// ============================================================
function renderRecordsTable() {
  const tbody = document.getElementById("records-body");
  if (!tbody) return;

  // Ordena por data mais recente
  const records = getFilteredRecords().sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

  if (records.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center;">Nenhum registro encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = records
    .map(
      (record) => `
    <tr>
      <td>${escapeHtml(record.ordem)}</td>
      <td><i>${escapeHtml(record.genero)}</i></td>
      <td><i>${escapeHtml(record.especie || "N/A")}</i></td>
      <td style="font-size: 0.85rem;">${record.latitude.toFixed(
        4
      )}, ${record.longitude.toFixed(4)}</td>
      <td>${escapeHtml(record.pesquisador)}</td>
      <td>${escapeHtml(record.instituicao || "N/A")}</td>
      <td>${new Date(record.data).toLocaleDateString("pt-BR")}</td>
      <td>
        <button class="btn-action btn-delete" data-id="${
          record.id
        }" aria-label="Excluir registro">
          <i class="fas fa-trash" aria-hidden="true"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

function handleDeleteRecord(id) {
  if (confirm("Deseja realmente excluir este registro?")) {
    tardiRecords = tardiRecords.filter((record) => record.id !== id);
    localStorage.setItem("tardiRecords", JSON.stringify(tardiRecords));
    showNotification("Registro excluído com sucesso!", "success");
    renderAll();
  }
}

// ============================================================
// NOTIFICAÇÕES (Toast Messages)
// ============================================================
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ============================================================
// RENDERIZAÇÃO GERAL
// ============================================================
function renderAll() {
  populateGeneroFilter(); // Atualiza o filtro de gênero
  updateStats();
  renderRecordsTable();
  renderMarkers();
  // Galeria de estruturas é renderizada ao entrar na seção
}

// ============================================================
// DADOS E FUNÇÕES DO GUIA DE ESTRUTURAS (Sem alterações)
// ============================================================
const tardigradeStructures = [
  {
    id: "cirros-laterais-A",
    name: "Cirros Laterais A",
    description:
      "Estruturas sensoriais em forma de seta (cA) localizadas lateralmente na cabeça. Essenciais para diferenciar Heterotardigrada (presentes) de Eutardigrada (ausentes).",
    image: "assets/key-images/cirro-A-presente.jpg",
  },
  {
    id: "cirro-mediano",
    name: "Cirro Mediano",
    description:
      "Uma única estrutura sensorial no centro da cabeça. Comum em Arthrotardigrada, mas ausente em Echiniscoidea.",
    image: "assets/key-images/cirro-mediano-presente.jpg",
  },
  {
    id: "placas-dorsais",
    name: "Placas Dorsais e Laterais",
    description:
      "Armadura cuticular protetora encontrada em Echiniscoidea (ex: Echiniscus). Ausente em Eutardigrada.",
    image: "assets/key-images/4-garras-placas.jpg",
  },
  {
    id: "papilas-cefalicas",
    name: "Papilas Cefálicas",
    description:
      "Pequenas protuberâncias sensoriais na cabeça, características da Ordem Apochela (ex: Milnesium).",
    image: "assets/key-images/apochela-cabeca.jpg",
  },
  {
    id: "garras-assimetricas",
    name: "Garras Assimétricas (2-1-2-1)",
    description:
      "Garras de tamanhos ou formas diferentes, com sequência 2-1-2-1. Típico de Hypsibioidea e Isohypsibioidea.",
    image: "assets/key-images/garras-assimetricas.jpg",
  },
  {
    id: "garras-simetricas",
    name: "Garras Simétricas (2-1-1-2)",
    description:
      "Garras semelhantes em tamanho e forma, com sequência 2-1-1-2. Característica de Macrobiotoidea.",
    image: "assets/key-images/garras-simetricas.jpg",
  },
  {
    id: "garras-tipo-Y",
    name: "Garras Tipo Y (Macrobiotidae)",
    description:
      "Garras onde os ramos primário e secundário são fundidos por um trecho, formando um 'Y'.",
    image: "assets/key-images/garras-Y.jpg",
  },
  {
    id: "garras-tipo-V-L",
    name: "Garras Tipo V ou L (Murrayidae)",
    description:
      "Garras onde os ramos divergem diretamente da base, sem um trecho fundido, formando um 'V' ou 'L'.",
    image: "assets/key-images/garras-V-L.jpg",
  },
  {
    id: "garras-tipo-isohypsibius",
    name: "Garras Tipo Isohypsibius",
    description:
      "Garras onde o ramo secundário forma um ângulo reto (ou maior) com a base da garra.",
    image: "assets/key-images/garras-isohypsibius.jpg",
  },
  {
    id: "garras-tipo-hypsibius",
    name: "Garras Tipo Hypsibius",
    description:
      "Garras externas onde o ramo secundário forma um arco comum com a porção basal.",
    image: "assets/key-images/garras-hypsibius.jpg",
  },
  {
    id: "lamina-ventral",
    name: "Lâmina Ventral",
    description:
      "Uma estrutura presente no tubo bucal de alguns gêneros, como Doryphoribius.",
    image: "assets/key-images/lamina-ventral-presente.jpg",
  },
  {
    id: "lamelas-peribuccais",
    name: "Lamelas Peribuccais",
    description:
      "Anel de lamelas delicadas ao redor da boca. Presentes em gêneros como Pseudobiotus.",
    image: "assets/key-images/lamelas-presentes.jpg",
  },
];

function renderStructures() {
  const container = document.getElementById("estrutura-cards-container");
  if (!container) return;

  const searchTerm = document
    .getElementById("estrutura-search")
    .value.toLowerCase();

  const filteredStructures = tardigradeStructures.filter(
    (estrutura) =>
      estrutura.name.toLowerCase().includes(searchTerm) ||
      estrutura.description.toLowerCase().includes(searchTerm)
  );

  if (filteredStructures.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Nenhuma estrutura encontrada.</p>';
    return;
  }

  container.innerHTML = filteredStructures
    .map(
      (estrutura) => `
        <div class="estrutura-card" data-id="${estrutura.id}">
            <div class="estrutura-card-image-container">
                <img src="${
                  estrutura.image || "assets/tardigrade-icon.png"
                }" alt="${escapeHtml(
        estrutura.name
      )}" class="estrutura-card-image">
            </div>
            <div class="estrutura-card-content">
                <h4 class="estrutura-card-title">${escapeHtml(
                  estrutura.name
                )}</h4>
                <p class="estrutura-card-description">${escapeHtml(
                  estrutura.description
                )}</p>
            </div>
        </div>
    `
    )
    .join("");
}

// ============================================================
// INICIALIZAÇÃO DA APLICAÇÃO (Atualizada)
// ============================================================
function init() {
  // Event Listeners para Navegação
  const menuToggleTriggers = document.querySelectorAll(
    ".mobile-menu-btn, .mobile-nav-close"
  );
  menuToggleTriggers.forEach((trigger) => {
    trigger.addEventListener("click", toggleMobileMenu);
  });

  // Gatilhos de navegação atualizados
  const sectionNavTriggers = document.querySelectorAll(
    '.desktop-nav a[href^="#"], .mobile-nav-item[href^="#"], .menu-btn[data-section], .back-btn[data-section]'
  );
  sectionNavTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();

      // Ignora botões desabilitados (placeholders)
      if (trigger.disabled) return;

      const sectionId =
        trigger.dataset.section || trigger.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Event Listener para Formulário
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Event Listener para Botão de Localização
  const getLocationBtn = document.getElementById("getLocation");
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getLocation);
  }

  // NOVO: Event Listener para Preview de Imagem
  const fotoInput = document.getElementById("foto");
  if (fotoInput) {
    fotoInput.addEventListener("change", handleImagePreview);
  }

  // Event Listener para Filtro de Grupos (Mapa)
  const grupoFilter = document.getElementById("grupo-filter");
  if (grupoFilter) {
    grupoFilter.addEventListener("change", renderAll);
  }

  // Event Listener para Filtro de Gênero (Mapa)
  const generoFilter = document.getElementById("genero-filter");
  if (generoFilter) {
    generoFilter.addEventListener("change", renderAll);
  }

  // Event Listener para Filtro da Galeria de Estruturas
  const estruturaSearch = document.getElementById("estrutura-search");
  if (estruturaSearch) {
    estruturaSearch.addEventListener("input", renderStructures);
  }

  // Event Listeners para Delegação (Delete e Chave)
  document.addEventListener("click", (e) => {
    // Botão Deletar
    const deleteButton = e.target.closest(".btn-delete");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      handleDeleteRecord(id);
    }
  });

  // Listener da Chave Dicotômica
  const keyStepContainer = document.getElementById("key-step");
  if (keyStepContainer) {
    keyStepContainer.addEventListener("click", (event) => {
      const optionButton = event.target.closest(".key-option");
      if (optionButton && optionButton.dataset.step) {
        nextStep(optionButton.dataset.step);
      }
    });
  }

  // Event Listeners para Botões da Chave (Reset/Path)
  const resetKeyBtn = document.getElementById("reset-key-btn");
  if (resetKeyBtn) {
    resetKeyBtn.addEventListener("click", resetKey);
  }

  const pathBtn = document.getElementById("path-btn");
  if (pathBtn) {
    pathBtn.addEventListener("click", showPath);
  }

  // Inicialização da Página
  showSection("home");
  // Renderiza os dados iniciais
  renderAll();
  renderStructures(); // Renderiza a galeria (para o filtro)
}

// Executa Inicialização
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ============================================================
// FUNÇÕES UTILITÁRES (showPath, escapeHtml)
// ============================================================
function showPath() {
  const pathDisplay = document.getElementById("path-display");
  const pathSteps = document.getElementById("path-steps");
  const pathBtn = document.getElementById("path-btn");
  if (!pathDisplay || !pathSteps || !pathBtn) return;

  if (pathDisplay.style.display === "none" || !pathDisplay.style.display) {
    if (choiceHistory.length === 0) {
      pathSteps.innerHTML =
        '<li style="text-align: center; font-style: italic;">Nenhuma escolha feita ainda.</li>';
    } else {
      pathSteps.innerHTML = choiceHistory
        .map((entry) => {
          return `<li><strong>${escapeHtml(
            entry.question
          )}</strong><br><em>→ ${escapeHtml(entry.answer)}</em></li>`;
        })
        .join("");
    }
    pathDisplay.style.display = "block";
    pathBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Caminho';
  } else {
    pathDisplay.style.display = "none";
    pathBtn.innerHTML = '<i class="fas fa-route"></i> Mostrar Caminho';
  }
}

function escapeHtml(text) {
  if (typeof text !== "string") {
    return text;
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
