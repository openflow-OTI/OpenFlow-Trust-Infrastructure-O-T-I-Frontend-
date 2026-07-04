function buildSpiralPath(): string {
  const cx = 50
  const cy = 50
  const turns = 2.05
  const startAngleDeg = -75
  const rStart = 41
  const rEnd = 6
  const samples = 200

  const points: Array<[number, number]> = []

  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const angle = ((startAngleDeg + t * turns * 360) * Math.PI) / 180
    const r = rStart * Math.pow(rEnd / rStart, t)
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    points.push([x, y])
  }

  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
}

const SPIRAL_PATH = buildSpiralPath()

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 36, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="OpenFlow Labs logo"
    >
      <path
        d={SPIRAL_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
