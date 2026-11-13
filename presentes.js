// Lista de presentes: mostra os cartões, controla o carrinho e o pagamento PIX.
// Os presentes e a conta ficam em presentes-dados.js.

const grade = document.getElementById("grade");
const carrinho = document.getElementById("carrinho");
const fundoEscuro = document.getElementById("fundo-escuro");
const listaItens = document.getElementById("itens");
const aviso = document.getElementById("aviso");
const pagamento = document.getElementById("pagamento");

const reais = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- Carrinho (fica salvo no navegador, mesmo se fechar a página) ----------
// Cada item: { id, nome, valor, qtd }
let itens = JSON.parse(localStorage.getItem("carrinho-presentes") || "[]")
  .filter((i) => i.id.startsWith("livre") || PRESENTES.some((p) => p.id === i.id));

function salvar() {
  localStorage.setItem("carrinho-presentes", JSON.stringify(itens));
  desenharCarrinho();
}

function total() {
  return itens.reduce((soma, i) => soma + i.valor * i.qtd, 0);
}

function adicionar(presente, valor = presente.valor) {
  // Valor livre entra sempre como um item novo; os outros somam na quantidade
  const existente = presente.id !== "livre" && itens.find((i) => i.id === presente.id);
  if (existente) existente.qtd++;
  else itens.push({ id: presente.id === "livre" ? "livre-" + Date.now() : presente.id, nome: presente.titulo.replace(/\.$/, ""), valor, qtd: 1 });
  salvar();
  mostrarAviso("Negócio fechado! Veja em “Negócios fechados”.");
}

function mudarQuantidade(id, diferenca) {
  const item = itens.find((i) => i.id === id);
  if (!item) return;
  item.qtd += diferenca;
  if (item.qtd <= 0) itens = itens.filter((i) => i.id !== id);
  salvar();
}

// ---------- Anúncios dos classificados ----------
function anuncio(presente) {
  const el = document.createElement("article");
  el.className = "anuncio";
  el.innerHTML = `
    <p class="anuncio__texto"><b>${presente.titulo}</b> ${presente.texto}</p>
    <p class="anuncio__preco">${reais(presente.valor)}${presente.cota ? " <small>(a cota)</small>" : ""}</p>
    <button class="anuncio__botao" type="button">Fechar negócio ›</button>
  `;
  el.querySelector("button").addEventListener("click", () => adicionar(presente));
  return el;
}

function anuncioValorLivre() {
  const el = document.createElement("article");
  el.className = "anuncio anuncio--livre";
  el.innerHTML = `
    <p class="anuncio__texto"><b>${VALOR_LIVRE.titulo}</b> ${VALOR_LIVRE.texto}</p>
    <label class="anuncio__livre">
      R$ <input type="number" min="${VALOR_LIVRE.minimo}" step="10" placeholder="${VALOR_LIVRE.minimo}" inputmode="decimal" aria-label="Valor do presente">
    </label>
    <button class="anuncio__botao" type="button">Fechar negócio ›</button>
  `;
  const campoValor = el.querySelector("input");
  el.querySelector("button").addEventListener("click", () => {
    const valor = Number(campoValor.value.replace(",", "."));
    if (!valor || valor < VALOR_LIVRE.minimo) {
      mostrarAviso(`O valor mínimo é ${reais(VALOR_LIVRE.minimo)}`);
      campoValor.focus();
      return;
    }
    adicionar({ id: "livre", titulo: "Anúncio em branco (valor livre)" }, Math.round(valor * 100) / 100);
    campoValor.value = "";
  });
  return el;
}

// Uma seção para cada categoria ("Vende-se", "Procura-se"...), com os anúncios em colunas
function desenharPresentes() {
  grade.innerHTML = "";
  CATEGORIAS.forEach((cat, i) => {
    const secao = document.createElement("section");
    secao.className = "classificados__secao";
    secao.innerHTML = `<h3 class="classificados__secao-titulo">${cat}</h3>`;
    const colunas = document.createElement("div");
    colunas.className = "classificados__anuncios";
    PRESENTES.filter((p) => p.categoria === cat).forEach((p) => colunas.appendChild(anuncio(p)));
    // O anúncio de valor livre entra no fim da última seção
    if (VALOR_LIVRE.ativo && i === CATEGORIAS.length - 1) colunas.appendChild(anuncioValorLivre());
    secao.appendChild(colunas);
    grade.appendChild(secao);
  });
}

