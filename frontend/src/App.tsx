import { useState } from 'react'
import { LandingPage } from './components/ui/LandingPage'
import { JoinScreen } from './components/ui/JoinScreen'

type AppState = 'landing' | 'join'

export default function App() {
  const [stage, setStage] = useState<AppState>('landing')

  if (stage === 'landing') {
    return <LandingPage onEnter={() => setStage('join')} />
  }

  return <JoinScreen />
}


// Room-based chat (CRITICAL)
// Smooth movement (lerp)
// User join/leave animation
// Message timestamps