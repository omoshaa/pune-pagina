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
    // especie: "harmsworthi", // Removido
    quantidade: 12,
    // tamanho: 350, // Removido
    localidade: "Parque Ibirapuera, SP",
    habitat: "Terrestre - Musgo",
    pesquisador: "Ana Silva",
    instituicao: "USP",
    // caracteristicas: "Dois macroplacóides, garras duplas assimétricas, cutícula lisa", // Removido
    // observacoes: "Encontrado em musgo de árvore. Estado ativo e tun observados.", // Removido
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
    // especie: "testudo", // Removido
    quantidade: 8,
    // tamanho: 180, // Removido
    localidade: "Parque Nacional de Brasília, DF",
    habitat: "Terrestre - Líquen",
    pesquisador: "João Costa",
    instituicao: "UnB",
    // caracteristicas: "Cirros laterais A presentes, placas dorsais bem desenvolvidas, quatro garras por perna", // Removido
    // observacoes: "Encontrado em líquen sobre rocha. Resistência extrema observada.", // Removido
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
    // especie: "tardigradum", // Removido
    quantidade: 5,
    // tamanho: 1200, // Removido
    localidade: "Tijuca, Rio de Janeiro, RJ",
    habitat: "Terrestre - Folhiço",
    pesquisador: "Maria Santos",
    instituicao: "UFRJ",
    // caracteristicas: "Papilas cefálicas presentes, ganchos com ramo secundário não conectado, ovos lisos", // Removido
    // observacoes: "Maior tardígrado observado. Comportamento predatório em outros tardígrados.", // Removido
    fotos: [],
    data: "2025-09-24T19:00:00Z",
  },
];

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
  const filter = document.getElementById("grupo-filter")?.value;
  return filter
    ? tardiRecords.filter(
        (record) => record.classe === filter || record.ordem === filter
      )
    : tardiRecords;
}

// ============================================================
// ESTATÍSTICAS (Cards de contadores)
// ============================================================
function updateStats() {
  const totalRegistros = tardiRecords.length;
  const totalGrupos = [...new Set(tardiRecords.map((r) => r.classe || r.ordem))]
    .length;
  // Atualizado para contar Gêneros
  const totalGeneros = [
    ...new Set(tardiRecords.map((r) => r.genero)),
  ].length;
  document.getElementById("total-registros").textContent = totalRegistros;
  document.getElementById("total-grupos").textContent = totalGrupos;
  document.getElementById("total-especies").textContent = totalGeneros; // ID no HTML ainda é "total-especies"
}

// ============================================================
// FORMULÁRIO DE CADASTRO (Atualizado)
// ============================================================
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newRecord = {
    id: generateId(),
    latitude: parseFloat(formData.get("latitude")),
    longitude: parseFloat(formData.get("longitude")),
    classe: formData.get("classe"),
    ordem: formData.get("ordem") || "",
    superfamilia: formData.get("superfamilia") || "",
    familia: formData.get("familia") || "",
    genero: formData.get("genero"),
    // especie: removido
    quantidade: parseInt(formData.get("quantidade")) || 1, // Campo removido do form, mas mantido nos dados
    // tamanho: removido
    localidade: formData.get("localidade"),
    habitat: formData.get("habitat"),
    pesquisador: formData.get("pesquisador"),
    instituicao: formData.get("instituicao") || "",
    // caracteristicas: removido
    // observacoes: removido
    fotos: [],
    data: new Date().toISOString(),
  };
  tardiRecords.push(newRecord);
  localStorage.setItem("tardiRecords", JSON.stringify(tardiRecords));
  showNotification("Registro salvo com sucesso!", "success");
  e.target.reset();
  renderAll();
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

// ============================================================
// CHAVE DICOTÔMICA (Máquina de Estados ATUALIZADA)
// ============================================================

