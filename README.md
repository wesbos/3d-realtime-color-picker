# Every Color - 3D RGB Color Picker with Real-time Collaboration

A 3D interactive RGB color cube with real-time collaborative cursors powered by PartyKit.

## Features

- 🎨 3D RGB color cube visualization
- 🖱️ Interactive color picking with perspective-aware cursor
- 👥 Real-time collaboration - see other users' cursors
- 🌈 Live color updates shared across all users
- 📱 Responsive design with zoom controls

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start PartyKit development server:**

```bash
npm run dev:party
```

3. **In another terminal, start the frontend:**

```bash
npm run dev
```

4. **Open your browser to:**

- Frontend: `http://localhost:5173`
- PartyKit admin: `http://localhost:1999`

## Usage

- **Hover** over the cube to pick colors
- **Click and drag** to rotate the view
- **Scroll** to zoom in/out
- **Multiple users** can connect and see each other's color selections in real-time

## Architecture

- **Frontend**: Vite + Three.js for 3D rendering
- **Real-time**: PartyKit server for WebSocket coordination
- **Events**: Clean event-driven architecture for multiple color pickers

## Deployment

Deploy the PartyKit server:

```bash
npm run deploy:party
```

The color picker component is designed to be reusable - you can create multiple instances on the same page with different configurations.
