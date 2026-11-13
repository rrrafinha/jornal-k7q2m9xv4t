// Monta o código "PIX copia e cola" (padrão BR Code do Banco Central).
// O mesmo texto vira o QR Code. Tudo é feito no próprio navegador:
// o dinheiro vai direto da conta do convidado para a chave PIX do casal.

// Cada informação do código é escrita como: ID (2 dígitos) + tamanho (2 dígitos) + valor
function campo(id, valor) {
  return id + String(valor.length).padStart(2, "0") + valor;
}

// Tira acentos e símbolos (o padrão do PIX só aceita letras simples)
function semAcento(texto, limite) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, limite);
}

// "Dígito verificador" do código (CRC16), que o banco usa para conferir se está tudo certo
function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function gerarCodigoPix({ chave, nome, cidade, valor, descricao = "" }) {
  const conta =
    campo("00", "br.gov.bcb.pix") +
    campo("01", chave.trim()) +
    (descricao ? campo("02", semAcento(descricao, 40)) : "");

  const codigo =
    campo("00", "01") +                       // versão do padrão
    campo("26", conta) +                      // a chave PIX do casal
    campo("52", "0000") +                     // categoria (padrão para pessoa física)
    campo("53", "986") +                      // moeda: Real
    campo("54", valor.toFixed(2)) +           // valor
    campo("58", "BR") +                       // país
    campo("59", semAcento(nome, 25)) +        // nome de quem recebe
    campo("60", semAcento(cidade, 15)) +      // cidade de quem recebe
    campo("62", campo("05", "***")) +         // identificador (*** = sem identificador)
    "6304";                                   // começo do dígito verificador

  return codigo + crc16(codigo);
}

function pixConfigurado() {
  const p = CONTA.pix;
  return Boolean(p.chave.trim() && p.nome.trim() && p.cidade.trim());
}
