interface ColorDisplayProps {
  colorText: string
  backgroundColor: string
  textColor: string
}

export function ColorDisplay({ colorText, backgroundColor, textColor }: ColorDisplayProps) {
  return (
    <h1
      id="colorDisplay"
      style={{
        color: textColor,
        fontSize: '24px',
        fontWeight: 300,
        textAlign: 'center',
        margin: '20px 0',
        fontFamily: '"Courier New", monospace',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '10px 20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor
      }}
    >
      {colorText}
    </h1>
  )
}

