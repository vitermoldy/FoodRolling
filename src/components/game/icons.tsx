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
