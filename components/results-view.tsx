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

  const bgColor = isBasicMode ? "bg-[#0a0e12]" : isTvMode ? "bg-[#0f120e]" : "bg-[#0f0e0d]"
  const textColor = isBasicMode ? "text-[#7CB9E8]" : isTvMode ? "text-[#A8D5AA]" : "text-[#F0C87A]"
  const badgeBg = isBasicMode ? "bg-[#1a2a3a]" : isTvMode ? "bg-[#2a3f2a]" : "bg-[#2a2419]"
  const subtitleColor = isBasicMode ? "text-[#5A8FB8]" : isTvMode ? "text-[#7AA87C]" : "text-[#A0826D]"
  const btnBg = isBasicMode
    ? "bg-[#1a2a3a] hover:bg-[#2a3a4a] text-[#7CB9E8] border-2 border-[#3a4a5a]"
    : isTvMode
      ? "bg-[#1a2a1a] hover:bg-[#2a3a2a] text-[#A8D5AA] border-2 border-[#3a5a3a]"
      : "bg-[#2a2419] hover:bg-[#3a3429] text-[#F0C87A] border-2 border-[#4a3f2d]"
  const btnPrimary = isBasicMode
    ? "bg-[#7CB9E8] hover:bg-[#6AA9D8] text-[#0a0e12]"
    : isTvMode
      ? "bg-[#6B9B6E] hover:bg-[#5A8A5D] text-[#0f120e]"
      : "bg-[#D8A24A] hover:bg-[#C89239] text-[#0f0e0d]"
  const btnPrimaryActive = isBasicMode
    ? "bg-[#7CB9E8] text-[#0a0e12]"
    : isTvMode
      ? "bg-[#6B9B6E] text-[#0f120e]"
      : "bg-[#D8A24A] text-[#0f0e0d]"

  const bgGlass = isBasicMode ? "glass-background-basic" : "glass-background-premium"

  const filteredResults =
    results && onlineOnly
      ? results.filter(
          (r) => r.providers.flatrate.length > 0 || r.providers.rent.length > 0 || r.providers.buy.length > 0,
        )
      : results

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <div className={`min-h-screen p-6 flex items-center justify-center ${bgColor} ${textColor}`}>
        <div className="text-center">
          <p className="text-xl mb-4">
            {onlineOnly ? "Nessun risultato disponibile online" : "Nessun risultato trovato"}
          </p>
          <button onClick={onBack} className={`font-bold py-3 px-6 rounded-lg transition-all ${btnPrimary}`}>
            Torna indietro
          </button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredResults.length / RESULTS_PER_PAGE)
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
  const endIndex = startIndex + RESULTS_PER_PAGE
  const resultsToShow = isBasicMode ? filteredResults : filteredResults.slice(startIndex, endIndex)
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
    <div className={`min-h-screen p-6 ${bgGlass} ${textColor} ${isBasicMode ? "pb-32" : ""} relative`}>
      {isBasicMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e12] border-t-2 border-[#1a2a3a]">
          <div className="max-w-6xl mx-auto p-4">
            <div className="bg-[#1a2a3a] rounded-lg p-4 border-2 border-[#2a3a4a] min-h-[100px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#5A8FB8] text-xs mb-1">Pubblicità</p>
                <div id="adsense-placeholder" className="text-[#3a4a5a] text-sm">
                  {/* AdSense code goes here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className={`inline-block px-4 py-2 rounded-full mb-4 ${badgeBg}`}>
            <span className="text-sm font-bold">{source === "premium" ? "PREMIUM" : "BASIC"}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">I tuoi risultati</h1>
          <p className={`text-sm ${subtitleColor}`}>
            Abbiamo trovato {filteredResults.length} {filteredResults.length === 1 ? "titolo" : "titoli"} per te
          </p>
          {totalPages > 1 && (
            <p className={`text-xs mt-2 ${subtitleColor}`}>
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
              className={`px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnBg}`}
            >
              ← Precedente
            </button>

            <div className="flex gap-2">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    currentPage === page ? btnPrimaryActive : btnBg
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnBg}`}
            >
              Successiva →
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button onClick={onBack} className={`font-bold py-4 px-8 rounded-lg transition-all shadow-lg ${btnPrimary}`}>
            ← Torna indietro
          </button>
        </div>
      </div>
    </div>
  )
}
