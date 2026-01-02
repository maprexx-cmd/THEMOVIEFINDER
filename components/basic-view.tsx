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
  const [showLimitModal, setShowLimitModal] = useState(false)
  const setResults = useMovieStore((state) => state.setResults)

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]))
  }

  const handleFind = async () => {
    if (selectedGenres.length === 0) {
      setStatus("Seleziona almeno un genere!")
      return
    }

    setIsLoading(true)
    setStatus("Sto cercando il film giusto per te...")

    try {
      const results = await searchBasicMovies(selectedGenres)
      setResults(results, "basic")
      onNavigate("results")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Errore durante la ricerca")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLimitModalClose = () => {
    setShowLimitModal(false)
    onNavigate("login")
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-[#0a0a0a] text-white p-6 relative">
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141414] border border-[#0ea5e9]/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-full bg-[#0ea5e9]/10 mb-4">
                <img src="/icon-512-v6.png" alt="Movie Finder" className="w-16 h-16" />
              </div>
            </div>
            <h2 className="text-3xl font-light text-white mb-2 tracking-wider">Scelte Terminate</h2>
            <p className="text-stone-400 mb-8 text-sm tracking-wide">Torna domani per nuove scelte</p>
            <button
              onClick={handleLimitModalClose}
              className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0ea5e9] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto pb-36">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 px-5 py-2 rounded-full mb-6">
            <span className="text-sm font-medium tracking-wider text-[#38bdf8] uppercase">{mode.label}</span>
          </div>
          <h1 className="text-4xl font-light mb-3 tracking-wide">Modalità Basic</h1>
          <p className="text-stone-500 text-sm tracking-wide">3 film al giorno • Generi base</p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-xl font-light mb-6 text-center tracking-wide">Seleziona i generi</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((genre) => (
              <label
                key={genre.key}
                className={`flex items-center justify-center gap-3 p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedGenres.includes(genre.value)
                    ? "bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white shadow-[0_8px_20px_rgba(14,165,233,0.4)]"
                    : "bg-[#1a1a1a] text-stone-400 hover:bg-[#262626] border border-[#262626] hover:border-[#3a3a3a]"
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
            className="flex-1 bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#262626] hover:border-[#3a3a3a] font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wide"
            disabled={isLoading}
          >
            Cancella
          </button>
          <button
            onClick={handleFind}
            disabled={isLoading || selectedGenres.length === 0}
            className="flex-1 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0ea5e9] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(14,165,233,0.3)] transform hover:-translate-y-1 text-sm tracking-wide"
          >
            {isLoading ? "Cercando..." : "Trova 3 film"}
          </button>
        </div>

        <button
          onClick={() => onNavigate("login")}
          className="w-full bg-transparent border border-[#0ea5e9]/30 text-[#38bdf8] hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9] font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wide"
        >
          Passa a Premium
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 min-h-[100px] flex items-center justify-center">
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
