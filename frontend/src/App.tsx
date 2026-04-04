import { useState } from 'react'
import { CosmosCanvas } from '../src/components/canvas/CosmosCanvas'
import { ChatPanel } from './components/Chat/ChatPanel'
import { JoinScreen } from './components/ui/JoinScreen'

export default function App() {
  const [username, setUsername] = useState<string | null>(null)

  if (!username) {//if username is not set, show the join screen where user can enter their name and join the cosmos
    return <JoinScreen onJoin={setUsername} />
  }

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      <CosmosCanvas username={username} />
      <ChatPanel />
    </div>
  )
}