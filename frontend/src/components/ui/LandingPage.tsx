import { useMemo, useEffect, useState } from 'react';
import { lazy, Suspense } from 'react'
const MagicRings = lazy(() => import('../MagicRings'))

interface LandingPageProps {
    onEnter?: () => void;
}

const LandingPage = ({ onEnter }: LandingPageProps) => {
    const [mounted, setMounted] = useState(false);

    // generate starfield positions using a seeded-ish math trick so its deterministic
    const stars = useMemo(
        () =>
            Array.from({ length: 250 }, (_, i) => {
                const r1 = Math.abs(Math.sin(i * 9301 + 49297) * 233280) % 1;
                const r2 = Math.abs(Math.sin(i * 12345 + 67890) * 233280) % 1;
                const r3 = Math.abs(Math.sin(i * 54321 + 11111) * 233280) % 1;
                const r4 = Math.abs(Math.sin(i * 99991 + 22222) * 233280) % 1;
                return { x: r1 * 100, y: r2 * 100, size: r3 * 2 + 0.5, opacity: r4 * 0.8 + 0.2 };
            }),
        []
    );

    useEffect(() => {
        // small delay so the fade in animation actualy works
        const timer = setTimeout(() => {
            setMounted(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#020613] flex flex-col items-center justify-center selection:bg-blue-500/30">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;900&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .star-cross {
          background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 60%);
        }
      `}</style>

            {/* stars in the backgound */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                        }}
                    />
                ))}

            </div>

            {/* rings shader effect */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={null}>
                    <MagicRings
                        color="#fc42ff"
                        colorTwo="#42fcff"
                        ringCount={6}
                        speed={1}
                        attenuation={10}
                        lineThickness={2}
                        baseRadius={0.35}
                        radiusStep={0.1}
                        scaleRate={0.1}
                        opacity={1}
                        blur={0}
                        noiseAmount={0.1}
                        rotation={0}
                        ringGap={1.5}
                        fadeIn={0.7}
                        fadeOut={0.5}
                        followMouse={true}
                        mouseInfluence={0.2}
                        hoverScale={1.2}
                        parallax={0.1}
                    />
                </Suspense>
            </div>

            {/* main hero content */}
            <div
                className={`relative z-20 flex flex-col items-center w-full px-4 transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                <h1
                    className="font-montserrat font-black text-white text-center leading-[0.9]"
                    style={{
                        fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                        letterSpacing: '0.05em',
                        textShadow: '0 0 60px rgba(252,66,255,0.4), 0 0 120px rgba(66,252,255,0.2)',
                    }}
                >
                    VIRTUAL
                    <br />
                    COSMOS
                </h1>

                <p className="font-montserrat font-light text-gray-300 text-center mt-6 tracking-[0.2em] text-[clamp(0.9rem,2vw,1.25rem)] uppercase">
                    Explore the infinite.
                </p>

                <div className={`mt-12 transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={onEnter}
                        className="group relative px-12 py-4 rounded-full overflow-hidden border border-white/20 bg-black/20 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/50 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                    >
                        <span className="relative z-10 font-montserrat font-medium text-xs md:text-sm tracking-[0.4em] uppercase text-white">
                            Enter
                        </span>
                        <div className="absolute inset-0 -z-10 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                </div>

                <div className={`mt-8 transition-opacity duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <a href="https://www.thegauravthakur.in/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 font-montserrat font-light text-[11px] tracking-[0.3em] uppercase text-white/30 hover:text-white/70 transition-colors duration-300" >

                        <span className="block w-4 h-px bg-white/20 group-hover:bg-white/50 group-hover:w-6 transition-all duration-300" />
                        crafted by Gaurav Thakur
                        <span className="block w-4 h-px bg-white/20 group-hover:bg-white/50 group-hover:w-6 transition-all duration-300" />
                    </a>
                </div>
            </div>



        </div>
    );
};

export default LandingPage;