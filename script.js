// ===================================
// FILOSTUDY - Portal de Estudos Filogenéticos
// Script principal da aplicação
// ===================================

// ============================================================
// MENU MOBILE E NAVEGAÇÃO RESPONSIVA
// ============================================================

// Variável de controle: menu mobile aberto ou fechado
let isMobileMenuOpen = false;

/**
 * Função: Abre/fecha o menu mobile (toggle)
 * Chamada ao clicar no botão hamburger ou no botão X
 */
function toggleMobileMenu() {
  const mobileNav = document.getElementById("mobile-nav"); // Overlay do menu
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn"); // Botão hamburger

  if (!mobileNav || !mobileMenuBtn) return; // Proteção contra elementos não encontrados

  // Inverte o estado
  isMobileMenuOpen = !isMobileMenuOpen;

  if (isMobileMenuOpen) {
    // ABRIR menu
    mobileNav.classList.add("active");
    mobileMenuBtn.classList.add("active"); // Anima hamburger para X
    document.body.style.overflow = "hidden"; // Desabilita scroll da página
  } else {
    // FECHAR menu
    mobileNav.classList.remove("active");
    mobileMenuBtn.classList.remove("active"); // Volta hamburger ao normal
    document.body.style.overflow = "auto"; // Reabilita scroll
  }
}

// Event listener: Fechar menu ao clicar fora dele
document.addEventListener("click", (e) => {
  const mobileNav = document.getElementById("mobile-nav");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");

  // Se menu está aberto E clique foi fora do menu E fora do botão
  if (
    isMobileMenuOpen &&
    mobileNav &&
    !mobileNav.contains(e.target) &&
    mobileMenuBtn &&
    !mobileMenuBtn.contains(e.target)
  ) {
    toggleMobileMenu(); // Fecha o menu
  }
});

// Event listener: Fechar menu ao redimensionar para desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen) {
    toggleMobileMenu(); // Fecha menu se tela ficar grande
  }
});

// ============================================================
// NAVEGAÇÃO ENTRE SEÇÕES (SPA - Single Page Application)
// ============================================================

/**
 * Função: Mostra uma seção e esconde todas as outras
 * @param {string} sectionId - ID da seção a ser exibida (ex: 'home', 'mapa-filos')
 */
