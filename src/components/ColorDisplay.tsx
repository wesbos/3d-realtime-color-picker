import './ColorDisplay.css'

interface ColorDisplayProps {
  colorText: string
  backgroundColor: string
  textColor: string
}

export function ColorDisplay({ colorText, backgroundColor, textColor }: ColorDisplayProps) {
  return (
    <h1
      id="colorDisplay"
      className="color-display"
      style={{
        color: textColor,
        backgroundColor
      }}
    >
      {colorText}
    </h1>
  )
}

