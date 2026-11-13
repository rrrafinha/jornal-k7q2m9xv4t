// Caça-palavras dos jornais antigos.
// Monta um quadro de letras em cada <section class="passatempo" data-caca="...">,
// usando as palavras de caca-palavras-dados.js.
// Para jogar: toque na PRIMEIRA letra da palavra e depois na ÚLTIMA.

const TAMANHO_QUADRO = 11;   // 11 x 11 letras
const LETRAS = "ABCDEFGHIJLMNOPQRSTUVXZ";
// Direções: → , ↓ , ↘ , ↗
const DIRECOES = [[0, 1], [1, 0], [1, 1], [-1, 1]];

// Tira acento, espaço e pontuação: "Fila do pão" → "FILADOPAO"
const limpar = (p) => p.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();

// Sorteio "fixo": o mesmo quadro aparece sempre igual para todo mundo
function sorteador(semente) {
  let s = 0;
  for (const c of semente) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tenta encaixar todas as palavras no quadro; se não der, tenta de novo
function montarQuadro(palavras, semente) {
  const n = TAMANHO_QUADRO;
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const aleatorio = sorteador(semente + tentativa);
    const quadro = Array.from({ length: n }, () => Array(n).fill(""));
    const posicoes = {};
    // As maiores primeiro (são as mais difíceis de encaixar)
    const ordem = [...palavras].sort((a, b) => b.length - a.length);
    let deuCerto = true;

    for (const palavra of ordem) {
      let encaixou = false;
      for (let i = 0; i < 300 && !encaixou; i++) {
        const [dl, dc] = DIRECOES[Math.floor(aleatorio() * DIRECOES.length)];
        const l0 = Math.floor(aleatorio() * n);
        const c0 = Math.floor(aleatorio() * n);
        const lFim = l0 + dl * (palavra.length - 1);
        const cFim = c0 + dc * (palavra.length - 1);
        if (lFim < 0 || lFim >= n || cFim >= n) continue;

        let cabe = true;
        for (let k = 0; k < palavra.length; k++) {
          const atual = quadro[l0 + dl * k][c0 + dc * k];
          if (atual && atual !== palavra[k]) { cabe = false; break; }
        }
        if (!cabe) continue;

        for (let k = 0; k < palavra.length; k++) quadro[l0 + dl * k][c0 + dc * k] = palavra[k];
        posicoes[palavra] = { l0, c0, dl, dc };
        encaixou = true;
      }
      if (!encaixou) { deuCerto = false; break; }
    }

    if (!deuCerto) continue;

    // Completa o resto com letras quaisquer
    for (let l = 0; l < n; l++)
      for (let c = 0; c < n; c++)
        if (!quadro[l][c]) quadro[l][c] = LETRAS[Math.floor(aleatorio() * LETRAS.length)];
    return { quadro, posicoes };
  }
  return null;
}

