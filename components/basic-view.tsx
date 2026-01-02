"use client"

import { useState } from "react"
import type { Mode, View } from "@/app/page"
import { searchBasicMovies } from "@/lib/tmdb"
import { useMovieStore } from "@/lib/store"

interface BasicViewProps {
  mode: Mode
  onNavigate: (view: View) => void
}

const GENRES = [
  { key: "commedia", label: "Comicità", value: 35 },
  { key: "azione", label: "Azione", value: 28 },
  { key: "thriller", label: "Thriller", value: 53 },
  { key: "animazione", label: "Animazione", value: 16 },
]

export function BasicView({ mode, onNavigate }: BasicViewProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("Seleziona i generi e clicca Trova 3 film")
  const setResults = useMovieStore((state) => state.setResults)

  const checkUsageLimit = () => {
    if (typeof window === "undefined") return true

    const lastUsage = localStorage.getItem("basicLastUsage")
    const now = Date.now()

    if (lastUsage) {
      const timeDiff = now - Number.parseInt(lastUsage)
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff < 24) {
        return false
      }
    }

    return true
  }

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]))
  }

  const handleFind = async () => {
    if (selectedGenres.length === 0) {
      setStatus("Seleziona almeno un genere!")
      return
    }

    if (!checkUsageLimit()) {
      setStatus("Hai raggiunto il limite giornaliero. Torna domani o passa a Premium!")
      setTimeout(() => {
        onNavigate("login")
      }, 3000)
      return
    }

    setIsLoading(true)
    setStatus("Sto cercando il film giusto per te...")

    try {
      const results = await searchBasicMovies(selectedGenres)
      setResults(results, "basic")

      if (typeof window !== "undefined") {
        localStorage.setItem("basicLastUsage", Date.now().toString())
      }

      onNavigate("results")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Errore durante la ricerca")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto p-6 relative elegant-stripes">
      <img src="/background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />

      <div className="max-w-2xl mx-auto pb-36 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/50 px-5 py-2 rounded-full mb-6">
            <span className="text-sm font-medium tracking-wider text-cyan-300 uppercase">{mode.label}</span>
          </div>
          <h1 className="text-4xl font-light mb-3 tracking-wide">Modalità Basic</h1>
          <p className="text-stone-500 text-sm tracking-wide">3 film al giorno • Generi base</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 mb-6 shadow-[0_16px_56px_rgba(6,182,212,0.4)]">
          <h2 className="text-xl font-light mb-6 text-center tracking-wide">Seleziona i generi</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((genre) => (
              <label
                key={genre.key}
                className={`flex items-center justify-center gap-3 p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedGenres.includes(genre.value)
                    ? "bg-gradient-to-br from-cyan-500/40 to-blue-500/40 backdrop-blur-xl text-white shadow-[0_8px_20px_rgba(6,182,212,0.7)] border-2 border-cyan-400/70"
                    : "bg-white/5 backdrop-blur-xl text-stone-300 hover:bg-cyan-500/10 border border-cyan-400/20 hover:border-cyan-400/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.value)}
                  onChange={() => handleGenreToggle(genre.value)}
                  className="sr-only"
                />
                <span className="font-medium tracking-wide text-sm">{genre.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-stone-500 text-sm tracking-wide">{status}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setSelectedGenres([])}
            className="flex-1 bg-white/5 backdrop-blur-xl hover:bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 font-medium py-3 px-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wide"
            disabled={isLoading}
          >
            Cancella
          </button>
          <button
            onClick={handleFind}
            disabled={isLoading || selectedGenres.length === 0}
            className="flex-1 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 backdrop-blur-xl hover:from-cyan-500/70 hover:to-blue-500/70 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 text-sm tracking-wide border border-cyan-400/50"
          >
            {isLoading ? "Cercando..." : "Trova 3 film"}
          </button>
        </div>

        <button
          onClick={() => onNavigate("login")}
          className="w-full bg-white/5 backdrop-blur-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 font-medium py-3 px-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wide"
        >
          ⭐ Passa a Premium
        </button>

        <button
          onClick={() => onNavigate("login")}
          className="w-full bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium py-3 px-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wide mt-3"
        >
          ← Indietro
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 min-h-[100px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-stone-600 text-xs mb-2 uppercase tracking-wider">Pubblicità</p>
              <div id="adsense-placeholder" className="text-stone-700 text-sm">
                {/* AdSense code goes here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
