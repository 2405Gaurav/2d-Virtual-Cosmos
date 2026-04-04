import { useState } from 'react'

interface Props {
  onJoin: (name: string) => void
}

export function JoinScreen({ onJoin }: Props) {
  const [name, setName] = useState('')

  return (
    <div className="w-screen h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col gap-4 w-80">
        <h1 className="text-white text-2xl font-bold text-center">🌌 Virtual Cosmos</h1>
        <p className="text-gray-400 text-sm text-center">Enter a name to join the space</p>
        <input
          className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-indigo-500"
          placeholder="Your name..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 font-semibold transition"
          onClick={() => name.trim() && onJoin(name.trim())}
        >
          Enter Cosmos
        </button>
      </div>
    </div>
  )
}