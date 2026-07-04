export interface NavItem {
  id: string
  label: string
  icon: string
  href: string
}

export interface IndexData {
  label: string
  value: string
  dir: 'up' | 'down'
}

export interface OhlcItem {
  label: string
  value: string
}

export interface RatioItem {
  label: string
  value: string
}

export interface Stock {
  ticker: string
  initial: string
  name: string
  price: string
  change: string
  dir: 'up' | 'down'
  ohlc: OhlcItem[]
  ratios: RatioItem[]
}

export interface VolumeBar {
  v: number
  dir: 'up' | 'down'
}

export interface KeyLevel {
  label: string
  value: string
  tone: 'up' | 'flat' | 'down'
}

export interface ForecastData {
  title: string
  caption: string
  ranges: string[]
  activeRange: string
  yMin: number
  yMax: number
  yTicks: number[]
  xLabels: string[]
  actual: number[]
  forecast: number[]
  ciUpper: number[]
  ciLower: number[]
  volume: VolumeBar[]
}

export interface TargetStat {
  label: string
  value: string
}

export interface TargetData {
  title: string
  price: string
  rec: string
  upside: string
  sliderPct: number
  stats: TargetStat[]
  disclaimer: string
}

export interface SentimentItem {
  label: string
  value: number
  tone: string
  verdict: string
  source: string
}

export interface SynthesisData {
  title: string
  paragraphs: string[]
}

export interface NewsItem {
  headline: string
  source: string
  time: string
  tag: string
  tone: string
}

export interface RankingHighlight {
  ticker: string
  rank: number
  name: string
  score: string
  ret: string
  dir: 'up' | 'down'
}

export interface RankingRow {
  rank: number
  ticker: string
  company: string
  score: string
  ret: string
  dir: 'up' | 'down'
  conf: string
  confPct: number
  rec: string
  cap: string
}

export type Glossary = Record<string, string>
