import { useSynthesis } from '@/hooks/useStock'

interface Props { ticker: string }

export function SynthesisCard({ ticker }: Props) {
  const { data } = useSynthesis(ticker)

  return (
    <section className="card panel-card synth-card">
      <div className="card-title">{data?.title ?? 'AI Synthesis'}</div>
      <div className="synth-scroll">
        {data?.paragraphs.map((p, i) => (
          <p key={i} className="synth-para">{p}</p>
        ))}
      </div>
    </section>
  )
}
