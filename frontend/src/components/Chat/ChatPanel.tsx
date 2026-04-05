import { useState, useRef, useEffect, useCallback } from 'react'
import { useCosmosStore } from '../../store/useCosmosStore'

export function ChatPanel() {
  const {
    isChatOpen, chatMessages, nearbyUsers,
    myId, socket, remoteUsers, typingUsers
  } = useCosmosStore()

  const [input, setInput] = useState('')
  const bottomRef    = useRef<HTMLDivElement>(null)
  const isTypingRef  = useRef(false)          // are we currently emitting typing?
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Emit stopTyping after 1.5s of no keypresses
  const emitStopTyping = useCallback(() => {
    if (isTypingRef.current) {
      socket?.emit('chat:stopTyping')
      isTypingRef.current = false
    }
  }, [socket])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    if (!socket) return

    // Start typing signal (only emit once per typing session)
    if (!isTypingRef.current) {
      socket.emit('chat:typing')
      isTypingRef.current = true
    }

    // Reset the stop timer on every keystroke
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(emitStopTyping, 1500)
  }

  const sendMessage = () => {
    if (!input.trim() || !socket) return

    // Stop typing signal immediately on send
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    emitStopTyping()

    socket.emit('chat:send', { text: input.trim() })
    setInput('')
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
      emitStopTyping()
    }
  }, [emitStopTyping])

  const nearbyUserDetails = nearbyUsers
    .map(id => remoteUsers.get(id))
    .filter(Boolean)

  // Who is currently typing (exclude self)
  const whoIsTyping = Array.from(typingUsers.entries())
    .filter(([id]) => id !== myId)
    .map(([, name]) => name)

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (!isChatOpen) return null

  return (
    <div
      className="absolute bottom-4 right-4 w-80 flex flex-col overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(9, 9, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '20px',
        maxHeight: '420px',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
        .chat-font { font-family: 'Syne', sans-serif; }
        .msg-enter { animation: msgIn 0.2s ease forwards; }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-input:focus { outline: none; box-shadow: 0 0 0 1.5px rgba(99,102,241,0.5); }
        .send-btn:hover { background: rgba(99,102,241,0.9); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }

        /* Typing dots */
        .typing-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #818cf8;
          animation: typingBounce 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="px-4 py-3 flex flex-col gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="chat-font text-xs font-semibold text-emerald-400 tracking-wide">
              Proximity Chat
            </span>
          </div>
          <span className="chat-font text-[10px] text-gray-500 tracking-widest uppercase">
            {nearbyUsers.length + 1} in range
          </span>
        </div>

        {/* Nearby avatars */}
        {nearbyUserDetails.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {nearbyUserDetails.map((u) => u && (
              <div key={u.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: u.color }} />
                <span className="chat-font text-[10px] text-gray-300 max-w-[70px] truncate">
                  {u.username}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}
            >
              <span className="chat-font text-[10px] text-indigo-300">You</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
        style={{ minHeight: '180px', maxHeight: '240px' }}
      >
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
            <span className="text-2xl">💬</span>
            <p className="chat-font text-[11px] text-gray-600 text-center">
              You're in range. Say hello!
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isMe = msg.senderId === myId
          return (
            <div key={msg.id}
              className={`msg-enter flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="chat-font text-[10px] font-semibold"
                  style={{ color: isMe ? '#818cf8' : '#94a3b8' }}
                >
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="chat-font text-[9px] text-gray-600">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="chat-font px-3 py-2 text-sm text-white leading-relaxed"
                style={{
                  maxWidth: '85%',
                  borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: isMe
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : 'rgba(255,255,255,0.07)',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isMe ? '0 4px 15px rgba(79,70,229,0.3)' : 'none',
                  wordBreak: 'break-word',
                }}
              >
                {msg.text}
              </div>
            </div>
          )
        })}

        {/* ── Typing Indicator ── */}
        {whoIsTyping.length > 0 && (
          <div className="msg-enter flex items-end gap-2">
            {/* Bubble with dots */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl rounded-bl-sm"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>

            {/* Label */}
            <span className="chat-font text-[10px] text-gray-500 pb-1">
              {whoIsTyping.length === 1
                ? `${whoIsTyping[0]} is typing`
                : whoIsTyping.length === 2
                ? `${whoIsTyping[0]} & ${whoIsTyping[1]} are typing`
                : `${whoIsTyping.length} people are typing`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex items-center gap-2 p-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          className="chat-input flex-1 text-white text-sm rounded-xl px-3 py-2 placeholder-gray-600 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
          }}
          placeholder="Message the group..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="send-btn flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
          style={{ background: 'rgba(99,102,241,0.7)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}