document.addEventListener("DOMContentLoaded", () => {
  
  document.documentElement.requestFullscreen();

  
// Corrige a altura visível da tela no celular (descontando a barra de URL)
function atualizarAlturaReal() {
  const vhReal = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vhReal}px`);
}

// Chamada imediata ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarAlturaReal(); // ✅ Aplica ao carregar
});

// Atualiza também se o usuário gira o celular ou muda a tela
window.addEventListener('resize', atualizarAlturaReal);

  
  
  
  
  
  
  let intervaloEstrelas; // ID do intervalo
  
  
  // Evita zoom via Ctrl + roda do mouse
window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Evita zoom via Ctrl + '+', Ctrl + '-'
window.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
    e.preventDefault();
  }
});

  

  // ===================================
// 🌠 Efeito de estrelas cadentes na diagonal
// ===================================

	
function criarEstrelaCadente() {
  const container = document.getElementById('container-estrelas');
  const estrela = document.createElement('div');
  estrela.classList.add('estrela-cadente');

 const posX = window.innerWidth + Math.random() * (window.innerWidth * 0.6); // 100% a 160% da largura
const posY = -150 + Math.random() * (window.innerHeight * 0.2 + 150); // -150px a 20% da altura da tela

  estrela.style.left = `${posX}px`;
  estrela.style.top = `${posY}px`;

  // Duração da animação (lenta)
  const duracao = Math.random() * 4 + 4; // 4s a 8s
  estrela.style.animationDuration = `${duracao}s`;

  container.appendChild(estrela);

  estrela.addEventListener('animationend', () => {
    estrela.remove();
  });
}


// Criar estrelas cadentes em intervalos aleatórios
function iniciarEstrelasCadentes() {
  if (intervaloEstrelas) clearInterval(intervaloEstrelas); // Garante que não duplica
  intervaloEstrelas = setInterval(() => {
    criarEstrelaCadente();
  }, 1000);
}

function pararEstrelasCadentes() {
  clearInterval(intervaloEstrelas);
  intervaloEstrelas = null;
  document.getElementById("container-estrelas").innerHTML = "";
}




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

// 🧼 remove o sistema e as estrelas
pararEstrelasCadentes();

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

    // 🔧 Estado para zoom/pan do canvas
    let isArrastandoCanvas = false;
    let ultimoXCanvas = 0;
    let ultimoYCanvas = 0;
    let distanciaInicialTouch = null;
    let escalaInicialTouch = 1;
    const ZOOM_MIN = 0.1;
    const ZOOM_MAX = 10;

    // 🔧 Estado para edição de objeto com dois dedos
    let objetoMovendoTouch = null;
    let offsetTouchX = 0;
    let offsetTouchY = 0;

    // ===================================================
    // 🔧 Utilitário: transforma escala e rotação em CSS
    // ===================================================
    function aplicarTransformacaoNoObjeto(id, escala, rotacaoEmRad) {
        const objeto = document.querySelector(`.objeto-edicao[data-id="${id}"]`);
        if (!objeto) return;

        const graus = rotacaoEmRad * (180 / Math.PI);
        objeto.style.transform = `scale(${escala}) rotate(${graus}deg)`;
    }

    // ===================================================
    // 🔍 Verifica se os dois dedos estão sobre o mesmo objeto selecionado
    // ===================================================
    function tocandoObjetoSelecionadoComDoisDedos(t1, t2) {
        const objSelecionado = MAXEditor.camadaSelecionada;
        if (!objSelecionado) return false;

        const alvo1 = document.elementFromPoint(t1.clientX, t1.clientY);
        const alvo2 = document.elementFromPoint(t2.clientX, t2.clientY);

        return [alvo1, alvo2].every(el =>
            el?.classList.contains("objeto-edicao") &&
            el.dataset.id === objSelecionado
        );
    }

    // ===================================================
    // 🌀 Aplica transformações visuais ao canvas-transformado
    // ===================================================
    function atualizarTransformacao() {
        transformado.style.transform = `translate(calc(-50% + ${MAXEditor.panX}px), calc(-50% + ${MAXEditor.panY}px)) scale(${MAXEditor.zoom})`;
        transformado.style.transformOrigin = "center center";
        transformado.style.transition = "transform 0.08s ease-out";
        verificarSeCanvasSumiu();
    }

    // 🔄 Centraliza canvas com base no tamanho do wrapper
    function centralizarCanvasComZoom() {
        const larguraWrapper = wrapper.clientWidth;
        const alturaWrapper = wrapper.clientHeight;
        const larguraCanvas = canvas.offsetWidth;
        const alturaCanvas = canvas.offsetHeight;
        const margem = 0.9;

        const escalaIdeal = Math.min(larguraWrapper / larguraCanvas, alturaWrapper / alturaCanvas) * margem;
        MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaIdeal));
        MAXEditor.panX = 0;
        MAXEditor.panY = 0;

        atualizarTransformacao();
    }

    // ♻️ Recentraliza manualmente
    function recentralizarCanvas() {
        MAXEditor.zoom = 1;
        MAXEditor.panX = 0;
        MAXEditor.panY = 0;
        atualizarTransformacao();
    }

    // 🧠 Detecta se canvas "sumiu" da tela e recentraliza
    let ultimaCentralizacao = 0;
    function verificarSeCanvasSumiu() {
        if (!canvas || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;

        const agora = Date.now();
        if (agora - ultimaCentralizacao < 500) return;

        const margem = 60;
        const wrapperBox = wrapper.getBoundingClientRect();
        const canvasBox = canvas.getBoundingClientRect();

        const foraHorizontal = canvasBox.right < wrapperBox.left + margem || canvasBox.left > wrapperBox.right - margem;
        const foraVertical = canvasBox.bottom < wrapperBox.top + margem || canvasBox.top > wrapperBox.bottom - margem;

        if (foraHorizontal || foraVertical) {
            console.warn("⚠️ Canvas fora da tela. Recentralizando...");
            ultimaCentralizacao = agora;
            centralizarCanvasComZoom();
        }
    }

    // 🌐 Expõe funções para uso externo
    window.centralizarCanvasComZoom = centralizarCanvasComZoom;
    window.recentralizarCanvas = recentralizarCanvas;

    // ===================================================
    // 🎯 ZOOM COM SCROLL DO MOUSE (PC)
    // ===================================================
    wrapper.addEventListener("wheel", (e) => {
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        MAXEditor.zoom += delta;
        MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, MAXEditor.zoom));
        atualizarTransformacao();
    }, { passive: false });

    // ===================================================
    // 🖱️ PAN COM MOUSE
    // ===================================================
    wrapper.addEventListener("mousedown", (e) => {
        const objSelecionado = MAXEditor.camadaSelecionada;
        const alvo = e.target.closest(".objeto-edicao");

        if (alvo && alvo.dataset.id === objSelecionado) return;

        isArrastandoCanvas = true;
        ultimoXCanvas = e.clientX;
        ultimoYCanvas = e.clientY;
        transformado.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (MAXEditor.interacaoObjetoAtiva) {
            isArrastandoCanvas = false;
            return;
        }
        if (!isArrastandoCanvas) return;

        const dx = e.clientX - ultimoXCanvas;
        const dy = e.clientY - ultimoYCanvas;
        MAXEditor.panX += dx;
        MAXEditor.panY += dy;
        ultimoXCanvas = e.clientX;
        ultimoYCanvas = e.clientY;

        atualizarTransformacao();
    });

    document.addEventListener("mouseup", () => {
        isArrastandoCanvas = false;
    });

    // ===================================================
    // 📱 TOQUE: GESTOS DE ESCALA, ROTAÇÃO E MOVIMENTO
    // ===================================================
    wrapper.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
            const [t1, t2] = e.touches;

            if (tocandoObjetoSelecionadoComDoisDedos(t1, t2)) {
                MAXEditor.interacaoDoisDedos = {
                    modo: "objeto",
                    id: MAXEditor.camadaSelecionada,
                    distanciaInicial: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
                    anguloInicial: Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX),
                    escalaInicial: 1,
                    rotacaoInicial: 0
                };

                // Desativa zoom da tela
                distanciaInicialTouch = null;
                escalaInicialTouch = null;
            } else {
                // Gesto comum de zoom/pan
                distanciaInicialTouch = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                escalaInicialTouch = MAXEditor.zoom;
                ultimoXCanvas = (t1.clientX + t2.clientX) / 2;
                ultimoYCanvas = (t1.clientY + t2.clientY) / 2;
                MAXEditor.interacaoDoisDedos = null;
            }
        }
        else if (e.touches.length === 1 && MAXEditor.camadaSelecionada) {
            // 🧲 Mover objeto com 1 dedo em qualquer lugar da tela
            const objeto = document.querySelector(`.objeto-edicao[data-id="${MAXEditor.camadaSelecionada}"]`);
            if (objeto) {
                const t1 = e.touches[0];
const canvasBox = canvas.getBoundingClientRect();

objetoMovendoTouch = objeto;

// Pega a posição atual do objeto (estilo left/top)
const leftAtual = parseFloat(objeto.style.left) || 0;
const topAtual = parseFloat(objeto.style.top) || 0;

// Calcula o ponto inicial do dedo relativo ao canvas
const posDedoX = t1.clientX - canvasBox.left;
const posDedoY = t1.clientY - canvasBox.top;

// Armazena o delta entre dedo e posição real do objeto
offsetTouchX = posDedoX - leftAtual;
offsetTouchY = posDedoY - topAtual;

            }
        }
    }, { passive: false });

    wrapper.addEventListener("touchmove", (e) => {
        // 👉 Mover objeto com 1 dedo
// 🟢 Se estiver arrastando o objeto com um dedo
if (e.touches.length === 1 && objetoMovendoTouch) {
    const t1 = e.touches[0];
    const canvasBox = canvas.getBoundingClientRect();

    // Posição atual do dedo relativa ao canvas
    const posDedoX = t1.clientX - canvasBox.left;
    const posDedoY = t1.clientY - canvasBox.top;

    // Nova posição do objeto com base no dedo - deslocamento
    const x = posDedoX - offsetTouchX;
    const y = posDedoY - offsetTouchY;

    // Aplica nova posição ao objeto
    objetoMovendoTouch.style.left = `${x}px`;
    objetoMovendoTouch.style.top = `${y}px`;

    // 🔁 Atualiza posição do contorno para manter alinhamento com o objeto
    const contorno = document.getElementById("contorno-selecao");
    if (contorno && !contorno.classList.contains("oculto")) {
        const objWidth = objetoMovendoTouch.offsetWidth;
        const objHeight = objetoMovendoTouch.offsetHeight;
        const contWidth = contorno.offsetWidth;
        const contHeight = contorno.offsetHeight;

        // Calcula nova posição do contorno centralizado
        const contX = x - (contWidth - objWidth) / 2;
        const contY = y - (contHeight - objHeight) / 2;

        contorno.style.left = `${contX}px`;
        contorno.style.top = `${contY}px`;
    }

    e.preventDefault(); // Impede scroll enquanto move objeto
}


        // ✌️ Escalar/rotacionar objeto com dois dedos
        if (e.touches.length === 2 && MAXEditor.interacaoDoisDedos?.modo === "objeto") {
            const [t1, t2] = e.touches;
            const novaDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const novoAng = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);

            const escala = novaDist / MAXEditor.interacaoDoisDedos.distanciaInicial;
            const rotacao = novoAng - MAXEditor.interacaoDoisDedos.anguloInicial;

            aplicarTransformacaoNoObjeto(MAXEditor.interacaoDoisDedos.id, escala, rotacao);
            e.preventDefault();
            return;
        }

        // 🧭 Zoom + Pan do canvas com dois dedos
        if (e.touches.length === 2 && distanciaInicialTouch !== null) {
            const [t1, t2] = e.touches;

            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            const novaDistancia = Math.hypot(dx, dy);

            const novoMeio = {
                x: (t1.clientX + t2.clientX) / 2,
                y: (t1.clientY + t2.clientY) / 2
            };

            const fatorZoom = novaDistancia / distanciaInicialTouch;
            MAXEditor.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaInicialTouch * fatorZoom));

            const dxMeio = novoMeio.x - ultimoXCanvas;
            const dyMeio = novoMeio.y - ultimoYCanvas;

            MAXEditor.panX += dxMeio;
            MAXEditor.panY += dyMeio;

            ultimoXCanvas = novoMeio.x;
            ultimoYCanvas = novoMeio.y;

            atualizarTransformacao();
            e.preventDefault();
        }
    }, { passive: false });

    // ✅ Reseta variáveis no fim do toque
    wrapper.addEventListener("touchend", () => {
        distanciaInicialTouch = null;
        objetoMovendoTouch = null;
    });

    // 🚀 Inicia com canvas centralizado
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
 
 iniciarEstrelasCadentes();

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

// ========================================
//   FECHAR ABA DE CAMADAS CLICANDO FORA
// ======================================== 
  document.addEventListener('click', (evento) => {
  const painel = document.querySelector('.painel');
  const botao = document.querySelector('#abrir-camadas');

  const clicouForaDoPainel = painel && !painel.contains(evento.target);
  const clicouNoBotao = botao && botao.contains(evento.target);

  const painelEstaAberto = painel && painel.classList.contains('ativo');

  if (painelEstaAberto && clicouForaDoPainel && !clicouNoBotao) {
    painel.classList.remove('ativo');
  }
});

  
  
  
  
  
  // ==============================
// 🎯 SISTEMA EDITOR DE TEXTO
// ==============================

// 👉 campos para camada de texto
const telaEdicaoTexto  = document.getElementById("tela-edicao-texto");
const textoEditavel    = document.getElementById("texto-editavel");
const btnConfirmarText = document.getElementById("botao-confirmar-texto");

const inputImagem = document.getElementById("input-imagem");

// —————————————————————
// Funções utilitárias
// —————————————————————
function abrirEditorTexto() {
  textoEditavel.innerHTML = "";              // limpa campo
  telaEdicaoTexto.classList.remove("oculto");
  textoEditavel.focus();
  MAXEditor.interacaoObjetoAtiva = true;      // trava pan/zoom se precisar
  
    // Inicializa como 'Cancelar'
  btnConfirmarText.classList.remove("confirmar");
  btnConfirmarText.classList.add("cancelar");
  btnConfirmarText.innerText = "Cancelar";
}

function fecharEditorTexto() {
  telaEdicaoTexto.classList.add("oculto");
  MAXEditor.interacaoObjetoAtiva = false;
}

/* function criarObjetoTexto(conteudo) {
  const id = Date.now().toString(36);

  const obj = document.createElement("div");
  obj.className = "objeto-edicao";
  obj.dataset.id = id;
  obj.dataset.tipo = "texto";
  obj.style.left = "50%";
  obj.style.top  = "50%";
  obj.style.transform = "translate(-50%, -50%)";
  obj.style.minWidth = "120px";

  const span = document.createElement("div");
  span.className = "conteudo-texto";
  span.innerText = conteudo;
  span.style.color = "#fff";
  span.style.font = "400 28px/1.3 'Poppins', sans-serif";
  span.style.whiteSpace = "pre-wrap";

  obj.appendChild(span);
  document.getElementById("canvas-transformado").appendChild(obj);

  aplicarContornoEdicao(obj);
  ObjetoInteracaoManager.ativar(obj);
} */

function mostrarContainer(tipo) {
  document.querySelectorAll('.grupo-botoes').forEach(container => {
    container.classList.add("oculto");
  });
  const containerAtivo = document.getElementById(`container-${tipo}`);
  if (containerAtivo) {
    containerAtivo.classList.remove("oculto");
  }
}

const ferramentasDisponiveis = {
  texto: () => abrirEditorTexto(),
  imagem: () => {
    inputImagem.onchange = (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      const leitor = new FileReader();
      leitor.onload = () => {
        const imagemBase64 = leitor.result;
        criarCamadaBase("imagem", arquivo.name, imagemBase64);
        inputImagem.value = "";
      };
      leitor.readAsDataURL(arquivo);
    };
    inputImagem.click();
  },
  forma: () => criarCamadaBase("forma", "Forma")
};

document.querySelectorAll(".botao-ferramenta").forEach(botao => {
  botao.addEventListener("click", () => {
    const textoBotao = botao.textContent.toLowerCase();
    if (textoBotao.includes("texto")) ferramentasDisponiveis.texto();
    else if (textoBotao.includes("imagem")) ferramentasDisponiveis.imagem();
    else if (textoBotao.includes("forma")) ferramentasDisponiveis.forma();
  });
});

btnConfirmarText.addEventListener("click", () => {
  if (!textoEditavel.innerText.trim()) return;
	criarCamadaBase("texto", "Texto", textoEditavel.innerText.trim());
	fecharEditorTexto();
});

    

// Verifica a cada digitação se há conteúdo
textoEditavel.addEventListener("input", () => {
  const temTexto = textoEditavel.innerText.trim().length > 0;

  if (temTexto) {
    btnConfirmarText.classList.remove("cancelar");
    btnConfirmarText.classList.add("confirmar");
    btnConfirmarText.innerText = "Confirmar";
  } else {
    btnConfirmarText.classList.remove("confirmar");
    btnConfirmarText.classList.add("cancelar");
    btnConfirmarText.innerText = "Cancelar";
  }
});

// Lógica de clique
btnConfirmarText.addEventListener("click", () => {
  const texto = textoEditavel.innerText.trim();
	fecharEditorTexto();
 
  
});

  



  
// ==========================
// 🧠 NOVO SISTEMA DE CAMADAS
// ==========================

// Referência à lista onde as camadas serão exibidas
const listaCamadas = document.getElementById("lista-camadas");









// ============================================
// ============================================

// 🧱 Função principal para criar uma nova camada na lista lateral

// ============================================
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
  <span class="icone-camada icone-arrastar" title="Arrastar camada" draggable="true"> <svg viewBox="0 0 24 24"><path fill="white" d="M4 9h16v2H4V9zm0 4h16v2H4v-2z"/></svg>
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
    conteudo: tipo === "texto" ? imagemBase64 : null,
    imagemBase64: tipo === "imagem" ? imagemBase64 : null
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
            btnOlho.innerHTML = visivel ? svgOlhoFechado : svgOlhoAberto;
            
            // --- CÓDIGO PARA ESCONDER/MOSTRAR O OBJETO NO CANVAS ---
            const objCanvas = document.querySelector(`.objeto-edicao[data-id="${camada.dataset.id}"]`);
            if (objCanvas) {
                objCanvas.style.display = visivel ? 'none' : ''; // 'none' para esconder, '' para mostrar (retorna ao display padrão)
            }
            // --- FIM DO CÓDIGO ---
        });

  // =========================================
  // 🔒 Evento de clique no cadeado (bloqueio)
  // =========================================
// ... dentro de criarCamadaBase, no btnCadeado.addEventListener("click", () => { ...

const btnCadeado = camada.querySelector(".icone-bloqueio");
btnCadeado.addEventListener("click", () => {
    const bloqueadoAnterior = camada.dataset.bloqueado === "true"; // Estado ANTERIOR
    const novoEstadoBloqueado = !bloqueadoAnterior; // NOVO estado
    camada.dataset.bloqueado = novoEstadoBloqueado.toString(); // ATUALIZA o dataset

    // Troca o SVG de acordo com o NOVO estado
    btnCadeado.innerHTML = novoEstadoBloqueado ? svgCadeadoFechado : svgCadeadoAberto; // <--- CORREÇÃO AQUI
    
    // Lógica para ativar/desativar edição baseada no NOVO estado
    if (novoEstadoBloqueado) { // Se a camada acabou de ser BLOQUEADA
        if (MAXEditor.camadaSelecionada === camada.dataset.id) { // Se ela é a selecionada
            ObjetoInteracaoManager.desativar();
            removerContornoEdicao();
            mostrarNotificacaoAviso("Camada bloqueada! Edição desativada.");
        }
    } else { // Se a camada acabou de ser DESBLOQUEADA
        if (MAXEditor.camadaSelecionada === camada.dataset.id) { // Se ela é a selecionada
            const objCanvas = document.querySelector(`.objeto-edicao[data-id="${camada.dataset.id}"]`);
            if(objCanvas) {
                ObjetoInteracaoManager.ativar(objCanvas);
                aplicarContornoEdicao(objCanvas); // Reaplica contorno caso necessário
                mostrarNotificacaoAviso("Camada desbloqueada! Edição ativada.");
            }
        }
    }
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
	 const texto = camada.dados?.conteudo || camada.nome || "Texto Exemplo";
  obj.textContent = texto;
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
  document.getElementById("canvas-container").appendChild(obj);

  
  

 // 🧷 Salva referência opcional na camada (futuro)
camada._objRef = obj;

// ✅ Devolve o objeto criado
return obj;


  
}

 

}


// ============================================
// FIM FUNÇÃO CRIAR CAMADA BASE
// ============================================













  
// =============================================
 // 🎯 Mostra contorno sobre o objeto selecionado
  // =============================================
  
function aplicarContornoEdicao(objCriado) {
  const contorno = document.getElementById("contorno-selecao");
  const canvasContainer = document.getElementById("canvas-container");
  
  
  // Verifica se é um objeto de texto
const ehTexto = objCriado.classList.contains("objeto-texto");
contorno.dataset.tipo = ehTexto ? "texto" : "outro";



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

  // Aplica a rotação do objeto ao contorno também
  const objTransform = window.getComputedStyle(objCriado).transform;
  contorno.style.transform = objTransform;

  // Remove classes anteriores
  contorno.classList.remove("oculto", "tipo-texto");

  // 🧠 DETECÇÃO de camada de texto
  if (objCriado.classList.contains("objeto-texto")) {
    contorno.classList.add("tipo-texto");

    const conteudo = objCriado.querySelector(".conteudo"); // ⬅️ conteúdo real do texto
    if (conteudo) {
      // 🧠 Escala adaptativa
      const escalaX = objCriado.offsetWidth / conteudo.offsetWidth;
      const escalaY = objCriado.offsetHeight / conteudo.offsetHeight;
      const escala = Math.min(escalaX, escalaY);

      conteudo.style.transform = `scale(${escala})`;
      conteudo.style.transformOrigin = "top left";
    }
  }

  // contorno ativado
  contorno.classList.remove("oculto");
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
// ⬆️⬇️ ARRASTAR PARA REORDENAR CAMADAS (Drag and Drop)
// Permite mudar a ordem visual das camadas tanto na lista quanto no canvas.
// =======================================================================

// A referência à lista de camadas já existe: const listaCamadas = document.getElementById("lista-camadas");

let camadaArrastada = null;     // Armazena a camada que está sendo arrastada
let linhaDemarcadora = null;    // Elemento visual da linha verde para indicar posição de drop

// Cria e adiciona a linha demarcadora ao DOM uma única vez
function criarLinhaDemarcadora() {
    if (!linhaDemarcadora) {
        linhaDemarcadora = document.createElement('div');
        linhaDemarcadora.classList.add('linha-demarcadora');
        linhaDemarcadora.style.position = 'absolute';
        linhaDemarcadora.style.height = '2px';
        linhaDemarcadora.style.background = '#00ff80'; /* Verde vivo */
        linhaDemarcadora.style.zIndex = '1000'; /* Acima dos itens da camada */
        linhaDemarcadora.style.width = 'calc(100% - 16px)'; /* Ajusta à largura da lista */
        linhaDemarcadora.style.left = '8px'; /* Alinha com o padding da lista */
        linhaDemarcadora.style.display = 'none'; /* Inicia escondida */
        listaCamadas.appendChild(linhaDemarcadora);
    }
}

// Evento quando o arrasto de um item de camada começa
listaCamadas.addEventListener("dragstart", (e) => {
    // Certifica-se de que estamos arrastando a camada pelo ícone de arrastar
    const iconeArrastar = e.target.closest(".icone-arrastar");
    if (iconeArrastar) {
        camadaArrastada = iconeArrastar.closest(".item-camada"); // Pega o item da camada pai
        if (camadaArrastada) {
            // Adiciona uma classe para estilização durante o arrasto
            camadaArrastada.classList.add("arrastando");
            // Define o dado que será transferido (o ID da camada)
            e.dataTransfer.setData("text/plain", camadaArrastada.dataset.id);
            // Define o efeito visual do arrasto
            e.dataTransfer.effectAllowed = "move";

            criarLinhaDemarcadora(); // Garante que a linha existe
            linhaDemarcadora.style.display = 'block'; // Mostra a linha
        }
    } else {
        // Se o arrasto não começou do ícone, previne o comportamento padrão (arrasto de texto, etc.)
        e.preventDefault(); 
        e.dataTransfer.effectAllowed = "none";
    }
});

// Evento quando a camada arrastada entra em uma zona que pode receber o drop
listaCamadas.addEventListener("dragenter", (e) => {
    e.preventDefault(); // Necessário para permitir o drop
    const alvoDrop = e.target.closest(".item-camada");
    if (alvoDrop && alvoDrop !== camadaArrastada) {
        alvoDrop.classList.add("drag-over"); // Adiciona classe visual ao alvo do drop
    }
});

// Evento quando a camada arrastada se move sobre uma zona de drop
listaCamadas.addEventListener("dragover", (e) => {
    e.preventDefault(); // Necessário para permitir o drop
    e.dataTransfer.dropEffect = "move"; // Define o cursor como "mover"

    const alvoDrop = e.target.closest(".item-camada");

    // Remove a classe 'drag-over' de todos os outros elementos primeiro
    document.querySelectorAll(".item-camada.drag-over").forEach(item => {
        if (item !== alvoDrop) item.classList.remove("drag-over");
    });

    if (alvoDrop && alvoDrop !== camadaArrastada) {
        alvoDrop.classList.add("drag-over"); // Adiciona classe 'drag-over' ao elemento atual

        // Posiciona a linha demarcadora
        const bounding = alvoDrop.getBoundingClientRect();
        const listaBounding = listaCamadas.getBoundingClientRect(); // Para posição relativa à lista
        const offset = e.clientY - bounding.top; // Posição do mouse dentro do alvo

        // Se o mouse estiver na metade superior, a linha fica ACIMA do alvo
        if (offset < bounding.height / 2) {
            linhaDemarcadora.style.top = `${alvoDrop.offsetTop - (linhaDemarcadora.offsetHeight / 2)}px`;
        } else {
            // Se o mouse estiver na metade inferior, a linha fica ABAIXO do alvo
            linhaDemarcadora.style.top = `${alvoDrop.offsetTop + alvoDrop.offsetHeight - (linhaDemarcadora.offsetHeight / 2)}px`;
        }
        linhaDemarcadora.style.display = 'block'; // Garante que a linha está visível durante o dragover
    } else {
        // Se arrastando sobre a área vazia da lista, esconde a linha
        linhaDemarcadora.style.display = 'none';
    }
});

// Evento quando a camada arrastada sai de uma zona de drop
listaCamadas.addEventListener("dragleave", (e) => {
    // Se o evento leave não for para um filho ou para a própria lista, esconde a linha e remove classe
    if (!listaCamadas.contains(e.relatedTarget)) { // Se o mouse saiu completamente da lista
        linhaDemarcadora.style.display = 'none';
        document.querySelectorAll(".item-camada.drag-over").forEach(item => {
            item.classList.remove("drag-over");
        });
    }
});


// Evento quando a camada é solta em uma zona de drop
listaCamadas.addEventListener("drop", (e) => {
    e.preventDefault();
    linhaDemarcadora.style.display = 'none'; // Esconde a linha ao soltar
    const alvoDrop = e.target.closest(".item-camada");
    document.querySelectorAll(".item-camada.drag-over").forEach(item => { // Limpa todas as classes drag-over
        item.classList.remove("drag-over");
    });

    if (camadaArrastada && alvoDrop && camadaArrastada !== alvoDrop) {
        const bounding = alvoDrop.getBoundingClientRect();
        const offset = e.clientY - bounding.top;

        if (offset > bounding.height / 2) {
            // Soltou na metade inferior, insere DEPOIS do alvo
            listaCamadas.insertBefore(camadaArrastada, alvoDrop.nextSibling);
        } else {
            // Soltou na metade superior, insere ANTES do alvo
            listaCamadas.insertBefore(camadaArrastada, alvoDrop);
        }

        // --- ATUALIZAÇÃO Z-INDEX DOS OBJETOS NO CANVAS ---
        // Itera sobre todas as camadas na NOVA ordem e ajusta o z-index no canvas
        let zIndexBase = 10; // Z-index inicial para os objetos do canvas. Objetos com z-index menores que 10 não serão afetados.
        // Itera a lista de camadas da forma como elas estão AGORA no DOM, de baixo para cima,
        // para que o item mais "alto" na lista (primeiro da lista visualmente) tenha o maior z-index.
        const itemsCamadaOrdenados = Array.from(listaCamadas.children).reverse(); 

        itemsCamadaOrdenados.forEach((item, index) => {
            const objCanvas = document.querySelector(`.objeto-edicao[data-id="${item.dataset.id}"]`);
            if (objCanvas) {
                // Quanto mais para o "topo" da lista de camadas (índice 0), maior o z-index no canvas
                // Multiplicar o index por um valor pequeno (ex: 1) para que o z-index aumente gradualmente
                // Começamos do zIndexBase e adicionamos o index para criar a ordem
                objCanvas.style.zIndex = zIndexBase + index; 
            }
        });
        // --- FIM ATUALIZAÇÃO Z-INDEX ---

        mostrarNotificacaoAviso(`✅ Camada reordenada!`);
    }
});

// Evento quando o arrasto termina (limpa classes e reseta variáveis)
listaCamadas.addEventListener("dragend", () => {
    document.querySelectorAll(".item-camada.arrastando").forEach(item => {
        item.classList.remove("arrastando");
    });
    document.querySelectorAll(".item-camada.drag-over").forEach(item => {
        item.classList.remove("drag-over");
    });
    camadaArrastada = null; // Reseta a camada arrastada
    linhaDemarcadora.style.display = 'none'; // Garante que a linha esteja escondida
});


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
        
        // CORREÇÃO: Obtenha a posição inicial do objeto de forma mais robusta usando getComputedStyle
        const computedStyle = window.getComputedStyle(this.objetoAtual);
        this.startLeft = parseFloat(computedStyle.left) || 0; // Posição LEFT inicial do OBJETO no canvas
        this.startTop = parseFloat(computedStyle.top) || 0;   // Posição TOP inicial do OBJETO no canvas

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
        this.startLeft = parseFloat(window.getComputedStyle(this.objetoAtual).left) || 0; // Use computedStyle aqui também
        this.startTop = parseFloat(window.getComputedStyle(this.objetoAtual).top) || 0;   // Use computedStyle aqui também

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
    const tipo = this.contorno?.dataset?.tipo || "outro";

    const dx = (clientX - this.startX) / currentScale;
    const dy = (clientY - this.startY) / currentScale;

    if (tipo === "texto") {
  const delta = Math.max(dx, dy); // Pega o maior movimento para travar
  const proporcao = (this.startWidth + delta) / this.startWidth;

  const novoWidth = this.startWidth * proporcao;
  const novoHeight = this.startHeight * proporcao;

  const centerX = this.startLeft + this.startWidth / 2;
  const centerY = this.startTop + this.startHeight / 2;

  const newLeft = centerX - (novoWidth / 2);
  const newTop = centerY - (novoHeight / 2);

  this.objetoAtual.style.width = `${novoWidth}px`;
  this.objetoAtual.style.height = `${novoHeight}px`;
  this.objetoAtual.style.left = `${newLeft}px`;
  this.objetoAtual.style.top = `${newTop}px`;

  // Escalona o texto
  const fontSizeInicial = parseFloat(window.getComputedStyle(this.objetoAtual).fontSize);
  const novoFontSize = fontSizeInicial * proporcao;
  this.objetoAtual.style.fontSize = `${novoFontSize}px`;

  // Aplica ao contorno
  this.contorno.style.left = `${newLeft}px`;
  this.contorno.style.top = `${newTop}px`;
  this.contorno.style.width = `${novoWidth}px`;
  this.contorno.style.height = `${novoHeight}px`;
  return; // Importante: interrompe o restante para o texto ser especial
}
 else {
        // Redimensionamento normal
        let newWidth = this.startWidth;
        let newHeight = this.startHeight;
        let newLeft = this.startLeft;
        let newTop = this.startTop;

        switch (this.handleAtivo) {
            case 'handle-br':
                newWidth = Math.max(20, this.startWidth + dx);
                newHeight = Math.max(20, this.startHeight + dy);
                break;
            case 'handle-bl':
                newWidth = Math.max(20, this.startWidth - dx);
                newHeight = Math.max(20, this.startHeight + dy);
                newLeft = this.startLeft + dx;
                break;
            case 'handle-tr':
                newWidth = Math.max(20, this.startWidth + dx);
                newHeight = Math.max(20, this.startHeight - dy);
                newTop = this.startTop + dy;
                break;
            case 'handle-tl':
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

        if (this.objetoAtual.dataset.tipo === "imagem") {
            const img = this.objetoAtual.querySelector("img");
            if (img) {
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.maxWidth = "none";
                img.style.maxHeight = "none";
            }
        }

        this.contorno.style.width = `${newWidth + 16}px`;
        this.contorno.style.height = `${newHeight + 16}px`;
        this.contorno.style.left = `${newLeft - 8}px`;
        this.contorno.style.top = `${newTop - 8}px`;
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

const wrapper = document.getElementById("canvas-wrapper");

// =======================================================================
// 🖱️ SELEÇÃO DE OBJETOS NO CANVAS VIA CLIQUE
// Gerencia a seleção/desseleção de objetos ao clicar na área de edição.
// =======================================================================
canvasContainer.addEventListener("mousedown", (e) => {
    // Tenta encontrar o objeto de edição mais próximo do elemento clicado
    const clickedObject = e.target.closest(".objeto-edicao");
	
    
    // Se clicou em um objeto
    if (clickedObject) {
        const objectId = clickedObject.dataset.id;
        const correspondingLayer = document.querySelector(`.item-camada[data-id="${objectId}"]`);
        
        // Se a camada correspondente já está selecionada E o objeto não está bloqueado,
        // não precisamos fazer nada, pois a interação já está ativa para este objeto.
        if (correspondingLayer && correspondingLayer.classList.contains("ativa") && correspondingLayer.dataset.bloqueado !== "true") {
            // console.log("Objeto já selecionado e ativo. Nada a fazer."); // Descomente para depuração
            return; 
        }

        // Se o objeto clicado não é o atualmente selecionado ou está bloqueado ou não era selecionado
        if (correspondingLayer) {
            // Simula um clique na camada correspondente para ativar a lógica de seleção.
            // Isso irá: remover seleção anterior, adicionar 'ativa', mudar painel, ativar manager, etc.
            correspondingLayer.click(); 
            // console.log("Simulando clique na camada:", objectId); // Descomente para depuração
        }
    } else {
        // Se clicou em uma área vazia do canvas (não em um objeto)
        // E existe uma camada atualmente selecionada, então desselecione.
        if (MAXEditor.camadaSelecionada) {
            limparSelecaoDeCamadas();
            
             console.log("Clicou no canvas vazio. Desselecionando."); // Descomente para depuração
        }
    }
});

// ✅ Permite desselecionar clicando fora do canvas real (ex: fundo/cinza ao redor do canvas)
wrapper.addEventListener("mousedown", (e) => {
    // Ignora se clicou em objeto ou no contorno de seleção
    const clicouEmObjeto = e.target.closest(".objeto-edicao");
    const clicouNoContorno = e.target.closest("#contorno-selecao");

    if (!clicouEmObjeto && !clicouNoContorno && MAXEditor.camadaSelecionada) {
        limparSelecaoDeCamadas();
        console.log("🔹 Desselecionado ao clicar no wrapper fora de qualquer objeto.");
    }
});



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


// =======================================================================
// 🔄 ATUALIZAÇÃO DE Z-INDEX DE TODOS OS OBJETOS NO CANVAS
// Garante que a ordem visual dos objetos no canvas corresponda à lista de camadas.
// =======================================================================
function atualizarTodosZIndexes() {
    let zIndexBase = 10; // Z-index inicial para os objetos do canvas

    // Pega todos os elementos de camada na lista, na ordem atual do DOM
    // Reverse para que o primeiro item da lista (topo) tenha o MAIOR z-index
    const itemsCamadaOrdenados = Array.from(listaCamadas.children).reverse(); 

    itemsCamadaOrdenados.forEach((item, index) => {
        const objCanvas = document.querySelector(`.objeto-edicao[data-id="${item.dataset.id}"]`);
        if (objCanvas) {
            // O item mais ao topo na lista de camadas terá um z-index maior
            objCanvas.style.zIndex = zIndexBase + index; 
        }
    });
    // console.log("Z-indexes dos objetos no canvas atualizados."); // Descomente para debug
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

    
	





	
	

}); // Fim do DOMContentLoaded
  
