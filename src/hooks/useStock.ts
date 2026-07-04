import { useQuery } from '@tanstack/react-query'
import { fetchStock, fetchForecast, fetchTarget, fetchKeyLevels, fetchSentiment, fetchSynthesis, fetchNews } from '@/services/api'

export function useStock(ticker = 'BBCA') {
  return useQuery({ queryKey: ['stock', ticker], queryFn: () => fetchStock(ticker), staleTime: 30_000 })
}

export function useForecast(ticker = 'BBCA', range = '3M') {
  return useQuery({ queryKey: ['forecast', ticker, range], queryFn: () => fetchForecast(ticker, range), staleTime: 60_000 })
}

export function useTarget(ticker = 'BBCA') {
  return useQuery({ queryKey: ['target', ticker], queryFn: () => fetchTarget(ticker), staleTime: 60_000 })
}

export function useKeyLevels(ticker = 'BBCA') {
  return useQuery({ queryKey: ['keylevels', ticker], queryFn: () => fetchKeyLevels(ticker), staleTime: 60_000 })
}

export function useSentiment(ticker = 'BBCA') {
  return useQuery({ queryKey: ['sentiment', ticker], queryFn: () => fetchSentiment(ticker), staleTime: 30_000 })
}

export function useSynthesis(ticker = 'BBCA') {
  return useQuery({ queryKey: ['synthesis', ticker], queryFn: () => fetchSynthesis(ticker), staleTime: 60_000 })
}

export function useNews(ticker = 'BBCA') {
  return useQuery({ queryKey: ['news', ticker], queryFn: () => fetchNews(ticker), staleTime: 15_000 })
}