function showSection(sectionId) {
  // Fechar menu mobile se estiver aberto
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Esconder TODAS as seções
  const sections = document.querySelectorAll(".container");
  sections.forEach((section) => {
    section.classList.add("hidden"); // Adiciona classe .hidden
  });

  // Mostrar apenas a seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden"); // Remove classe .hidden

    // Inicializar componentes específicos da seção após um delay
    setTimeout(() => {
      if (sectionId === "mapa-filos" && !map) {
        // Se for seção do mapa E mapa ainda não foi criado
        initMap(); // Inicializa o mapa Leaflet
        renderAll(); // Renderiza marcadores e estatísticas
      } else if (sectionId === "mapa-filos" && map) {
        // Se mapa já existe, apenas redimensiona
        map.invalidateSize(); // Fix para mapa aparecer corretamente
      }

      if (sectionId === "chave-dicotomica") {
        resetKey(); // Reinicia chave dicotômica
      }
    }, 300); // 300ms de delay para animações suaves

    // Scroll suave para o topo da página
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

// ============================================================
// DADOS DOS REGISTROS FILOGENÉTICOS
// Armazenados no LocalStorage do navegador
// ============================================================

// Carrega registros do LocalStorage OU usa dados de exemplo
let filoRecords = JSON.parse(localStorage.getItem("filoRecords")) || [
  // Registro de exemplo 1: Tardígrado
  {
    id: "1a2b3c", // ID único de 6 caracteres
    latitude: -23.5505, // Coordenada GPS
    longitude: -46.6333,
    filo: "Tardigrada",
    classe: "Eutardigrada",
    ordem: "Ramazzottiida",
    familia: "Ramazzottiidae",
    genero: "Ramazzottius",
    especie: "oberhaeuseri",
    quantidade: 15, // Número de indivíduos observados
    tamanho: 0.3, // Tamanho em mm
    localidade: "Parque Ibirapuera, SP",
    habitat: "Terrestre",
    pesquisador: "Ana Silva",
    instituicao: "USP",
    caracteristicas:
      "Tardígrado com cutícula lisa, garras duplas bem desenvolvidas",
    observacoes: "Encontrado em musgo de árvore. Resistente à dessecação.",
    fotos: [], // Array de URLs de fotos (não implementado)
    data: "2025-09-22T19:00:00Z", // Data no formato ISO
  },
  // Registro de exemplo 2: Borboleta
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
    tamanho: 120, // 120mm de envergadura
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

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
let map = null; // Instância do mapa Leaflet (null até ser inicializado)
let markers = []; // Array de marcadores no mapa
let currentStep = 1; // Passo atual da chave dicotômica
let choiceHistory = []; // Histórico de escolhas do usuário na chave

// ============================================================
// MAPA INTERATIVO LEAFLET
// ============================================================

/**
 * Função: Inicializa o mapa Leaflet
 * Só é chamada quando o usuário navega para a seção "Mapa de Filos"
 */
function initMap() {
  // Verificar se a biblioteca Leaflet foi carregada
  if (typeof L === "undefined") {
    console.log("Leaflet não está carregado");
    return;
  }

  // Verificar se o elemento HTML do mapa existe
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.log("Elemento do mapa não encontrado");
    return;
  }

  try {
    // Criar instância do mapa centrado no Brasil
    map = L.map("map").setView([-15.7942, -47.8822], 4); // Centro: Brasília, Zoom: 4

    // Adicionar camada de tiles (mapa base do OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19, // Zoom máximo permitido
      tileSize: 256, // Tamanho dos tiles
      zoomOffset: 0,
    }).addTo(map);

    // Aguardar um pouco antes de renderizar marcadores (fix para mobile)
    setTimeout(() => {
      renderMarkers(); // Adiciona marcadores dos registros
      map.invalidateSize(); // Força recálculo do tamanho do mapa
    }, 500);

    console.log("Mapa inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar o mapa:", error);
  }
}

/**
 * Função: Renderiza marcadores no mapa
 * Remove marcadores antigos e adiciona novos baseados nos registros filtrados
 */
function renderMarkers() {
  if (!map) return; // Proteção: só executa se mapa foi inicializado

  // Remover todos os marcadores antigos
  markers.forEach((marker) => map.removeLayer(marker));
  markers = []; // Limpa array

  // Obter registros (com filtro se houver)
  const filteredRecords = getFilteredRecords();

  // Para cada registro, criar um marcador
  filteredRecords.forEach((record) => {
    const marker = L.marker([record.latitude, record.longitude]).addTo(map) // Adiciona ao mapa
      .bindPopup(`
        <div class="popup-content">
          <h4>${record.filo} - ${record.genero} ${record.especie}</h4>
          <p><strong>Local:</strong> ${record.localidade}</p>
          <p><strong>Pesquisador:</strong> ${record.pesquisador}</p>
          <p><strong>Data:</strong> ${new Date(record.data).toLocaleDateString(
            "pt-BR"
          )}</p>
        </div>
      `); // Popup com informações

    markers.push(marker); // Adiciona ao array
  });
}

/**
 * Função: Retorna registros filtrados pelo dropdown
 * @returns {Array} Array de registros filtrados ou todos os registros
 */
function getFilteredRecords() {
  const filter = document.getElementById("filo-filter")?.value; // Valor do dropdown
  return filter
    ? filoRecords.filter((record) => record.filo === filter) // Filtra por filo
    : filoRecords; // Ou retorna todos
}

