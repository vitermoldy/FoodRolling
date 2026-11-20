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
