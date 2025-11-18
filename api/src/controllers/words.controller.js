// src/controllers/words.controller.js
import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";
import path from "path";

/**
 * Controller OTIMIZADO:
 * - Caminho correto para whitelists em src/data
 * - Geração otimizada com filtros inteligentes
 * - Estratégia IA → Whitelist → Fallback
 */

/* fallback simples (mantê-los como backup) */
const FALLBACK = {
  1: ["pato", "bola", "gato", "vovo", "fita", "mala"],
  2: ["caneta", "camisa", "futebol", "pipoca", "parque", "doce"],
  3: ["brinquedo", "amarelo", "janela", "desenho", "caderno", "parquinho"],
};

// monta prompt (pequenas diferenças por nível)
function buildPrompt(level = 1, amount = 50) {
  if (level === 1) {
    return `
Gere ${amount} palavras em português para crianças que estão começando a ler.
Regras:
- APENAS palavras muito simples(2 a 4 letras)
- Preferencia por 1 silaba(até 2 silabas se for palavras bem simples)
- no máximo 1 sílaba difícil
- Evitar dígrafos e combinações raras (evitar "nh", "lh"," ch", rr, ss, "gu" seguido de e/i).
- Evitar nomes próprios, termos técnicos e estrangeirismos.
- Sem acentos obrigatórios, mas pode incluir "mãe", "avó" se for muito comum.
- Não gere palavras no plural e aumentativo /diminutivo
- Não repita palavras.
- retorno APENAS em JSON puro, no formato:
{ "words": ["pai", "mae", ...] }
`;
  }
  if (level === 2) {
    return `
Gere ${amount} palavras em português para crianças nível 2.
Regras:
- Palavras com 2 ou 3 sílabas
- De preferência por sílabas simples (ex.: ca, co, ta, te, ba, be, entre outras, mas não se restrinja só a elas). 
 -Evitar encontros consonantais complexos.
- Evitar nomes próprios, gírias e termos técnicos.
- Preferência por termos do universo infantil (brinquedo, escola, comida simples).
- Não repita palavras.
- retorno APENAS em JSON puro, no formato:
{ "words": ["cachorro", "mesa", ...] }
`;
  }
  // level 3+
  return `
Gere ${amount} palavras em português para crianças nível 3.
Regras:
- Palavras de 3 a 5 sílabas.
- Palavras relacionadas ao universo infantil (brinquedos, lugares, ações, objetos), ou muito comuns no cotidiano.
- Evitar nomes próprios, termos técnicos, palavras impróprias, muito regionais ou arcaicas.
- Não repita palavras.
- Retorno EXCLUSIVAMENTE em JSON válido, formato:
{ "words": ["brinquedo","janela","amigo", ...] }
`;
}

// converte number -> enum string usada por Activity.level no DB
function normalizeLevelEnum(levelNum) {
  switch (Number(levelNum)) {
    case 1:
      return "INICIAL";
    case 2:
      return "BASICO";
    case 3:
      return "INTERMEDIARIO";
    case 4:
      return "AVANCADO";
    default:
      return "INICIAL";
  }
}

// tenta parsear JSON da resposta do OpenAI
function parseOpenAiWords(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p.words)) return p.words.map(String);
  } catch (e) {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        const p2 = JSON.parse(m[0]);
        if (Array.isArray(p2.words)) return p2.words.map(String);
      } catch (err) {
        // segue pra heurística
      }
    }
  }

  const maybe = raw
    .split(/[\n,]+/)
    .map((s) => s.replace(/[^a-zA-ZÀ-ú\sçãõáéíóúâêîôûü-]/gi, "").trim())
    .filter(Boolean)
    .slice(0, 50);
  return maybe;
}

