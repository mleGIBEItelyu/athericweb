import { getDummyStock, getDummyForecast, getDummyTarget, getDummyKeyLevels, getDummySentiment, getDummySynthesis, getDummyNews, RANKING_HIGHLIGHTS, RANKING_ROWS, INDICES } from '@/data/dummy'
import type { Stock, ForecastData, TargetData, SentimentItem, SynthesisData, NewsItem, KeyLevel, RankingHighlight, RankingRow, IndexData } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// When VITE_API_URL is set, these functions will fetch from backend instead
export async function fetchStock(ticker: string): Promise<Stock> {
  if (!BASE_URL) return getDummyStock(ticker)
  const res = await fetch(`${BASE_URL}/api/stock/${ticker}`)
  return res.json()
}

export async function fetchForecast(ticker: string, range: string): Promise<ForecastData> {
  if (!BASE_URL) return getDummyForecast(ticker, range)
  const res = await fetch(`${BASE_URL}/api/forecast/${ticker}?range=${range}`)
  return res.json()
}

export async function fetchTarget(ticker: string): Promise<TargetData> {
  if (!BASE_URL) return getDummyTarget(ticker)
  const res = await fetch(`${BASE_URL}/api/target/${ticker}`)
  return res.json()
}

export async function fetchKeyLevels(ticker: string): Promise<KeyLevel[]> {
  if (!BASE_URL) return getDummyKeyLevels(ticker)
  const res = await fetch(`${BASE_URL}/api/keylevels/${ticker}`)
  return res.json()
}

export async function fetchSentiment(ticker: string): Promise<SentimentItem[]> {
  if (!BASE_URL) return getDummySentiment(ticker)
  const res = await fetch(`${BASE_URL}/api/sentiment/${ticker}`)
  return res.json()
}

export async function fetchSynthesis(ticker: string): Promise<SynthesisData> {
  if (!BASE_URL) return getDummySynthesis(ticker)
  const res = await fetch(`${BASE_URL}/api/synthesis/${ticker}`)
  return res.json()
}

export async function fetchNews(ticker: string): Promise<NewsItem[]> {
  if (!BASE_URL) return getDummyNews(ticker)
  const res = await fetch(`${BASE_URL}/api/news/${ticker}`)
  return res.json()
}

export async function fetchIndices(): Promise<IndexData[]> {
  if (!BASE_URL) return INDICES
  const res = await fetch(`${BASE_URL}/api/indices`)
  return res.json()
}

export async function fetchRankingHighlights(): Promise<RankingHighlight[]> {
  if (!BASE_URL) return RANKING_HIGHLIGHTS
  const res = await fetch(`${BASE_URL}/api/ranking/highlights`)
  return res.json()
}

export async function fetchRankingRows(): Promise<RankingRow[]> {
  if (!BASE_URL) return RANKING_ROWS
  const res = await fetch(`${BASE_URL}/api/ranking/rows`)
  return res.json()
}
