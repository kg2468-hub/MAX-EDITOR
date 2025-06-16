document.addEventListener("DOMContentLoaded", () => {
  
  

 
 
  

  // Apenas uma mensagem no console para confirmar que o projeto foi carregado
console.log("MAX Editor iniciado.");
mostrarNotificacaoAviso(`SEJA MUITO BEM VINDO(A) 😁🎨`);

  
  // ==============================
// 🔧 Objeto global para armazenar o estado do editor
// ==============================
const MAXEditor = {
  camadaSelecionada: null,  // ← aqui vamos armazenar o ID da camada selecionada futuramente
  camadas: [],               // ← se quiser, também pode usar para registrar todas as camadas
  interacaoObjetoAtiva: false, 
    zoom: 1,  
    panX: 0,   
    panY: 0    
};

   // --- VARIÁVEIS DE CONTROLE DO ZOOM/PAN DO CANVAS (MOVIDAS PARA CÁ) ---
    let isArrastando = false; // Controla o arrasto do canvas com um dedo/mouse
    let ultimoXCanvas = 0; // Última posição X para cálculo de pan do canvas
    let ultimoYCanvas = 0; // Última posição Y para cálculo de pan do canvas

    let distanciaInicialTouch = null; // Distância entre dois dedos para zoom de pinça
    let escalaInicialTouch = 1; // Escala inicial para zoom de pinça
  
  
// =============================
//     ABRIR MODAL "CRIAR"
// =============================

// Pega o botão e o modal
const botaoCriar = document.getElementById("btn-criar");
const modalCriar = document.getElementById("modal-criar");

// Ao clicar no botão, remove a classe "oculto" e mostra o modal
botaoCriar.addEventListener("click", () => {
  // 🧼 Restaura os valores padrão
  document.getElementById("nome").value = "Meu Projeto";
  document.getElementById("largura").value = 1080;
  document.getElementById("altura").value = 1080;

  // 👁️ Mostra o modal
  modalCriar.classList.remove("oculto");
});

// =============================
//     FECHAR MODAL (X)
// =============================
const botaoFechar = document.getElementById("fechar-modal");

botaoFechar.addEventListener("click", () => {
  modalCriar.classList.add("oculto"); // Esconde o modal novamente
});

// =======================================
//       CRIAR PROJETO E MOSTRAR EDITOR
// =======================================

const botaoCriarProjeto = document.getElementById("confirmar-criacao");
const telaInicial = document.getElementById("tela-inicial");
const telaEditor = document.getElementById("tela-editor");
const canvasContainer = document.getElementById("canvas-container");

botaoCriarProjeto.addEventListener("click", () => {
  // 🟢 Captura os valores digitados
  const nome = document.getElementById("nome").value.trim();
  const largura = parseInt(document.getElementById("largura").value);
  const altura = parseInt(document.getElementById("altura").value);

  // =========================
  // 🔒 VALIDAÇÕES INICIAIS
  // =========================

  // 🚫 Nome não pode estar vazio
  if (!nome) {
    mostrarNotificacao("Digite um nome para o projeto.");
    return;
  }

  // 🚫 Largura e altura precisam estar entre 100 e 5000
  if (
    isNaN(largura) || isNaN(altura) ||
    largura < 100 || largura > 5000 ||
    altura < 100 || altura > 5000
  ) {
    mostrarNotificacao("Largura e altura devem ser entre 100 e 5000 pixels.");
    return;
  }

  // 🔒 Oculta o modal e a tela inicial
  modalCriar.classList.add("oculto");
  telaInicial.classList.add("oculto");

  // 👁️ Exibe a tela de edição
  telaEditor.classList.remove("oculto");
  
  // 🔁 Garante que o menu lateral e o painel de camadas estejam fechados
menuLateral.classList.add("oculto");
menuLateral.classList.remove("ativo");

painelCamadas.classList.add("oculto");
painelCamadas.classList.remove("ativo");


// 🧼 Limpa qualquer conteúdo anterior da área de edição
canvasContainer.innerHTML = "";

// 📐 Define dinamicamente o tamanho da área de edição (div canvas-container)
canvasContainer.style.width = largura + "px";
canvasContainer.style.height = altura + "px";

// 🧩 Aplica o fundo quadriculado visual
canvasContainer.style.backgroundColor = "#ffffff";
canvasContainer.style.backgroundImage = `
  linear-gradient(45deg, #eee 25%, transparent 25%),
  linear-gradient(-45deg, #eee 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #eee 75%),
  linear-gradient(-45deg, transparent 75%, #eee 75%)
`;
canvasContainer.style.backgroundSize = "20px 20px";
canvasContainer.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";
canvasContainer.style.border = "1px solid #4caf50";

	// 🔁 Recria o contorno de seleção
	const contorno = document.createElement("div");
	contorno.id = "contorno-selecao";
	contorno.className = "contorno-objeto oculto";
	contorno.innerHTML = `
	  <div class="handle-tl"></div>
	  <div class="handle-tr"></div>
	  <div class="handle-bl"></div>
	  <div class="handle-br"></div>
	  <div class="handle-rot"></div>
	`;
	canvasContainer.appendChild(contorno);


  // 🧠 Você pode salvar as infos do projeto aqui se quiser usar depois
  console.log(`Projeto "${nome}" criado com ${largura}x${altura}px`);
  
  // 🧼 Limpa as camadas antigas da lista lateral
document.querySelectorAll(".item-camada").forEach(camada => camada.remove());

// 🧼 Volta para o Container principal dos botoes de ferramentas
mostrarContainer("principal");

// 🧼 remove um fundo escuro do menu
document.getElementById("fundo-escuro-menu").classList.remove("ativo");
document.getElementById("fundo-escuro-menu").classList.add("oculto");

setTimeout(() => {
  centralizarCanvasComZoom();
}, 100); // espera 100ms para o DOM renderizar o canvas corretamente


});
  
  
  
// =======================================================================
// 🔍 SISTEMA DE ZOOM + MOVIMENTAÇÃO (PC e CELULAR)
// -----------------------------------------------------------------------
// Permite:
// - Zoom suave com scroll do mouse e gesto de pinça
// - Movimento suave da tela com mouse ou dedo (liberado apenas com zoom > 1)
// - Centralização automática baseada no tamanho da tela
// - Proteção contra sumiço do canvas
// =======================================================================




function iniciarSistemaDeZoom() {
    const wrapper = document.getElementById("canvas-wrapper");
    const transformado = document.getElementById("canvas-transformado");
    const canvas = document.getElementById("canvas-container");

    if (!wrapper || !canvas || !transformado) return;

    // Variáveis de controle LOCAL para a função iniciarSistemaDeZoom
    // Elas controlam o estado de arrasto e últimas posições do mouse/touch para o PAN do CANVAS.
    let isArrastando = false; 
    let ultimoXCanvas = 0; 
    let ultimoYCanvas = 0; 

    // Variáveis para o zoom de pinça (gesto de dois dedos no touch)
    let distanciaInicialTouch = null; 
    let escalaInicialTouch = 1; 

    const ZOOM_MIN = 0.1;
    const ZOOM_MAX = 10;

    // Função que aplica a transformação visual (translate e scale) ao elemento 'canvas-transformado'
    // Agora usa as propriedades de MAXEditor
    function atualizarTransformacao() {
        transformado.style.transform = `translate(calc(-50% + ${MAXEditor.panX}px), calc(-50% + ${MAXEditor.panY}px)) scale(${MAXEditor.zoom})`;
        transformado.style.transformOrigin = "center center";
        transformado.style.transition = "transform 0.08s ease-out";
        verificarSeCanvasSumiu();
    }

    // Centraliza o canvas na tela e ajusta o zoom para que ele caiba completamente
    function centralizarCanvasComZoom() {
        const larguraWrapper = wrapper.clientWidth;
        const alturaWrapper = wrapper.clientHeight;
        const larguraCanvas = canvas.offsetWidth;
        const alturaCanvas = canvas.offsetHeight;

        const margem = 0.9; // Uma pequena margem para o canvas não "grudar" nas bordas
        const escalaIdeal = Math.min(larguraWrapper / larguraCanvas, alturaWrapper / canvas.offsetHeight) * margem;

        // Atualiza as propriedades de zoom e pan no objeto global MAXEditor
        MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaIdeal));
        MAXEditor.panX = 0;
        MAXEditor.panY = 0;

        atualizarTransformacao();
    }

    // Reseta o zoom e a posição do canvas para o estado padrão (zoom 1x, centralizado)
    function recentralizarCanvas() {
        MAXEditor.zoom = 1;
        MAXEditor.panX = 0;
        MAXEditor.panY = 0;
        atualizarTransformacao();
    }

    // Variável para controlar o tempo da última centralização automática
    let ultimaCentralizacao = 0;

    // Verifica se o canvas está muito fora da área visível e o recentraliza automaticamente
    function verificarSeCanvasSumiu() {
        if (!canvas || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;

        const agora = Date.now();
        const intervaloMinimo = 500; // Intervalo mínimo de 500ms entre centralizações

        if (agora - ultimaCentralizacao < intervaloMinimo) return;

        const margem = 60; // Margem em pixels para considerar o canvas "fora da tela"
        const wrapperBox = wrapper.getBoundingClientRect();
        const canvasBox = canvas.getBoundingClientRect();

        const foraHorizontal =
            canvasBox.right < wrapperBox.left + margem ||
            canvasBox.left > wrapperBox.right - margem;

        const foraVertical =
            canvasBox.bottom < wrapperBox.top + margem ||
            canvasBox.top > wrapperBox.bottom - margem;

        if (foraHorizontal || foraVertical) {
            console.warn("⚠️ Canvas fora da área visível. Recentralizando...");
            ultimaCentralizacao = agora;
            centralizarCanvasComZoom();
        }
    }

    // Expõe globalmente as funções para que possam ser chamadas de outras partes do código
    window.centralizarCanvasComZoom = centralizarCanvasComZoom;
    window.recentralizarCanvas = recentralizarCanvas;

    // ======================================
    // EVENTOS DE MOUSE / SCROLL (PC)
    // ======================================

    // Zoom com a roda do mouse (scroll)
    wrapper.addEventListener("wheel", (e) => {
        if (e.ctrlKey || e.metaKey) return; // Ignora se Ctrl/Cmd está pressionado (para zoom nativo do navegador)
        e.preventDefault(); // Previne o scroll padrão da página

        const delta = e.deltaY > 0 ? -0.1 : 0.1; // Determina a direção do zoom
        MAXEditor.zoom += delta; // Ajusta o zoom do MAXEditor
        MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, MAXEditor.zoom)); // Limita o zoom entre min e max
        atualizarTransformacao();
    }, { passive: false }); // 'passive: false' é necessário para permitir e.preventDefault()

    // Início do arrasto do canvas com o mouse (mousedown)
    wrapper.addEventListener("mousedown", (e) => {
        const contorno = document.getElementById("contorno-selecao");
        
        // Verifica 1: Há uma camada selecionada E o clique foi dentro da "margem de segurança" expandida do contorno?
        let isWithinSafeMargin = false;
        if (MAXEditor.camadaSelecionada && contorno && !contorno.classList.contains("oculto")) {
            const contornoRect = contorno.getBoundingClientRect();
            const margemSeguranca = 30; // Define o "raio" da zona de segurança (em pixels)

            // Calcula as coordenadas da área expandida
            const expandedLeft = contornoRect.left - margemSeguranca;
            const expandedTop = contornoRect.top - margemSeguranca;
            const expandedRight = contornoRect.right + margemSeguranca;
            const expandedBottom = contornoRect.bottom + margemSeguranca;

            // Se o clique ocorreu dentro dessa área expandida, a flag é ativada
            if (e.clientX >= expandedLeft && e.clientX <= expandedRight &&
                e.clientY >= expandedTop && e.clientY <= expandedBottom) {
                isWithinSafeMargin = true;
            }
        }

        // Se o clique foi no próprio objeto (para arrastar o objeto) OU dentro da margem de segurança do contorno,
        // NÃO INICIE O ARRASTO DO CANVAS. Deixe o evento seguir para o ObjetoInteracaoManager.
        if (e.target.closest(".objeto-edicao") || isWithinSafeMargin) { // <--- CORREÇÃO AQUI
            return; 
        }

        // Se nenhuma das condições acima for atendida, então é um clique válido para arrastar o canvas.
        isArrastando = true; // Ativa a flag de arrasto do canvas
        ultimoXCanvas = e.clientX; // Armazena a posição X inicial do mouse
        ultimoYCanvas = e.clientY; // Armazena a posição Y inicial do mouse
        transformado.style.transition = "none"; // Desativa transição CSS para um movimento mais direto
    });

    // Movimento do mouse (mousemove) para arrastar o canvas
    document.addEventListener("mousemove", (e) => {
        // Se uma interação de objeto (arrastar/redimensionar/rotacionar) estiver ativa,
        // o arrasto do canvas é desativado imediatamente para evitar conflitos.
        if (MAXEditor.interacaoObjetoAtiva) {
            isArrastando = false; // Garante que a flag de arrasto do canvas seja desativada
            return;
        }

        if (!isArrastando) return; // Se a flag de arrasto do canvas não estiver ativa, não faça nada

        const dx = e.clientX - ultimoXCanvas; // Calcula a mudança na posição X do mouse
        const dy = e.clientY - ultimoYCanvas; // Calcula a mudança na posição Y do mouse
        
        // Atualiza as propriedades de pan (posição) do MAXEditor
        MAXEditor.panX += dx;
        MAXEditor.panY += dy;
        
        ultimoXCanvas = e.clientX; // Atualiza a última posição do mouse para o próximo cálculo
        ultimoYCanvas = e.clientY;

        atualizarTransformacao(); // Aplica a nova transformação visual ao canvas
    });

    // Fim do arrasto do canvas (mouseup)
    document.addEventListener("mouseup", () => {
        isArrastando = false; // Desativa a flag de arrasto do canvas
    });

    // ======================================
    // EVENTOS DE TOQUE (MOBILE)
    // ======================================

    // Início do toque (touchstart) - Usado para identificar zoom de pinça ou ignorar toques de um dedo.
    wrapper.addEventListener("touchstart", (e) => {
        // A lógica de prioridade para touch (margem de segurança e clique direto no objeto)
        // é similar à do mouse, mas a forma como os eventos touch são propagados é diferente.
        // O ObjetoInteracaoManager já lida com a captura do evento de um dedo no objeto/handle.
        // Aqui, focamos no gesto de pinça (dois dedos) para zoom/pan do canvas.
        if (e.touches.length === 2) { 
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            distanciaInicialTouch = Math.hypot(dx, dy); // Calcula a distância inicial entre os dedos

            escalaInicialTouch = MAXEditor.zoom; // Armazena o zoom atual do MAXEditor como base para o zoom de pinça

            // Posição média dos dois dedos para o cálculo inicial do pan (movimento)
            ultimoXCanvas = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            ultimoYCanvas = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        } else if (e.touches.length === 1) { 
            // Não inicia o pan no wrapper com um dedo. Essa interação é gerenciada pelo ObjetoInteracaoManager (para arrastar objetos).
            // Nenhuma ação aqui para um dedo no wrapper, o que permite que o ObjetoInteracaoManager capture.
        }
    }, { passive: false }); // 'passive: false' é crucial para permitir e.preventDefault()

    // Movimento do toque (touchmove) - Para zoom de pinça e pan com dois dedos
    wrapper.addEventListener("touchmove", (e) => {
        // Se houver dois dedos e a distância inicial foi capturada (indicando um gesto de pinça)
        if (e.touches.length === 2 && distanciaInicialTouch !== null) {
            const [t1, t2] = e.touches;

            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            const novaDistancia = Math.hypot(dx, dy); // Calcula a nova distância entre os dedos

            const novoMeio = { // Calcula o novo ponto médio dos dedos
                x: (t1.clientX + t2.clientX) / 2,
                y: (t1.clientY + t2.clientY) / 2
            };

            const fatorZoom = novaDistancia / distanciaInicialTouch; // Calcula o fator de escala do zoom
            // Atualiza o zoom do MAXEditor, garantindo que fique dentro dos limites
            MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaInicialTouch * fatorZoom));

            const dxMeio = novoMeio.x - ultimoXCanvas; // Calcula o deslocamento do pan
            const dyMeio = novoMeio.y - ultimoYCanvas; // Calcula o deslocamento do pan
            
            // Atualiza as propriedades de pan do MAXEditor
            MAXEditor.panX += dxMeio;
            MAXEditor.panY += dyMeio;

            ultimoXCanvas = novoMeio.x; // Atualiza a última posição média para o próximo cálculo
            ultimoYCanvas = novoMeio.y;

            atualizarTransformacao(); // Aplica a nova transformação visual
            e.preventDefault(); // Previne a rolagem padrão da página, essencial para gestos de toque
        }
    }, { passive: false }); // 'passive: false' permite preventDefault()

    // Fim do toque (touchend) - Reseta a variável de distância inicial do touch
    wrapper.addEventListener("touchend", () => {
        distanciaInicialTouch = null;
    });

    // Inicia o canvas centralizado e com zoom adequado ao carregar o sistema
    centralizarCanvasComZoom();
}






  // =============================