// (Esta é a nova chave baseada no seu documento)
const keySteps = {
  "1": {
    title: "Filo Tardigrada: Classe",
    question: "1. Observe a cabeça do espécime:",
    options: [
      {
        text: "1. Cirros laterais A presentes (Seta ou cA).",
        next: "heterotardigrada_ordens",
        image: "assets/key-images/cirro-A-presente.jpg", // Imagem mantida do script original
      },
      {
        text: "1’. Cirros laterais A ausentes.",
        next: "eutardigrada_ordens",
        image: "assets/key-images/cirro-A-ausente.jpg", // Imagem mantida do script original
      },
    ],
  },
  // --- HETEROTARDIGRADA ---
  heterotardigrada_ordens: {
    title: "Classe Heterotardigrada: Ordens",
    question: "1. Observe o cirro mediano (centro da cabeça):",
    options: [
      {
        text: "1. Cirro mediano geralmente presente; dígitos ou garras inseridos diretamente na perna.",
        next: "arthrotardigrada_result",
        image: "assets/key-images/cirro-mediano-presente.jpg", // Imagem mantida
      },
      {
        text: "1’. Cirro mediano ausente; cada garra e uma papila inserida na perna.",
        next: "echiniscoidea_familias",
        image: "assets/key-images/cirro-mediano-ausente.jpg", // Imagem mantida
      },
    ],
  },
  arthrotardigrada_result: {
    title: "Resultado: Ordem Arthrotardigrada",
    result: "Ordem Arthrotardigrada",
    description:
      "Uma espécie: Styraconyx hallasi [acidental, marinho, mas também encontrado em fontes da Gronelândia].",
    image: "assets/key-results/Arthrotardigrada.jpg", // Imagem mantida
  },
  echiniscoidea_familias: {
    title: "Ordem Echiniscoidea: Famílias",
    question: "1. Observe as garras e placas:",
    options: [
      {
        text: "1. Quatro garras por perna em adultos; com placas dorsais-laterais.",
        next: "echiniscus_generos_1", // Inicia a chave de gêneros de Echiniscidae
        image: "assets/key-images/4-garras-placas.jpg", // Imagem mantida
      },
      {
        text: "1'. Duas garras nas pernas I-III, uma garra na perna IV em adultos; cutícula sem placas dorsais.",
        next: "carphaniidae_result",
        image: "assets/key-images/2-garras-sem-placas.jpg", // Imagem mantida
      },
    ],
  },
  carphaniidae_result: {
    title: "Resultado: Família Carphaniidae",
    result: "Gênero Carphania (Família Carphaniidae)",
    description:
      "Um gênero: Carphania. Duas garras nas pernas I-III, uma garra na perna IV em adultos; cutícula sem placas dorsais; cirrus A muito curto.",
    image: "assets/tardigrade-icon.png", // Usuário informou "SEM IMAGEM"
  },
  echiniscus_generos_1: {
    title: "Família Echiniscidae: Gêneros (Passo 1/2)",
    question: "1. Observe a placa pseudosegmentar:",
    options: [
      {
        text: "1. Placa pseudosegmentar ausente.",
        next: "echiniscus_generos_2",
        image: "assets/tardigrade-icon.png", // Placeholder
      },
      {
        text: "1’. Placa pseudosegmentar presente (entre a segunda placa em pares e a placa terminal).",
        next: "pseudechiniscus_result",
        image: "assets/key-results/Pseudechiniscus.jpg", // Placeholder
      },
    ],
  },
  pseudechiniscus_result: {
    title: "Resultado: Gênero Pseudechiniscus",
    result: "Gênero Pseudechiniscus",
    description:
      "Placa pseudosegmentar presente entre a segunda placa em pares e a placa terminal.",
    image: "assets/key-results/Pseudechiniscus.jpg", // Placeholder
  },
  echiniscus_generos_2: {
    title: "Família Echiniscidae: Gêneros (Passo 2/2)",
    question: "2. Observe a placa terminal:",
    options: [
      {
        text: "2. Placa terminal entalhada.",
        next: "echiniscus_result",
        image: "assets/key-results/Echiniscus.jpg", // Placeholder
      },
      {
        text: "2’. Placa terminal dividida por suturas; olhos em manchas pretas.",
        next: "hypechiniscus_result",
        image: "assets/key-results/Hypechiniscus.jpg", // Placeholder
      },
    ],
  },
  echiniscus_result: {
    title: "Resultado: Gênero Echiniscus",
    result: "Gênero Echiniscus",
    description: "Placa terminal entalhada.",
    image: "assets/key-results/Echiniscus.jpg", // Placeholder
  },
  hypechiniscus_result: {
    title: "Resultado: Gênero Hypechiniscus",
    result: "Gênero Hypechiniscus",
    description: "Placa terminal dividida por suturas; olhos em manchas pretas.",
    image: "assets/key-results/Hypechiniscus.jpg", // Placeholder
  },

  // --- EUTARDIGRADA ---
  eutardigrada_ordens: {
    title: "Classe Eutardigrada: Ordens",
    question: "1. Observe a cabeça e os ganchos:",
    options: [
      {
        text: "1. Cabeça sem papilas cefálicas; geralmente 2 ganchos duplos por perna.",
        next: "parachela_superfamilias", // Continua para Parachela
        image: "assets/key-images/parachela-cabeca.jpg", // Imagem mantida
      },
      {
        text: "1’. Cabeça com papilas cefálicas (incluindo duas papilas laterais); ganchos com ramo secundário não conectado ao primário.",
        next: "apochela_result",
        image: "assets/key-images/apochela-cabeca.jpg", // Imagem mantida
      },
    ],
  },
  apochela_result: {
    title: "Resultado: Ordem Apochela",
    result: "Gênero Milnesium (Ordem Apochela)",
    description:
      "Cabeça com papilas cefálicas; ganchos com ramo secundário não conectado ao primário; ovos lisos colocados dentro do exúvio; limnoterrestre.",
    image: "assets/key-results/Milnesium.jpg", // Imagem mantida
  },

  // --- PARACHELA (CHAVE DETALHADA) ---
  parachela_superfamilias: {
    title: "Ordem Parachela: Superfamílias",
    question: "1. Observe a simetria das garras duplas:",
    options: [
      {
        text: '1. Garras duplas "assimétricas" (sequência 2-1-2-1).',
        next: "hypsibioidea_isohypsibioidea",
        image: "assets/key-images/garras-assimetricas.jpg", // Imagem mantida
      },
      {
        text: '1’. Garras duplas "simétricas" (sequência 2-1-1-2); tubo bucal com lâmina ventral.',
        next: "macrobiotoidea_familias",
        image: "assets/key-images/garras-simetricas.jpg", // Imagem mantida
      },
    ],
  },
  
  // --- Superfamílias Hypsibioidea & Isohypsibioidea ---
  hypsibioidea_isohypsibioidea: {
    title: "Superfamílias Isohypsibioidea e Hypsibiidae",
    question: "2(1). Observe a forma das garras internas e externas:",
    options: [
      {
        text: "2. Garras internas e externas de tamanho e forma semelhantes (tipo Isohypsibius, ângulo reto).",
        next: "isohypsibiidae_generos_1",
        image: "assets/key-images/garras-isohypsibius.jpg", // Imagem mantida
      },
      {
        text: "2’. Garras internas e externas de tamanho e forma claramente diferentes (tipo Hypsibius, arco).",
        next: "hypsibiidae_generos_1",
        image: "assets/key-images/garras-hypsibius.jpg", // Imagem mantida
      },
    ],
  },

  // --- Superfamília Macrobiotoidea ---
  macrobiotoidea_familias: {
    title: "Superfamília Macrobiotoidea: Famílias",
    question: "1. Observe o formato das garras:",
    options: [
      {
        text: "1. Garras em formato L ou V (ramos divergindo da base); gancho evidente na lâmina ventral.",
        next: "murrayidae_generos",
        image: "assets/key-images/garras-V-L.jpg", // Imagem mantida
      },
      {
        text: "1’. Garras em formato Y (ramos fundidos por um trecho); sem gancho evidente na lâmina ventral.",
        next: "macrobiotidae_generos_1",
        image: "assets/key-images/garras-Y.jpg", // Imagem mantida
      },
    ],
  },
  murrayidae_generos: {
    title: "Família Murrayidae: Gêneros",
    question: "1. Observe as garras e espessamentos:",
    options: [
      {
        text: "1. Garras em forma de L bem desenvolvidas, com espessamentos cuticulares conectando a base.",
        next: "dactylobiotus_result",
        image: "assets/key-results/Dactylobiotus.jpg", // Placeholder
      },
      {
        text: "1’. Garras em forma de V, sem espessamentos cuticulares; com lunulas.",
        next: "murrayon_result",
        image: "assets/key-results/Murrayon.jpg", // Placeholder
      },
    ],
  },
  dactylobiotus_result: {
    title: "Resultado: Gênero Dactylobiotus",
    result: "Gênero Dactylobiotus",
    description:
      "Garras em forma de L muito bem desenvolvidas, com espessamentos cuticulares conectando a base das garras em cada perna.",
    image: "assets/key-results/Dactylobiotus.jpg", // Placeholder
  },
  murrayon_result: {
    title: "Resultado: Gênero Murrayon",
    result: "Gênero Murrayon",
    description:
      "Garras em forma de V, sem espessamentos cuticulares conectando a base das garras em cada perna, com lunulas; limnoterrestres.",
    image: "assets/key-results/Murrayon.jpg", // Placeholder
  },
  macrobiotidae_generos_1: {
    title: "Família Macrobiotidae: Gêneros (Passo 1/3)",
    question: "1. Conte os macroplacóides:",
    options: [
      {
        text: "1. Três macroplacóides.",
        next: "macrobiotidae_generos_2",
        image: "assets/tardigrade-icon.png", // Placeholder
      },
      {
        text: "1’. Dois macroplacóides; microplacóide (se presente) próximo ao segundo.",
        next: "macrobiotus_result",
        image: "assets/key-results/Macrobiotus.jpg", // Placeholder
      },
    ],
  },
  macrobiotus_result: {
    title: "Resultado: Gênero Macrobiotus",
    result: "Gênero Macrobiotus",
    description:
      "Dois macroplacóides; microplacóide, se presente, próximo ao segundo macroplacóide; cutícula com ou sem poros; ovos com processos de vários tipos.",
    image: "assets/key-results/Macrobiotus.jpg", // Placeholder
  },
  macrobiotidae_generos_2: {
    title: "Família Macrobiotidae: Gêneros (Passo 2/3)",
    question: "2(1). Observe os macroplacóides:",
    options: [
      {
        text: "2. Macroplacóides em forma de haste; lamelas bucais presentes.",
        next: "macrobiotidae_generos_3",
        image: "assets/tardigrade-icon.png", // Placeholder
      },
      {
        text: "2’. Macroplacóides redondos; microplacóide presente; lamelas bucais ausentes.",
        next: "minibiotus_result",
        image: "assets/key-results/Minibiotus.jpg", // Placeholder
      },
    ],
  },
  minibiotus_result: {
    title: "Resultado: Gênero Minibiotus",
    result: "Gênero Minibiotus",
    description:
      "Macroplacóides redondos; microplacóide presente; lamelas bucais ausentes; pápulas presentes.",
    image: "assets/key-results/Minibiotus.jpg", // Placeholder
  },
  macrobiotidae_generos_3: {
    title: "Família Macrobiotidae: Gêneros (Passo 3/3)",
    question: "3(2). Observe a posição do microplacóide (se presente):",
    options: [
      {
        text: "3. Microplacóide sempre presente e claramente próximo ao terceiro macroplacóide.",
        next: "mesobiotus_result",
        image: "assets/key-results/Mesobiotus.jpg", // Placeholder
      },
      {
        text: "3’. Microplacóide, se presente, distante do terceiro macroplacóide.",
        next: "paramacrobiotus_result",
        image: "assets/key-results/Paramacrobiotus.jpg", // Placeholder
      },
    ],
  },
  mesobiotus_result: {
    title: "Resultado: Gênero Mesobiotus",
    result: "Gênero Mesobiotus",
    description:
      "Microplacóide sempre presente e claramente próximo ao terceiro macroplacóide (menos que seu comprimento); garra característica com septo interno.",
    image: "assets/key-results/Mesobiotus.jpg", // Placeholder
  },
  paramacrobiotus_result: {
    title: "Resultado: Gênero Paramacrobiotus",
    result: "Gênero Paramacrobiotus",
    description:
      "Microplacóide, se presente, distante do terceiro macroplacóide mais que seu comprimento; ovos sempre com grandes processos reticulados.",
    image: "assets/key-results/Paramacrobiotus.jpg", // Placeholder
  },

  // --- Família Isohypsibiidae ---
  isohypsibiidae_generos_1: {
    title: "Família Isohypsibiidae: Gêneros (Passo 1/3)",
    question: "1. Observe as garras:",
    options: [
      {
        text: "1. Ramo secundário de cada garra formando um ângulo reto (tipo Isohypsibius).",
        next: "isohypsibiidae_generos_2",
        image: "assets/key-images/garras-isohypsibius.jpg", // Imagem mantida
      },
      {
        text: "1’. Garra externa tipo Hypsibius com ramo primário muito longo; garra interna tipo Isohypsibius.",
        next: "ramajendas_result",
        image: "assets/key-results/Ramajendas.jpg", // Placeholder
      },
    ],
  },
  ramajendas_result: {
    title: "Resultado: Gênero Ramajendas",
    result: "Gênero Ramajendas",
    description:
      "Garra externa do tipo Hypsibius com um ramo primário extremamente longo e esbelto; garra interna do tipo Isohypsibius.",
    image: "assets/key-results/Ramajendas.jpg", // Placeholder
  },
  isohypsibiidae_generos_2: {
    title: "Família Isohypsibiidae: Gêneros (Passo 2/3)",
    question: "2(1). Observe a lâmina ventral no tubo bucal:",
    options: [
      {
        text: "2. Lâmina ventral ausente.",
        next: "isohypsibiidae_generos_3",
        image: "assets/key-images/lamina-ventral-ausente.jpg", // Imagem mantida
      },
      {
        text: "2’. Lâmina ventral presente.",
        next: "doryphoribius_result",
        image: "assets/key-images/lamina-ventral-presente.jpg", // Imagem mantida
      },
    ],
  },
  doryphoribius_result: {
    title: "Resultado: Gênero Doryphoribius",
    result: "Gênero Doryphoribius",
    description: "Lâmina ventral presente no tubo bucal; limnoterrestre.",
    image: "assets/key-results/Doryphoribius.jpg", // Imagem mantida
  },
  isohypsibiidae_generos_3: {
    title: "Família Isohypsibiidae: Gêneros (Passo 3/3)",
    question: "3(2). Observe as lamelas peribuccais (ao redor da boca):",
    options: [
      {
        text: "3. Lamelas peribuccais ausentes.",
        next: "isohypsibius_result",
        image: "assets/key-images/lamelas-ausentes.jpg", // Imagem mantida
      },
      {
        text: "3’. Lamelas peribuccais presentes (pode ser difícil de ver).",
        next: "isohypsibiidae_generos_4", // Leva ao passo Pseudobiotus/Thulinius
        image: "assets/key-images/lamelas-presentes.jpg", // Imagem mantida
      },
    ],
  },
  isohypsibius_result: {
    title: "Resultado: Gênero Isohypsibius",
    result: "Gênero Isohypsibius",
    description: "Lamelas peribuccais ao redor da abertura bucal ausentes.",
    image: "assets/key-results/Isohypsibius.jpg", // Imagem mantida
  },
  isohypsibiidae_generos_4: {
    title: "Família Isohypsibiidae: Gêneros (Passo 4/4)",
    question: "4(3). Conte as lamelas peribuccais:",
    options: [
      {
        text: "4. Cerca de 30 lamelas peribuccais presentes.",
        next: "pseudobiotus_result",
        image: "assets/key-results/Pseudobiotus.jpg", // Imagem mantida
      },
      {
        text: "4’. Doze lamelas peribuccais presentes, frequentemente fundidas.",
        next: "thulinius_result",
        image: "assets/key-results/Thulinius.jpg", // Placeholder
      },
    ],
  },
  pseudobiotus_result: {
    title: "Resultado: Gênero Pseudobiotus",
    result: "Gênero Pseudobiotus",
    description: "Cerca de 30 lamelas peribuccais presentes.",
    image: "assets/key-results/Pseudobiotus.jpg", // Imagem mantida
  },
  thulinius_result: {
    title: "Resultado: Gênero Thulinius",
    result: "Gênero Thulinius",
    description:
      "Doze lamelas peribuccais presentes, frequentemente fundidas; uma ou duas barras cuticulares sob as bases das garras.",
    image: "assets/key-results/Thulinius.jpg", // Placeholder
  },

  // --- Família Hypsibiidae ---
  hypsibiidae_generos_1: {
    title: "Família Hypsibiidae: Gêneros (Passo 1/4)",
    question: "1. Observe as garras externas:",
    options: [
      {
        text: "1. Garras externas do tipo Isohypsibius.",
        next: "hypsibiidae_generos_2",
        image: "assets/key-images/garras-isohypsibius.jpg", // Imagem mantida
      },
      {
        text: "1’. Garras externas do tipo Hypsibius.",
        next: "hypsibiidae_generos_3",
        image: "assets/key-images/garras-hypsibius.jpg", // Imagem mantida
      },
    ],
  },
  hypsibiidae_generos_2: {
    title: "Família Hypsibiidae: Gêneros (Passo 2/4)",
    question: "2(1). Observe as garras internas:",
    options: [
      {
        text: "2. Garras internas do tipo Isohypsibius modificado (ângulo > 90 graus).",
        next: "mixibius_result",
        image: "assets/key-results/Mixibius.jpg", // Placeholder
      },
      {
        text: "2’. Garras internas do tipo Hypsibius.",
        next: "acutuncus_result",
        image: "assets/key-results/Acutuncus.jpg", // Placeholder
      },
    ],
  },
  mixibius_result: {
    title: "Resultado: Gênero Mixibius",
    result: "Gênero Mixibius",
    description:
      "Garras internas do tipo Isohypsibius modificado (ângulo > 90 graus); apofises assimétricas.",
    image: "assets/key-results/Mixibius.jpg", // Placeholder
  },
  acutuncus_result: {
    title: "Resultado: Gênero Acutuncus",
    result: "Gênero Acutuncus",
    description:
      "Garras internas do tipo Hypsibius; apofises simétricas; ovos com processos postos livremente.",
    image: "assets/key-results/Acutuncus.jpg", // Placeholder
  },
  hypsibiidae_generos_3: {
    title: "Família Hypsibiidae: Gêneros (Passo 3/4)",
    question: "3(1). Observe o tubo bucal:",
    options: [
      {
        text: "3. Tubo bucal rígido, sem parte posterior flexível e espiral.",
        next: "hypsibius_result",
        image: "assets/key-results/Hypsibius.jpg", // Placeholder
      },
      {
        text: "3’. Tubo bucal com parte posterior flexível e espiral (tubo faríngeo).",
        next: "hypsibiidae_generos_4",
        image: "assets/tardigrade-icon.png", // Placeholder
      },
    ],
  },
  hypsibius_result: {
    title: "Resultado: Gênero Hypsibius",
    result: "Gênero Hypsibius",
    description:
      "Tubo bucal rígido, sem parte posterior de composição flexível e espiral; limnoterrestre.",
    image: "assets/key-results/Hypsibius.jpg", // Placeholder
  },
  hypsibiidae_generos_4: {
    title: "Família Hypsibiidae: Gêneros (Passo 4/4)",
    question: "4(3). Observe o espessamento no tubo bucal:",
    options: [
      {
        text: "4. Espessamento em forma de gota (entre parte rígida e flexível) AUSENTE.",
        next: "adropion_result",
        image: "assets/key-results/Adropion.jpg", // Placeholder
      },
      {
        text: "4’. Espessamento em forma de gota (entre parte rígida e flexível) PRESENTE.",
        next: "hypsibiidae_generos_5",
        image: "assets/tardigrade-icon.png", // Placeholder
      },
    ],
  },
  adropion_result: {
    title: "Resultado: Gênero Adropion",
    result: "Gênero Adropion",
    description:
      "Espessamento em forma de gota entre as porções rígidas e flexíveis do tubo bucal ausente.",
    image: "assets/key-results/Adropion.jpg", // Placeholder
  },
  hypsibiidae_generos_5: {
    title: "Família Hypsibiidae: Gêneros (Passo 5/5)",
    question: "5(4). Observe os macroplacóides:",
    options: [
      {
        text: "5. Dois macroplacóides semelhantes em comprimento, organizados em fileiras (parecem parênteses); septo presente.",
        next: "pilatobius_result",
        image: "assets/key-results/Pilatobius.jpg", // Placeholder
      },
      {
        text: "5’. Dois macroplacóides sem septo OU três macroplacóides com ou sem septo.",
        next: "diphascon_result",
        image: "assets/key-results/Diphascon.jpg", // Placeholder
      },
    ],
  },
  pilatobius_result: {
    title: "Resultado: Gênero Pilatobius",
    result: "Gênero Pilatobius",
    description:
      "Dois macroplacoides semelhantes em comprimento, organizados em fileiras (parecem parênteses); septo presente.",
    image: "assets/key-results/Pilatobius.jpg", // Placeholder
  },
  diphascon_result: {
    title: "Resultado: Gênero Diphascon",
    result: "Gênero Diphascon",
    description:
      "Dois macroplacoides sem septo ou três macroplacoides com ou sem septo.",
    image: "assets/key-results/Diphascon.jpg", // Placeholder
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
          <img src="${option.image || 'assets/tardigrade-icon.png'}" alt="Imagem para ${escapeHtml(option.text)}" class="key-option-image">
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
      <img src="${step.image || 'assets/tardigrade-icon.png'}" alt="Imagem de ${escapeHtml(step.result)}" class="result-image">
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
  if(keySteps[currentStep]) {
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
  const records = getFilteredRecords().slice(0, 10); // Mostra os 10 últimos
  
  if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum registro encontrado.</td></tr>';
      return;
  }
  
  tbody.innerHTML = records
    .map(
      (record) => `
    <tr>
      <td>${escapeHtml(record.classe || record.ordem)}</td>
      <td>${escapeHtml(record.familia)}</td>
      <td><i>${escapeHtml(record.genero)}</i></td>
      <td>${escapeHtml(record.localidade)}</td>
      <td>${escapeHtml(record.pesquisador)}</td>
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
        description: "Estruturas sensoriais em forma de seta (cA) localizadas lateralmente na cabeça. Essenciais para diferenciar Heterotardigrada (presentes) de Eutardigrada (ausentes).",
        image: "assets/key-images/cirro-A-presente.jpg"
    },
    {
        id: "cirro-mediano",
        name: "Cirro Mediano",
        description: "Uma única estrutura sensorial no centro da cabeça. Comum em Arthrotardigrada, mas ausente em Echiniscoidea.",
        image: "assets/key-images/cirro-mediano-presente.jpg"
    },
    {
        id: "placas-dorsais",
        name: "Placas Dorsais e Laterais",
        description: "Armadura cuticular protetora encontrada em Echiniscoidea (ex: Echiniscus). Ausente em Eutardigrada.",
        image: "assets/key-images/4-garras-placas.jpg"
    },
    {
        id: "papilas-cefalicas",
        name: "Papilas Cefálicas",
        description: "Pequenas protuberâncias sensoriais na cabeça, características da Ordem Apochela (ex: Milnesium).",
        image: "assets/key-images/apochela-cabeca.jpg"
    },
    {
        id: "garras-assimetricas",
        name: "Garras Assimétricas (2-1-2-1)",
        description: "Garras de tamanhos ou formas diferentes, com sequência 2-1-2-1. Típico de Hypsibioidea e Isohypsibioidea.",
        image: "assets/key-images/garras-assimetricas.jpg"
    },
    {
        id: "garras-simetricas",
        name: "Garras Simétricas (2-1-1-2)",
        description: "Garras semelhantes em tamanho e forma, com sequência 2-1-1-2. Característica de Macrobiotoidea.",
        image: "assets/key-images/garras-simetricas.jpg"
    },
    {
        id: "garras-tipo-Y",
        name: "Garras Tipo Y (Macrobiotidae)",
        description: "Garras onde os ramos primário e secundário são fundidos por um trecho, formando um 'Y'.",
        image: "assets/key-images/garras-Y.jpg"
    },
    {
        id: "garras-tipo-V-L",
        name: "Garras Tipo V ou L (Murrayidae)",
        description: "Garras onde os ramos divergem diretamente da base, sem um trecho fundido, formando um 'V' ou 'L'.",
        image: "assets/key-images/garras-V-L.jpg"
    },
    {
        id: "garras-tipo-isohypsibius",
        name: "Garras Tipo Isohypsibius",
        description: "Garras onde o ramo secundário forma um ângulo reto (ou maior) com a base da garra.",
        image: "assets/key-images/garras-isohypsibius.jpg"
    },
    {
        id: "garras-tipo-hypsibius",
        name: "Garras Tipo Hypsibius",
        description: "Garras externas onde o ramo secundário forma um arco comum com a porção basal.",
        image: "assets/key-images/garras-hypsibius.jpg"
    },
    {
        id: "lamina-ventral",
        name: "Lâmina Ventral",
        description: "Uma estrutura presente no tubo bucal de alguns gêneros, como Doryphoribius.",
        image: "assets/key-images/lamina-ventral-presente.jpg"
    },
    {
        id: "lamelas-peribuccais",
        name: "Lamelas Peribuccais",
        description: "Anel de lamelas delicadas ao redor da boca. Presentes em gêneros como Pseudobiotus.",
        image: "assets/key-images/lamelas-presentes.jpg"
    }
];

function renderStructures() {
    const container = document.getElementById("estrutura-cards-container");
    if (!container) return;

    const searchTerm = document.getElementById("estrutura-search").value.toLowerCase();
    
    const filteredStructures = tardigradeStructures.filter(estrutura =>
        estrutura.name.toLowerCase().includes(searchTerm) ||
        estrutura.description.toLowerCase().includes(searchTerm)
    );

    if (filteredStructures.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Nenhuma estrutura encontrada.</p>';
        return;
    }

    container.innerHTML = filteredStructures.map(estrutura => `
        <div class="estrutura-card" data-id="${estrutura.id}">
            <div class="estrutura-card-image-container">
                <img src="${estrutura.image || 'assets/tardigrade-icon.png'}" alt="${escapeHtml(estrutura.name)}" class="estrutura-card-image">
            </div>
            <div class="estrutura-card-content">
                <h4 class="estrutura-card-title">${escapeHtml(estrutura.name)}</h4>
                <p class="estrutura-card-description">${escapeHtml(estrutura.description)}</p>
            </div>
        </div>
    `).join('');
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

  // Event Listener para Filtro de Grupos (Mapa)
  const grupoFilter = document.getElementById("grupo-filter");
  if (grupoFilter) {
    grupoFilter.addEventListener("change", renderAll);
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
  // O renderAll() será chamado dentro do initMap() se necessário,
  // ou pode ser chamado aqui se o mapa não for a primeira tela.
  // Vamos garantir que os dados iniciais (tabela, stats) sejam carregados.
  updateStats();
  renderRecordsTable();
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
  if (typeof text !== 'string') {
    return text;
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}