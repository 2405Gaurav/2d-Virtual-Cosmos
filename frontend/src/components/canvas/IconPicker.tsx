import { useState } from 'react'
import { useCosmosStore } from '../../store/useCosmosStore'

const ICONS = [
  '😎','🥸','🤩','😈','👻','💀','🤠','🥷','🧙','🧛',
  '🤖','👽','🫡','🥳','😤','🤯','🫠','🤡','😇','🤓',
]

export function IconPicker() {
  const { socket, icon, bio: storeBio, setIcon: storeSetIcon, setBio: storeSetBio } = useCosmosStore()
  const [open, setOpen] = useState(false)
  const [localBio, setLocalBio] = useState(storeBio)
  const [editingBio, setEditingBio] = useState(false)

  const apply = (newIcon: string) => {
    storeSetIcon(newIcon)
    socket?.emit('user:update-profile', { icon: newIcon, bio: localBio })
  }

  const saveBio = () => {
    setEditingBio(false)
    storeSetBio(localBio)
    socket?.emit('user:update-profile', { icon, bio: localBio })
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {/* avatar button at the top */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-gray-900/90 backdrop-blur border border-gray-700 
                   rounded-full px-4 py-2 text-sm text-gray-200 hover:border-indigo-500 transition-colors"
      >
        <span className="text-2xl leading-none">{icon}</span>
        <span className="text-gray-400">Your avatar</span>
        <span className="text-xs text-gray-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-2xl w-80">

          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs text-gray-400 font-medium">Choose your icon</p>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-200 text-lg leading-none transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {/* icon grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => apply(ic)}
                className={`
                  text-2xl p-2 rounded-xl transition-all flex items-center justify-center aspect-square
                  ${icon === ic
                    ? 'bg-indigo-600/40 ring-2 ring-indigo-500 scale-110 shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/80 hover:scale-105'}
                `}
              >
                {ic}
              </button>
            ))}
          </div>

          {/* preview of whats selected */}
          <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-3 py-2 mb-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-500">Selected</p>
              <p className="text-sm text-gray-200 font-medium">Your avatar icon</p>
            </div>
          </div>

          {/* bio section */}
          <div className="border-t border-gray-700/60 pt-3">
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">Short bio</p>
            {editingBio ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 outline-none border border-gray-700 focus:border-indigo-500 transition-colors"
                  placeholder="What are you working on?"
                  maxLength={120}
                  value={localBio}
                  onChange={e => setLocalBio(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveBio()}
                  autoFocus
                />
                <button
                  onClick={saveBio}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 rounded-xl transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingBio(true)}
                className="w-full text-left text-sm text-gray-400 hover:text-gray-200 
                           bg-gray-800/50 hover:bg-gray-800 rounded-xl px-3 py-2 transition-colors border border-transparent hover:border-gray-700"
              >
                {localBio || '✏️  Add a bio…'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}