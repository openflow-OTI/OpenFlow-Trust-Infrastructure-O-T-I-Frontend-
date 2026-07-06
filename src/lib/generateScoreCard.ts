import type { ScoreMetadata } from './types'
import type { components } from '@/api/schema.gen'

type SignalBreakdown = components['schemas']['SignalBreakdown']

const SIGNAL_LABELS: Record<string, string> = {
  walletAge: 'Wallet Age',
  transactionCount: 'Transaction Count',
  tokenHoldingBehavior: 'Token Holding Behavior',
  smartContractInteractions: 'Smart Contract Interactions',
  transactionTimingPatterns: 'Transaction Timing Patterns',
}

function scoreColor(v: number): string {
  if (v >= 70) return '#00E5A0'
  if (v >= 40) return '#ffb020'
  return '#ff4d5e'
}

function fmt(v: number): string {
  return v.toLocaleString()
}

function getMetaLabel(key: string, metadata: ScoreMetadata): string {
  switch (key) {
    case 'walletAge':
      return `${fmt(metadata.walletAgedays)} days`
    case 'transactionCount':
      return `${fmt(metadata.txCount)} transactions`
    case 'tokenHoldingBehavior':
      return `${fmt(metadata.uniqueTokens)} unique tokens`
    case 'smartContractInteractions':
      return `${fmt(metadata.contractInteractions)} smart-contract transactions`
    case 'transactionTimingPatterns':
      return `${fmt(metadata.internalTxCount)} internal transactions`
    default:
      return ''
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function generateScoreCard(params: {
  score: number
  signals: SignalBreakdown
  metadata?: ScoreMetadata
  chain: string
  wallet: string
}): Promise<void> {
  const { score, signals, metadata, chain, wallet } = params

  await document.fonts.ready
  const logoImg = await loadImage('/logo.svg')

  const W = 640
  const H = 800
  const PAD = 40

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  // Border
  ctx.strokeStyle = '#1e1e1e'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)

  // --- Header: logo + brand ---
  const LOGO_SIZE = 40
  const LOGO_X = PAD - 8
  const LOGO_Y = 18
  ctx.drawImage(logoImg, LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#00E5A0'
  ctx.font = 'bold 20px "JetBrains Mono", monospace'
  ctx.fillText('OTI', 104, 50)

  ctx.fillStyle = '#8a9994'
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.fillText('OpenFlow Trust Infrastructure', 104, 68)

  // Header separator
  ctx.strokeStyle = '#1e1e1e'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 90)
  ctx.lineTo(W - PAD, 90)
  ctx.stroke()

  // Chain name
  ctx.fillStyle = '#00E5A0'
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(chain.toUpperCase(), W / 2, 112)

  // Wallet address truncated
  const truncated =
    wallet.length > 14
      ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
      : wallet
  ctx.fillStyle = '#eafff4'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.fillText(truncated, W / 2, 134)

  // --- Score ring ---
  const ringCx = W / 2
  const ringCy = 258
  const ringR = 82
  const ringLW = 14

  ctx.beginPath()
  ctx.arc(ringCx, ringCy, ringR, 0, 2 * Math.PI)
  ctx.strokeStyle = '#1e1e1e'
  ctx.lineWidth = ringLW
  ctx.stroke()

  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (score / 100) * 2 * Math.PI
  ctx.beginPath()
  ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle)
  ctx.strokeStyle = scoreColor(score)
  ctx.lineWidth = ringLW
  ctx.lineCap = 'round'
  ctx.stroke()

  // Score text: number + %
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = scoreColor(score)
  ctx.font = 'bold 44px "JetBrains Mono", monospace'
  ctx.fillText(`${score}%`, ringCx, ringCy - 4)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#8a9994'
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.fillText('Trust Score', ringCx, ringCy + 54)

  // Divider below ring
  ctx.strokeStyle = '#1e1e1e'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 358)
  ctx.lineTo(W - PAD, 358)
  ctx.stroke()

  // --- Signal bars ---
  const barX = PAD
  const barW = W - PAD * 2
  const barH = 5
  const barR = 2.5

  const signalKeys = Object.keys(signals) as (keyof SignalBreakdown)[]
  let sigY = 382

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  for (const key of signalKeys) {
    const value = signals[key] as number
    const color = scoreColor(value)
    const label = SIGNAL_LABELS[key] ?? String(key)
    const meta = metadata ? getMetaLabel(key, metadata) : ''

    // Signal label
    ctx.fillStyle = '#8a9994'
    ctx.font = '10.5px "JetBrains Mono", monospace'
    ctx.textAlign = 'left'
    ctx.fillText(label, barX, sigY)

    // Signal value (right-aligned)
    ctx.fillStyle = color
    ctx.font = 'bold 10.5px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(String(value), W - barX, sigY)

    // Metadata label
    if (meta) {
      ctx.textAlign = 'left'
      ctx.fillStyle = '#00E5A0'
      ctx.font = '9.5px "JetBrains Mono", monospace'
      ctx.globalAlpha = 0.8
      ctx.fillText(meta, barX, sigY + 14)
      ctx.globalAlpha = 1
    }

    // Track
    const trackY = sigY + 22
    ctx.fillStyle = '#101010'
    roundedRect(ctx, barX, trackY, barW, barH, barR)
    ctx.fill()

    // Fill
    const fillW = Math.max(barR * 2, (value / 100) * barW)
    ctx.fillStyle = color
    roundedRect(ctx, barX, trackY, fillW, barH, barR)
    ctx.fill()

    sigY += 65
  }

  // Footer
  ctx.fillStyle = '#8a9994'
  ctx.font = '9px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('openflowlabs.io · OTI Trust Score', W / 2, H - 18)

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oti-${chain}-${wallet.slice(0, 8)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
