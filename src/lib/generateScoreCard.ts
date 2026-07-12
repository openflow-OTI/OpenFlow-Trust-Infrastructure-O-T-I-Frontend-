import type { ScoreMetadata } from './types'
import type { components } from '@/api/schema.gen'
import { getChainInfo } from './chains'

// ── Chain icon SVGs (raw strings → data URLs for canvas) ──────
import bitcoinSvg   from '../assets/chain-icons/bitcoin.svg?raw'
import ethereumSvg  from '../assets/chain-icons/ethereum.svg?raw'
import solanaSvg    from '../assets/chain-icons/solana.svg?raw'
import bscSvg       from '../assets/chain-icons/bsc.svg?raw'
import tronSvg      from '../assets/chain-icons/tron.svg?raw'
import tonSvg       from '../assets/chain-icons/ton.svg?raw'
import avalancheSvg from '../assets/chain-icons/avalanche.svg?raw'
import polygonSvg   from '../assets/chain-icons/polygon.svg?raw'
import arbitrumSvg  from '../assets/chain-icons/arbitrum.svg?raw'
import optimismSvg  from '../assets/chain-icons/optimism.svg?raw'
import baseSvg      from '../assets/chain-icons/base.svg?raw'
import suiSvg       from '../assets/chain-icons/sui.svg?raw'
import sonicSvg     from '../assets/chain-icons/sonic.svg?raw'
import lineaSvg     from '../assets/chain-icons/linea.svg?raw'
import zksyncSvg    from '../assets/chain-icons/zksync.svg?raw'

const CHAIN_SVG_MAP: Record<string, string> = {
  bitcoin:   bitcoinSvg,
  ethereum:  ethereumSvg,
  solana:    solanaSvg,
  bsc:       bscSvg,
  tron:      tronSvg,
  ton:       tonSvg,
  avalanche: avalancheSvg,
  polygon:   polygonSvg,
  arbitrum:  arbitrumSvg,
  optimism:  optimismSvg,
  base:      baseSvg,
  sui:       suiSvg,
  sonic:     sonicSvg,
  linea:     lineaSvg,
  zksync:    zksyncSvg,
}

function svgToDataUrl(svg: string): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

type SignalBreakdown = components['schemas']['SignalBreakdown']

const SIGNAL_LABELS: Record<string, string> = {
  walletAge: 'Wallet Age',
  transactionCount: 'Transaction Count',
  tokenHoldingBehavior: 'Token Holding Behavior',
  smartContractInteractions: 'Smart Contract Interactions',
  transactionTimingPatterns: 'Transaction Timing Patterns',
}

// ── Colour helpers ────────────────────────────────────────────
function scoreTierColor(v: number): string {
  if (v >= 85) return '#00E5A0'
  if (v >= 65) return '#4ade80'
  if (v >= 45) return '#f59e0b'
  if (v >= 25) return '#f97316'
  return '#ff4d5e'
}

function scoreTierLabel(v: number): string {
  if (v >= 85) return 'HIGHLY TRUSTED'
  if (v >= 65) return 'TRUSTED'
  if (v >= 45) return 'CAUTION'
  if (v >= 25) return 'SUSPICIOUS'
  return 'HIGH RISK'
}

function signalBarColor(ratio: number): string {
  const pct = ratio * 100
  if (pct >= 70) return '#00E5A0'
  if (pct >= 40) return '#ffb020'
  return '#ff4d5e'
}

