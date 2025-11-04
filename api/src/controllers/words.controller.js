// src/controllers/words.controller.js
// gera lista de palavras de acordo com o nível

// se você já tem esse helper, pode importar do teu env:
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildPrompt(level = 1) {
  // vamos gerar só palavras em pt-BR, simples, para crianças
  if (level === 1) {
    return `
Gere 6 palavras em português para crianças que estão começando a ler.
Regras:
- somente palavras bem curtas (2 a 4 letras)
- no máximo 1 sílaba difícil
- sem acentos se puder, mas pode ter "mãe", "avó" se for muito comum
- retorno APENAS em JSON puro, no formato:
{ "words": ["pai", "mãe", "casa", "bola", "uva", "pato"] }
`;
  }

  if (level === 2) {
    return `
Gere 6 palavras em português para crianças em nível intermediário.
Regras:
- palavras de 4 a 6 letras
- sílabas simples (CA, CO, TA, TE, BA, etc)
- nada de palavras muito adultas
- retorno APENAS em JSON puro, no formato:
{ "words": ["cachorro", "mesa", "caneta", "copo", "festa", "praia"] }
`;
  }

  // level 3
  return `
Gere 6 palavras em português para crianças um pouco mais avançadas.
Regras:
- palavras de 5 a 9 letras
- ainda do universo infantil (brinquedo, piscina, janela, amigo, desenho)
- evitar nomes próprios
- retorno APENAS em JSON puro, no formato:
{ "words": ["brinquedo", "piscina", "janela", "desenho", "macarrão", "amarelo"] }
`;
}

// fallback caso não tenha IA
const FALLBACK = {
  1: ["pato", "bola", "gato", "vovó", "fita", "mala"],
  2: ["caneta", "camisa", "futebol", "pipoca", "parque", "doce"],
  3: ["brinquedo", "amarelo", "janela", "desenho", "caderno", "parquinho"],
};

export async function generateWords(req, res) {
  const level = Number(req.query.level) || 1;

  // se não tiver chave, devolve fallback e pronto
  if (!OPENAI_API_KEY) {
    return res.json({
      level,
      words: FALLBACK[level] ?? FALLBACK[1],
      source: "fallback",
    });
  }

  try {
    const prompt = buildPrompt(level);

    // Node 22 já tem fetch, então dá pra fazer direto
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // coloque o modelo que você usa aí
        messages: [
          { role: "system", content: "Você é um gerador de palavras infantis." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const json = await resp.json();

    // isso depende do formato da tua conta, mas normalmente vem aqui:
    const raw = json?.choices?.[0]?.message?.content ?? "";

    // vamos tentar fazer parse do JSON que pedimos
    let words = [];
    try {
      const parsed = JSON.parse(raw);
      words = Array.isArray(parsed.words) ? parsed.words : [];
    } catch (e) {
      // se não veio JSON puro, tenta quebrar na marra
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed2 = JSON.parse(m[0]);
        words = Array.isArray(parsed2.words) ? parsed2.words : [];
      }
    }

    // se mesmo assim não vier nada, usa fallback
    if (!words.length) {
      words = FALLBACK[level] ?? FALLBACK[1];
    }

    return res.json({
      level,
      words,
      source: "openai",
    });
  } catch (err) {
    console.error("Erro ao gerar palavras dinâmicas:", err);
    return res.json({
      level,
      words: FALLBACK[level] ?? FALLBACK[1],
      source: "error-fallback",
    });
  }
}