import { useParams } from 'react-router-dom'
import { StockHeader } from '@/components/dashboard/StockHeader'
import { ForecastCard } from '@/components/dashboard/ForecastCard'
import { TargetCard } from '@/components/dashboard/TargetCard'
import { SentimentCard } from '@/components/dashboard/SentimentCard'
import { SynthesisCard } from '@/components/dashboard/SynthesisCard'
import { NewsFeed } from '@/components/dashboard/NewsFeed'

export function Dashboard() {
  const { ticker = 'BBCA' } = useParams<{ ticker?: string }>()
  const upperTicker = ticker.toUpperCase()

  return (
    <div className="content">
      <StockHeader ticker={upperTicker} />
      <div className="dash-grid">
        <div className="dash-col"><ForecastCard ticker={upperTicker} /></div>
        <div className="dash-col">
          <TargetCard ticker={upperTicker} />
          <SentimentCard ticker={upperTicker} />
        </div>
        <div className="dash-bottom">
          <SynthesisCard ticker={upperTicker} />
          <NewsFeed ticker={upperTicker} />
        </div>
      </div>
    </div>
  )
}