function fmtWeighted(v: number): string {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

function fmt(v: number): string {
  return v.toLocaleString()
}

function getMetaLabel(key: string, metadata: ScoreMetadata): string {
  switch (key) {
    case 'walletAge':
      return `${fmt(metadata.walletAgedays)} days`
    case 'transactionCount':
      return metadata.txCount >= 1000
        ? '1,000+ transactions'
        : `${fmt(metadata.txCount)} transactions`
    case 'tokenHoldingBehavior':
      return `${fmt(metadata.uniqueTokens)} unique tokens`
    case 'smartContractInteractions':
      return `${fmt(metadata.contractInteractions)} smart-contract txns`
    case 'transactionTimingPatterns':
      return `${fmt(metadata.internalTxCount)} internal txns`
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

// ── Panel (rounded rectangle with dark-blue tint) ────────────
function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  borderColor = '#1c2535',
) {
  // fill
  ctx.fillStyle = '#0b0f1a'
  roundedRect(ctx, x, y, w, h, 14)
  ctx.fill()
  // border
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  roundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14)
  ctx.stroke()
}

// ── Main export ───────────────────────────────────────────────
export async function generateScoreCard(params: {
  score: number
  signals: SignalBreakdown
  metadata?: ScoreMetadata
  chain: string
  wallet: string
}): Promise<void> {
  const { score, signals, metadata, chain, wallet } = params
  const chainColor = getChainInfo(chain)?.color ?? '#00E5A0'
  const tierColor = scoreTierColor(score)
  const tierLabel = scoreTierLabel(score)

  await document.fonts.ready
  const logoImg = await loadImage('/logo.svg')

  // Load chain icon (fail silently — layout falls back gracefully)
  let chainIconImg: HTMLImageElement | null = null
  const chainSvgRaw = CHAIN_SVG_MAP[chain]
  if (chainSvgRaw) {
    try { chainIconImg = await loadImage(svgToDataUrl(chainSvgRaw)) } catch { /* ignore */ }
  }

  // ── Canvas setup ─────────────────────────────────────────────
  const W = 640
  const H = 860
  const PAD = 36
  // SCALE=3 → 1920×2580 px — crisp on all Retina/high-DPI screens
  const SCALE = 3

  const canvas = document.createElement('canvas')
  canvas.width  = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // ── Background ───────────────────────────────────────────────
  ctx.fillStyle = '#05080f'
  ctx.fillRect(0, 0, W, H)

  // Outer border
  ctx.strokeStyle = '#1c2535'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)

  // ── Header ───────────────────────────────────────────────────
  const LOGO_SIZE = 38
  ctx.drawImage(logoImg, PAD - 6, 18, LOGO_SIZE, LOGO_SIZE)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#00E5A0'
  ctx.font = 'bold 20px "JetBrains Mono", monospace'
  ctx.fillText('OTI', 100, 44)

  ctx.fillStyle = '#7a8fa8'
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.fillText('OpenFlow Trust Infrastructure', 100, 62)

  // header separator
  ctx.strokeStyle = '#1c2535'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 86)
  ctx.lineTo(W - PAD, 86)
  ctx.stroke()

  // ── Chain icon + wallet ──────────────────────────────────────
  const ICON_SIZE = 32
  if (chainIconImg) {
    ctx.drawImage(chainIconImg, W / 2 - ICON_SIZE / 2, 92, ICON_SIZE, ICON_SIZE)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#7a8fa8'
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.fillText(chain.toUpperCase(), W / 2, chainIconImg ? 140 : 106)

  const truncated =
    wallet.length > 14
      ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
      : wallet
  ctx.fillStyle = '#e8f4ff'
  ctx.font = '13px "JetBrains Mono", monospace'
  ctx.fillText(truncated, W / 2, chainIconImg ? 160 : 128)

  // ── Score panel ──────────────────────────────────────────────
  const scorePanelY = chainIconImg ? 178 : 148
  const scorePanelH = 240
  // tinted border using chain color (mix 22 % chain + 78 % base border)
  // We approximate this by drawing a slightly transparent chainColor stroke
  drawPanel(ctx, PAD, scorePanelY, W - PAD * 2, scorePanelH, '#1c2535')

  // subtle chain-color border overlay (20 % opacity)
  ctx.save()
  ctx.globalAlpha = 0.20
  ctx.strokeStyle = chainColor
  ctx.lineWidth = 1
  roundedRect(ctx, PAD + 0.5, scorePanelY + 0.5, W - PAD * 2 - 1, scorePanelH - 1, 14)
  ctx.stroke()
  ctx.restore()

  // Ring gauge
  const ringCx = W / 2
  const ringCy = scorePanelY + 116
  const ringR  = 78
  const ringLW = 14

  // track
  ctx.beginPath()
  ctx.arc(ringCx, ringCy, ringR, 0, 2 * Math.PI)
  ctx.strokeStyle = '#1c2535'
  ctx.lineWidth = ringLW
  ctx.stroke()

  // fill arc
  const startAngle = -Math.PI / 2
  const endAngle   = startAngle + (score / 100) * 2 * Math.PI
  ctx.beginPath()
  ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle)
  ctx.strokeStyle = chainColor
  ctx.lineWidth   = ringLW
  ctx.lineCap     = 'round'
  ctx.stroke()

  // score number
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = tierColor
  ctx.font         = 'bold 46px "JetBrains Mono", monospace'
  ctx.fillText(`${score}%`, ringCx, ringCy - 2)

  // tier label
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle    = tierColor
  ctx.font         = 'bold 11px "JetBrains Mono", monospace'
  ctx.textAlign    = 'center'
  ctx.fillText(tierLabel, W / 2, scorePanelY + scorePanelH - 22)

  // ── Signals panel ────────────────────────────────────────────
  const signalPanelY = scorePanelY + scorePanelH + 16
  const signalKeys   = Object.keys(signals) as (keyof SignalBreakdown)[]
  const ROW_H        = 58
  const signalPanelH = 36 + signalKeys.length * ROW_H + 4

  drawPanel(ctx, PAD, signalPanelY, W - PAD * 2, signalPanelH)

  // "TRUST SIGNALS" heading
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle    = '#7a8fa8'
  ctx.font         = 'bold 9.5px "JetBrains Mono", monospace'
  ctx.fillText('TRUST SIGNALS', PAD + 16, signalPanelY + 22)

  const barX = PAD + 16
  const barW = W - PAD * 2 - 32
  const barH = 5
  const barRad = 2.5
  let sigY = signalPanelY + 40

  for (const key of signalKeys) {
    const sig = signals[key] as { score: number; weighted: number; maxWeight: number }
    const ratio  = sig.weighted / sig.maxWeight
    const color  = signalBarColor(ratio)
    const label  = SIGNAL_LABELS[key] ?? String(key)
    const valLbl = `${fmtWeighted(sig.weighted)}/${sig.maxWeight}`
    const meta   = metadata ? getMetaLabel(key, metadata) : ''

    // signal label
    ctx.fillStyle    = '#7a8fa8'
    ctx.font         = '10.5px "JetBrains Mono", monospace'
    ctx.textAlign    = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(label, barX, sigY)

    // value right-aligned
    ctx.fillStyle = color
    ctx.font      = 'bold 10.5px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(valLbl, barX + barW, sigY)

    // metadata line
    if (meta) {
      ctx.textAlign    = 'left'
      ctx.fillStyle    = '#00E5A0'
      ctx.font         = '9px "JetBrains Mono", monospace'
      ctx.globalAlpha  = 0.8
      ctx.fillText(meta, barX, sigY + 14)
      ctx.globalAlpha  = 1
    }

    // track
    const trackY = sigY + 22
    ctx.fillStyle = '#0f1520'
    roundedRect(ctx, barX, trackY, barW, barH, barRad)
    ctx.fill()

    // fill
    const fillW = Math.max(barRad * 2, ratio * barW)
    ctx.fillStyle = color
    roundedRect(ctx, barX, trackY, fillW, barH, barRad)
    ctx.fill()

    sigY += ROW_H
  }

  // ── Footer ───────────────────────────────────────────────────
  ctx.strokeStyle = '#1c2535'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(PAD, H - 38)
  ctx.lineTo(W - PAD, H - 38)
  ctx.stroke()

  ctx.fillStyle    = '#7a8fa8'
  ctx.font         = '9px "JetBrains Mono", monospace'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('otiscore.vercel.app · OTI Trust Score', W / 2, H - 18)

  // ── Download ─────────────────────────────────────────────────
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `oti-${chain}-${wallet.slice(0, 8)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
