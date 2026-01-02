"use client"

interface LoginViewProps {
  onModeSelect: (isPremium: boolean) => void
}

export function LoginView({ onModeSelect }: LoginViewProps) {
  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#05050a] via-[#0f0f1a] to-[#1a0f2e] flex items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 blur-2xl animate-pulse-glow"></div>
              <img
                src="/icon-512-v6.png"
                alt="Movie Finder"
                className="relative w-28 h-28 rounded-2xl"
                style={{
                  filter: "drop-shadow(0 15px 35px rgba(251, 191, 36, 0.4)) brightness(1.1)",
                }}
              />
            </div>
          </div>
          <h1 className="text-6xl font-black text-white tracking-[0.2em] uppercase mb-2 drop-shadow-2xl">MOVIE</h1>
          <h2 className="text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-[0.25em] uppercase mb-4">
            FINDER
          </h2>
          <p className="text-gray-400 text-sm tracking-[0.2em] uppercase font-semibold">Scegli La Tua Modalità</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onModeSelect(true)}
            className="group w-full relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-black font-black py-5 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(251,191,36,0.4)] overflow-hidden"
          >
            <span className="relative z-10 tracking-wider text-base uppercase drop-shadow-md">🚀 Accedi • Premium</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10"></div>
          </button>

          <button
            onClick={() => onModeSelect(false)}
            className="group w-full relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-400 hover:to-indigo-400 text-white border-2 border-blue-400/30 font-black py-5 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] overflow-hidden"
          >
            <span className="relative z-10 tracking-wider text-base uppercase drop-shadow-md">🎬 Ospite • Basic</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-br from-[#1a1810] to-[#0f0f1a] border-2 border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-amber-400 font-black mb-4 flex items-center gap-2 text-base uppercase tracking-wider">
              <span className="text-2xl">⭐</span> Premium
            </h3>
            <ul className="text-gray-300 text-sm space-y-3 leading-relaxed font-medium">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1 text-lg">•</span>
                <span>Ricerca illimitata senza restrizioni</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1 text-lg">•</span>
                <span>Filtri avanzati di scelta tra 10 generi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1 text-lg">•</span>
                <span>Scegli le tue piattaforme streaming preferite</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1 text-lg">•</span>
                <span>Accesso alle classifiche mensili</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#101520] to-[#0f0f1a] border-2 border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-blue-400 font-black mb-4 flex items-center gap-2 text-base uppercase tracking-wider">
              <span className="text-2xl">🎬</span> Basic
            </h3>
            <ul className="text-gray-400 text-sm space-y-3 leading-relaxed font-medium">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1 text-lg">•</span>
                <span>Scelta tra 4 generi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1 text-lg">•</span>
                <span>Risultato: 3 film</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1 text-lg">•</span>
                <span>1 possibilità di scelta al giorno</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-400 text-xs uppercase tracking-widest transition-colors font-semibold"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}