// ---------- Desenho do carrinho ----------
function desenharCarrinho() {
  const quantidade = itens.reduce((soma, i) => soma + i.qtd, 0);
  document.getElementById("contador").textContent = quantidade;
  document.getElementById("total").textContent = reais(total());
  document.getElementById("vazio").hidden = itens.length > 0;
  document.getElementById("rodape").hidden = itens.length === 0;

  listaItens.innerHTML = "";
  itens.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <span class="item__icone" aria-hidden="true">✦</span>
      <span class="item__nome">${item.nome}<small>${reais(item.valor)}</small></span>
      <span class="item__qtd">
        <button type="button" aria-label="Tirar um">−</button>
        <span>${item.qtd}</span>
        <button type="button" aria-label="Pôr mais um">+</button>
      </span>
    `;
    const [menos, mais] = li.querySelectorAll("button");
    menos.addEventListener("click", () => mudarQuantidade(item.id, -1));
    mais.addEventListener("click", () => mudarQuantidade(item.id, +1));
    listaItens.appendChild(li);
  });
}

function abrirCarrinho() {
  carrinho.classList.add("carrinho--aberto");
  carrinho.removeAttribute("aria-hidden");
  fundoEscuro.hidden = false;
}

function fecharCarrinho() {
  carrinho.classList.remove("carrinho--aberto");
  carrinho.setAttribute("aria-hidden", "true");
  fundoEscuro.hidden = true;
}

// ---------- Pagamento ----------
function abrirPagamento() {
  const nome = document.getElementById("nome-convidado");
  if (!nome.value.trim()) {
    mostrarAviso("Escreva o seu nome para o casal saber quem presenteou 💛");
    nome.focus();
    return;
  }

  const valor = total();
  document.getElementById("pagamento-valor").textContent = reais(valor);

  const pronto = pixConfigurado();
  document.getElementById("pix-pronto").hidden = !pronto;
  document.getElementById("pix-pendente").hidden = pronto;

  if (pronto) {
    const codigo = gerarCodigoPix({ ...CONTA.pix, valor, descricao: "Presente casamento" });
    document.getElementById("pix-codigo").value = codigo;

    // Desenha o QR Code
    const qr = qrcode(0, "M");
    qr.addData(codigo);
    qr.make();
    document.getElementById("qr").innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2 });

    // Botão para o convidado avisar o casal pelo WhatsApp (se o número estiver configurado)
    const avisar = document.getElementById("avisar");
    if (CONTA.whatsapp) {
      const lista = itens.map((i) => `${i.qtd}x ${i.nome}`).join(", ");
      const mensagem = document.getElementById("mensagem").value.trim();
      const texto =
        `Oi, Alexandre e Mariana! Aqui é ${nome.value.trim()} 💛\n` +
        `Acabei de enviar um presente de ${reais(valor)} pelo PIX: ${lista}.` +
        (mensagem ? `\n\n${mensagem}` : "");
      avisar.href = `https://wa.me/${CONTA.whatsapp}?text=${encodeURIComponent(texto)}`;
      avisar.hidden = false;
    } else {
      avisar.hidden = true;
    }
  }

  fecharCarrinho();
  pagamento.hidden = false;
}

function fecharPagamento() {
  pagamento.hidden = true;
}

document.getElementById("copiar").addEventListener("click", async () => {
  const campo = document.getElementById("pix-codigo");
  try {
    await navigator.clipboard.writeText(campo.value);
  } catch {
    campo.select();
    document.execCommand("copy");
  }
  mostrarAviso("Código PIX copiado!");
});

// ---------- Aviso rápido no rodapé ----------
let tempoAviso;
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("aviso--visivel");
  clearTimeout(tempoAviso);
  tempoAviso = setTimeout(() => aviso.classList.remove("aviso--visivel"), 2500);
}

// ---------- Botões ----------
document.getElementById("abrir-carrinho").addEventListener("click", abrirCarrinho);
document.getElementById("fechar-carrinho").addEventListener("click", fecharCarrinho);
fundoEscuro.addEventListener("click", fecharCarrinho);
document.getElementById("ir-pagar").addEventListener("click", abrirPagamento);
document.getElementById("fechar-pagamento").addEventListener("click", fecharPagamento);
pagamento.addEventListener("click", (e) => { if (e.target === pagamento) fecharPagamento(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { fecharCarrinho(); fecharPagamento(); }
});

desenharPresentes();
desenharCarrinho();
