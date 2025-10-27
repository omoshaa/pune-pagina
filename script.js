// ===================================
// TARDISTUDY - Portal de Estudos de Tardigrada
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

// ============================================================
// NAVEGAÇÃO ENTRE SEÇÕES (SPA - Single Page Application)
// ============================================================

/**
 * Função: Mostra uma seção e esconde todas as outras
 * @param {string} sectionId - ID da seção a ser exibida (ex: 'home', 'mapa-tardigrada')
 */
function showSection(sectionId) {
  // Fechar menu mobile se estiver aberto
  if (isMobileMenuOpen) {
    toggleMobileMenu();
  }

  // Esconder TODAS as seções
  // CORREÇÃO: Seleciona as seções principais, não todos os .container
  const sections = document.querySelectorAll("main > .section, main > .hero-section");
  sections.forEach((section) => {
    section.classList.add("hidden"); // Adiciona classe .hidden
  });

  // Mostrar apenas a seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden"); // Remove classe .hidden

    // Inicializar componentes específicos da seção após um delay
    setTimeout(() => {
      if (sectionId === "mapa-tardigrada" && !map) {
        // Se for seção do mapa E mapa ainda não foi criado
        initMap(); // Inicializa o mapa Leaflet
        renderAll(); // Renderiza marcadores e estatísticas
      } else if (sectionId === "mapa-tardigrada" && map) {
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
// DADOS DOS REGISTROS DE TARDIGRADA
// Armazenados no LocalStorage do navegador
// ============================================================

// CORREÇÃO: Renomeado de filoRecords para tardiRecords
let tardiRecords = JSON.parse(localStorage.getItem("tardiRecords")) || [
  // Registro de exemplo 1: Tardígrado Eutardigrada
  {
    id: "1a2b3c", // ID único de 6 caracteres
    latitude: -23.5505, // Coordenada GPS
    longitude: -46.6333,
    classe: "Eutardigrada",
    ordem: "Parachela",
    superfamilia: "Macrobiotoidea",
    familia: "Macrobiotidae",
    genero: "Macrobiotus",
    especie: "harmsworthi",
    quantidade: 12, // Número de indivíduos observados
    tamanho: 350, // Tamanho em micrometros
    localidade: "Parque Ibirapuera, SP",
    habitat: "Terrestre - Musgo",
    pesquisador: "Ana Silva",
    instituicao: "USP",
    caracteristicas:
      "Dois macroplacóides, garras duplas assimétricas, cutícula lisa",
    observacoes:
      "Encontrado em musgo de árvore. Estado ativo e tun observados.",
    fotos: [],
    data: "2025-09-22T19:00:00Z",
  },
  // Registro de exemplo 2: Tardígrado Heterotardigrada
  {
    id: "4d5e6f",
    latitude: -15.7801,
    longitude: -47.9292,
    classe: "Heterotardigrada",
    ordem: "Echiniscoidea",
    superfamilia: "",
    familia: "Echiniscidae",
    genero: "Echiniscus",
    especie: "testudo",
    quantidade: 8,
    tamanho: 180, // Tamanho em micrometros
    localidade: "Parque Nacional de Brasília, DF",
    habitat: "Terrestre - Líquen",
    pesquisador: "João Costa",
    instituicao: "UnB",
    caracteristicas:
      "Cirros laterais A presentes, placas dorsais bem desenvolvidas, quatro garras por perna",
    observacoes:
      "Encontrado em líquen sobre rocha. Resistência extrema observada.",
    fotos: [],
    data: "2025-09-23T19:00:00Z",
  },
  // Registro de exemplo 3: Milnesium (Apochela)
  {
    id: "7g8h9i",
    latitude: -22.9068,
    longitude: -43.1729,
    classe: "Eutardigrada",
    ordem: "Apochela",
    superfamilia: "",
    familia: "Milnesiidae",
    genero: "Milnesium",
    especie: "tardigradum",
    quantidade: 5,
    tamanho: 1200, // Tamanho em micrometros (maior espécie)
    localidade: "Tijuca, Rio de Janeiro, RJ",
    habitat: "Terrestre - Folhiço",
    pesquisador: "Maria Santos",
    instituicao: "UFRJ",
    caracteristicas:
      "Papilas cefálicas presentes, ganchos com ramo secundário não conectado, ovos lisos",
    observacoes:
      "Maior tardígrado observado. Comportamento predatório em outros tardígrados.",
    fotos: [],
    data: "2025-09-24T19:00:00Z",
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
 * Só é chamada quando o usuário navega para a seção "Mapa de Tardigrada"
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
    // CORREÇÃO DE BUG: Usando `record.classe` em vez de `record.filo`
    // MELHORIA DE SEGURANÇA: Usando escapeHtml para dados do usuário
    const popupHtml = `
      <div class="popup-content">
        <h4>${escapeHtml(record.classe)} - ${escapeHtml(
      record.genero
    )} ${escapeHtml(record.especie)}</h4>
        <p><strong>Local:</strong> ${escapeHtml(record.localidade)}</p>
        <p><strong>Pesquisador:</strong> ${escapeHtml(record.pesquisador)}</p>
        <p><strong>Data:</strong> ${new Date(record.data).toLocaleDateString(
          "pt-BR"
        )}</p>
      </div>
    `;

    const marker = L.marker([record.latitude, record.longitude])
      .addTo(map) // Adiciona ao mapa
      .bindPopup(popupHtml); // Popup com informações

    markers.push(marker); // Adiciona ao array
  });
}

/**
 * Função: Retorna registros filtrados pelo dropdown
 * @returns {Array} Array de registros filtrados ou todos os registros
 */
function getFilteredRecords() {
  const filter = document.getElementById("grupo-filter")?.value; // Valor do dropdown
  return filter
    ? tardiRecords.filter( // CORREÇÃO: Usando tardiRecords
        (record) => record.classe === filter || record.ordem === filter
      ) // Filtra por grupo
    : tardiRecords; // Ou retorna todos
}

// ============================================================
// ESTATÍSTICAS (Cards de contadores)
// ============================================================

/**
 * Função: Atualiza os 3 cards de estatísticas
 * Conta: total de registros, grupos únicos, espécies únicas
 */
function updateStats() {
  const totalRegistros = tardiRecords.length; // Conta registros

  // Conta grupos únicos de Tardigrada usando Set (remove duplicatas)
  const totalGrupos = [...new Set(tardiRecords.map((r) => r.classe || r.ordem))]
    .length;

  // Conta espécies únicas (genero + especie)
  const totalEspecies = [
    ...new Set(tardiRecords.map((r) => `${r.genero} ${r.especie}`)),
  ].length;

  // Atualiza o HTML dos contadores
  document.getElementById("total-registros").textContent = totalRegistros;
  document.getElementById("total-grupos").textContent = totalGrupos;
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
    // CORREÇÃO DE BUG: Removida a propriedade "filo" que não existe no form
    classe: formData.get("classe"),
    ordem: formData.get("ordem") || "", // Campos opcionais
    superfamilia: formData.get("superfamilia") || "",
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
  tardiRecords.push(newRecord); // CORREÇÃO: Usando tardiRecords

  // Salva no LocalStorage (persiste dados)
  localStorage.setItem("tardiRecords", JSON.stringify(tardiRecords)); // CORREÇÃO

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
  } else {
    showNotification("Geolocalização não suportada.", "error");
  }
}

// ============================================================
// CHAVE DICOTÔMICA (Máquina de Estados)
// ============================================================

// Objeto que define todos os passos da chave dicotômica de Tardigrada
const keySteps = {
  // Passo inicial - Cirros laterais A
  1: {
    title: "Passo 1",
    question: "Cirros laterais A presentes (seta / cA)?",
    options: [
      { text: "Sim - Cirros laterais A presentes", next: "heterotardigrada" },
      { text: "Não - Cirros laterais A ausentes", next: "eutardigrada" },
    ],
  },
  // ... (todos os outros passos da chave permanecem os mesmos) ...
  // Ramo Heterotardigrada
  heterotardigrada: {
    title: "Heterotardigrada - Passo 2",
    question: "Cirro mediano geralmente presente (cirro no centro da cabeça)?",
    options: [
      { text: "Sim - Cirro mediano presente", next: "arthrotardigrada" },
      { text: "Não - Cirro mediano ausente", next: "echiniscoidea_inicio" },
    ],
  },
  // Resultado: Arthrotardigrada
  arthrotardigrada: {
    title: "Resultado",
    result: "Arthrotardigrada (Ordem)",
    description:
      "Ex.: Styraconyx hallasi - Tardigrados com cirro mediano presente",
  },
  // Echiniscoidea - início
  echiniscoidea_inicio: {
    title: "Echiniscoidea - Passo 3",
    question:
      "Quatro garras por perna em adultos; com placas dorsais-laterais?",
    options: [
      {
        text: "Sim - Quatro garras e placas dorsais-laterais",
        next: "echiniscidae",
      },
      { text: "Não - Características diferentes", next: "carphaniidae" },
    ],
  },
  // Resultado: Família Echiniscidae
  echiniscidae: {
    title: "Resultado",
    result: "Família Echiniscidae",
    description:
      "Tardigrados com quatro garras por perna e placas dorsais-laterais",
  },
  // Resultado: Família Carphaniidae
  carphaniidae: {
    title: "Resultado",
    result: "Família Carphaniidae",
    description:
      "Um gênero: Carphania - características distintas de Echiniscidae",
  },
  // Ramo Eutardigrada
  eutardigrada: {
    title: "Eutardigrada - Passo 2",
    question:
      "Cabeça com papilas cefálicas (incluindo duas papilas laterais) e ganchos com ramo secundário não conectado ao primário (ovos lisos dentro do exúvio)?",
    options: [
      {
        text: "Sim - Papilas cefálicas e ganchos com ramo secundário desconectado",
        next: "apochela",
      },
      { text: "Não - Características diferentes", next: "parachela_inicio" },
    ],
  },
  // Resultado: Apochela
  apochela: {
    title: "Resultado",
    result: "Apochela",
    description:
      "Ex.: Milnesium - Tardigrados com papilas cefálicas e ganchos específicos",
  },
  // Parachela - início
  parachela_inicio: {
    title: "Parachela - Passo 3",
    question:
      "Duas garras duplas em cada perna assimétricas (sequência 2-1-2-1) e ovos postos dentro do exúvio OU dois ganchos duplos por perna?",
    options: [
      {
        text: "Sim - Garras duplas assimétricas ou ganchos duplos",
        next: "parachela_superfamilias",
      },
      {
        text: "Não - Garras simétricas e tubo bucal com lâmina ventral",
        next: "macrobiotoidea",
      },
    ],
  },
  // Macrobiotoidea
  macrobiotoidea: {
    title: "Macrobiotoidea - Passo 4",
    question: "Macroplacóides: três macroplacóides presentes?",
    options: [
      { text: "Sim - Três macroplacóides", next: "macrobiotidae_tres" },
      { text: "Não - Dois macroplacóides", next: "macrobiotus" },
    ],
  },
  // Resultado: Macrobiotidae (três macroplacóides)
  macrobiotidae_tres: {
    title: "Resultado",
    result: "Macrobiotidae - Três macroplacóides",
    description:
      "Verificar Mesobiotus / Paramacrobiotus etc. - com três macroplacóides",
  },
  // Resultado: Macrobiotus
  macrobiotus: {
    title: "Resultado",
    result: "Macrobiotus",
    description: "Dois macroplacóides; pode haver microplacóide",
  },
  // Parachela - superfamílias
  parachela_superfamilias: {
    title: "Parachela - Passo 4",
    question:
      "Garras internas e externas semelhantes em forma (ganchos com ângulo reto) ou de formas diferentes (garras externas tipo Hypsibius com arco)?",
    options: [
      {
        text: "Sim - Garras semelhantes (ganchos com ângulo reto)",
        next: "isohypsibioidea",
      },
      {
        text: "Não - Garras diferentes (externas tipo Hypsibius)",
        next: "hypsibioidea",
      },
    ],
  },
  // Isohypsibioidea
  isohypsibioidea: {
    title: "Isohypsibioidea - Passo 5",
    question: "Lâmina ventral no tubo bucal presente?",
    options: [
      { text: "Sim - Lâmina ventral presente", next: "doryphoribius" },
      { text: "Não - Lâmina ventral ausente", next: "isohypsibiidae_lamelas" },
    ],
  },
  // Resultado: Doryphoribius
  doryphoribius: {
    title: "Resultado",
    result: "Doryphoribius",
    description: "Limnoterrestre - com lâmina ventral no tubo bucal",
  },
  // Isohypsibiidae - lamelas
  isohypsibiidae_lamelas: {
    title: "Isohypsibiidae - Passo 6",
    question:
      "Lamelas peribuccais ao redor da abertura bucal presentes (cerca de 30) ou ausentes?",
    options: [
      { text: "Sim - Lamelas peribuccais presentes", next: "pseudobiotus" },
      { text: "Não - Lamelas peribuccais ausentes", next: "isohypsibius" },
    ],
  },
  // Resultado: Pseudobiotus
  pseudobiotus: {
    title: "Resultado",
    result: "Pseudobiotus",
    description: "Muitas lamelas peribuccais (cerca de 30)",
  },
  // Resultado: Isohypsibius
  isohypsibius: {
    title: "Resultado",
    result: "Isohypsibius",
    description: "Lamelas peribuccais ausentes",
  },
  // Resultado: Hypsibioidea
  hypsibioidea: {
    title: "Resultado",
    result: "Hypsibioidea → Família Hypsibiidae",
    description: "Garras externas tipo Hypsibius com arco característico",
  },
};

/**
 * Função: Avança para o próximo passo da chave
 * @param {string} stepId - ID do próximo passo
 */
function nextStep(stepId) {
  const step = keySteps[stepId]; // Busca dados do passo
  if (!step) return; // Proteção

  // Adiciona escolha atual ao histórico (pergunta + resposta)
  const currentStepData = keySteps[currentStep];
  if (currentStepData && currentStepData.question) {
    // Encontra qual opção foi escolhida
    const chosenOption = currentStepData.options?.find(
      (opt) => opt.next === stepId
    );
    const response = chosenOption
      ? chosenOption.text
      : "Resposta não identificada";

    choiceHistory.push({
      question: currentStepData.question,
      answer: response,
    });
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

  // CORREÇÃO: Remove "onclick" e usa "data-step" para consistência
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
          ${escapeHtml(option.text)}
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

  // Exibe resultado identificado
  document.getElementById("result-content").innerHTML = `
    <div class="result-card">
      <h4>Identificação: ${escapeHtml(step.result)}</h4>
      <p>${escapeHtml(step.description)}</p>
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

  // Oculta exibição do caminho
  const pathDisplay = document.getElementById("path-display");
  const pathBtn = document.getElementById("path-btn");
  if (pathDisplay) {
    pathDisplay.style.display = "none";
  }
  if (pathBtn) {
    pathBtn.innerHTML = '<i class="fas fa-route"></i> Mostrar Caminho';
  }

  showStep(keySteps[1], 1); // Mostra primeiro passo
}

/**
 * Função: Atualiza o HTML do histórico de escolhas
 */
function updateChoiceHistory() {
  const historyList = document.getElementById("choice-history");
  historyList.innerHTML = choiceHistory
    .map((entry, index) => {
      if (typeof entry === "object") {
        return `<li><strong>Passo ${index + 1}:</strong> ${escapeHtml(
          entry.question
        )}<br><em>Resposta: ${escapeHtml(entry.answer)}</em></li>`;
      } else {
        return `<li>${escapeHtml(entry)}</li>`;
      }
    })
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

  // Gera HTML das linhas da tabela (com escapeHtml)
  tbody.innerHTML = records
    .map(
      (record) => `
    <tr>
      <td>${escapeHtml(record.classe || record.ordem)}</td>
      <td>${escapeHtml(record.familia)}</td>
      <td>${escapeHtml(record.genero)}</td>
      <td><em>${escapeHtml(record.genero)} ${escapeHtml(record.especie)}</em></td>
      <td>${escapeHtml(record.localidade)}</td>
      <td>${escapeHtml(record.pesquisador)}</td>
      <td>${new Date(record.data).toLocaleDateString("pt-BR")}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${
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

/**
 * Função: Deleta um registro
 * @param {string} id - ID do registro a ser deletado
 */
function handleDeleteRecord(id) {
  // Pede confirmação
  if (confirm("Deseja realmente excluir este registro?")) {
    // Remove registro do array
    tardiRecords = tardiRecords.filter((record) => record.id !== id); // CORREÇÃO

    // Atualiza LocalStorage
    localStorage.setItem("tardiRecords", JSON.stringify(tardiRecords)); // CORREÇÃO

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
  // ===== EVENT LISTENERS PARA NAVEGAÇÃO (CORRIGIDO) =====

  // 1. Botões de abrir/fechar menu mobile
  const menuToggleTriggers = document.querySelectorAll(
    ".mobile-menu-btn, .mobile-nav-close"
  );
  menuToggleTriggers.forEach((trigger) => {
    trigger.addEventListener("click", toggleMobileMenu);
  });

  // 2. Links de navegação (Desktop, Mobile, Botões da Home, Botões "Voltar")
  const sectionNavTriggers = document.querySelectorAll(
    '.desktop-nav a[href^="#"], .mobile-nav-item[href^="#"], .menu-btn[data-section], .back-btn[data-section]'
  );
  sectionNavTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault(); // Impede navegação padrão
      // Pega o ID da seção do data-attribute OU do href
      const sectionId =
        trigger.dataset.section || trigger.getAttribute("href").substring(1);
      showSection(sectionId); // Mostra seção
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

  // ===== EVENT LISTENER PARA FILTRO DE GRUPOS =====
  const grupoFilter = document.getElementById("grupo-filter");
  if (grupoFilter) {
    grupoFilter.addEventListener("change", renderAll); // Re-renderiza ao mudar filtro
  }

  // ===== EVENT LISTENERS PARA DELEGAÇÃO (Botões dinâmicos) =====

  // 1. Botões de Delete na tabela
  document.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".btn-delete");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      handleDeleteRecord(id);
    }
  });

  // 2. Botões da Chave Dicotômica (usa data-step)
  const keyStepContainer = document.getElementById("key-step");
  if (keyStepContainer) {
    keyStepContainer.addEventListener("click", (event) => {
      const optionButton = event.target.closest(".key-option");
      if (optionButton && optionButton.dataset.step) {
        nextStep(optionButton.dataset.step);
      }
    });
  }

  // ===== EVENT LISTENERS PARA BOTÕES DA CHAVE (Reset/Path) =====
  const resetKeyBtn = document.getElementById("reset-key-btn");
  if (resetKeyBtn) {
    resetKeyBtn.addEventListener("click", resetKey);
  }

  const pathBtn = document.getElementById("path-btn");
  if (pathBtn) {
    pathBtn.addEventListener("click", showPath);
  }

  // ===== INICIALIZAÇÃO DA PÁGINA =====

  // Mostra seção inicial (Home)
  showSection("home");
  // Renderiza dados iniciais
  renderAll();
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

/**
 * Função: Mostra o caminho percorrido até o momento
 */
function showPath() {
  const pathDisplay = document.getElementById("path-display");
  const pathSteps = document.getElementById("path-steps");
  const pathBtn = document.getElementById("path-btn");

  if (!pathDisplay || !pathSteps || !pathBtn) return;

  if (pathDisplay.style.display === "none" || !pathDisplay.style.display) {
    // Mostrar caminho
    if (choiceHistory.length === 0) {
      pathSteps.innerHTML =
        '<li style="text-align: center; font-style: italic;">Nenhuma escolha feita ainda.</li>';
    } else {
      pathSteps.innerHTML = choiceHistory
        .map((entry, index) => {
          if (typeof entry === "object") {
            return `<li><strong>${escapeHtml(
              entry.question
            )}</strong><br><em>→ ${escapeHtml(entry.answer)}</em></li>`;
          } else {
            return `<li><strong>Pergunta ${index +
              1}:</strong> ${escapeHtml(entry)}</li>`;
          }
        })
        .join("");
    }

    pathDisplay.style.display = "block";
    pathBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Caminho';
  } else {
    // Ocultar caminho
    pathDisplay.style.display = "none";
    pathBtn.innerHTML = '<i class="fas fa-route"></i> Mostrar Caminho';
  }
}

/**
 * Função: Escape HTML para prevenir XSS
 * @param {string} text - Texto para escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return text; // Retorna o valor original se não for string
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}