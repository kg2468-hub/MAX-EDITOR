document.addEventListener("DOMContentLoaded", () => {
  
  
 iniciarSistemaDeZoom()
 
 
  

  // Apenas uma mensagem no console para confirmar que o projeto foi carregado
console.log("MAX Editor iniciado.");
mostrarNotificacaoAviso(`SEJA MUITO BEM VINDO(A) 😁🎨`);

  
  // ==============================
// 🔧 Objeto global para armazenar o estado do editor
// ==============================
const MAXEditor = {
  camadaSelecionada: null,  // ← aqui vamos armazenar o ID da camada selecionada futuramente
  camadas: []               // ← se quiser, também pode usar para registrar todas as camadas
};

  
  
  
  
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


  // 🎨 Cria o canvas com as dimensões definidas
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas.style.border = "1px solid #4caf50";
  canvas.style.backgroundColor = "transparent";

  // Aplica fundo quadriculado branco (estilo editores reais)
  canvas.style.backgroundImage = `
    linear-gradient(45deg, #eee 25%, transparent 25%),
    linear-gradient(-45deg, #eee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eee 75%),
    linear-gradient(-45deg, transparent 75%, #eee 75%)
  `;
  canvas.style.backgroundSize = "20px 20px";
  canvas.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";

  // 🧼 Limpa apenas o conteúdo anterior (sem destruir tudo!)
	const antigoCanvas = canvasContainer.querySelector("canvas");
	if (antigoCanvas) antigoCanvas.remove();

	// Adiciona o novo canvas
	canvasContainer.appendChild(canvas);

	// 🔁 Recria o contorno de seleção
	const contorno = document.createElement("div");
	contorno.id = "contorno-selecao";
	contorno.className = "contorno-objeto oculto";
	contorno.innerHTML = `
	  <div class="handle-tl"></div>
	  <div class="handle-tr"></div>
	  <div class="handle-bl"></div>
	  <div class="handle-br"></div>
	`;
	canvasContainer.appendChild(contorno);


  // 🧠 Você pode salvar as infos do projeto aqui se quiser usar depois
  console.log(`Projeto "${nome}" criado com ${largura}x${altura}px`);
  
  // 🧼 Limpa as camadas antigas da lista lateral
document.querySelectorAll(".item-camada").forEach(camada => camada.remove());

// 🧼 Volta para o Container principal dos botoes de ferramentas
mostrarContainer("principal");

centralizarCanvasComZoom();


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
  const canvas = document.getElementById("canvas-container");

  if (!wrapper || !canvas) return;

  let escalaZoom = 1;
  let posicaoX = 0;
  let posicaoY = 0;

  let isArrastando = false;
  let ultimoX = 0;
  let ultimoY = 0;

  let distanciaInicial = null;
  let escalaInicial = 1;

  const ZOOM_MIN = 0.2;
  const ZOOM_MAX = 5;

  // 🎯 Aplica o zoom e posição ao wrapper
  function atualizarTransformacao() {
    wrapper.style.transform = `translate(${posicaoX}px, ${posicaoY}px) scale(${escalaZoom})`;
    wrapper.style.transformOrigin = "center center";
    wrapper.style.transition = "transform 0.08s ease-out";
    verificarSeCanvasSumiu();
  }

  // 🧠 Centraliza o canvas automaticamente com base no tamanho da tela
  function centralizarCanvasComZoom() {
    const larguraWrapper = wrapper.clientWidth;
    const alturaWrapper = wrapper.clientHeight;

    const larguraCanvas = canvas.offsetWidth;
    const alturaCanvas = canvas.offsetHeight;

    const escalaX = larguraWrapper / larguraCanvas;
    const escalaY = alturaWrapper / alturaCanvas;

    const margem = 0.9; // 90% da tela visível
    const escalaIdeal = Math.min(escalaX, escalaY) * margem;

    escalaZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaIdeal));
    posicaoX = 0;
    posicaoY = 0;

    atualizarTransformacao();
  }

  // 🔄 Recentraliza forçadamente com zoom 100%
  function recentralizarCanvas() {
    escalaZoom = 1;
    posicaoX = 0;
    posicaoY = 0;
    atualizarTransformacao();
  }

  // 🧠 Detecta se o canvas "sumiu da tela"
