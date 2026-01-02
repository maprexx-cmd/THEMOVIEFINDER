"use client"

import { useEffect, useState } from "react"
import type { View } from "@/app/page"
import { getTopRatedMovies, type MovieResult } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"

interface RankingsViewProps {
  onNavigate: (view: View) => void
}

export function RankingsView({ onNavigate }: RankingsViewProps) {
  const [movies, setMovies] = useState<MovieResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTopMovies() {
      console.log("[v0] Loading top rated movies...")
      setIsLoading(true)
      try {
        const results = await getTopRatedMovies()
        console.log("[v0] Loaded movies:", results.length)
        setMovies(results)
      } catch (error) {
        console.log("[v0] Error loading top movies:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTopMovies()
  }, [])

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto text-white p-6 relative elegant-stripes">
      <img src="/background.png" alt="" className="fixed inset-0 w-full h-full object-cover opacity-50" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-500/20 backdrop-blur-xl text-white border border-orange-400/40 px-4 py-2 rounded-full mb-4 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <span className="text-sm font-bold">CLASSIFICHE</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Top 5 del Mese</h1>
          <p className="text-stone-400 text-sm">
            I film più apprezzati questo mese, disponibili sulle piattaforme italiane
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
            <p className="mt-4 text-stone-400">Caricamento classifiche...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400">Nessun film trovato nelle classifiche questo mese</p>
          </div>
        ) : (
          <div className="space-y-6">
            {movies.map((result, index) => (
              <div key={result.item.id} className="relative">
                <div className="absolute -left-4 -top-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/50 z-10">
                  {index + 1}
                </div>
                <MovieCard result={result} isTvMode={false} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 items-center">
          <button
            onClick={() => onNavigate("premium")}
            className="bg-white/5 backdrop-blur-xl hover:bg-orange-500/20 text-orange-300 hover:text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 border-2 border-orange-400/40 hover:border-orange-400/60 transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            ← Torna Indietro
          </button>
        </div>
      </div>
    </div>
  )
}
