// ===================================
// FILOSTUDY - Portal de Estudos Filogenéticos
// ===================================

// ===== MENU MOBILE E NAVEGAÇÃO RESPONSIVA =====
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

// Fechar menu mobile ao clicar fora
document.addEventListener("click", (e) => {
  const mobileNav = document.getElementById("mobile-nav");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");

  if (
    isMobileMenuOpen &&
    mobileNav &&
    !mobileNav.contains(e.target) &&
    mobileMenuBtn &&
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

// Navegação entre seções melhorada
function showSection(sectionId) {
  // Fechar menu mobile se estiver aberto
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Esconder todas as seções
  const sections = document.querySelectorAll(".container");
  sections.forEach((section) => {
    section.classList.add("hidden");
  });

  // Mostrar seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden");

    // Inicializar componentes específicos da seção
    setTimeout(() => {
      if (sectionId === "mapa-filos" && !map) {
        initMap();
        renderAll();
      } else if (sectionId === "mapa-filos" && map) {
        // Redimensionar mapa existente
        map.invalidateSize();
      }

      if (sectionId === "chave-dicotomica") {
        resetKey();
      }
    }, 300);

    // Scroll suave para o topo
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

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
];

// Variáveis globais
let map = null;
let markers = [];
let currentStep = 1;
let choiceHistory = [];

// ===== MAPA INTERATIVO =====
function initMap() {
  // Verificar se o Leaflet está carregado
  if (typeof L === "undefined") {
    console.log("Leaflet não está carregado");
    return;
  }

  // Verificar se o elemento do mapa existe
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.log("Elemento do mapa não encontrado");
    return;
  }

  try {
    // Inicializar o mapa
    map = L.map("map").setView([-15.7942, -47.8822], 4);

    // Adicionar camada de tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(map);

    // Aguardar um pouco antes de renderizar marcadores
    setTimeout(() => {
      renderMarkers();
      // Ajustar o tamanho do mapa
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
    const marker = L.marker([record.latitude, record.longitude]).addTo(map)
      .bindPopup(`
        <div class="popup-content">
          <h4>${record.filo} - ${record.genero} ${record.especie}</h4>
          <p><strong>Local:</strong> ${record.localidade}</p>
          <p><strong>Pesquisador:</strong> ${record.pesquisador}</p>
          <p><strong>Data:</strong> ${new Date(record.data).toLocaleDateString(
            "pt-BR"
          )}</p>
        </div>
      `);

    markers.push(marker);
  });
}

function getFilteredRecords() {
  const filter = document.getElementById("filo-filter")?.value;
  return filter
    ? filoRecords.filter((record) => record.filo === filter)
    : filoRecords;
}

// ===== ESTATÍSTICAS =====
function updateStats() {
  const totalRegistros = filoRecords.length;
  const totalFilos = [...new Set(filoRecords.map((r) => r.filo))].length;
  const totalEspecies = [
    ...new Set(filoRecords.map((r) => `${r.genero} ${r.especie}`)),
  ].length;

  document.getElementById("total-registros").textContent = totalRegistros;
  document.getElementById("total-filos").textContent = totalFilos;
  document.getElementById("total-especies").textContent = totalEspecies;
}

// ===== FORMULÁRIO =====
function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const newRecord = {
    id: generateId(),
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
  e.target.reset();
  renderAll();
}

function generateId() {
  return Math.random().toString(36).substr(2, 6);
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
  }
}

// ===== CHAVE DICOTÔMICA =====
const keySteps = {
  1: {
    title: "Passo 1",
    question: "O organismo possui células organizadas em tecidos verdadeiros?",
    options: [
      { text: "Sim - Possui tecidos organizados", next: "tecidos-sim" },
      { text: "Não - Células não organizadas em tecidos", next: "tecidos-nao" },
    ],
  },
  "tecidos-nao": {
    title: "Resultado",
    result: "Porifera",
    description: "Esponjas - organismos aquáticos sem tecidos verdadeiros",
  },
  "tecidos-sim": {
    title: "Passo 2",
    question: "O organismo apresenta simetria radial ou bilateral?",
    options: [
      { text: "Simetria radial", next: "radial" },
      { text: "Simetria bilateral", next: "bilateral" },
    ],
  },
  radial: {
    title: "Resultado",
    result: "Cnidaria",
    description:
      "Águas-vivas, corais, anêmonas - organismos com simetria radial",
  },
  bilateral: {
    title: "Passo 3",
    question: "O organismo possui esqueleto interno?",
    options: [
      { text: "Sim - Possui esqueleto interno", next: "esqueleto-sim" },
      { text: "Não - Sem esqueleto interno", next: "esqueleto-nao" },
    ],
  },
  "esqueleto-sim": {
    title: "Resultado",
    result: "Chordata",
    description: "Vertebrados - peixes, anfíbios, répteis, aves, mamíferos",
  },
  "esqueleto-nao": {
    title: "Resultado",
    result: "Arthropoda",
    description: "Artrópodes - insetos, crustáceos, aracnídeos",
  },
};

function nextStep(stepId) {
  const step = keySteps[stepId];
  if (!step) return;

  // Adicionar escolha ao histórico
  const currentStepData = keySteps[currentStep];
  if (currentStepData) {
    choiceHistory.push(currentStepData.question);
  }

  if (step.result) {
    showResult(step);
  } else {
    showStep(step, stepId);
  }
}

function showStep(step, stepId) {
  currentStep = stepId;

  document.getElementById("step-title").textContent = step.title;

  const content = document.getElementById("step-content");
  content.innerHTML = `
    <div class="key-question">
      <p><strong>${step.question}</strong></p>
    </div>
    <div class="key-options">
      ${step.options
        .map(
          (option) => `
        <button class="key-option" onclick="nextStep('${option.next}')">
          ${option.text}
        </button>
      `
        )
        .join("")}
    </div>
  `;

  updateChoiceHistory();
}

function showResult(step) {
  document.getElementById("key-step").style.display = "none";
  document.getElementById("key-result").style.display = "block";

  document.getElementById("result-content").innerHTML = `
    <div class="result-card">
      <h4>Filo: ${step.result}</h4>
      <p>${step.description}</p>
    </div>
  `;

  updateChoiceHistory();
}

function resetKey() {
  currentStep = 1;
  choiceHistory = [];
  document.getElementById("key-step").style.display = "block";
  document.getElementById("key-result").style.display = "none";
  showStep(keySteps[1], 1);
}

function updateChoiceHistory() {
  const historyList = document.getElementById("choice-history");
  historyList.innerHTML = choiceHistory
    .map((choice) => `<li>${choice}</li>`)
    .join("");
}

// ===== TABELA DE REGISTROS =====
function renderRecordsTable() {
  const tbody = document.getElementById("records-body");
  if (!tbody) return;

  const records = getFilteredRecords().slice(0, 10);

  tbody.innerHTML = records
    .map(
      (record) => `
    <tr>
      <td>${record.filo}</td>
      <td>${record.classe}</td>
      <td><em>${record.genero} ${record.especie}</em></td>
      <td>${record.localidade}</td>
      <td>${record.pesquisador}</td>
      <td>${new Date(record.data).toLocaleDateString("pt-BR")}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${record.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

function handleDeleteRecord(id) {
  if (confirm("Deseja realmente excluir este registro?")) {
    filoRecords = filoRecords.filter((record) => record.id !== id);
    localStorage.setItem("filoRecords", JSON.stringify(filoRecords));
    showNotification("Registro excluído com sucesso!", "success");
    renderAll();
  }
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ===== RENDERIZAÇÃO GERAL =====
function renderAll() {
  updateStats();
  renderRecordsTable();
  renderMarkers();
}

// ===== INICIALIZAÇÃO =====
function init() {
  // Event listeners para navegação
  const desktopNavLinks = document.querySelectorAll(".desktop-nav a");
  desktopNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  const mobileNavLinks = document.querySelectorAll(".mobile-nav-item");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Event listeners para formulário
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const getLocationBtn = document.getElementById("getLocation");
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getLocation);
  }

  // Event listener para filtro
  const filoFilter = document.getElementById("filo-filter");
  if (filoFilter) {
    filoFilter.addEventListener("change", renderAll);
  }

  // Event listener para delete
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-delete")) {
      const id = e.target.closest(".btn-delete").dataset.id;
      handleDeleteRecord(id);
    }
  });

  // Inicializar componentes depois de um delay
  setTimeout(() => {
    // Só inicializar o mapa se estivermos na seção do mapa
    if (
      document.getElementById("mapa-filos") &&
      !document.getElementById("mapa-filos").classList.contains("hidden")
    ) {
      initMap();
    }
    resetKey();
    renderAll();
  }, 500);

  // Mostrar seção inicial
  showSection("home");
}

// Inicialização quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
