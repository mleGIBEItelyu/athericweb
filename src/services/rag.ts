/**
 * rag.ts — Retrieval-Augmented Generation core service
 *
 * Flow:
 *  1. Retriever: ambil data relevan dari dummy.ts (knowledge base)
 *  2. Prompt Builder: susun context string terstruktur
 *  3. Gemini API: generate analisis / jawaban berbasis context
 */

import {
  getDummyStock,
  getDummyForecast,
  getDummyTarget,
  getDummySentiment,
  getDummyNews,
  RANKING_ROWS,
  RANKING_HIGHLIGHTS,
  INDICES,
} from '@/data/dummy'

// ─── Gemini API Config ────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

export const hasGeminiKey = () => Boolean(GEMINI_API_KEY)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: { text: string }[]
}

interface GeminiRequest {
  systemInstruction?: { parts: { text: string }[] }
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

// ─── Retriever: Build Context Strings ─────────────────────────────────────────

/**
 * Retrieve data saham — versi SLIM untuk hemat token (~120 token per saham).
 */
export function buildStockContext(ticker: string): string {
  const clean = ticker.toUpperCase()
  const stock = getDummyStock(clean)
  const target = getDummyTarget(clean)
  const sentiments = getDummySentiment(clean)
  const news = getDummyNews(clean)
  const rankRow = RANKING_ROWS.find(r => r.ticker === clean)

  // Hanya berita top 1
  const topNews = news[0] ? `Berita: ${news[0].headline} [${news[0].tone}]` : ''
  // Sentimen ringkas
  const sent = sentiments.map(s => `${s.label}:${s.verdict}(${s.value})`).join(' ')
  // Ranking
  const rank = rankRow ? `Rank:#${rankRow.rank} Skor:${rankRow.score} ${rankRow.rec} Conf:${rankRow.confPct}%` : ''

  return [
    `${clean}|${stock.price}|${stock.change}|${stock.dir === 'up' ? '▲' : '▼'}`,
    stock.ratios.map(r => `${r.label}:${r.value}`).join(' '),
    `Target:${target.price} Rec:${target.rec} Stop:${target.stats[0]?.value} RR:${target.stats[1]?.value} Conf:${target.stats[2]?.value}`,
    sent,
    rank,
    topNews,
  ].filter(Boolean).join('\n')
}

/**
 * Build konteks global: indices, top ranking, semua saham.
 */
export function buildGlobalContext(): string {
  const lines: string[] = [
    `=== KONDISI PASAR GLOBAL & IHSG ===`,
    '',
    `[INDEKS UTAMA]`,
    ...INDICES.map(idx => `${idx.label}: ${idx.value} (${idx.dir === 'up' ? '▲' : '▼'})`),
    '',
    `[TOP RANKING SAHAM (AI Score)]`,
    ...RANKING_HIGHLIGHTS.map(
      r => `#${r.rank} ${r.ticker} (${r.name}) — Skor: ${r.score}, Return: ${r.ret} (${r.dir === 'up' ? '▲' : '▼'})`
    ),
    '',
    `[TABEL RANKING LENGKAP]`,
    ...RANKING_ROWS.map(
      r =>
        `#${r.rank} ${r.ticker} | Skor: ${r.score} | Rec: ${r.rec} | Confidence: ${r.conf} ${r.confPct}% | Cap: ${r.cap}`
    ),
    '',
  ]

  return lines.join('\n')
}

/**
 * Build konteks multi-saham untuk pertanyaan komparasi.
 */
export function buildMultiStockContext(tickers: string[]): string {
  return tickers.map(t => buildStockContext(t)).join('\n\n')
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Kamu analis saham IDX. Jawab HANYA dari data yang diberikan. Bahasa Indonesia. WAJIB max 3 baris. Tidak boleh lebih.

FORMAT WAJIB:
Baris 1: Status + sinyal utama (harga, arah, rekomendasi)
Baris 2: Alasan kunci (1 teknikal + 1 fundamental)
Baris 3: Target / risiko / peringatan - akhiri dengan [bukan saran investasi]

Jika tidak ada data: tulis "Data tidak tersedia" - jangan karang angka.`

// ─── Gemini API Caller ─────────────────────────────────────────────────────────

/**
 * Core function: kirim request ke Gemini API dan return teks response.
 * Throws error jika API key tidak ada atau request gagal.
 */
async function callGemini(
  contents: GeminiContent[],
  temperature = 0.7,
  maxTokens = 200,
  retries = 1
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY tidak ditemukan. Buat file .env.local dengan VITE_GEMINI_API_KEY=...')
  }

  const body: GeminiRequest = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  // Auto-retry sekali jika 429 (rate limit)
  if (res.status === 429 && retries > 0) {
    await new Promise(r => setTimeout(r, 6000))
    return callGemini(contents, temperature, maxTokens, 0)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const msg = err?.error?.message ?? res.statusText
    if (res.status === 429) throw new Error('Quota habis. Coba beberapa menit lagi atau upgrade API key.')
    throw new Error(`Gemini error ${res.status}: ${msg}`)
  }

  const json = await res.json()
  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Gemini tidak mengembalikan respons teks.')
  return text
}

// ─── RAG Functions ─────────────────────────────────────────────────────────────

/**
 * Generate AI Synthesis untuk satu saham.
 * Retrieve data saham → susun konteks → Gemini generate analisis.
 */
export async function generateSynthesis(ticker: string): Promise<string[]> {
  const context = buildStockContext(ticker)

  const prompt = `Tulis synthesis ${ticker.toUpperCase()} — MAX 3 BARIS TOTAL, tidak boleh lebih.

DATA:
${context}

Output: 3 baris saja. Baris 1: sinyal harga & arah. Baris 2: alasan teknikal+fundamental. Baris 3: target+risiko+[bukan saran investasi].`

  const contents: GeminiContent[] = [
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const raw = await callGemini(contents, 0.6, 300)

  // Split response menjadi array paragraf
  const paragraphs = raw
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)

  return paragraphs.length > 0 ? paragraphs : [raw.trim()]
}

/**
 * RAG Chat: jawab pertanyaan user berdasarkan data saham yang relevan.
 * Secara otomatis mendeteksi ticker yang disebut dan memuat konteksnya.
 */
export async function chatWithRAG(
  messages: ChatMessage[],
  activeTicker?: string
): Promise<string> {
  // Deteksi ticker dari pesan terakhir user
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text ?? ''
  const mentionedTickers = detectTickers(lastUserMsg)

  // Bangun konteks berdasarkan ticker yang relevan
  let context = ''
  const tickersToLoad = new Set<string>()

  if (activeTicker) tickersToLoad.add(activeTicker.toUpperCase())
  mentionedTickers.forEach(t => tickersToLoad.add(t))

  if (tickersToLoad.size === 0) {
    // Tidak ada ticker spesifik → gunakan konteks global
    context = buildGlobalContext()
  } else if (tickersToLoad.size === 1) {
    const ticker = [...tickersToLoad][0]
    context = buildStockContext(ticker)
  } else {
    // Multi-ticker: load semua yang disebutkan + global
    context = buildGlobalContext() + '\n\n' + buildMultiStockContext([...tickersToLoad])
  }

  // Susun contents: injek context ke pesan pertama user
  const firstUserIdx = messages.findIndex(m => m.role === 'user')
  const contentsRaw: ChatMessage[] = messages.map((m, i) => {
    if (i === firstUserIdx) {
      return {
        role: 'user',
        text: `[DATA PASAR TERSEDIA UNTUK REFERENSI]\n${context}\n\n[PERTANYAAN USER]\n${m.text}`,
      }
    }
    return m
  })

  const contents: GeminiContent[] = contentsRaw.map(m => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  return callGemini(contents, 0.7, 200)
}

// ─── Helper: Detect Tickers ───────────────────────────────────────────────────

/** Daftar ticker yang dikenal */
const KNOWN_TICKERS = ['BBCA', 'BBRI', 'TLKM', 'ASII', 'GOTO', 'BMRI', 'UNVR', 'ICBP', 'BUKA', 'LQ45', 'IHSG']

/**
 * Deteksi ticker saham yang disebutkan dalam teks query.
 */
export function detectTickers(text: string): string[] {
  const upper = text.toUpperCase()
  const found: string[] = []

  // Cek known tickers
  KNOWN_TICKERS.forEach(ticker => {
    if (upper.includes(ticker)) found.push(ticker)
  })

  // Cek pattern 4-huruf kapital (kemungkinan ticker)
  const matches = upper.match(/\b[A-Z]{4}\b/g) ?? []
  matches.forEach(m => {
    if (!found.includes(m) && !['YANG', 'ATAU', 'JIKA', 'DARI', 'PADA', 'AKAN', 'BISA', 'SAJA'].includes(m)) {
      found.push(m)
    }
  })

  return [...new Set(found)]
}
