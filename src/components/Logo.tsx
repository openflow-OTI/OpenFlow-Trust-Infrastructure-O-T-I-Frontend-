interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 34, className }: LogoProps) {
  return (
    <img
      src="/logo.jpg"
      alt="OTI logo"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    />
  )
}
