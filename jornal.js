// Folhear o jornal: mostra uma página por vez e vira a folha com animação.
// Dá para passar pelas setas ‹ ›, pelo teclado (← →), arrastando o dedo
// para o lado no celular, pelo índice do rodapé ou pelo índice da capa.

const jornal = document.getElementById("jornal");
const paginas = [...jornal.querySelectorAll(".pagina")];
const botaoAnterior = document.getElementById("anterior");
const botaoProxima = document.getElementById("proxima");
const indice = document.getElementById("indice");

// Nome de cada página no índice do rodapé: [completo, curto (celular)].
// O usuário quer os mesmos nomes no celular e no computador.
const NOMES = [
  ["Capa", "Capa"],
  ["Mariana", "Mariana"],
  ["Alexandre", "Alexandre"],
  ["Nós dois", "Nós dois"],
  ["Presentes", "Presentes"],
  ["Informações", "Informações"],
];
let atual = 0;

// Notebook de tela baixa: monta o jornal numa tela "virtual" de ALTURA_MINIMA
// e encolhe tudo junto (zoom), em vez de cortar fotos ou apertar o texto.
const ALTURA_MINIMA = 880;

function ajustarTamanho() {
  const raiz = document.documentElement;
  const escala = innerWidth > 900 && innerHeight < ALTURA_MINIMA ? innerHeight / ALTURA_MINIMA : 1;

  if (escala < 1) {
    raiz.style.setProperty("--vh", `${ALTURA_MINIMA / 100}px`);
    raiz.style.setProperty("--vw", `${innerWidth / escala / 100}px`);
    raiz.style.setProperty("--largura-max", `${1500 / escala}px`);
    document.body.style.zoom = escala;
  } else {
    raiz.style.removeProperty("--vh");
    raiz.style.removeProperty("--vw");
    raiz.style.removeProperty("--largura-max");
    document.body.style.zoom = "";
  }
}

ajustarTamanho();
addEventListener("resize", ajustarTamanho);

// Marca d'água com o logo do casal (A, flor de pétalas, M · 20.03.27) embaixo de cada página.
// A flor é a mesma de imagens/logo.svg: 4 pétalas longas em cruz e 4 curtas nas diagonais.
const PETALA_LONGA = "M0 -6 C-15 -34 -13 -66 0 -96 C13 -66 15 -34 0 -6 Z";
const PETALA_CURTA = "M0 -10 C-11 -30 -10 -50 0 -70 C10 -50 11 -30 0 -10 Z";
const FLOR = [0, 90, 180, 270]
  .map((a) => `<path d="${PETALA_LONGA}" transform="rotate(${a})"/><path d="${PETALA_CURTA}" transform="rotate(${a + 45})"/>`)
  .join("");

const LOGO = `
  <span class="marca-dagua__letras">
    <span>A</span>
    <svg viewBox="-100 -100 200 200">${FLOR}</svg>
    <span>M</span>
  </span>
  <span class="marca-dagua__data">20.03.27</span>`;

// Rodapé de cada página com o botão "Informações", que leva à página de serviço.
// A própria página de informações não leva o botão.
const PAGINA_INFO = paginas.findIndex((p) => p.id === "pagina-6") + 1;

paginas.forEach((pagina, i) => {
  const marca = document.createElement("div");
  marca.className = "marca-dagua";
  marca.setAttribute("aria-hidden", "true");
  marca.innerHTML = LOGO;
  pagina.appendChild(marca);

  if (i + 1 === PAGINA_INFO) return;
  const rodape = document.createElement("footer");
  rodape.className = "pagina__rodape";
  rodape.innerHTML = `
    <a class="botao-info" href="#pagina-${PAGINA_INFO}" data-pagina="${PAGINA_INFO}">
      <span class="botao-info__mao" aria-hidden="true">☞</span> Informações
    </a>`;
  pagina.appendChild(rodape);
});

// Todas as páginas entram no folhear (abas, setas, teclado e dedo)
const ULTIMA_FOLHEAVEL = paginas.length - 1;

function folhear(passo) {
  const alvo = atual + passo;
  if (alvo > ULTIMA_FOLHEAVEL) return;
  irPara(alvo);
}

