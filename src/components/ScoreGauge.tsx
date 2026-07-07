interface ScoreGaugeProps {
  score: number
  ringColor?: string
}

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--accent)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export function ScoreGauge({ score, ringColor }: ScoreGaugeProps) {
  const radius = 72
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const offset = circumference - (score / 100) * circumference
  const textColor = scoreColor(score)
  const arcColor = ringColor ?? textColor

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
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="score-gauge-value" style={{ color: textColor }}>
        <span className="score-gauge-number">{score}</span>
        <span className="score-gauge-percent">%</span>
      </div>
    </div>
  )
}