/* ---------------------------
   Whitelist helper - SOMENTE por nível (VERSÃO CORRIGIDA)
--------------------------- */
async function loadWhitelistForLevel(levelNum) {
  try {
    // ✅ CORREÇÃO: Usar path.resolve para caminhos confiáveis
    const basePath = path.resolve(process.cwd(), 'src', 'data');
    
    const perLevelMap = {
      1: path.join(basePath, "whitelist_level1.txt"),
      2: path.join(basePath, "whitelist_level2.txt"),
      3: path.join(basePath, "whitelist_level3.txt"),
    };

    console.log(`🔍 Procurando whitelist para nível ${levelNum} em: ${basePath}`);
   
    const file = perLevelMap[levelNum];
    if (!file) {
      console.warn(`⚠️ Nenhuma whitelist definida para nível ${levelNum}`);
      return [];
    }

    try {
      const raw = await fs.readFile(file, "utf-8");
      const words = raw.split(/\r?\n/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      
      console.log(`✅ Whitelist nível ${levelNum} carregada: ${words.length} palavras de: ${file}`);
      return words;
       
    } catch (err) {
      console.warn(`❌ Whitelist nível ${levelNum} não encontrada: ${file}`);
      console.warn(` Erro detalhado: ${err.message}`);
      return [];
    }
   
  } catch (err) {
    console.error("❌ Erro crítico ao carregar whitelist:", err);
    return [];
  }
}

// ===== FUNÇÕES AUXILIARES OTIMIZADAS =====

/** Busca palavras já feitas pelo usuário */
async function getUserDoneWords(userId) {
  try {
    const doneList = await prisma.userGeneratedWord.findMany({
      where: { userId },
      include: {
        generatedWord: {
          select: { word: true }
        }
      }
    });
   
    const doneWords = new Set();
    doneList.forEach(item => doneWords.add(item.generatedWord.word.toLowerCase()));
   
    console.log(`📊 Usuário já fez ${doneWords.size} palavras`);
    return doneWords;
  } catch (err) {
    console.warn("Erro ao buscar palavras do usuário:", err?.message);
    return new Set();
  }
}

/** Busca palavras da OpenAI com tratamento de erro */
async function fetchOpenAIWords(prompt, apiKey) {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um gerador de palavras infantis." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const json = await resp.json();
    const raw = json?.choices?.[0]?.message?.content ?? "";
    return parseOpenAiWords(raw);
  } catch (err) {
    console.error("❌ Erro na requisição OpenAI:", err);
    return [];
  }
}

/** Salva palavras no banco de forma otimizada */
async function saveWordsToDatabase(words, levelNum, userId, source) {
  for (const word of words) {
    try {
      // Upsert na GeneratedWord
      const gw = await prisma.generatedWord.upsert({
        where: {
          word_level: {
            word: word,
            level: levelNum
          }
        },
        create: {
          word: word,
          level: levelNum,
          times: 1,
          source: source,
        },
        update: {
          times: { increment: 1 }
        }
      });

      // Vincular ao usuário se logado
      if (userId) {
        await prisma.userGeneratedWord.upsert({
          where: {
            userId_generatedWordId: {
              userId: userId,
              generatedWordId: gw.id
            }
          },
          create: {
            userId: userId,
            generatedWordId: gw.id,
            times: 1
          },
          update: {
            times: { increment: 1 }
          }
        });
      }
    } catch (err) {
      console.warn(`⚠️ Erro ao salvar palavra "${word}":`, err?.message);
    }
  }
}

/** Garante que as Activities existam */
async function ensureActivitiesExist(words, levelNum) {
  const enumLevel = normalizeLevelEnum(levelNum);
 
  for (const word of words) {
    try {
      const existing = await prisma.activity.findFirst({
        where: { title: word, level: enumLevel },
      });
     
      if (!existing) {
        await prisma.activity.create({
          data: {
            title: word,
            description: `Atividade auto-gerada para "${word}"`,
            level: enumLevel,
          },
        });
      }
    } catch (err) {
      console.warn(`Erro ao garantir Activity para "${word}":`, err?.message);
    }
  }
}