//     MENU LATERAL ABRIR/FECHAR
// =============================
const botaoMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menu-lateral");
const fecharMenu = document.getElementById("fechar-menu");

// Abrir o menu lateral
botaoMenu.addEventListener("click", () => {
  menuLateral.classList.remove("oculto"); // torna visível
  menuLateral.classList.add("ativo");     // aplica transição para a esquerda
  
  document.getElementById("fundo-escuro-menu").classList.remove("oculto");
  document.getElementById("fundo-escuro-menu").classList.add("ativo");document.getElementById("fundo-escuro-menu").classList.remove("oculto");
  document.getElementById("fundo-escuro-menu").classList.add("ativo");

});


// Fechar o menu lateral
fecharMenu.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");  // inicia saída com animação


  document.getElementById("fundo-escuro-menu").classList.remove("ativo");
  document.getElementById("fundo-escuro-menu").classList.add("oculto");
  
  // Espera a animação acabar antes de esconder completamente
  setTimeout(() => {
    menuLateral.classList.add("oculto");
  }, 300); // 300ms = tempo da transição definida no CSS
});

  // =============================
//     VOLTAR À TELA INICIAL
// =============================
const botaoVoltar = document.getElementById("btn-voltar");

botaoVoltar.addEventListener("click", () => {
  // Fecha menu lateral
  menuLateral.classList.remove("ativo");
  setTimeout(() => {
    menuLateral.classList.add("oculto");
  }, 300);

  // Esconde tela de edição e mostra a inicial
  telaEditor.classList.add("oculto");
  telaInicial.classList.remove("oculto");

  // Limpa o canvas
  canvasContainer.innerHTML = '';

  console.log("Voltando para a tela inicial.");
});
  
  
  
 // ========================================
