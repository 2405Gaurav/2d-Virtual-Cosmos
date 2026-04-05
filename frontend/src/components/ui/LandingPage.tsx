import { useEffect, useRef } from 'react'

interface Props {
  onEnter: () => void
}

export function LandingPage({ onEnter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated starfield
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.18 + 0.04,
      alpha: Math.random(),
      dir: Math.random() > 0.5 ? 1 : -1,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.dir * s.speed * 0.012
        if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03020a] flex flex-col items-center justify-center">
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-syne { font-family: 'Syne Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.38; transform: scale(1.06); }
        }
        .anim-1 { animation: fadeUp 0.9s ease forwards; }
        .anim-2 { animation: fadeUp 0.9s 0.18s ease forwards; opacity: 0; }
        .anim-3 { animation: fadeUp 0.9s 0.36s ease forwards; opacity: 0; }
        .anim-4 { animation: fadeUp 0.9s 0.54s ease forwards; opacity: 0; }
        .pulse-ring { animation: pulse-ring 3.5s ease-in-out infinite; }
      `}</style>

      {/* Starfield canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Nebula glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-700 opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-500 opacity-10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-indigo-500/10 pulse-ring pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-indigo-400/10 pulse-ring pointer-events-none" style={{ animationDelay: '1.2s' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {/* Badge */}
        <div className="anim-1 font-mono-syne text-[10px] tracking-[0.3em] text-indigo-400 uppercase border border-indigo-500/30 px-4 py-1.5 rounded-full bg-indigo-500/5">
          Real-time · Proximity · Social
        </div>

        {/* Title */}
        <h1 className="anim-2 font-syne font-extrabold text-white leading-none" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
          Virtual
          <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)' }}>
            Cosmos
          </span>
        </h1>

        {/* Subtitle */}
        <p className="anim-3 font-syne text-gray-400 max-w-sm text-base leading-relaxed">
          Move through space. Come close to connect.
          <br />
          Drift apart to disconnect.
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="anim-4 font-syne font-bold text-sm tracking-widest uppercase px-10 py-4 rounded-full text-white transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 40px rgba(99,102,241,0.35)',
          }}
        >
          Enter Cosmos →
        </button>

        {/* Hint */}
        <p className="anim-4 font-mono-syne text-[11px] text-gray-600 tracking-widest uppercase">
          Move with WASD or Arrow Keys
        </p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="font-mono-syne text-[10px] text-gray-700 tracking-widest uppercase">
          Virtual Cosmos · Real-time Proximity Chat
        </span>
      </div>
    </div>
  )
}