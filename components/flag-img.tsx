'use client'

export default function FlagImg({
  url,
  name,
  size = 40,
}: {
  url: string | null | undefined
  name?: string
  size?: number
}) {
  if (!url) return <span style={{ fontSize: size * 0.6 }}>🏳️</span>

  return (
    <img
      src={url}
      alt={name ?? ''}
      width={size}
      height={size * 0.67}
      className="object-cover rounded-sm shadow-sm"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