/* GERA palavras (GET /api/words?level=1) - VERSÃO OTIMIZADA */
export async function generateWords(req, res) {
  const levelNum = Number(req.query.level) || 1;
  const userId = req.user?.id || req.user?.sub || null;

  const REQUEST_AMOUNT = 20;
  const PICK_AMOUNT = 6;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  try {
    console.log(`🎯 Gerando palavras para nível ${levelNum}, usuário: ${userId}`);
    
    // ✅ DEBUG: Informações do diretório
    console.log(`📍 Diretório atual: ${process.cwd()}`);
    console.log(`📍 __dirname equivalente: ${path.resolve()}`);
    console.log(`📍 Tentando acessar: ${path.resolve(process.cwd(), 'src', 'data')}`);

    // 1) Carregar whitelist e palavras do usuário em paralelo
    const [whitelist, allUserDoneWords] = await Promise.all([
      loadWhitelistForLevel(levelNum),
      userId ? getUserDoneWords(userId) : Promise.resolve(new Set())
    ]);

    const whitelistSet = new Set(whitelist);
    console.log(`📋 Whitelist nível ${levelNum}: ${whitelistSet.size} palavras`);

    // 2) Pedir à OpenAI (ou fallback)
    let words = [];
    let source = "fallback";

    if (!OPENAI_API_KEY) {
      words = FALLBACK[levelNum] ?? FALLBACK[1];
      console.log("OpenAI key not set — usando fallback");
    } else {
      const prompt = buildPrompt(levelNum, REQUEST_AMOUNT);
      const openAiWords = await fetchOpenAIWords(prompt, OPENAI_API_KEY);
     
      if (openAiWords.length > 0) {
        words = openAiWords;
        source = "openai";
        console.log(`🤖 OpenAI retornou ${words.length} palavras`);
      } else {
        words = FALLBACK[levelNum] ?? FALLBACK[1];
        console.warn("OpenAI falhou — usando fallback");
      }
    }

    // 3) Processar candidatas: normalizar, remover duplicatas
    const normalizedWords = words
      .map(w => String(w).trim().toLowerCase())
      .filter(w => w.length > 0);

    const uniqueWords = [...new Set(normalizedWords)];
    console.log(`🔄 ${uniqueWords.length} palavras únicas após normalização`);

    // 4) FILTRAGEM INTELIGENTE - Sua estratégia!
    const filteredCandidates = uniqueWords.filter(word => {
      // A - Remover palavras que usuário JÁ FEZ
      if (allUserDoneWords.has(word)) {
        return false;
      }
     
      // B - PRIORIZAR palavras na whitelist (se whitelist existir)
      if (whitelistSet.size > 0 && !whitelistSet.has(word)) {
        return false;
      }
     
      return true;
    });

    console.log(`🎯 ${filteredCandidates.length} palavras após filtros (whitelist + usuário)`);

    // 5) Selecionar palavras finais com estratégia inteligente
    let finalWords = [];

    // Primeiro: palavras filtradas da IA (máx 6)
    finalWords = filteredCandidates.slice(0, PICK_AMOUNT);

    // Segundo: se faltarem, buscar da whitelist (que usuário não fez)
    if (finalWords.length < PICK_AMOUNT && whitelistSet.size > 0) {
      const availableWhitelist = Array.from(whitelistSet)
        .filter(word => !allUserDoneWords.has(word) && !finalWords.includes(word))
        .slice(0, PICK_AMOUNT - finalWords.length);
     
      finalWords = [...finalWords, ...availableWhitelist];
      console.log(`➕ Adicionadas ${availableWhitelist.length} palavras da whitelist`);
    }

    // Terceiro: se ainda faltarem, usar fallback (que usuário não fez)
    if (finalWords.length < PICK_AMOUNT) {
      const fallbackWords = (FALLBACK[levelNum] ?? FALLBACK[1])
        .map(w => w.toLowerCase())
        .filter(word => !allUserDoneWords.has(word) && !finalWords.includes(word))
        .slice(0, PICK_AMOUNT - finalWords.length);
     
      finalWords = [...finalWords, ...fallbackWords];
      console.log(`🆘 Adicionadas ${fallbackWords.length} palavras do fallback`);
    }

    // Último recurso: permitir repetição se necessário
    if (finalWords.length < PICK_AMOUNT) {
      const allPossible = [...uniqueWords, ...Array.from(whitelistSet), ...(FALLBACK[levelNum] ?? [])];
      const remaining = allPossible
        .map(w => w.toLowerCase())
        .filter(word => !finalWords.includes(word))
        .slice(0, PICK_AMOUNT - finalWords.length);
     
      finalWords = [...finalWords, ...remaining];
      console.log(`⚡ Completando com ${remaining.length} palavras disponíveis`);
    }

    // 6) Salvar no banco apenas as palavras selecionadas
    await saveWordsToDatabase(finalWords, levelNum, userId, source);

    // 7) Garantir Activities
    await ensureActivitiesExist(finalWords, levelNum);

    const response = {
      level: levelNum,
      words: finalWords,
      meta: {
        totalGenerated: uniqueWords.length,
        afterFilters: filteredCandidates.length,
        finalCount: finalWords.length,
        source: source,
        hasWhitelist: whitelistSet.size > 0,
        userWordsExcluded: allUserDoneWords.size
      },
    };

    console.log(`✅ Entregando ${finalWords.length} palavras para nível ${levelNum}`);
    return res.json(response);

  } catch (err) {
    console.error("❌ Erro ao gerar palavras:", err);
    return res.json({
      level: levelNum,
      words: FALLBACK[levelNum] ?? FALLBACK[1],
      source: "error-fallback",
    });
  }
}

