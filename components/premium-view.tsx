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
      <div className="min-h-screen bg-[#0f0e0d] text-[#F0C87A] p-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl mb-4">🔒</div>
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
    )
  }

  if (step === "login") {
    return (
      <div className="min-h-screen max-h-screen overflow-y-auto bg-[#0f0e0d] text-[#F0C87A] p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Cosa vuoi cercare?</h1>
            <p className="text-[#A0826D] text-xs">Scegli tra film o serie TV</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setMediaType("movie")
                setStep("platform")
              }}
              className="bg-[#1a1712] border-2 border-[#4a3f2d] hover:border-[#D8A24A] hover:bg-[#2a2419] text-[#F0C87A] p-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-[0_8px_20px_rgba(216,162,74,0.3)]"
            >
              <div className="mb-3 flex justify-center">
                <img
                  src="/icon-512-v6.png"
                  alt="Film"
                  className="w-16 h-16"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(240, 200, 122, 0.4))",
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-1">Film</h2>
              <p className="text-[#A0826D] text-xs">Cerca il film perfetto per te</p>
            </button>

            <button
              onClick={() => {
                setMediaType("tv")
                setStep("platform")
              }}
              className="bg-[#151a15] border-2 border-[#3a5a3a] hover:border-[#6B9B6E] hover:bg-[#1a2419] text-[#A8D5AA] p-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-[0_8px_20px_rgba(107,155,110,0.3)]"
            >
              <div className="mb-3 flex justify-center">
                <img
                  src="/icon-512-v6.png"
                  alt="Serie TV"
                  className="w-16 h-16"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(107, 155, 110, 0.4))",
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-1">Serie TV</h2>
              <p className="text-[#7AA87C] text-xs">Scopri la serie perfetta per te</p>
            </button>
          </div>

          <button
            onClick={() => {
              console.log("[v0] Navigating to rankings")
              onNavigate("rankings")
            }}
            className="w-full bg-[#2a2419] hover:bg-[#D8A24A] hover:text-[#0f0e0d] text-[#F0C87A] border-2 border-[#D8A24A] font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 hover:shadow-[0_8px_20px_rgba(216,162,74,0.4)] text-lg"
          >
            <img src="/icon-512-v6.png" alt="" className="w-6 h-6" />
            Classifiche
          </button>

          <button
            onClick={() => onNavigate("login")}
            className="w-full bg-transparent border-2 border-[#4a3f2d] text-[#F0C87A] hover:bg-[#2a2419] hover:border-[#D8A24A] font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            ← Torna a log in
          </button>
        </div>
      </div>
    )
  }

  if (step === "platform") {
    return (
      <div
        className={`min-h-screen max-h-screen overflow-y-auto p-6 ${mediaType === "tv" ? "bg-[#0f120e] text-[#A8D5AA]" : "bg-[#0f0e0d] text-[#F0C87A]"}`}
      >
        <div className="max-w-3xl mx-auto pb-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Piattaforme Preferite</h1>
            <p className={`text-sm ${mediaType === "tv" ? "text-[#7AA87C]" : "text-[#A0826D]"}`}>
              Seleziona le piattaforme dove preferisci guardare i contenuti (opzionale)
            </p>
          </div>

          <div
            className={`rounded-lg p-4 mb-6 border-2 ${mediaType === "tv" ? "bg-[#151a15] border-[#2a3f2a]" : "bg-[#1a1712] border-[#2a2419]"}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STREAMING_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-3 rounded-lg font-semibold text-sm transition-all duration-300 border-2 ${
                    selectedPlatforms.includes(platform.id)
                      ? mediaType === "tv"
                        ? "bg-[#6B9B6E] text-[#0f120e] border-[#6B9B6E] shadow-[0_8px_20px_rgba(107,155,110,0.4)]"
                        : "bg-[#D8A24A] text-[#0f0e0d] border-[#D8A24A] shadow-[0_8px_20px_rgba(216,162,74,0.4)]"
                      : mediaType === "tv"
                        ? "bg-[#1a2a1a] text-[#A8D5AA] border-[#3a5a3a] hover:bg-[#2a3a2a] hover:shadow-[0_4px_12px_rgba(107,155,110,0.2)]"
                        : "bg-[#2a2419] text-[#F0C87A] border-[#4a3f2d] hover:bg-[#3a3429] hover:shadow-[0_4px_12px_rgba(216,162,74,0.2)]"
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
              className={`flex-1 font-bold py-4 px-6 rounded-lg transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 ${
                mediaType === "tv"
                  ? "bg-[#1a2a1a] hover:bg-[#2a3a2a] text-[#A8D5AA] border-[#3a5a3a] hover:shadow-[0_4px_12px_rgba(107,155,110,0.2)]"
                  : "bg-[#2a2419] hover:bg-[#3a3429] text-[#F0C87A] border-[#4a3f2d] hover:shadow-[0_4px_12px_rgba(216,162,74,0.2)]"
              }`}
            >
              ← Indietro
            </button>
            <button
              onClick={() => setStep("genre")}
              className={`flex-1 font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                mediaType === "tv"
                  ? "bg-[#6B9B6E] hover:bg-[#5A8A5D] text-[#0f120e] shadow-[0_8px_20px_rgba(107,155,110,0.3)] hover:shadow-[0_12px_28px_rgba(107,155,110,0.4)]"
                  : "bg-[#D8A24A] hover:bg-[#C89239] text-[#0f0e0d] shadow-[0_8px_20px_rgba(216,162,74,0.3)] hover:shadow-[0_12px_28px_rgba(216,162,74,0.4)]"
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
      <div
        className={`min-h-screen max-h-screen overflow-hidden p-3 ${mediaType === "tv" ? "bg-[#0f120e] text-[#A8D5AA]" : "bg-[#0f0e0d] text-[#F0C87A]"}`}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col justify-between py-1">
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold mb-1">Preferenze di Genere</h1>
            <p className={`text-xs ${mediaType === "tv" ? "text-[#7AA87C]" : "text-[#A0826D]"}`}>
              Usa gli slider per indicare quanto ti piace ogni genere (0-10)
            </p>
          </div>

          <div
            className={`rounded-lg p-3 mb-2 border-2 flex-shrink overflow-y-auto ${mediaType === "tv" ? "bg-[#151a15] border-[#2a3f2a]" : "bg-[#1a1712] border-[#2a2419]"}`}
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="space-y-2">
              {PREMIUM_GENRES.map((genre) => (
                <div key={genre.key}>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-semibold text-xs">{genre.label}</span>
                    <span className={`font-bold text-xs ${mediaType === "tv" ? "text-[#6B9B6E]" : "text-[#D8A24A]"}`}>
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
                      background: `linear-gradient(to right, 
                        ${mediaType === "tv" ? "#2a3f2a" : "#2a2419"} 0%, 
                        ${mediaType === "tv" ? "#3a5a3a" : "#4a3f2d"} ${(sliders[genre.key] / 10) * 30}%, 
                        ${mediaType === "tv" ? "#5a8a5a" : "#8a7a4d"} ${(sliders[genre.key] / 10) * 60}%, 
                        ${mediaType === "tv" ? "#6B9B6E" : "#D8A24A"} ${(sliders[genre.key] / 10) * 100}%)`,
                    }}
                  />
                </div>
              ))}

              <div className="pt-2 border-t border-[#3a3429]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnimation}
                    onChange={(e) => setIncludeAnimation(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#D8A24A]"
                  />
                  <span className="font-semibold text-xs">Includi Animazione</span>
                </label>
                <p className={`text-xs mt-0.5 ml-6 ${mediaType === "tv" ? "text-[#7AA87C]" : "text-[#A0826D]"}`}>
                  Attiva per includere film/serie di animazione
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-6 mb-2">
            {status && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-xs font-semibold ${mediaType === "tv" ? "text-[#7AA87C]" : "text-[#A0826D]"}`}>
                  {status}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep("platform")}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 text-sm ${
                mediaType === "tv"
                  ? "bg-[#1a2a1a] hover:bg-[#2a3a2a] text-[#A8D5AA] border-[#3a5a3a] hover:shadow-[0_4px_12px_rgba(107,155,110,0.2)]"
                  : "bg-[#2a2419] hover:bg-[#3a3429] text-[#F0C87A] border-[#4a3f2d] hover:shadow-[0_4px_12px_rgba(216,162,74,0.2)]"
              }`}
              disabled={isLoading}
            >
              ← Indietro
            </button>
            <button
              onClick={handleReset}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 text-sm ${
                mediaType === "tv"
                  ? "bg-[#1a2a1a] hover:bg-[#2a3a2a] text-[#A8D5AA] border-[#3a5a3a] hover:shadow-[0_4px_12px_rgba(107,155,110,0.2)]"
                  : "bg-[#2a2419] hover:bg-[#3a3429] text-[#F0C87A] border-[#4a3f2d] hover:shadow-[0_4px_12px_rgba(216,162,74,0.2)]"
              }`}
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              onClick={handleFind}
              disabled={isLoading}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-sm ${
                mediaType === "tv"
                  ? "bg-[#6B9B6E] hover:bg-[#5A8A5D] text-[#0f120e] shadow-[0_8px_20px_rgba(107,155,110,0.3)] hover:shadow-[0_12px_28px_rgba(107,155,110,0.4)]"
                  : "bg-[#D8A24A] hover:bg-[#C89239] text-[#0f0e0d] shadow-[0_8px_20px_rgba(216,162,74,0.3)] hover:shadow-[0_12px_28px_rgba(216,162,74,0.4)]"
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
