import { useState, useRef, useEffect } from 'react'
import { useCosmosStore } from '../../store/useCosmosStore'

export function ChatPanel() {
  const { isChatOpen, chatMessages, nearbyUsers, myId, socket } = useCosmosStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendMessage = () => {
    if (!input.trim() || !socket) return
    socket.emit('chat:send', { text: input.trim() }) // ← clean, no window hack
    setInput('')
  }

  if (!isChatOpen) return null

  return (
    <div className="absolute bottom-4 right-4 w-72 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-2xl flex flex-col overflow-hidden shadow-xl">
      <div className="px-4 py-2 border-b border-gray-700 text-sm text-indigo-400 font-semibold">
        💬 {nearbyUsers.length} nearby
      </div>
      <div className="flex-1 overflow-y-auto max-h-64 p-3 flex flex-col gap-2">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.senderId === myId ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500">{msg.senderName}</span>
            <div className={`px-3 py-1.5 rounded-xl text-sm text-white max-w-[90%] ${
              msg.senderId === myId ? 'bg-indigo-600' : 'bg-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-2 border-t border-gray-700">
        <input
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded-lg text-sm">
          Send
        </button>
      </div>
    </div>
  )
}