// ============================================================
// ESTATÍSTICAS (Cards de contadores)
// ============================================================

/**
 * Função: Atualiza os 3 cards de estatísticas
 * Conta: total de registros, filos únicos, espécies únicas
 */
function updateStats() {
  const totalRegistros = filoRecords.length; // Conta registros

  // Conta filos únicos usando Set (remove duplicatas)
  const totalFilos = [...new Set(filoRecords.map((r) => r.filo))].length;

  // Conta espécies únicas (genero + especie)
  const totalEspecies = [
    ...new Set(filoRecords.map((r) => `${r.genero} ${r.especie}`)),
  ].length;

  // Atualiza o HTML dos contadores
  document.getElementById("total-registros").textContent = totalRegistros;
  document.getElementById("total-filos").textContent = totalFilos;
  document.getElementById("total-especies").textContent = totalEspecies;
}

// ============================================================
// FORMULÁRIO DE CADASTRO
// ============================================================

/**
 * Função: Processa o envio do formulário
 * @param {Event} e - Evento de submit do formulário
 */
function handleFormSubmit(e) {
  e.preventDefault(); // Impede reload da página

  // Extrai dados do formulário usando FormData API
  const formData = new FormData(e.target);

  // Cria novo objeto de registro
  const newRecord = {
    id: generateId(), // Gera ID único aleatório
    latitude: parseFloat(formData.get("latitude")), // Converte para número
    longitude: parseFloat(formData.get("longitude")),
    filo: formData.get("filo"),
    classe: formData.get("classe"),
    ordem: formData.get("ordem") || "", // Campos opcionais
    familia: formData.get("familia") || "",
    genero: formData.get("genero"),
    especie: formData.get("especie"),
    quantidade: parseInt(formData.get("quantidade")), // Converte para inteiro
    tamanho: parseFloat(formData.get("tamanho")) || null, // Pode ser null
    localidade: formData.get("localidade"),
    habitat: formData.get("habitat"),
    pesquisador: formData.get("pesquisador"),
    instituicao: formData.get("instituicao") || "",
    caracteristicas: formData.get("caracteristicas"),
    observacoes: formData.get("observacoes") || "",
    fotos: [], // TODO: implementar upload de fotos
    data: new Date().toISOString(), // Data atual em formato ISO
  };

  // Adiciona registro ao array
  filoRecords.push(newRecord);

  // Salva no LocalStorage (persiste dados)
  localStorage.setItem("filoRecords", JSON.stringify(filoRecords));

  // Mostra mensagem de sucesso
  showNotification("Registro salvo com sucesso!", "success");

  // Limpa o formulário
  e.target.reset();

  // Atualiza visualizações (tabela, mapa, estatísticas)
  renderAll();
}

/**
 * Função: Gera um ID único de 6 caracteres
 * @returns {string} ID aleatório
 */
function generateId() {
  return Math.random().toString(36).substr(2, 6); // Base 36: letras + números
}

/**
 * Função: Obtém localização GPS do usuário
 * Usa a API de Geolocalização do navegador
 */
function getLocation() {
  // Verifica se navegador suporta geolocalização
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Sucesso: preenche campos de lat/long
        document.getElementById("latitude").value =
          position.coords.latitude.toFixed(6); // 6 casas decimais
        document.getElementById("longitude").value =
          position.coords.longitude.toFixed(6);
        showNotification("Localização obtida!", "success");
      },
      () => showNotification("Erro ao obter localização", "error") // Erro
    );
  }
}

// ============================================================
// CHAVE DICOTÔMICA (Máquina de Estados)
// Sistema de identificação interativa de filos
// ============================================================