// ⚠️ Função para mostrar notificação animada
// ========================================
function mostrarNotificacao(mensagem) {
  const notificacao = document.getElementById("notificacao-erro");
  if (!notificacao) return; // segurança extra

  notificacao.textContent = mensagem;
  notificacao.classList.add("ativa");

  setTimeout(() => {
    notificacao.classList.remove("ativa");
  }, 3000); // desaparece após 3 segundos
}
  
  // ========================================
// ⚠️ NOTIFICAÇÃO DE AVISO
// ========================================
  function mostrarNotificacaoAviso(mensagem) {
  const aviso = document.getElementById("notificacao-aviso");
  if (!aviso) return;

  aviso.textContent = mensagem;
  aviso.classList.add("ativa");

  setTimeout(() => {
    aviso.classList.remove("ativa");
  }, 3000); // ⏳ some após 3 segundos
}



    
  
  
  
  
  // =============================
//   (   C  A  M  A  D  A  S   )
// =============================
  
  
  
  
  
  
  
  
  // ==========================
// 🎨 Ícones SVG offline
// ==========================
  
  // olho / cadeado / arrastar
  
const svgOlhoAberto = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>`;

const svgOlhoFechado = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.379-3.939M6.43 6.43A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-1.507 2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`;

const svgCadeadoAberto = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M7 10V6a5 5 0 019.9-1" />
  <rect x="4" y="10" width="16" height="10" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="none"/>
  <path d="M12 14v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

  const svgCadeadoFechado = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M12 17a1.5 1.5 0 001.5-1.5V14a1.5 1.5 0 00-3 0v1.5A1.5 1.5 0 0012 17z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M16 8V6a4 4 0 10-8 0v2m-2 0h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z" />
