function scoreColor(score: number): string {
  if (score >= 70) return 'var(--accent)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export function ScoreGauge({ score }: { score: number }) {
  const radius = 60
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div className="score-gauge">
      <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="#000000"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))' }}
        />
      </svg>
      <div className="score-gauge-value" style={{ color }}>
        <span className="score-gauge-number">{score}</span>
        <span className="score-gauge-percent">%</span>
      </div>
    </div>
  )
}