function criarCacaPalavras(secao) {
  const chave = secao.dataset.caca;
  const dados = CACA_PALAVRAS[chave];
  if (!dados) return;

  const palavras = [...new Set(dados.palavras.map(limpar))].filter((p) => p.length >= 2 && p.length <= TAMANHO_QUADRO);
  const montado = montarQuadro(palavras, chave);
  if (!montado) return;
  const { quadro } = montado;

  const guardado = `caca-palavras-${chave}`;
  const achadas = new Set(JSON.parse(localStorage.getItem(guardado) || "[]").filter((p) => palavras.includes(p)));

  secao.innerHTML = `
    <h3 class="passatempo__titulo">Passatempo · Caça&#8209;palavras</h3>
    <p class="passatempo__instrucao">${dados.titulo}. Toque na <b>primeira</b> e depois na <b>última</b> letra de cada palavra.</p>
    <div class="passatempo__corpo">
      <div class="passatempo__quadro" style="--n:${TAMANHO_QUADRO}" role="grid" aria-label="Quadro de letras"></div>
      <div class="passatempo__lado">
        <p class="passatempo__lista-titulo">Palavras</p>
        <ul class="passatempo__lista"></ul>
        <p class="passatempo__placar"></p>
        <button class="passatempo__recomecar" type="button">Recomeçar</button>
      </div>
    </div>
  `;

  const quadroEl = secao.querySelector(".passatempo__quadro");
  const listaEl = secao.querySelector(".passatempo__lista");
  const placarEl = secao.querySelector(".passatempo__placar");

  // Letras do quadro
  const celulas = [];
  quadro.forEach((linha, l) => {
    celulas[l] = [];
    linha.forEach((letra, c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "passatempo__letra";
      b.textContent = letra;
      b.addEventListener("click", () => tocar(l, c));
      quadroEl.appendChild(b);
      celulas[l][c] = b;
    });
  });

  // Lista de palavras (com o jeito original, com acento)
  const nomeOriginal = {};
  dados.palavras.forEach((p) => { nomeOriginal[limpar(p)] = p; });
  const itensLista = {};
  palavras.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = nomeOriginal[p];
    listaEl.appendChild(li);
    itensLista[p] = li;
  });

  // Caminho entre duas letras (só vale reta: linha, coluna ou diagonal)
  function caminho(l1, c1, l2, c2) {
    const dl = Math.sign(l2 - l1);
    const dc = Math.sign(c2 - c1);
    const passos = Math.max(Math.abs(l2 - l1), Math.abs(c2 - c1));
    if (l1 !== l2 && c1 !== c2 && Math.abs(l2 - l1) !== Math.abs(c2 - c1)) return null;
    return Array.from({ length: passos + 1 }, (_, k) => [l1 + dl * k, c1 + dc * k]);
  }

  function marcar(palavra) {
    const { l0, c0, dl, dc } = montado.posicoes[palavra];
    for (let k = 0; k < palavra.length; k++) celulas[l0 + dl * k][c0 + dc * k].classList.add("passatempo__letra--achada");
    itensLista[palavra].classList.add("passatempo__item--achado");
  }

  function atualizarPlacar() {
    placarEl.textContent = achadas.size === palavras.length
      ? "Parabéns! Você achou todas! ✦"
      : `${achadas.size} de ${palavras.length} encontradas`;
    secao.classList.toggle("passatempo--completo", achadas.size === palavras.length);
  }

  let inicio = null;

  function tocar(l, c) {
    if (!inicio) {
      inicio = [l, c];
      celulas[l][c].classList.add("passatempo__letra--inicio");
      return;
    }
    const [l1, c1] = inicio;
    celulas[l1][c1].classList.remove("passatempo__letra--inicio");
    inicio = null;
    if (l1 === l && c1 === c) return;   // tocou na mesma letra: cancela

    const trecho = caminho(l1, c1, l, c);
    const texto = trecho ? trecho.map(([a, b]) => quadro[a][b]).join("") : "";
    const invertido = [...texto].reverse().join("");
    const palavra = palavras.find((p) => !achadas.has(p) && (p === texto || p === invertido));

    if (palavra) {
      achadas.add(palavra);
      localStorage.setItem(guardado, JSON.stringify([...achadas]));
      marcar(palavra);
      atualizarPlacar();
    } else {
      // Errou: as letras tremem rapidinho
      (trecho || [[l1, c1], [l, c]]).forEach(([a, b]) => {
        const el = celulas[a][b];
        el.classList.remove("passatempo__letra--errou");
        void el.offsetWidth;
        el.classList.add("passatempo__letra--errou");
      });
    }
  }

  secao.querySelector(".passatempo__recomecar").addEventListener("click", () => {
    achadas.clear();
    localStorage.removeItem(guardado);
    secao.querySelectorAll(".passatempo__letra--achada").forEach((el) => el.classList.remove("passatempo__letra--achada"));
    Object.values(itensLista).forEach((li) => li.classList.remove("passatempo__item--achado"));
    atualizarPlacar();
  });

  achadas.forEach(marcar);
  atualizarPlacar();
}

document.querySelectorAll(".passatempo[data-caca]").forEach(criarCacaPalavras);