// Índice do rodapé (um botão para cada página)
const botoesIndice = paginas.map((_, i) => {
  const [longo, curto] = NOMES[i] || [`Pág. ${i + 1}`, `${i + 1}`];
  const b = document.createElement("button");
  b.type = "button";
  b.className = "folhear__item";
  b.innerHTML = `<span class="longo">${longo}</span><span class="curto">${curto}</span>`;
  b.setAttribute("aria-label", longo);
  b.addEventListener("click", () => irPara(i));
  indice.appendChild(b);
  return b;
});

function irPara(n) {
  n = Math.max(0, Math.min(paginas.length - 1, n));

  paginas.forEach((pagina, i) => {
    // As páginas de trás ficam por baixo; as já lidas "viram" para a esquerda
    pagina.style.zIndex = paginas.length - i;
    pagina.classList.toggle("pagina--virada", i < n);
    pagina.classList.toggle("pagina--atual", i === n);
    pagina.inert = i !== n;
  });

  botoesIndice.forEach((b, i) => {
    if (!b) return;
    b.classList.toggle("folhear__item--ativo", i === n);
    b.setAttribute("aria-current", i === n ? "page" : "false");
  });
  // Celular estreito: se o índice não couber inteiro, rola até a aba da página atual
  botoesIndice[n]?.scrollIntoView({ block: "nearest", inline: "nearest" });

  botaoAnterior.disabled = n === 0;
  botaoProxima.disabled = n >= ULTIMA_FOLHEAVEL;

  paginas[n].scrollTop = 0;
  history.replaceState(null, "", `#pagina-${n + 1}`);
  atual = n;
}

botaoAnterior.addEventListener("click", () => folhear(-1));
botaoProxima.addEventListener("click", () => folhear(1));

// Links do índice da capa
jornal.querySelectorAll("[data-pagina]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    irPara(Number(link.dataset.pagina) - 1);
  });
});

// Teclado: setas para os lados (menos quando a pessoa está digitando)
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "ArrowRight") folhear(1);
  if (e.key === "ArrowLeft") folhear(-1);
});

// Celular: arrastar o dedo para o lado vira a página
let toqueInicio = null;

jornal.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse") return;
  toqueInicio = { x: e.clientX, y: e.clientY };
});

jornal.addEventListener("pointerup", (e) => {
  if (!toqueInicio) return;
  const dx = e.clientX - toqueInicio.x;
  const dy = e.clientY - toqueInicio.y;
  toqueInicio = null;
  // Só conta se foi claramente para o lado (e não rolando para baixo)
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    folhear(dx < 0 ? 1 : -1);
  }
});

jornal.addEventListener("pointercancel", () => { toqueInicio = null; });

// Contagem regressiva da capa. Troque o horário quando estiver definido
// (formato: ano-mês-diaThora:minuto, com o fuso de Brasília -03:00).
const DATA_CASAMENTO = new Date("2027-03-20T16:00:00-03:00");
const contagem = document.getElementById("contagem");

function atualizarContagem() {
  if (!contagem) return;
  const falta = DATA_CASAMENTO - Date.now();

  if (falta <= 0) {
    contagem.innerHTML = '<p class="contagem__fim">Extra! Extra! Hoje é o grande dia!</p>';
    clearInterval(relogio);
    return;
  }

  const s = Math.floor(falta / 1000);
  const valores = {
    dias: Math.floor(s / 86400),
    horas: Math.floor(s / 3600) % 24,
    minutos: Math.floor(s / 60) % 60,
    segundos: s % 60,
  };

  for (const [unidade, valor] of Object.entries(valores)) {
    const casa = contagem.querySelector(`[data-unidade="${unidade}"]`);
    casa.textContent = String(valor).padStart(unidade === "dias" ? 3 : 2, "0");
  }
}

const relogio = setInterval(atualizarContagem, 1000);
atualizarContagem();

// Abre na página do endereço (ex.: ...#pagina-5 abre direto nos presentes)
const doEndereco = Number((location.hash.match(/pagina-(\d+)/) || [])[1]);
irPara(doEndereco ? doEndereco - 1 : 0);