/* lista palavras salvas/history do usuário por nível */
export async function listSavedWords(req, res) {
  const userId = req.user?.id || req.user?.sub;
  const levelNum = req.query.level ? Number(req.query.level) : undefined;

  if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

  try {
    console.log(`🔍 Buscando palavras salvas para usuário: ${userId}, nível: ${levelNum}`);
   
    const where = { userId: userId };
   
    if (levelNum !== undefined && !Number.isNaN(levelNum)) {
      where.generatedWord = { level: levelNum };
    }

    const userWords = await prisma.userGeneratedWord.findMany({
      where: where,
      include: { generatedWord: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Encontradas ${userWords.length} palavras salvas para o usuário`);

    const formattedWords = userWords.map(item => ({
      id: item.id,
      word: item.generatedWord.word,
      level: item.generatedWord.level,
      times: item.times,
      createdAt: item.createdAt,
      source: item.generatedWord.source,
      userGeneratedWordId: item.id,
      generatedWordId: item.generatedWordId
    }));

    return res.json({
      success: true,
      words: formattedWords
    });

  } catch (err) {
    console.error("❌ ERRO listSavedWords:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar palavras salvas.",
      error: err.message
    });
  }
}

// 🔍 DEBUG: Função para verificar o que está no banco
export async function debugUserWords(req, res) {
  const userId = req.user?.id || req.user?.sub;
 
  if (!userId) return res.status(401).json({ message: "Não autenticado" });

  try {
    console.log(`🔍 DEBUG: Buscando dados para usuário: ${userId}`);
   
    const userWords = await prisma.userGeneratedWord.findMany({
      where: { userId },
      include: { generatedWord: true },
      orderBy: { createdAt: "desc" }
    });

    const allGeneratedWords = await prisma.generatedWord.findMany({
      where: { level: 1 },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      userInfo: {
        userId,
        totalUserWords: userWords.length
      },
      userWords: userWords.map(uw => ({
        id: uw.id,
        userId: uw.userId,
        generatedWordId: uw.generatedWordId,
        times: uw.times,
        createdAt: uw.createdAt,
        word: uw.generatedWord?.word || 'N/A',
        level: uw.generatedWord?.level || 'N/A',
        source: uw.generatedWord?.source || 'N/A'
      })),
      allGeneratedWords: allGeneratedWords.map(gw => ({
        id: gw.id,
        word: gw.word,
        level: gw.level,
        times: gw.times,
        source: gw.source,
        createdAt: gw.createdAt
      })),
      counts: {
        userWordsCount: userWords.length,
        allGeneratedWordsCount: allGeneratedWords.length
      },
      message: userWords.length === 0
        ? "⚠️ Nenhuma palavra encontrada para este usuário"
        : "✅ Palavras encontradas para o usuário"
    });
  } catch (err) {
    console.error("❌ ERRO debugUserWords:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}