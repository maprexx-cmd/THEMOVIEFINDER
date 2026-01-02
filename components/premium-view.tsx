"use client"

import { useState } from "react"
import type { Mode, View } from "@/app/page"
import { searchPremiumMovies } from "@/lib/tmdb"
import { useMovieStore } from "@/lib/store"

interface PremiumViewProps {
  mode: Mode
  onNavigate: (view: View) => void
}

const PREMIUM_GENRES = [
  { key: "comicita", label: "Comicità", movie: 35, tv: 35 },
  { key: "azione", label: "Azione", movie: 28, tv: 10759 },
  { key: "thriller", label: "Thriller", movie: 53, tv: 9648 },
  { key: "dramma", label: "Drammatico", movie: 18, tv: 18 },
  { key: "romantico", label: "Romantico", movie: 10749, tv: 10749 },
  { key: "fantascienza", label: "Fantascienza", movie: 878, tv: 10765 },
  { key: "horror", label: "Horror", movie: 27, tv: 27 },
  { key: "avventura", label: "Avventura", movie: 12, tv: 10759 },
  { key: "crime", label: "Crime", movie: 80, tv: 80 },
]

const STREAMING_PLATFORMS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 531, name: "Paramount+" },
  { id: 350, name: "Apple TV+" },
  { id: 1899, name: "Max" },
  { id: 29, name: "Sky Go" },
  { id: 40, name: "Now TV" },
  { id: 2, name: "Apple iTunes" },
  { id: 3, name: "Google Play" },
  { id: 68, name: "Microsoft Store" },
  { id: 10, name: "Amazon Video" },
  { id: 1771, name: "Infinity+" },
  { id: 109, name: "Mediaset Infinity" },
  { id: 167, name: "Rakuten TV" },
]

type PremiumStep = "login" | "platform" | "genre" | "results"

