import { useState } from 'react'

/**
 * SVG flags from flagcdn.com (the open-source `flag-icons` set, MIT). Emoji flags
 * don't render on Windows, so we use images with a small globe glyph as fallback.
 * Pass a slide-scoped className for styling (e.g. `earth__flagimg`).
 */
export default function Flag({ a2, size = 20, className = '' }) {
  const code = a2 && a2 !== '-99' ? a2.toLowerCase() : null
  const [broken, setBroken] = useState(false)
  if (!code || broken) {
    return (
      <span className={`${className} ${className}--none`} style={{ width: size * 1.33, height: size }} aria-hidden>
        ◍
      </span>
    )
  }
  return (
    <img
      className={className}
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      width={size * 1.33}
      height={size}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
    />
  )
}
