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
    <div className="min-h-screen max-h-screen overflow-y-auto bg-[#0f0e0d] text-[#F0C87A] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#D8A24A] text-[#0f0e0d] px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-bold">CLASSIFICHE</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Top 5 del Mese</h1>
          <p className="text-[#A0826D] text-sm">
            I film più apprezzati questo mese, disponibili sulle piattaforme italiane
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D8A24A] border-t-transparent"></div>
            <p className="mt-4 text-[#A0826D]">Caricamento classifiche...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A0826D]">Nessun film trovato nelle classifiche questo mese</p>
          </div>
        ) : (
          <div className="space-y-6">
            {movies.map((result, index) => (
              <div key={result.item.id} className="relative">
                <div className="absolute -left-4 -top-4 bg-[#D8A24A] text-[#0f0e0d] w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-10">
                  {index + 1}
                </div>
                <MovieCard result={result} isTvMode={false} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate("premium")}
            className="bg-[#2a2419] hover:bg-[#3a3429] text-[#F0C87A] font-bold py-3 px-8 rounded-lg transition-all duration-300 border-2 border-[#4a3f2d] transform hover:scale-105 active:scale-95"
          >
            ← Torna Indietro
          </button>
        </div>
      </div>
    </div>
  )
}