export function PremiumView({ mode, onNavigate }: PremiumViewProps) {
  const [step, setStep] = useState<PremiumStep>("login")
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie")
  const [sliders, setSliders] = useState<Record<string, number>>(
    Object.fromEntries(PREMIUM_GENRES.map((g) => [g.key, 0])),
  )
  const [includeAnimation, setIncludeAnimation] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const setResults = useMovieStore((state) => state.setResults)
  const setPreferredPlatforms = useMovieStore((state) => state.setPreferredPlatforms)

  const handleSliderChange = (key: string, value: number) => {
    setSliders((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setSliders(Object.fromEntries(PREMIUM_GENRES.map((g) => [g.key, 0])))
    setStatus("Slider resettati")
  }

  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId],
    )
  }

  const handleFind = async () => {
    const topGenres = PREMIUM_GENRES.map((g) => ({
      id: mediaType === "tv" ? g.tv : g.movie,
      value: sliders[g.key] || 0,
    }))
      .filter((g) => g.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
      .map((g) => g.id)

    if (includeAnimation) {
      topGenres.push(16) // ID genere animazione
    }

    if (topGenres.length === 0) {
      setStatus("Alza almeno uno slider o seleziona animazione!")
      return
    }

    setIsLoading(true)
    setStatus("Sto cercando risultati...")

    try {
      setPreferredPlatforms(selectedPlatforms)
      const results = await searchPremiumMovies(mediaType, topGenres, selectedPlatforms)
      setResults(results, "premium", mediaType)
      onNavigate("results")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Errore durante la ricerca")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mode.premium) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center relative">
        <img src="/background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="max-w-md text-center space-y-6 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">🔒</h1>
            <h2 className="text-2xl font-bold">Funzionalità Premium</h2>
            <p className="text-[#A0826D]">
              Questa funzione è disponibile solo per gli utenti Premium. Accedi con Google per sbloccare tutte le
              funzionalità.
            </p>
            <button
              onClick={() => onNavigate("choice")}
              className="bg-[#D8A24A] hover:bg-[#C89239] text-[#0f0e0d] font-bold py-3 px-6 rounded-lg transition-all"
            >
              Torna indietro
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "login") {
    return (
      <div className="min-h-screen max-h-screen overflow-y-auto p-6 flex items-center justify-center relative elegant-stripes">
        <img src="/background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="max-w-md w-full space-y-4 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Cosa vuoi cercare?</h1>
            <p className="text-yellow-400 text-xs">Scegli tra film o serie TV</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setMediaType("movie")
                setStep("platform")
              }}
              className="bg-red-500/30 backdrop-blur-3xl border-2 border-red-400/60 hover:border-red-300/80 hover:bg-red-500/40 text-red-200 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-[0_8px_30px_rgba(239,68,68,0.8)] shadow-[inset_0_2px_20px_rgba(239,68,68,0.2)]"
              style={{
                backdropFilter: "blur(70px) saturate(300%)",
              }}
            >
              <div className="mb-3 flex justify-center">
                <img
                  src="/icon-512-v6.png"
                  alt="Film"
                  className="w-16 h-16"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.7))",
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-1 text-red-100">Film</h2>
              <p className="text-red-300 text-xs">Cerca il film perfetto per te</p>
            </button>

            <button
              onClick={() => {
                setMediaType("tv")
                setStep("platform")
              }}
              className="bg-emerald-500/30 backdrop-blur-3xl border-2 border-emerald-400/60 hover:border-emerald-300/80 hover:bg-emerald-500/40 text-emerald-200 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-[0_8px_30px_rgba(16,185,129,0.8)] shadow-[inset_0_2px_20px_rgba(16,185,129,0.2)]"
              style={{
                backdropFilter: "blur(70px) saturate(300%)",
              }}
            >
              <div className="mb-3 flex justify-center">
                <img
                  src="/icon-512-v6.png"
                  alt="Serie TV"
                  className="w-16 h-16"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.7))",
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-1 text-emerald-100">Serie TV</h2>
              <p className="text-emerald-300 text-xs">Scopri la serie perfetta per te</p>
            </button>
          </div>

          <button
            onClick={() => {
              console.log("[v0] Navigating to rankings")
              onNavigate("rankings")
            }}
            className="w-full bg-white/5 backdrop-blur-xl hover:bg-yellow-500/20 hover:text-white text-yellow-300 border-2 border-yellow-500/40 hover:border-yellow-400/70 font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 hover:shadow-[0_8px_20px_rgba(234,179,8,0.6)] text-lg"
          >
            <img src="/icon-512-v6.png" alt="" className="w-6 h-6" />
            Classifiche
          </button>

          <button
            onClick={() => onNavigate("login")}
            className="w-full bg-white/5 backdrop-blur-xl hover:bg-yellow-500/10 text-white border-2 border-yellow-500/40 hover:border-yellow-400/50 font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            ← Indietro
          </button>
        </div>
      </div>
    )
  }

  if (step === "platform") {
    return (
      <div className="min-h-screen max-h-screen overflow-y-auto p-6 relative elegant-stripes">
        <img src="/background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="max-w-3xl mx-auto pb-4 relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Piattaforme Preferite</h1>
            <p className={`text-sm ${mediaType === "tv" ? "text-emerald-300" : "text-red-300"}`}>
              Seleziona le piattaforme dove preferisci guardare i contenuti (opzionale)
            </p>
          </div>

          <div
            className={`bg-white/5 backdrop-blur-xl border-2 rounded-lg p-4 mb-6 ${
              mediaType === "tv"
                ? "border-emerald-500/30 shadow-[0_16px_56px_rgba(16,185,129,0.4)]"
                : "border-red-500/30 shadow-[0_16px_56px_rgba(239,68,68,0.4)]"
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STREAMING_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-3 rounded-lg font-semibold text-sm transition-all duration-300 border-2 ${
                    selectedPlatforms.includes(platform.id)
                      ? mediaType === "tv"
                        ? "bg-emerald-500/40 backdrop-blur-xl text-white border-emerald-400/70 shadow-[0_8px_20px_rgba(16,185,129,0.7)]"
                        : "bg-red-500/40 backdrop-blur-xl text-white border-red-400/70 shadow-[0_8px_20px_rgba(239,68,68,0.7)]"
                      : mediaType === "tv"
                        ? "bg-white/5 backdrop-blur-xl text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-400/40 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                        : "bg-white/5 backdrop-blur-xl text-red-200 border-red-500/20 hover:bg-red-500/10 hover:border-red-400/40 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                  }`}
                  style={{
                    transform: selectedPlatforms.includes(platform.id) ? "translateY(-2px)" : "translateY(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px) scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = selectedPlatforms.includes(platform.id)
                      ? "translateY(-2px)"
                      : "translateY(0)"
                  }}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("login")}
              className={`flex-1 font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-xl border-2 ${
                mediaType === "tv"
                  ? "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                  : "text-red-300 border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
              }`}
            >
              ← Indietro
            </button>
            <button
              onClick={() => setStep("genre")}
              className={`flex-1 font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-xl border-2 ${
                mediaType === "tv"
                  ? "bg-emerald-500/40 hover:bg-emerald-500/50 text-white border-emerald-400/70 shadow-[0_8px_20px_rgba(16,185,129,0.6)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.7)]"
                  : "bg-red-500/40 hover:bg-red-500/50 text-white border-red-400/70 shadow-[0_8px_20px_rgba(239,68,68,0.6)] hover:shadow-[0_12px_28px_rgba(239,68,68,0.7)]"
              }`}
            >
              Avanti →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "genre") {
    return (
      <div className="min-h-screen max-h-screen overflow-hidden p-3 relative">
        <img src="/background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="max-w-3xl mx-auto h-full flex flex-col justify-between py-1 relative z-10">
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold mb-1">Preferenze di Genere</h1>
            <p className={`text-xs ${mediaType === "tv" ? "text-emerald-400" : "text-red-400"}`}>
              Usa gli slider per indicare quanto ti piace ogni genere (0-10)
            </p>
          </div>

          <div
            className={`rounded-lg p-3 mb-2 border-2 flex-shrink overflow-y-auto backdrop-blur-xl ${
              mediaType === "tv" ? "bg-emerald-950/30 border-emerald-500/30" : "bg-red-950/30 border-red-500/30"
            }`}
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="space-y-2">
              {PREMIUM_GENRES.map((genre) => (
                <div key={genre.key}>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-semibold text-xs">{genre.label}</span>
                    <span className={`font-bold text-xs ${mediaType === "tv" ? "text-emerald-400" : "text-red-400"}`}>
                      {sliders[genre.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={sliders[genre.key]}
                    onChange={(e) => handleSliderChange(genre.key, Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background:
                        mediaType === "tv"
                          ? `linear-gradient(to right, 
                        #064e3b 0%, 
                        #10b981 ${(sliders[genre.key] / 10) * 100}%)`
                          : `linear-gradient(to right, 
                        #7f1d1d 0%, 
                        #ef4444 ${(sliders[genre.key] / 10) * 100}%)`,
                    }}
                  />
                </div>
              ))}

              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnimation}
                    onChange={(e) => setIncludeAnimation(e.target.checked)}
                    className={`w-4 h-4 cursor-pointer ${mediaType === "tv" ? "accent-emerald-500" : "accent-red-500"}`}
                  />
                  <span className="font-semibold text-xs">Includi Animazione</span>
                </label>
                <p className={`text-xs mt-0.5 ml-6 ${mediaType === "tv" ? "text-emerald-400" : "text-red-400"}`}>
                  Attiva per includere film/serie di animazione
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-6 mb-2">
            {status && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-xs font-semibold ${mediaType === "tv" ? "text-emerald-400" : "text-red-400"}`}>
                  {status}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep("platform")}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 text-sm bg-white/5 backdrop-blur-xl border-2 ${
                mediaType === "tv"
                  ? "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                  : "text-red-300 border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
              }`}
              disabled={isLoading}
            >
              ← Indietro
            </button>
            <button
              onClick={handleReset}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 text-sm bg-white/5 backdrop-blur-xl ${
                mediaType === "tv"
                  ? "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                  : "text-red-300 border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
              }`}
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              onClick={handleFind}
              disabled={isLoading}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-sm backdrop-blur-xl border-2 ${
                mediaType === "tv"
                  ? "bg-emerald-500/30 hover:bg-emerald-500/40 text-white border-emerald-400/60 shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.5)]"
                  : "bg-red-500/30 hover:bg-red-500/40 text-white border-red-400/60 shadow-[0_8px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_28px_rgba(239,68,68,0.5)]"
              }`}
            >
              {isLoading ? "Cercando..." : "Cerca"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
