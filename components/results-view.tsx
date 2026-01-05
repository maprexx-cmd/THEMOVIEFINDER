"use client"

import { useState, useEffect } from "react"
import { useMovieStore } from "@/lib/store"
import { MovieCard } from "@/components/movie-card"
import type { Mode } from "@/app/page"

interface ResultsViewProps {
  mode: Mode
  onBack: () => void
}

const RESULTS_PER_PAGE = 5

export function ResultsView({ mode, onBack }: ResultsViewProps) {
  const { results, source, mediaType, onlineOnly } = useMovieStore()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [results])

  const isBasicMode = source === "basic"
  const isTvMode = mediaType === "tv"

  const filteredResults =
    results && onlineOnly
      ? results.filter(
          (r) =>
            r.providers.flatrate.length > 0 ||
            r.providers.rent.length > 0 ||
            r.providers.buy.length > 0,
        )
      : results

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center relative elegant-stripes">
        <img
          src="/background.png"
          alt=""
          className="fixed inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="text-center relative z-10">
          <p className="text-xl mb-4 text-white">
            {onlineOnly
              ? "Nessun risultato disponibile online"
              : "Nessun risultato trovato"}
          </p>
          <button
            onClick={onBack}
            className={`font-bold py-3 px-6 rounded-lg transition-all bg-white/5 backdrop-blur-xl border hover:bg-white/10 text-white ${
              isBasicMode
                ? "border-cyan-400/40 hover:border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                : "border-yellow-400/40 hover:border-yellow-400/60 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            }`}
          >
            Torna indietro
          </button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredResults.length / RESULTS_PER_PAGE)
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
  const endIndex = startIndex + RESULTS_PER_PAGE

  const resultsToShow = isBasicMode
    ? filteredResults
    : filteredResults.slice(startIndex, endIndex)

  const showPagination = !isBasicMode && totalPages > 1

  const getPageNumbers = () => {
    const maxPagesToShow = 8
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const startPage = Math.max(1, currentPage - 3)
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="min-h-screen p-6 relative elegant-stripes">
      <img
        src="/background.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-50"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div
            className={`inline-block px-4 py-2 rounded-full mb-4 backdrop-blur-xl border ${
              isBasicMode
                ? "bg-cyan-500/20 border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                : "bg-yellow-500/20 border-yellow-400/40 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                isBasicMode ? "text-cyan-300" : "text-yellow-300"
              }`}
            >
              {source === "premium" ? "PREMIUM" : "BASIC"}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-white">
            I tuoi risultati
          </h1>

          <p className="text-sm text-gray-400">
            Abbiamo trovato {filteredResults.length}{" "}
            {filteredResults.length === 1 ? "titolo" : "titoli"} per te
          </p>

          {!isBasicMode && totalPages > 1 && (
            <p className="text-xs mt-2 text-gray-400">
              Pagina {currentPage} di {totalPages}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {resultsToShow.map((item) => (
            <MovieCard
              key={`${item.item.id}-${item.mediaType}`}
              result={item}
              isTvMode={isTvMode}
              isBasicMode={isBasicMode}
            />
          ))}
        </div>

        {showPagination && (
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/10 backdrop-blur-xl border border-yellow-400/30 hover:bg-yellow-500/20 hover:border-yellow-400/50 text-white shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              ← Precedente
            </button>

            <div className="flex gap-2">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    currentPage === page
                      ? "bg-yellow-500/40 backdrop-blur-xl border border-yellow-400/60 text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                      : "bg-white/10 backdrop-blur-xl border border-yellow-400/20 hover:bg-yellow-500/20 hover:border-yellow-400/40 text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/10 backdrop-blur-xl border border-yellow-400/30 hover:bg-yellow-500/20 hover:border-yellow-400/50 text-white shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              Successiva →
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className={`font-bold py-4 px-8 rounded-lg transition-all shadow-lg backdrop-blur-xl border hover:scale-105 text-white transform ${
              isBasicMode
                ? "bg-white/10 border-cyan-400/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                : "bg-white/10 border-yellow-400/30 hover:bg-yellow-500/20 hover:border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            }`}
          >
            ← Torna indietro
          </button>
        </div>
      </div>
    </div>
  )
}