// Objeto que define todos os passos da chave dicotômica
const keySteps = {
  // Passo inicial
  1: {
    title: "Passo 1",
    question: "O organismo possui células organizadas em tecidos verdadeiros?",
    options: [
      { text: "Sim - Possui tecidos organizados", next: "tecidos-sim" },
      { text: "Não - Células não organizadas em tecidos", next: "tecidos-nao" },
    ],
  },
  // Resultado: sem tecidos = Porifera
  "tecidos-nao": {
    title: "Resultado",
    result: "Porifera",
    description: "Esponjas - organismos aquáticos sem tecidos verdadeiros",
  },
  // Com tecidos: pergunta sobre simetria
  "tecidos-sim": {
    title: "Passo 2",
    question: "O organismo apresenta simetria radial ou bilateral?",
    options: [
      { text: "Simetria radial", next: "radial" },
      { text: "Simetria bilateral", next: "bilateral" },
    ],
  },
  // Resultado: simetria radial = Cnidaria
  radial: {
    title: "Resultado",
    result: "Cnidaria",
    description:
      "Águas-vivas, corais, anêmonas - organismos com simetria radial",
  },
  // Simetria bilateral: pergunta sobre esqueleto
  bilateral: {
    title: "Passo 3",
    question: "O organismo possui esqueleto interno?",
    options: [
      { text: "Sim - Possui esqueleto interno", next: "esqueleto-sim" },
      { text: "Não - Sem esqueleto interno", next: "esqueleto-nao" },
    ],
  },
  // Resultado: com esqueleto = Chordata
  "esqueleto-sim": {
    title: "Resultado",
    result: "Chordata",
    description: "Vertebrados - peixes, anfíbios, répteis, aves, mamíferos",
  },
  // Resultado: sem esqueleto = Arthropoda
  "esqueleto-nao": {
    title: "Resultado",
    result: "Arthropoda",
    description: "Artrópodes - insetos, crustáceos, aracnídeos",
  },
};

/**
 * Função: Avança para o próximo passo da chave
 * @param {string} stepId - ID do próximo passo
 */
function nextStep(stepId) {
  const step = keySteps[stepId]; // Busca dados do passo
  if (!step) return; // Proteção

  // Adiciona escolha atual ao histórico
  const currentStepData = keySteps[currentStep];
  if (currentStepData) {
    choiceHistory.push(currentStepData.question);
  }

  // Verifica se é um resultado final ou próximo passo
  if (step.result) {
    showResult(step); // Mostra resultado
  } else {
    showStep(step, stepId); // Mostra próximo passo
  }
}

/**
 * Função: Mostra um passo da chave (pergunta + opções)
 * @param {Object} step - Dados do passo
 * @param {string} stepId - ID do passo
 */
function showStep(step, stepId) {
  currentStep = stepId; // Atualiza passo atual

  // Atualiza título
  document.getElementById("step-title").textContent = step.title;

  // Atualiza conteúdo (pergunta + botões de opção)
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

  updateChoiceHistory(); // Atualiza histórico
}

/**
 * Função: Mostra o resultado final da identificação
 * @param {Object} step - Dados do resultado
 */
function showResult(step) {
  // Esconde passo, mostra resultado
  document.getElementById("key-step").style.display = "none";
  document.getElementById("key-result").style.display = "block";

  // Exibe filo identificado
  document.getElementById("result-content").innerHTML = `
    <div class="result-card">
      <h4>Filo: ${step.result}</h4>
      <p>${step.description}</p>
    </div>
  `;

  updateChoiceHistory(); // Atualiza histórico
}

/**
 * Função: Reinicia a chave dicotômica
 */
function resetKey() {
  currentStep = 1; // Volta ao passo 1
  choiceHistory = []; // Limpa histórico
  document.getElementById("key-step").style.display = "block";
  document.getElementById("key-result").style.display = "none";
  showStep(keySteps[1], 1); // Mostra primeiro passo
}

/**
 * Função: Atualiza o HTML do histórico de escolhas
 */
function updateChoiceHistory() {
  const historyList = document.getElementById("choice-history");
  historyList.innerHTML = choiceHistory
    .map((choice) => `<li>${choice}</li>`)
    .join("");
}

