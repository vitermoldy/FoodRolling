// Icons drawn for this game: filled shapes that match the plate-and-kitchen drawings on the stage.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Svg(props: IconProps) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" {...props} />
}

export function CoinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="13.2" rx="9" ry="8.4" fill="#a8771a" />
      <ellipse cx="12" cy="12" rx="9" ry="8.4" fill="#e3b23c" />
      <ellipse cx="12" cy="12" rx="6.2" ry="5.6" fill="none" stroke="#a8771a" strokeWidth="1.4" />
      <path d="M9.4 9.6h5.2M9.4 12h5.2M9.4 14.4h5.2" stroke="#a8771a" strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  )
}

/** A stack of three plates in tier colours: income grows by price. */
export function IncomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="18" rx="8.5" ry="3.2" fill="#3a7cc2" />
      <ellipse cx="12" cy="14" rx="8.5" ry="3.2" fill="#3f9450" />
      <ellipse cx="12" cy="10" rx="8.5" ry="3.2" fill="#c99317" />
      <ellipse cx="12" cy="9.6" rx="5.6" ry="1.9" fill="#fbf8f1" />
    </Svg>
  )
}

export function SpeedIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="10" y="1.8" width="4" height="2.6" rx="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="8.6" fill="currentColor" />
      <circle cx="12" cy="13.5" r="6.6" fill="#fbf8f1" />
      <path d="M12 13.5 L15.6 9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13.5" r="1.4" fill="currentColor" />
    </Svg>
  )
}

export function ChefIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 13.5c-2.4-.4-3.8-2.4-3.4-4.6.5-2.3 2.8-3.6 5-3 .8-2 2.4-3.1 4.4-3.1s3.6 1.1 4.4 3.1c2.2-.6 4.5.7 5 3 .4 2.2-1 4.2-3.4 4.6v2.5H6Z" fill="#fffefb" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="6" y="16.6" width="12" height="4.4" rx="1.2" fill="currentColor" />
    </Svg>
  )
}

export function SeatIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 12.5 6.5 21.5M16 12.5l1.5 9M9.2 17.4h5.6" stroke="#7a5538" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="12" cy="11.6" rx="7.6" ry="3" fill="#7a5538" />
      <ellipse cx="12" cy="10.6" rx="7.6" ry="3" fill="#b07a4f" />
    </Svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="10.2" width="14" height="10.6" rx="2.2" fill="currentColor" />
      <circle cx="12" cy="15.3" r="1.6" fill="#fbf8f1" />
    </Svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" />
    </Svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4.8v14.4a1 1 0 0 0 1.5.9l11.4-7.2a1 1 0 0 0 0-1.7L8.5 3.9A1 1 0 0 0 7 4.8Z" fill="currentColor" />
    </Svg>
  )
}

/** A pot with steam: give the chefs a hand. */
export function CookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8.5 6.5c-1-1.3 1-2.2 0-3.6M12 6.5c-1-1.3 1-2.2 0-3.6M15.5 6.5c-1-1.3 1-2.2 0-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 10h17v6.5a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4Z" fill="currentColor" />