</svg>
`;




  
  
  

  // =============================
//    ABRIR / FECHAR CAMADAS
// =============================
const botaoCamadas = document.getElementById("abrir-camadas");
const painelCamadas = document.getElementById("painel-camadas");

botaoCamadas.addEventListener("click", () => {
  if (painelCamadas.classList.contains("ativo")) {
    painelCamadas.classList.remove("ativo");
    painelCamadas.classList.add("oculto");
  } else {
    painelCamadas.classList.remove("oculto");
    painelCamadas.classList.add("ativo");
  }
});
  
  // =============================
//   FECHAR ABA DE CAMADAS (×)
// =============================
const botaoFecharCamadas = document.getElementById("fechar-camadas");

botaoFecharCamadas.addEventListener("click", () => {
  painelCamadas.classList.remove("ativo");
  painelCamadas.classList.add("oculto");
});
  
  
  
  
  
  
// ==============================
// 🎯 SISTEMA DE BOTÕES INFERIORES PARA CRIAR CAMADAS (MODULARIZADO SEM QUEBRAR NADA)
// ==============================

  
  
 
  // FUNÇÃO DE CONTAINERS DOS BOTÔES
  
  function mostrarContainer(tipo) {
  // Oculta todos os grupos
  document.querySelectorAll('.grupo-botoes').forEach(container => {
    container.classList.add("oculto");
  });

  // Mostra apenas o container correspondente
  const containerAtivo = document.getElementById(`container-${tipo}`);
  if (containerAtivo) {
    containerAtivo.classList.remove("oculto");
  }
}

  
  
  
  
  
  
  
  
// 👉 Modal e campos para camada de texto
const modalTexto = document.getElementById("modal-texto");
const inputTexto = document.getElementById("input-texto");
const btnConfirmarTexto = document.getElementById("btn-confirmar-texto");
const btnCancelarTexto = document.getElementById("btn-cancelar-texto");

// 👉 Modal de imagem já está no HTML via input invisível
const inputImagem = document.getElementById("input-imagem");

// ==============================
// 💡 Lista modular das ferramentas disponíveis
// Cada ferramenta tem:
// - nome identificador (ex: 'texto')
// - função a executar quando clicado
// ==============================

const ferramentasDisponiveis = {
  texto: () => {
    // Abre o modal de texto
    modalTexto.classList.remove("oculto");
    inputTexto.value = "";
    inputTexto.focus();
  },

  imagem: () => {
    // Define o que acontece quando a imagem for selecionada
    inputImagem.onchange = (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      const leitor = new FileReader();
      leitor.onload = () => {
        const imagemBase64 = leitor.result;

        // Cria a nova camada de imagem (usando função que já existe)
        criarCamadaBase("imagem", arquivo.name, imagemBase64);
        

        // Limpa o campo para permitir selecionar o mesmo arquivo novamente
        inputImagem.value = "";
      };
      leitor.readAsDataURL(arquivo); // Converte a imagem para base64
    };

    // Abre o seletor de arquivos
    inputImagem.click();
  },

  forma: () => {
    // Cria uma nova camada de forma com nome padrão
    criarCamadaBase("forma", "Forma");
    
  }
};

// ==============================
// 🧠 Detecta qual botão foi clicado e executa a ferramenta correta
// ==============================

document.querySelectorAll(".botao-ferramenta").forEach(botao => {
  botao.addEventListener("click", () => {
    const textoBotao = botao.textContent.toLowerCase();

    // Verifica qual ferramenta foi clicada com base no texto
    if (textoBotao.includes("texto")) {
      ferramentasDisponiveis.texto();
    } else if (textoBotao.includes("imagem")) {
      ferramentasDisponiveis.imagem();
    } else if (textoBotao.includes("forma")) {
      ferramentasDisponiveis.forma();
    }
  });
});

// ==============================
// ❌ BOTÃO "Cancelar" no modal de texto
// ==============================
btnCancelarTexto.addEventListener("click", () => {
  modalTexto.classList.add("oculto");
});

// ==============================
// ✅ BOTÃO "Confirmar" para adicionar o texto
// ==============================
btnConfirmarTexto.addEventListener("click", () => {
  const texto = inputTexto.value.trim();
  if (texto === "") return;

  // Cria a camada de texto com o valor digitado
  criarCamadaBase("texto", texto);
  modalTexto.classList.add("oculto");
});

// ==============================
// 🖱️ Clique fora do modal de texto fecha a caixa
// ==============================
modalTexto.addEventListener("click", (e) => {
  if (e.target === modalTexto) {
    modalTexto.classList.add("oculto");
  }
});
    


  



  
// ==========================
// 🧠 NOVO SISTEMA DE CAMADAS
// ==========================

// Referência à lista onde as camadas serão exibidas
const listaCamadas = document.getElementById("lista-camadas");

// ============================================
// 🧱 Função principal para criar uma nova camada na lista lateral
// ============================================
function criarCamadaBase(tipo, nome, imagemBase64 = null) {
  // 🔧 Cria um novo elemento <div> representando uma camada
  const camada = document.createElement("div");
  camada.className = "item-camada"; // Aplica classe CSS padrão

  // 🆔 Gera um ID único baseado no timestamp atual
  const idUnico = `camada-${Date.now()}`;
  camada.dataset.id = idUnico;

  
  
  
// =========================================
// 🖼️ MINIATURA DA CAMADA
// =========================================
// Por padrão, a miniatura é um quadrado cinza
// ⚠️ Monta a miniatura com base no tipo
let miniaturaHTML = '<div class="miniatura-camada"></div>';

if (tipo === "imagem" && imagemBase64) {
  // Se for imagem, exibe como fundo da miniatura
  miniaturaHTML = `<div class="miniatura-camada" style="background-image: url('${imagemBase64}')"></div>`;
  // salva a foto da camada para duplicar
    camada.dataset.imagemBase64 = imagemBase64;

} 
else if (tipo === "texto") {
 // 🔧 Exibe o texto real como preview
  const conteudoTexto = imagemBase64 || nome; // 👈 Usa o conteúdo se vier da duplicação
  miniaturaHTML = `<div class="miniatura-camada miniatura-texto">
    <span class="preview-texto">${conteudoTexto}</span>
  </div>`;
}
else if (tipo === "forma") {
  // Se for forma, exibe um quadrado colorido como exemplo
  miniaturaHTML = `<div class="miniatura-camada miniatura-forma">
    <div class="forma-exemplo"></div>
  </div>`;
}


  
  


  
  // 🔁 Define rótulo(titulo do tipo de cada camada) bonito com base no tipo
  
let rotuloTipo = "";
switch (tipo) {
  case "texto":
    rotuloTipo = "Camada de Texto";
    break;
  case "imagem":
    rotuloTipo = "Camada de Imagem";
    break;
  case "forma":
    rotuloTipo = "Camada Geométrica";
    break;
  default:
    rotuloTipo = "❓ Camada";
}
  
  
  // =========================================
  // 🧩 Estrutura interna da camada
  // =========================================
  camada.innerHTML = `
<div class="tipo-camada-topo">${rotuloTipo}</div> <!-- Tipo da camada no topo -->

  <span class="icone icone-opcoes">⋮</span> <!-- Menu de opções -->

<!-- 🖼️ Miniatura -->
  ${miniaturaHTML} <!-- Miniatura (imagem ou vazia) -->

 <!-- 👁️ Visibilidade -->
  <span class="icone-camada icone-visivel" title="Alternar visibilidade">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
  </span>
  
   <!-- 🔒 Bloqueio -->
  <span class="icone-camada icone-bloqueio" title="Bloquear edição">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M7 10V6a5 5 0 019.9-1" />
  <rect x="4" y="10" width="16" height="10" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="none"/>
  <path d="M12 14v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
  </span>

 <!-- 📝 Nome da camada -->
  <div class="nome-camada" title="${nome}">${nome}</div> <!-- Nome com até 2 linhas -->

  <!-- ⠿ Ícone de arrastar -->
  <span class="icone-camada icone-arrastar" title="Arrastar camada">
    <svg viewBox="0 0 24 24"><path fill="white" d="M4 9h16v2H4V9zm0 4h16v2H4v-2z"/></svg>
  </span>
