import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCosmosStore } from '../../store/useCosmosStore'

export function JoinScreen() {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const setUsername = useCosmosStore(s => s.setUsername)

  const handleLaunch = () => {
    if (!name.trim()) return
    setUsername(name.trim())
    navigate('/cosmos')
  }

  return (
    <div
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#03020a' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-syne { font-family: 'Syne Mono', monospace; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .join-anim { animation: fadeUp 0.6s ease forwards; }
        .join-input:focus { box-shadow: 0 0 0 2px rgba(99,102,241,0.5), 0 0 24px rgba(99,102,241,0.15); }
      `}</style>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-700 opacity-5 blur-[100px] pointer-events-none" />

      <div className="join-anim relative z-10 flex flex-col gap-5 w-80">
        <p className="font-mono-syne text-[10px] text-gray-600 tracking-[0.25em] uppercase text-center">
          Step 2 of 2
        </p>

        <div className="text-center">
          <h2 className="font-syne font-extrabold text-white text-3xl">Who are you?</h2>
          <p className="font-syne text-gray-500 text-sm mt-1">Choose a name for the cosmos</p>
        </div>

        <input
          autoFocus
          className="join-input font-syne bg-white/5 text-white rounded-xl px-5 py-3.5 outline-none border border-white/10 text-sm placeholder-gray-600 transition-all duration-200"
          placeholder="e.g. Nova, Atlas, Orion..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLaunch()}
          maxLength={20}
        />

        <button
          onClick={handleLaunch}
          disabled={!name.trim()}
          className="font-syne font-bold text-sm tracking-widest uppercase py-4 rounded-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: name.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1f1f2e',
            boxShadow: name.trim() ? '0 0 30px rgba(99,102,241,0.3)' : 'none',
          }}
        >
          Launch into Cosmos →
        </button>

        <p className="font-mono-syne text-[10px] text-gray-700 text-right -mt-2">
          {name.length}/20
        </p>
      </div>
    </div>
  )
}