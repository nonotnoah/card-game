import { useState } from "react"

interface SettingsProps {
  onSizeChange: (val: {
    numberOfSymbols: number
    sizeName: string
    sizeDescription: string
  }) => void
  onStart: () => void
}

export default function Settings({ onSizeChange, onStart }: SettingsProps) {
  const [numberOfSymbols, setNumberOfSymbols] = useState(8)
  const [sizeName, setSizeName] = useState('Normal')
  const [sizeDescription, setSizeDescription] = useState('The standard experience')

  const handleClick = (sign: string) => {
    const sizeNumbers = [4, 8, 13]
    const sizeNames = ['Small', 'Normal', 'Large']
    const sizeDescriptions = ['Faster pace', 'The standard experience', 'Gamers only.']
    const currentNumber = sizeNumbers.indexOf(numberOfSymbols)
    const currentName = sizeNames.indexOf(sizeName)
    const currentDescription = sizeDescriptions.indexOf(sizeDescription)
    if (sign == '-' && currentNumber != 0) {
      setNumberOfSymbols(sizeNumbers[currentNumber - 1])
      setSizeName(sizeNames[currentName - 1])
      setSizeDescription(sizeDescriptions[currentDescription - 1])
    }
    if (sign == '+' && currentNumber != 2) {
      setNumberOfSymbols(sizeNumbers[currentNumber + 1])
      setSizeName(sizeNames[currentName + 1])
      setSizeDescription(sizeDescriptions[currentDescription + 1])
    }
    // socket.to(socket.gameID).emit(numberOfSymbols)
    onSizeChange({ numberOfSymbols, sizeName, sizeDescription })
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
          <span className="symbol-number">{numberOfSymbols}</span>
          <button onClick={() => handleClick('+')} className="right">+</button>
        </div>
        <div className="title-size">{sizeName}</div>
      </div>
      <div className="info-wrapper">
        <p className="size-info">{sizeDescription}</p>
      </div>
      <div className="menu-button">
        <button onClick={() => handleStart()} className="start">Start Game</button>
      </div>
    </div>
  )
}