`;
  
  
// 🔍 Captura o botão de opções (⋮)
const btnOpcoes = camada.querySelector(".icone-opcoes");

// ⬇️ Mostra o menu flutuante ao lado do botão ⋮
// Dentro da função criarCamadaBase, onde btnOpcoes já existe
btnOpcoes.addEventListener("click", (e) => {
  e.stopPropagation(); // Impede o clique de fechar o menu automaticamente

  // Remove qualquer menu já existente
  const menuExistente = document.querySelector(".menu-opcoes");
  if (menuExistente) menuExistente.remove();

  // Cria o menu flutuante
  const menu = document.createElement("div");
  menu.className = "menu-opcoes";
  menu.innerHTML = `
    <button class="opcao-menu btn-duplicar">Duplicar camada</button>
    <button class="opcao-menu btn-renomear">Renomear camada</button>
    <button class="opcao-menu btn-apagar"> Apagar camada</button>
  `;

  // Posiciona o menu ao lado do botão ⋮
  // Adiciona o menu ao body
document.body.appendChild(menu);

// Captura a posição do botão ⋮
const rect = btnOpcoes.getBoundingClientRect();
const menuWidth = menu.offsetWidth;
const menuHeight = menu.offsetHeight;

// Posição inicial (à direita do botão)
let left = rect.right + 5;
let top = rect.top;

// 🧱 AJUSTE HORIZONTAL: Se ultrapassar a largura da tela, posiciona para a esquerda
if (left + menuWidth > window.innerWidth) {
  left = rect.left - menuWidth - 5; // Vai para a esquerda do botão
  if (left < 5) left = 5; // Garante que não saia da tela
}

// 🧱 AJUSTE VERTICAL: Se ultrapassar a altura da tela, sobe o menu
if (top + menuHeight > window.innerHeight) {
  top = window.innerHeight - menuHeight - 10; // Sobe um pouco
  if (top < 5) top = 5;
}

// 🧩 Aplica a posição final
menu.style.left = `${left}px`;
menu.style.top = `${top}px`;

  // 🎯 ATIVA OS BOTÕES APÓS INSERIR NO DOM
  const btnDuplicar = menu.querySelector(".btn-duplicar");
  const btnRenomear = menu.querySelector(".btn-renomear");
  const btnApagar = menu.querySelector(".btn-apagar");

  // ✅ Função Duplicar
  btnDuplicar.addEventListener("click", () => {
    menu.remove();
    console.log("Duplicar camada:", camada.dataset.id);
     duplicarCamada(camada);
  menu.style.display = "none"; // Fecha o menu flutuante após duplicar
  });

  // ✅ Função Renomear
  btnRenomear.addEventListener("click", () => {
    menu.remove();
    console.log("Renomear camada:", camada.dataset.id);
    menu.remove(); // Fecha o menu flutuante

  // Captura o elemento do nome da camada
  const nomeElemento = camada.querySelector(".nome-camada");
  const nomeAtual = nomeElemento.textContent;

  // Abre um prompt para digitar o novo nome
  const novoNome = prompt("Digite o novo nome da camada:", nomeAtual);

  // Se o nome for válido, atualiza na interface
  if (novoNome && novoNome.trim() !== "") {
    const textoFinal = novoNome.trim();
    nomeElemento.textContent = textoFinal.length > 20 ? textoFinal.slice(0, 20) + "..." : textoFinal;
    nomeElemento.title = textoFinal; // Atualiza o title também
    mostrarNotificacaoAviso(`✅ Camada renomeada`);
  }
  });

  // ✅ Função Apagar
btnApagar.addEventListener("click", () => {
  menu.remove(); // Fecha o menu

  // 🔔 Mostra a confirmação do sistema
  const confirmacao = confirm("Tem certeza que deseja remover esta camada?");

  if (confirmacao) {
    console.log("Apagar camada:", camada.dataset.id);
    camada.remove(); // Remove a camada da lista
    mostrarNotificacaoAviso(`✅ Camada removida`);
  } else {
    console.log("Remoção cancelada.");
    mostrarNotificacaoAviso(`❌ Remoção cancelada`);
  }
});

});
  
  
  // Fecha o menu se clicar fora dele
document.addEventListener("click", () => {
  const antigo = document.querySelector(".menu-opcoes");
  if (antigo) antigo.remove();
});



  
 // ============================================
// 📄 DUPLICAR CAMADA COM NOME NUMERADO E MINIATURA
// ============================================
function duplicarCamada(camadaOriginal) {
  // 🏷️ Pega o nome completo da camada original (usado como base para o novo nome)
  const nomeOriginal = camadaOriginal.querySelector(".nome-camada").getAttribute("title") || "Camada";

  // 🧱 Tipo da camada (texto, imagem, forma...)
  const tipo = camadaOriginal.dataset.tipo;

  // 🔤 Remove qualquer sufixo de "(cópia)" do nome original
  const baseNome = nomeOriginal.replace(/\s*\(cópia(?:\s\d+)?\)$/, "");

  // 📦 Coleta todos os nomes de camadas existentes
  const nomesExistentes = [...document.querySelectorAll(".nome-camada")].map(el =>
    el.getAttribute("title")
  );

  // 🔍 Filtra os nomes que têm a mesma base e já são cópias
  const indices = nomesExistentes
    .filter(n => n && n.startsWith(baseNome))
    .map(n => {
      const match = n.match(/\(cópia(?:\s(\d+))?\)$/);
      return match ? parseInt(match[1] || 1) : 0;
    });

  // 🔢 Calcula o índice da nova cópia
  const novoIndice = indices.length > 0 ? Math.max(...indices) + 1 : 1;

  // 📝 Define o novo nome com sufixo adequado
  const novoNome = novoIndice === 1 ? `${baseNome} (cópia)` : `${baseNome} (cópia ${novoIndice})`;

  // 🖼️ Verifica se há imagemBase64 (salva no dataset na criação)
  const imagemBase64 = camadaOriginal.dataset.imagemBase64 || null;

    // 📝 Se for camada de texto, pega o conteúdo do texto da miniatura
  let conteudoTexto = null;
  if (tipo === "texto") {
    const textoSpan = camadaOriginal.querySelector(".preview-texto");
    if (textoSpan) {
      conteudoTexto = textoSpan.textContent;
    }
  }

  // ✅ Cria a nova camada com tudo (tipo, nome e conteúdo)
  criarCamadaBase(tipo, novoNome, imagemBase64 || conteudoTexto); // Aproveita o mesmo terceiro parâmetro
  
  mostrarNotificacaoAviso(`✅ Camada de ${tipo} duplicada!`);
  
  criarObjetoCanvas(camada); // novaCamada é o objeto que você acabou de criar

  
  
  
  
}




  // ➕ Adiciona a camada recém-criada dentro da lista lateral - cria a cima das outra camadas
  listaCamadas.insertBefore(camada, listaCamadas.firstChild);
  
  
  // 🖼️ Cria o objeto correspondente na área de edição
const objCriado = criarObjetoCanvas({
  id: idUnico,
  tipo: tipo,
  nome: nome,
  dados: {
    imagemBase64: imagemBase64
  }
});
  

// Verifica se o objeto foi criado com sucesso antes de aplicar o contorno e iniciar arrasto
    if (objCriado) {
        aplicarContornoEdicao(objCriado);
    console.log("✅ Contorno aplicado no objeto:", objCriado);
    ObjetoInteracaoManager.ativar(objCriado); // <-- ATUALIZE ESTA LINHA
    console.log("✅ Interação habilitada para o objeto:", objCriado);
    } else {
        console.warn("⚠️ Objeto não foi criado, contorno e interação não aplicados");
    }
	
	
	
	
	
//===============================
// seleciona a camada do obj criado
//===============================
  
  // 🔄 Remove seleção anterior
document.querySelectorAll(".item-camada").forEach(c => c.classList.remove("ativa"));

    camada.classList.add("ativa"); // Aplica destaque nesta
    
    // muda o container dos botões ferramentas
    const tipoSelecionado = camada.dataset.tipo;
mostrarContainer(tipo);
    
    // ✅ Mostra o botão flutuante de "voltar" à esquerda
document.getElementById("btn-desselecionar").classList.remove("oculto");
    
    MAXEditor.camadaSelecionada = camada.dataset.id;

  
  
  

  // 📦 Armazena propriedades úteis no próprio elemento
  camada.dataset.tipo = tipo;
  camada.dataset.visivel = "true";
  camada.dataset.bloqueado = "false";

  // =========================================
  // 👁️ Evento de clique no olho (visibilidade)
  // =========================================
const btnOlho = camada.querySelector(".icone-visivel");
btnOlho.addEventListener("click", () => {
  const visivel = camada.dataset.visivel === "true";
  camada.dataset.visivel = (!visivel).toString();

  // Troca o SVG conforme o estado
  btnOlho.innerHTML = visivel ? svgOlhoFechado : svgOlhoAberto;
});

  // =========================================
  // 🔒 Evento de clique no cadeado (bloqueio)
  // =========================================
const btnCadeado = camada.querySelector(".icone-bloqueio");
btnCadeado.addEventListener("click", () => {
  const bloqueado = camada.dataset.bloqueado === "true";
  camada.dataset.bloqueado = (!bloqueado).toString();

  // Troca o SVG conforme o estado
  btnCadeado.innerHTML = bloqueado ? svgCadeadoFechado : svgCadeadoAberto;
});

  // =========================================
  // ✨ Selecionar camada ativa ao clicar nela
  // =========================================
  camada.addEventListener("click", () => {
    // Remove classe ativa de todas
    document.querySelectorAll(".item-camada").forEach(c => c.classList.remove("ativa"));
    camada.classList.add("ativa"); // Aplica destaque nesta
    
    // muda o container dos botões ferramentas
    const tipoSelecionado = camada.dataset.tipo;
mostrarContainer(tipoSelecionado);
    
    // ✅ Mostra o botão flutuante de "voltar" à esquerda
document.getElementById("btn-desselecionar").classList.remove("oculto");
    
    MAXEditor.camadaSelecionada = camada.dataset.id;

  

	// aplicar o contorno no objeto correspondente a camada selecionanda
  aplicarContornoEdicao(objCriado);
  console.log("✅ Contorno aplicado no objeto:", objCriado);

 // Obtenha o objeto do canvas correspondente a esta camada selecionada
        const objetoDoCanvas = document.querySelector(`.objeto-edicao[data-id="${camada.dataset.id}"]`);
        
        if (objetoDoCanvas) {
            aplicarContornoEdicao(objetoDoCanvas);
            console.log("✅ Contorno aplicado no objeto:", objetoDoCanvas);
            ObjetoInteracaoManager.ativar(objetoDoCanvas); // <-- ATUALIZE ESTA LINHA
            console.log("✅ Interação habilitada para o objeto:", objetoDoCanvas);
        } else {
            console.warn("⚠️ Objeto do canvas não encontrado para a camada selecionada.");
        }

  
  });
  
  
  
 // ================================================
// ❌ FUNÇÃO PARA REMOVER A SELEÇÃO DA CAMADA ATIVA
// E VOLTAR A MOSTRAR O CONTAINER PRINCIPAL
// ================================================
function limparSelecaoDeCamadas() {
  // 🔁 Remove destaque de todas as camadas na aba lateral
  document.querySelectorAll(".item-camada").forEach(c => c.classList.remove("ativa"));

  // ❌ Remove ID salvo da camada selecionada
  MAXEditor.camadaSelecionada = null;

  // 🎯 Volta a exibir o container de botões principal (texto, imagem, forma...)
  mostrarContainer("principal");
  
  ObjetoInteracaoManager.desativar(); // <-- ADICIONE ESTA LINHA AQUI

  // 🔒 Esconde o botão de "voltar"
  document.getElementById("btn-desselecionar").classList.add("oculto");
  
  // Oculta contorno visual
  removerContornoEdicao();
}
  
   // ================================================
// 🖱️ BOTÃO "← VOLTAR" — remove seleção da camada
// ================================================
document.getElementById("btn-desselecionar").addEventListener("click", () => {
  limparSelecaoDeCamadas();
});

  
  
  
  // 📦 Conteúdo textual, se for camada de texto
let conteudo = "";
if (tipo === "texto") {
  const spanTexto = camada.querySelector(".preview-texto");
  if (spanTexto) {
    conteudo = spanTexto.textContent;
  }
}

  
 
  // =================================================================
// 🎨 NOVO SISTEMA: Criar objeto na área de edição (canvas)
// =================================================================
function criarObjetoCanvas(camada) {
  // 🔍 Garante que a camada é válida
  if (!camada || !camada.id || !camada.tipo) return;

  // 🎯 Pega o container principal da área de edição
  const container = document.getElementById("canvas-container");
  if (!container) return;

  // 🧱 Cria a div visual que será exibida dentro do canvas
  const obj = document.createElement("div");
  obj.classList.add("objeto-edicao");   // Estilo padrão para todos
  obj.dataset.id = camada.id;           // Vincula o objeto à camada

  // 🎯 Posição inicial centralizada (ajuste simples por enquanto)
  obj.style.left = "200px";
  obj.style.top = "200px";
  obj.style.position = "absolute"; // Garante posicionamento absoluto

  // ============================
  // 📦 Conteúdo do objeto (por tipo)
  // ============================
  if (camada.tipo === "texto") {
    obj.textContent = camada.nome || "Texto";
    obj.style.fontSize = "20px";
    obj.style.color = "#fff";
    obj.style.fontFamily = "sans-serif";
	
    obj.style.width = "auto"; // Textos podem ter width 'auto' inicialmente
    obj.style.height = "auto";
    obj.style.padding = "5px"; // Adicione um padding para facilitar o clique/arrasto
    obj.style.whiteSpace = "nowrap"; // Evita quebra de linha inicial

  }

  else if (camada.tipo === "imagem" && camada.dados?.imagemBase64) {
    const img = new Image();
	img.src = camada.dados.imagemBase64;
	// Defina um tamanho inicial para o contêiner da imagem
        obj.style.width = "200px"; // Tamanho inicial da div do objeto
        obj.style.height = "200px";
        obj.style.display = "flex"; // Para centralizar a imagem dentro da div
        obj.style.justifyContent = "center";
        obj.style.alignItems = "center";

        img.style.width = "100%"; // Imagem preenche a div
        img.style.height = "100%";
        img.style.objectFit = "contain"; // Redimensiona a imagem para caber na div

	img.onload = () => {
		 // Ajusta o tamanho da div do objeto para o tamanho da imagem carregada
            // Isso evita que a div da imagem comece com 200x200px e a imagem pequena.
            // A imagem em si não terá max-width/height, mas a div wrapper terá o tamanho certo.
            obj.style.width = `${img.naturalWidth}px`;
            obj.style.height = `${img.naturalHeight}px`;

            // Garante que a imagem não ultrapasse um tamanho inicial grande demais
            const maxWidth = 300;
            const maxHeight = 300;
            if (obj.offsetWidth > maxWidth || obj.offsetHeight > maxHeight) {
                const ratio = Math.min(maxWidth / obj.offsetWidth, maxHeight / obj.offsetHeight);
                obj.style.width = `${obj.offsetWidth * ratio}px`;
                obj.style.height = `${obj.offsetHeight * ratio}px`;
            }
	  aplicarContornoEdicao(obj); // ✅ Só aplica contorno depois da imagem carregar
	};
	obj.appendChild(img);
	
	img.ondragstart = (e) => e.preventDefault();


  }

  else if (camada.tipo === "forma") {
    obj.style.width = "100px";
    obj.style.height = "100px";
    obj.style.background = "#4caf50";
    obj.style.borderRadius = "6px";
    


  }

  // 🧩 Adiciona ao container visual
  container.appendChild(obj);
  
  

 // 🧷 Salva referência opcional na camada (futuro)
camada._objRef = obj;

// ✅ Devolve o objeto criado
return obj;


  
}

 

}
  
// =============================================
 // 🎯 Mostra contorno sobre o objeto selecionado
  // =============================================
  
function aplicarContornoEdicao(objCriado) {
  const contorno = document.getElementById("contorno-selecao");
  const canvasContainer = document.getElementById("canvas-container");

  if (!objCriado || !contorno || !canvasContainer) return;

  const margem = 8; // Espaço extra em todos os lados

  // 🎯 Centro do objeto
  const centerX = objCriado.offsetLeft + objCriado.offsetWidth / 2;
  const centerY = objCriado.offsetTop + objCriado.offsetHeight / 2;

  // 📐 Novo tamanho do contorno
  const width = objCriado.offsetWidth + margem * 2;
  const height = objCriado.offsetHeight + margem * 2;

  // 📍 Calcula nova posição (centralizado)
  const left = centerX - width / 2;
  const top = centerY - height / 2;

  // ✅ Aplica com perfeição simétrica
  contorno.style.left = `${left}px`;
  contorno.style.top = `${top}px`;
  contorno.style.width = `${width}px`;
  contorno.style.height = `${height}px`;
  contorno.classList.remove("oculto");
  
    // Obtém o estilo de transformação do objeto
    const objTransform = window.getComputedStyle(objCriado).transform;
    // Aplica a mesma transformação ao contorno para que ele gire junto
    contorno.style.transform = objTransform; 

    contorno.classList.remove("oculto");

  console.log("🎯 Contorno centralizado:", { left, top, width, height });
}


// ===================================
//     REMOVER CONTORNO DE EDIÇÃO
// ===================================
// 🔹 Oculta o contorno visual de seleção da camada atual
// 🔹 Usado ao desselecionar ou clicar fora do objeto
function removerContornoEdicao() {
  const contorno = document.getElementById("contorno-selecao");
  if (contorno) {
    contorno.classList.add("oculto"); // 👁️ Oculta visualmente
  }
}



// =======================================================================
// 🖱️ GERENCIADOR DE INTERAÇÃO DE OBJETOS (Arrastar, Escalonar, Rotacionar)
// =======================================================================
const ObjetoInteracaoManager = {
    objetoAtual: null,
    isArrastandoObjeto: false,
    isRedimensionando: false,
    isRotacionando: false,
    handleAtivo: null,

    startX: 0, startY: 0, // Posição do clique INICIAL na tela
    startWidth: 0, startHeight: 0, // Largura/Altura inicial do OBJETO
    startLeft: 0, startTop: 0, // Posição LEFT/TOP inicial do OBJETO
    startAngle: 0, // Ângulo inicial para rotação

    contorno: null,

    // Armazenar referências das funções vinculadas para poder remover os listeners corretamente
    boundOnPointerDown: null,
    boundOnHandleDown: null,
    boundOnRotateDown: null,
    boundOnPointerMove: null,
    boundOnPointerUp: null,

    /**
     * Ativa a interação (arrastar, redimensionar, rotacionar) para um objeto específico.
     * @param {HTMLElement} objetoAlvo O elemento HTML do objeto no canvas.
     */
    ativar: function(objetoAlvo) {
        // Desativa a interação do objeto anterior, se houver um ativo
        if (this.objetoAtual && this.objetoAtual !== objetoAlvo) {
            this.desativar();
        }
        this.objetoAtual = objetoAlvo;
        this.contorno = document.getElementById("contorno-selecao");

        if (!this.objetoAtual || !this.contorno) {
            console.warn("Objeto ou contorno não encontrados para ativar a interação.");
            return;
        }

        // Armazena as referências vinculadas das funções de evento
        this.boundOnPointerDown = this.onPointerDown.bind(this);
        this.boundOnHandleDown = this.onHandleDown.bind(this);
        this.boundOnRotateDown = this.onRotateDown.bind(this);
        this.boundOnPointerMove = this.onPointerMove.bind(this);
        this.boundOnPointerUp = this.onPointerUp.bind(this);

        // Adiciona listeners de eventos ao objeto principal
        this.objetoAtual.addEventListener("mousedown", this.boundOnPointerDown);
        this.objetoAtual.addEventListener("touchstart", this.boundOnPointerDown, { passive: false });

        // Adiciona listeners de eventos para as alças de redimensionamento
        const handles = this.contorno.querySelectorAll(".handle-tl, .handle-tr, .handle-bl, .handle-br");
        handles.forEach(handle => {
            handle.addEventListener("mousedown", this.boundOnHandleDown);
            handle.addEventListener("touchstart", this.boundOnHandleDown, { passive: false });
        });

        // Adiciona listener de evento para a alça de rotação
        const handleRotacao = this.contorno.querySelector(".handle-rot");
        if (handleRotacao) {
            handleRotacao.addEventListener("mousedown", this.boundOnRotateDown);
            handleRotacao.addEventListener("touchstart", this.boundOnRotateDown, { passive: false });
        }
        console.log("Interação do objeto ATIVADA para:", objetoAlvo.dataset.id);
    },

    /**
     * Desativa a interação (arrastar, redimensionar, rotacionar) do objeto atual.
     */
    desativar: function() {
        if (!this.objetoAtual) return;

        // Remove os listeners do objeto principal
        this.objetoAtual.removeEventListener("mousedown", this.boundOnPointerDown);
        this.objetoAtual.removeEventListener("touchstart", this.boundOnPointerDown);

        // Remove os listeners das alças
        const handles = this.contorno.querySelectorAll(".handle-tl, .handle-tr, .handle-bl, .handle-br");
        handles.forEach(handle => {
            handle.removeEventListener("mousedown", this.boundOnHandleDown);
            handle.removeEventListener("touchstart", this.boundOnHandleDown);
        });
        const handleRotacao = this.contorno.querySelector(".handle-rot");
        if (handleRotacao) {
            handleRotacao.removeEventListener("mousedown", this.boundOnRotateDown);
            handleRotacao.removeEventListener("touchstart", this.boundOnRotateDown);
        }

        // Garante que os listeners globais de movimento/fim da interação sejam removidos
        document.removeEventListener("mousemove", this.boundOnPointerMove);
        document.removeEventListener("mouseup", this.boundOnPointerUp);
        document.removeEventListener("touchmove", this.boundOnPointerMove);
        document.removeEventListener("touchend", this.boundOnPointerUp);

        // Reseta as referências das funções vinculadas
        this.boundOnPointerDown = null;
        this.boundOnHandleDown = null;
        this.boundOnRotateDown = null;
        this.boundOnPointerMove = null;
        this.boundOnPointerUp = null;
        
        // Limpa o estado do manager
        this.objetoAtual = null;
        this.isArrastandoObjeto = false;
        this.isRedimensionando = false;
        this.isRotacionando = false;
        this.handleAtivo = null;
        this.contorno = null; // Limpa a referência ao contorno
        MAXEditor.interacaoObjetoAtiva = false; // Sinaliza ao sistema de pan do canvas que a interação acabou
        console.log("Interação do objeto DESATIVADA.");
    },

    /**
     * Inicia o arrasto do objeto principal.
     * @param {Event} e Evento de mouse ou toque.
     */
    onPointerDown: function(e) {
        e.stopPropagation(); // Impede que o evento suba para elementos pais (como o wrapper do canvas)
        const idCamada = this.objetoAtual.dataset.id;
        const camadaElemento = document.querySelector(`.item-camada[data-id="${idCamada}"]`);
        if (camadaElemento && camadaElemento.dataset.bloqueado === "true") {
            mostrarNotificacaoAviso("Camada bloqueada! Desbloqueie para mover.");
            return;
        }
        this.isArrastandoObjeto = true;
        MAXEditor.interacaoObjetoAtiva = true; // Sinaliza ao sistema de pan do canvas que um objeto está sendo manipulado
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.startX = clientX; // Posição X inicial do clique do mouse/toque na TELA
        this.startY = clientY; // Posição Y inicial do clique do mouse/toque na TELA
        this.startLeft = parseFloat(this.objetoAtual.style.left) || 0; // Posição LEFT inicial do OBJETO no canvas
        this.startTop = parseFloat(this.objetoAtual.style.top) || 0;   // Posição TOP inicial do OBJETO no canvas

        // Adiciona listeners globais para rastrear o movimento e o fim do arrasto
        document.addEventListener("mousemove", this.boundOnPointerMove);
        document.addEventListener("mouseup", this.boundOnPointerUp);
        document.addEventListener("touchmove", this.boundOnPointerMove, { passive: false });
        document.addEventListener("touchend", this.boundOnPointerUp);
        
        this.objetoAtual.style.transition = "none"; // Desativa transição para movimento instantâneo
        this.contorno.style.transition = "none";
    },

    /**
     * Inicia o redimensionamento do objeto através das alças.
     * @param {Event} e Evento de mouse ou toque.
     */
    onHandleDown: function(e) {
        e.stopPropagation(); // Impede que o evento suba
        e.preventDefault();  // Previne seleção de texto e outros comportamentos padrão
        const idCamada = this.objetoAtual.dataset.id;
        const camadaElemento = document.querySelector(`.item-camada[data-id="${idCamada}"]`);
        if (camadaElemento && camadaElemento.dataset.bloqueado === "true") {
            mostrarNotificacaoAviso("Camada bloqueada! Desbloqueie para redimensionar.");
            return;
        }
        this.isRedimensionando = true;
        MAXEditor.interacaoObjetoAtiva = true; // Sinaliza
        this.handleAtivo = e.target.className.split(' ').find(cls => cls.startsWith('handle-')); // Identifica qual alça foi clicada
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.startX = clientX;
        this.startY = clientY;
        this.startWidth = this.objetoAtual.offsetWidth;
        this.startHeight = this.objetoAtual.offsetHeight;
        this.startLeft = parseFloat(this.objetoAtual.style.left) || 0;
        this.startTop = parseFloat(this.objetoAtual.style.top) || 0;

        document.addEventListener("mousemove", this.boundOnPointerMove);
        document.addEventListener("mouseup", this.boundOnPointerUp);
        document.addEventListener("touchmove", this.boundOnPointerMove, { passive: false });
        document.addEventListener("touchend", this.boundOnPointerUp);

        this.objetoAtual.style.transition = "none";
        this.contorno.style.transition = "none";
    },

    /**
     * Inicia a rotação do objeto através da alça de rotação.
     * @param {Event} e Evento de mouse ou toque.
     */
    onRotateDown: function(e) {
        e.stopPropagation();
        e.preventDefault();
        const idCamada = this.objetoAtual.dataset.id;
        const camadaElemento = document.querySelector(`.item-camada[data-id="${idCamada}"]`);
        if (camadaElemento && camadaElemento.dataset.bloqueado === "true") {
            mostrarNotificacaoAviso("Camada bloqueada! Desbloqueie para rotacionar.");
            return;
        }
        this.isRotacionando = true;
        MAXEditor.interacaoObjetoAtiva = true; // Sinaliza
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const objRect = this.objetoAtual.getBoundingClientRect();
        const objCenterX = objRect.left + objRect.width / 2;
        const objCenterY = objRect.top + objRect.height / 2;

        // Calcula o ângulo inicial do ponteiro em relação ao centro do objeto
        this.startAngle = Math.atan2(clientY - objCenterY, clientX - objCenterX) * (180 / Math.PI);
        
        // Pega o ângulo de rotação atual do objeto para somar (se já houver rotação)
        const currentTransform = window.getComputedStyle(this.objetoAtual).transform;
        const match = currentTransform.match(/rotate\(([^deg]+)deg\)/);
        if (match) {
            this.startAngle -= parseFloat(match[1]);
        }

        document.addEventListener("mousemove", this.boundOnPointerMove);
        document.addEventListener("mouseup", this.boundOnPointerUp);
        document.addEventListener("touchmove", this.boundOnPointerMove, { passive: false });
        document.addEventListener("touchend", this.boundOnPointerUp);

        this.objetoAtual.style.transition = "none";
        this.contorno.style.transition = "none";
    },

    /**
     * Lida com o movimento do ponteiro (mouse ou toque) para arrastar, redimensionar ou rotacionar.
     * @param {Event} e Evento de mouse ou toque.
     */
    onPointerMove: function(e) {
        // Se nenhuma das flags de interação está ativa, não faz nada
        if (!this.isArrastandoObjeto && !this.isRedimensionando && !this.isRotacionando) return;
        e.preventDefault(); // Previne o comportamento padrão (ex: rolagem da página)

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Usa o zoom atual do MAXEditor para ajustar os movimentos/redimensionamentos
        const currentScale = MAXEditor.zoom;

        if (this.isArrastandoObjeto) {
            // As mudanças (dx, dy) devem ser baseadas na diferença entre a posição
            // atual do mouse e a posição inicial do clique, ajustada pela escala.
            const dx = (clientX - this.startX) / currentScale; 
            const dy = (clientY - this.startY) / currentScale; 
            
            this.objetoAtual.style.left = `${this.startLeft + dx}px`;
            this.objetoAtual.style.top = `${this.startTop + dy}px`;
        } 
        else if (this.isRedimensionando) {
            let newWidth = this.startWidth;
            let newHeight = this.startHeight;
            let newLeft = this.startLeft;
            let newTop = this.startTop;

            const dx = (clientX - this.startX) / currentScale;
            const dy = (clientY - this.startY) / currentScale;

            switch (this.handleAtivo) {
                case 'handle-br': // Bottom Right
                    newWidth = Math.max(20, this.startWidth + dx);
                    newHeight = Math.max(20, this.startHeight + dy);
                    break;
                case 'handle-bl': // Bottom Left
                    newWidth = Math.max(20, this.startWidth - dx);
                    newHeight = Math.max(20, this.startHeight + dy);
                    newLeft = this.startLeft + dx;
                    break;
                case 'handle-tr': // Top Right
                    newWidth = Math.max(20, this.startWidth + dx);
                    newHeight = Math.max(20, this.startHeight - dy);
                    newTop = this.startTop + dy;
                    break;
                case 'handle-tl': // Top Left
                    newWidth = Math.max(20, this.startWidth - dx);
                    newHeight = Math.max(20, this.startHeight - dy);
                    newLeft = this.startLeft + dx;
                    newTop = this.startTop + dy;
                    break;
            }

            this.objetoAtual.style.width = `${newWidth}px`;
            this.objetoAtual.style.height = `${newHeight}px`;
            this.objetoAtual.style.left = `${newLeft}px`;
            this.objetoAtual.style.top = `${newTop}px`;

            // Para imagens, redimensiona a imagem interna também para preencher o container
            if (this.objetoAtual.dataset.tipo === "imagem") {
                const img = this.objetoAtual.querySelector("img");
                if (img) {
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.maxWidth = "none";
                    img.style.maxHeight = "none";
                }
            }
        }
        else if (this.isRotacionando) {
            const objRect = this.objetoAtual.getBoundingClientRect();
            // Calcular o centro do objeto em relação à tela visível
            const objCenterX = objRect.left + objRect.width / 2;
            const objCenterY = objRect.top + objRect.height / 2;

            // Calcular o ângulo do ponteiro em relação ao centro do objeto
            const currentPointerAngle = Math.atan2(clientY - objCenterY, clientX - objCenterX) * (180 / Math.PI);
            // Calcular o novo ângulo de rotação (ajustado pelo ângulo inicial do clique)
            const newAngle = currentPointerAngle - this.startAngle;
            
            // Arredonda para evitar números flutuantes muito longos
            const finalAngle = Math.round(newAngle * 100) / 100;

            // Preserva outras transformações (se houver) e aplica a nova rotação
            const currentTransform = this.objetoAtual.style.transform;
            // Regex para encontrar e remover rotações existentes, deixando outras transforms
            let updatedTransform = currentTransform.replace(/rotate\(([^deg]+)deg\)/, '').trim();
            this.objetoAtual.style.transform = `${updatedTransform} rotate(${finalAngle}deg)`.trim();
        }

        // Atualiza o contorno para seguir o objeto após qualquer transformação
        aplicarContornoEdicao(this.objetoAtual);
    },

    /**
     * Finaliza qualquer interação (arrastar, redimensionar, rotacionar).
     */
    onPointerUp: function() {
        this.isArrastandoObjeto = false;
        this.isRedimensionando = false;
        this.isRotacionando = false;
        this.handleAtivo = null;
        MAXEditor.interacaoObjetoAtiva = false; // Sinaliza que nenhuma interação de objeto está ativa

        // Restaura transições CSS para suavidade
        this.objetoAtual.style.transition = "";
        this.contorno.style.transition = "";

        // Remove os listeners globais usando as referências armazenadas
        document.removeEventListener("mousemove", this.boundOnPointerMove);
        document.removeEventListener("mouseup", this.boundOnPointerUp);
        document.removeEventListener("touchmove", this.boundOnPointerMove);
        document.removeEventListener("touchend", this.boundOnPointerUp);
    }
};


// ===================================
// 🧼 Limpa a interação ativa de objetos
// ===================================
function finalizarInteracaoObjetoAnterior() {
    // Isso é um pouco mais avançado, requer controle sobre qual objeto está ativo
    // Idealmente, onPointerUp já lida com o que é necessário.
    // Mas, se estamos TROCANDO de objeto, o 'mouseup' do objeto anterior pode não ter ocorrido.

    // A maneira mais simples é ter uma referência ao objeto ANTERIORMENTE ativo
    // e remover os listeners dele ou forçar um "onPointerUp" para ele.

    // Por enquanto, a solução de stopPropagation e preventDefault no 'mousedown' do wrapper
    // É a mais direta. Se o problema persistir APÓS o padding, vamos investigar mais a fundo
    // o fluxo de eventos e se algum listener está "vazando".
}



  
  
  
 //////////////[ CAMADAS ]/////////////// 
 ///////////////[ FINAL ]////////////////
  
  
  
  // Habilita rolagem horizontal com arrasto do mouse nos botoes da parte de baixo de ferramentas 
  
const scrollArea = document.getElementById('ferramentas-scroll');
let isDown = false;
let startX, scrollLeft;

scrollArea.addEventListener('mousedown', (e) => {
  isDown = true;
  scrollArea.classList.add('ativo');
  startX = e.pageX - scrollArea.offsetLeft;
  scrollLeft = scrollArea.scrollLeft;
});

scrollArea.addEventListener('mouseleave', () => {
  isDown = false;
});

scrollArea.addEventListener('mouseup', () => {
  isDown = false;
});

scrollArea.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - scrollArea.offsetLeft;
  const walk = (x - startX) * 1.5; // Velocidade do arrasto
  scrollArea.scrollLeft = scrollLeft - walk;
});

  
  
  
  
     iniciarSistemaDeZoom()

  
});