// ============================================================
// TABELA DE REGISTROS
// ============================================================

/**
 * Função: Renderiza a tabela de registros recentes
 * Mostra os 10 registros mais recentes (ou filtrados)
 */
function renderRecordsTable() {
  const tbody = document.getElementById("records-body");
  if (!tbody) return; // Proteção

  // Pega registros filtrados e limita a 10
  const records = getFilteredRecords().slice(0, 10);

  // Gera HTML das linhas da tabela
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

/**
 * Função: Deleta um registro
 * @param {string} id - ID do registro a ser deletado
 */
function handleDeleteRecord(id) {
  // Pede confirmação
  if (confirm("Deseja realmente excluir este registro?")) {
    // Remove registro do array
    filoRecords = filoRecords.filter((record) => record.id !== id);

    // Atualiza LocalStorage
    localStorage.setItem("filoRecords", JSON.stringify(filoRecords));

    // Mostra notificação
    showNotification("Registro excluído com sucesso!", "success");

    // Atualiza visualizações
    renderAll();
  }
}

// ============================================================
// NOTIFICAÇÕES (Toast Messages)
// ============================================================

/**
 * Função: Mostra notificação temporária na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  if (!notification) return;

  // Define texto e classe CSS
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  // Remove após 3 segundos
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ============================================================
// RENDERIZAÇÃO GERAL
// ============================================================

/**
 * Função: Atualiza todas as visualizações
 * Chama: estatísticas, tabela e marcadores do mapa
 */
function renderAll() {
  updateStats(); // Atualiza contadores
  renderRecordsTable(); // Atualiza tabela
  renderMarkers(); // Atualiza marcadores do mapa
}

// ============================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// Executado quando o DOM estiver pronto
// ============================================================

/**
 * Função: Inicializa todos os event listeners e componentes
 */
function init() {
  // ===== EVENT LISTENERS PARA NAVEGAÇÃO =====

  // Links do menu desktop
  const desktopNavLinks = document.querySelectorAll(".desktop-nav a");
  desktopNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Impede navegação padrão
      const sectionId = link.getAttribute("href").substring(1); // Remove '#'
      showSection(sectionId); // Mostra seção
    });
  });

  // Links do menu mobile
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-item");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // ===== EVENT LISTENER PARA FORMULÁRIO =====
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // ===== EVENT LISTENER PARA BOTÃO DE LOCALIZAÇÃO =====
  const getLocationBtn = document.getElementById("getLocation");
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getLocation);
  }

  // ===== EVENT LISTENER PARA FILTRO DE FILOS =====
  const filoFilter = document.getElementById("filo-filter");
  if (filoFilter) {
    filoFilter.addEventListener("change", renderAll); // Re-renderiza ao mudar filtro
  }

  // ===== EVENT LISTENER PARA BOTÕES DE DELETE =====
  // Usa delegação de eventos (um listener no document)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-delete")) {
      const id = e.target.closest(".btn-delete").dataset.id;
      handleDeleteRecord(id);
    }
  });

  // ===== INICIALIZAÇÃO COM DELAY =====
  // Aguarda um pouco para garantir que DOM está pronto
  setTimeout(() => {
    // Só inicializa mapa se estivermos na seção do mapa
    if (
      document.getElementById("mapa-filos") &&
      !document.getElementById("mapa-filos").classList.contains("hidden")
    ) {
      initMap();
    }
    resetKey(); // Inicializa chave dicotômica
    renderAll(); // Renderiza tudo
  }, 500);

  // Mostra seção inicial (Home)
  showSection("home");
}

// ===== EXECUTA INICIALIZAÇÃO =====
// Verifica se DOM já está pronto
if (document.readyState === "loading") {
  // Ainda carregando: aguarda evento DOMContentLoaded
  document.addEventListener("DOMContentLoaded", init);
} else {
  // Já está pronto: executa imediatamente
  init();
}
