"use client"

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#05050a] via-[#1a0f2e] to-[#2d1810]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse -translate-x-1/2 -translate-y-1/2"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative text-center animate-fade-in space-y-10">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/40 to-orange-500/40 blur-3xl animate-pulse-glow"></div>
            <div className="absolute -inset-6 rounded-3xl border-2 border-amber-500/30 animate-spin-slow"></div>
            <div
              className="absolute -inset-3 rounded-3xl border border-orange-400/20"
              style={{ animation: "spin-slow 15s linear infinite reverse" }}
            ></div>

            <div className="relative animate-scale-in">
              <img
                src="/icon-512-v6.png"
                alt="Movie Finder"
                className="w-56 h-56 rounded-3xl shadow-2xl"
                style={{
                  filter: "drop-shadow(0 30px 60px rgba(251, 191, 36, 0.5)) brightness(1.1) contrast(1.1)",
                  animation: "float 3.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1
            className="text-8xl font-black text-white tracking-[0.25em] uppercase animate-fade-slide-up"
            style={{
              animationDelay: "0.2s",
              textShadow: "0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(251,191,36,0.2)",
            }}
          >
            MOVIE
          </h1>
          <h2
            className="text-7xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent tracking-[0.3em] uppercase animate-fade-slide-up"
            style={{
              animationDelay: "0.4s",
              filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))",
            }}
          >
            FINDER
          </h2>

          <p
            className="text-amber-300/70 text-lg tracking-[0.3em] uppercase font-semibold animate-fade-slide-up pt-2"
            style={{ animationDelay: "0.6s" }}
          >
            Il Cinema Che Ami
          </p>
        </div>

        <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="w-72 h-2 bg-[#27273a] rounded-full overflow-hidden mx-auto relative">
            <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full animate-loading-bar shadow-lg shadow-amber-500/50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
