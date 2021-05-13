import React from "react"
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon"

export default function QuoteIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M0.1 352.5c0 66.8 54.1 120.9 120.9 120.9 66.8 0 120.9-54.1 120.9-120.9s-54.1-120.9-120.9-120.9c-13.7 0-26.9 2.4-39.2 6.6C109.1 82.1 230.8-18.5 118 64.3 -7.1 156.2 0 348.8 0.1 352.4 0.1 352.4 0.1 352.5 0.1 352.5z" />
      <path d="M266.2 352.5c0 66.8 54.1 120.9 120.9 120.9s120.9-54.1 120.9-120.9S453.9 231.6 387.1 231.6c-13.7 0-26.9 2.4-39.2 6.6C375.2 82.1 496.9-18.5 384 64.3 258.9 156.2 266 348.8 266.2 352.4 266.2 352.4 266.2 352.5 266.2 352.5z" />
    </SvgIcon>
  )
}
