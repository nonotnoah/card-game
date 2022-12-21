import { useRef, useState } from "react"

interface SettingsProps {
  size: SizeProps
  onSizeChange: (val: {
    symbol: number
    name: string
    description: string
  }) => void
  onStart: () => void
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}

export default function Settings({ size, onSizeChange, onStart }: SettingsProps) {
  const numberOfSymbols = useRef(size.symbol)
  const sizeName = useRef(size.name)
  const sizeDescription = useRef(size.description)

  const handleClick = (sign: string) => {
    const sizeNumbers = [4, 8, 13]
    const sizeNames = ['Small', 'Normal', 'Large']
    const sizeDescriptions = ['Faster pace', 'The standard experience', 'More difficult']
    const currentNumber = sizeNumbers.indexOf(numberOfSymbols.current)
    const currentName = sizeNames.indexOf(sizeName.current)
    const currentDescription = sizeDescriptions.indexOf(sizeDescription.current)
    let symbol: number = 8
    let name: string = 'Normal'
    let description: string = 'The standard experience'
    if (sign == '-' && currentNumber != 0) {
      symbol = sizeNumbers[currentNumber - 1]
      name = sizeNames[currentName - 1]
      description = sizeDescriptions[currentDescription - 1]
      numberOfSymbols.current = symbol
      sizeName.current = name
      sizeDescription.current = description
      onSizeChange({ symbol, name, description })
    }
    if (sign == '+' && currentNumber != 2) {
      symbol = sizeNumbers[currentNumber + 1]
      name = sizeNames[currentName + 1]
      description = sizeDescriptions[currentDescription + 1]
      numberOfSymbols.current = symbol
      sizeName.current = name
      sizeDescription.current = description
      onSizeChange({ symbol, name, description })
    }
    // socket.to(socket.gameID).emit(numberOfSymbols)
  }

  const handleStart = () => {
    onStart()
  }

  return (
    <div className="settings-wrapper">
      <div className="title">Symbols per card</div>
      <div className="symbols-wrapper">
        <div className="card-size-select-wrapper">
          <button onClick={() => handleClick('-')} className="left">-</button>
          <span className="symbol-number">{size.symbol}</span>
          <button onClick={() => handleClick('+')} className="right">+</button>
        </div>
        <div className="title-size">{size.name}</div>
      </div>
      <div className="info-wrapper">
        <p className="size-info">{size.description}</p>
      </div>
      <div className="menu-button">
        <button onClick={() => handleStart()} className="start">Start Game</button>
      </div>
    </div>
  )
}