function verificarSeCanvasSumiu() {
  // 🛡️ Garante que o canvas existe e está visível
  if (!canvas || canvas.offsetParent === null) return;

  const margem = 60; // margem de segurança

  const limite = wrapper.getBoundingClientRect();
  const canvasBox = canvas.getBoundingClientRect();

  const foraHorizontal =
    canvasBox.right < limite.left + margem ||
    canvasBox.left > limite.right - margem;

  const foraVertical =
    canvasBox.bottom < limite.top + margem ||
    canvasBox.top > limite.bottom - margem;

  if (foraHorizontal || foraVertical) {
    console.warn("⚠️ Canvas fora da área visível. Recentralizando...");
    centralizarCanvasComZoom();
  }
}



  // 📤 Disponibiliza funções globalmente (caso queira usar em outros arquivos)
  window.centralizarCanvasComZoom = centralizarCanvasComZoom;
  window.recentralizarCanvas = recentralizarCanvas;

  // ============================
  // 💻 ZOOM COM SCROLL DO MOUSE
  // ============================
  wrapper.addEventListener("wheel", (e) => {
  if (e.ctrlKey || e.metaKey) return; // ignora pinch do touchpad

  e.preventDefault();

  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  escalaZoom += delta;
  escalaZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaZoom));

  atualizarTransformacao();
}, { passive: false });

  // =============================
  // 🖱️ MOVIMENTO COM O MOUSE (PC)
  // =============================
wrapper.addEventListener("mousedown", (e) => {
  if (escalaZoom <= 1) return; // Trava se zoom for 100%

  // 🛡️ Impede arrastar a tela se clicou sobre um objeto (exceto se for fora dele)
  if (e.target.closest(".objeto-edicao")) return;

  isArrastando = true;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
  wrapper.style.transition = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isArrastando || escalaZoom <= 1) return;

  const dx = e.clientX - ultimoX;
  const dy = e.clientY - ultimoY;
  posicaoX += dx;
  posicaoY += dy;
  ultimoX = e.clientX;
  ultimoY = e.clientY;

  // ✅ Limitação fluida baseada na visibilidade do canvas
  const limite = wrapper.getBoundingClientRect();
  const canvasBox = canvas.getBoundingClientRect();

  const margemX = limite.width * 0.2;
  const margemY = limite.height * 0.2;

  if (
    canvasBox.left > limite.right - margemX ||
    canvasBox.right < limite.left + margemX
  ) {
    posicaoX -= dx;
  }

  if (
    canvasBox.top > limite.bottom - margemY ||
    canvasBox.bottom < limite.top + margemY
  ) {
    posicaoY -= dy;
  }

  atualizarTransformacao();
});

document.addEventListener("mouseup", () => {
  isArrastando = false;
});




  // ==========================
  // 🤏 ZOOM E MOVIMENTO TOUCH
  // ==========================
  wrapper.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    distanciaInicial = Math.sqrt(dx * dx + dy * dy);
    escalaInicial = escalaZoom;
  } else if (e.touches.length === 1 && escalaZoom > 1) {
    // 🛡️ Impede mover a tela se tocou em um objeto
    const tocouObjeto = e.target.closest(".objeto-edicao");
    if (tocouObjeto) return;

    ultimoX = e.touches[0].clientX;
    ultimoY = e.touches[0].clientY;
  }
}, { passive: false });


 wrapper.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && distanciaInicial) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const novaDistancia = Math.sqrt(dx * dx + dy * dy);
    escalaZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escalaInicial * (novaDistancia / distanciaInicial)));

    if (escalaZoom <= 1) {
      posicaoX = 0;
      posicaoY = 0;
    }

    atualizarTransformacao();
    e.preventDefault();
  } else if (e.touches.length === 1 && escalaZoom > 1) {
    const tocouObjeto = e.target.closest(".objeto-edicao");
    if (tocouObjeto) return; // Impede mover se arrastou objeto

    const dx = e.touches[0].clientX - ultimoX;
    const dy = e.touches[0].clientY - ultimoY;
    posicaoX += dx;
    posicaoY += dy;
    ultimoX = e.touches[0].clientX;
    ultimoY = e.touches[0].clientY;
    atualizarTransformacao();
    e.preventDefault();
  }
}, { passive: false });


  wrapper.addEventListener("touchend", () => {
    distanciaInicial = null;
  });

  // ✅ Inicia centralizado com zoom inteligente
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
});


// Fechar o menu lateral
fecharMenu.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");  // inicia saída com animação

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
  

// Verifica se o objeto foi criado com sucesso antes de aplicar o contorno
if (objCriado) {
  aplicarContornoEdicao(objCriado);
  console.log("✅ Contorno aplicado no objeto:", objCriado);
} else {
  console.warn("⚠️ Objeto não foi criado, contorno não aplicado");
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

  // ============================
  // 📦 Conteúdo do objeto (por tipo)
  // ============================
  if (camada.tipo === "texto") {
    obj.textContent = camada.nome || "Texto";
    obj.style.fontSize = "20px";
    obj.style.color = "#fff";
    obj.style.fontFamily = "sans-serif";
    obj.style.position = "absolute";

  }

  else if (camada.tipo === "imagem" && camada.dados?.imagemBase64) {
    const img = new Image();
	img.src = camada.dados.imagemBase64;
	img.style.maxWidth = "200px";
	img.style.maxHeight = "200px";
	img.onload = () => {
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
    obj.style.position = "absolute";


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

  
  
  
  
  
  
});




