import { useState } from "react"

interface SettingsDisplayProps {
  size: SizeProps
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}

export default function SettingsDisplay({ size }: SettingsDisplayProps) {

  return (
    <div className="settings-wrapper">
      <div className="title">Symbols per card</div>
      <div className="symbols-wrapper">
        <div className="card-size-select-wrapper">
          <button disabled={true} className="left">-</button>
          <span className="symbol-number">{size.symbol}</span>
          <button disabled={true} className="right">+</button>
        </div>
        <div className="title-size">{size.name}</div>
      </div>
      <div className="info-wrapper">
        <p className="size-info">{size.description}</p>
      </div>
      <div className="menu-button">
        <button disabled={true} className="start">Waiting for host to start...</button>
      </div>
    </div>
  )
}