"use client"

import { useMovieStore } from "@/lib/store"

export function CinemaEffects() {
  const isClosing = useMovieStore((state) => state.isClosing)

  return (
    <>
      <div className="cinema-grain" />
      <div className="cinema-vignette" />
      {isClosing && (
        <div className="cinema-closing-overlay">
          <div className="cinema-closing-text text-center max-w-2xl mx-auto px-4">
            METTITI COMODO, LO SPETTACOLO STA PER COMINCIARE
          </div>
        </div>
      )}
    </>
  )
}
