// ============================================================
//  CONFIGURAÇÃO DOS CLASSIFICADOS (os "presentes")
//  Este é o único arquivo que precisa ser editado para mudar
//  a conta de recebimento e os anúncios.
// ============================================================

// ---------- Conta para receber (PIX) ----------
// Enquanto "chave" estiver vazia, o site mostra "pagamento em configuração".
const CONTA = {
  pix: {
    chave: "",      // chave PIX: CPF, e-mail, celular (+55...) ou chave aleatória
    nome: "",       // nome do titular da conta (até 25 letras, sem acento)
    cidade: "",     // cidade do titular (até 15 letras, sem acento)
  },
  // WhatsApp para o convidado avisar que presenteou (só números, com 55 + DDD)
  // Ex.: "5511999998888". Vazio = o botão de avisar não aparece.
  whatsapp: "",
};

// ---------- Seções dos classificados (na ordem em que aparecem) ----------
const CATEGORIAS = [
  "Prestam-se serviços",
  "Vende-se",
  "Procura-se",
  "Oportunidade",
];

// ---------- Anúncios ----------
// PROVISÓRIOS: trocar textos e valores como o casal quiser.
// titulo = o começo do anúncio, em letras grandes; texto = o resto.
// cota: true = a pessoa pode "comprar" várias vezes.
const PRESENTES = [
  { id: "grama",     categoria: "Prestam-se serviços", valor: 200, titulo: "Noivo corta a grama do vizinho.", texto: "Serviço caprichado, com direito a barulho de máquina às 7h de domingo. Leva a própria tesoura e o próprio café." },
  { id: "louca",     categoria: "Prestam-se serviços", valor: 120, titulo: "Noivo lava a louça do almoço de domingo.", texto: "Inclusive a panela do feijão. Sim, aquela." },
  { id: "armario",   categoria: "Prestam-se serviços", valor: 150, titulo: "Noiva organiza o seu guarda-roupa.", texto: "Separa por cor, estação e humor. Garantia de que você nunca mais vai achar nada." },
  { id: "cafune",    categoria: "Prestam-se serviços", valor: 50,  titulo: "Cafuné profissional.", texto: "Atendimento antes de dormir, sem hora marcada. Equipe com anos de experiência no ramo." },

  { id: "rede",      categoria: "Vende-se", valor: 280, titulo: "Rede de balanço, seminova.", texto: "Já balançou duas vezes. O vendedor arma pessoalmente." },
  { id: "cafe",      categoria: "Vende-se", valor: 350, titulo: "Café na cama, vitalício.", texto: "Entregue toda vez que você se levantar. Açúcar a combinar." },
  { id: "pao",       categoria: "Vende-se", valor: 60,  titulo: "Lugar na fila do pão.", texto: "Ao lado de quem lê jornal. Vista privilegiada para o amor." },
  { id: "panelas",   categoria: "Vende-se", valor: 600, titulo: "Jogo de panelas para casa nova.", texto: "Ideal para dar comida na boca com estilo. Não acompanha cozinheiro." },

  { id: "cota-viagem", categoria: "Procura-se", valor: 100, titulo: "Patrocinador para a lua de mel.", texto: "Casal procura alma generosa para ajudar nas passagens. Aceita-se em suaves cotas.", cota: true },
  { id: "jantar",    categoria: "Procura-se", valor: 250, titulo: "Jantar romântico desaparecido.", texto: "Visto pela última vez à luz de velas. Recompensa: gratidão eterna dos noivos." },
  { id: "diaria",    categoria: "Procura-se", valor: 500, titulo: "Cama de hotel com café da manhã.", texto: "Noivos exaustos da festa procuram uma noite de descanso que não seja em casa." },

  { id: "show",      categoria: "Oportunidade", valor: 300, titulo: "Ingressos para show de forró.", texto: "Para dançar coladinho e cantar o cafuné ao vivo, desafinando com orgulho." },
  { id: "cinema",    categoria: "Oportunidade", valor: 120, titulo: "Noite de cinema completa.", texto: "Pipoca, filme e sofá. Briga pelo controle remoto inclusa." },
];

// Anúncio com valor livre (o convidado escreve quanto quer dar)
const VALOR_LIVRE = {
  ativo: true,
  minimo: 20,
  titulo: "Anúncio em branco.",
  texto: "Escreva aqui o valor que o seu coração mandar.",
};
