"use client"

import { useEffect, useState } from "react"
import type { MovieResult } from "@/lib/tmdb"
import { useMovieStore } from "@/lib/store"

interface MovieCardProps {
  result: MovieResult
  isTvMode?: boolean
  isBasicMode?: boolean
}

export function MovieCard({ result, isTvMode = false, isBasicMode = false }: MovieCardProps) {
  const { item, providers, mediaType } = result
  const { toggleWatched, isWatched, triggerClosingEffect } = useMovieStore()
  const [watched, setWatched] = useState(false)
  const cardBg = "bg-[#141414]"
  const cardBorder = isBasicMode ? "border-[#0ea5e9]/20" : isTvMode ? "border-[#10b981]/20" : "border-[#d4af37]/20"
  const cardHover = isBasicMode
    ? "hover:border-[#0ea5e9] hover:shadow-[0_20px_40px_rgba(14,165,233,0.2)]"
    : isTvMode
      ? "hover:border-[#10b981] hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
      : "hover:border-[#d4af37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
  const titleColor = "text-white"
  const subtitleColor = "text-stone-500"
  const accentColor = isBasicMode ? "text-[#38bdf8]" : isTvMode ? "text-[#34d399]" : "text-[#d4af37]"
  const textColor = "text-stone-400"
  const btnSecondaryBg = "bg-[#1a1a1a]"
  const btnSecondaryHover = "hover:bg-[#262626]"
  const btnSecondaryText = isBasicMode ? "text-[#38bdf8]" : isTvMode ? "text-[#34d399]" : "text-[#d4af37]"
  const btnPrimaryBg = isBasicMode
    ? "bg-gradient-to-r from-[#0ea5e9] to-[#0284c7]"
    : isTvMode
      ? "bg-gradient-to-r from-[#10b981] to-[#059669]"
      : "bg-gradient-to-r from-[#d4af37] to-[#c39d2a]"
  const btnPrimaryHover = isBasicMode
    ? "hover:from-[#38bdf8] hover:to-[#0ea5e9]"
    : isTvMode
      ? "hover:from-[#34d399] hover:to-[#10b981]"
      : "hover:from-[#e5c048] hover:to-[#d4af37]"
  const btnPrimaryText = "text-white"

  const handleShare = async () => {
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareText = `Sto guardando: ${title}\n\nL'ho trovato grazie a MOVIE FINDER\nScarica adesso e trova i film e le serie tv più famose.\n\n${appUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} - Movie Finder`,
          text: shareText,
          url: appUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        alert("Link copiato negli appunti!")
      } else {
        alert("Condivisione non disponibile")
      }
    } catch (error) {
      console.log("[v0] Share cancelled:", error)
    }
  }

  const handleWatch = async () => {
    console.log("[v0] Watch button clicked, triggering closing effect")
    toggleWatched(mediaType, item.id)
    setWatched(true)

    // Trigger closing effect
    await triggerClosingEffect()
  }

  const title = mediaType === "tv" ? item.name : item.title
  const date = mediaType === "tv" ? item.first_air_date : item.release_date
  const year = date ? date.slice(0, 4) : ""
  const rating = item.vote_average ? item.vote_average.toFixed(1) : ""
  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null

  const getProviderLogo = (provider_name: string, logo_path?: string) => {
    if (logo_path) {
      return `https://image.tmdb.org/t/p/original${logo_path}`
    }
    return null
  }

  useEffect(() => {
    setWatched(isWatched(mediaType, item.id))
  }, [mediaType, item.id, isWatched])

  const truncateOverview = (text: string, isBasic: boolean) => {
    if (!text) return "Trama non disponibile."
    if (isBasic && text.length > 150) {
      return text.substring(0, 150) + "..."
    }
    return text
  }

  return (
    <div
      className={`glass-card ${isBasicMode ? "glass-card-basic" : "glass-card-premium"} rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1`}
    >
      <div className="flex flex-col sm:flex-row">
        {posterUrl && (
          <div className="sm:w-32 flex-shrink-0">
            <img
              src={posterUrl || "/placeholder.svg"}
              alt={title || "Poster"}
              className="w-full h-48 sm:h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 sm:p-6 flex-1">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className={`text-2xl font-light ${titleColor} mb-2 tracking-wide`}>
                  {title || "Titolo non disponibile"}
                </h3>
                <div className={`flex items-center gap-4 text-sm ${subtitleColor}`}>
                  {year && <span className="tracking-wide">{year}</span>}
                  {rating && <span className={`${accentColor} font-medium`}>★ {rating}</span>}
                </div>
              </div>
            </div>

            <p className={`${textColor} mb-6 leading-relaxed text-sm`}>
              {truncateOverview(item.overview || "", isBasicMode)}
            </p>

            {(providers.flatrate.length > 0 || providers.rent.length > 0 || providers.buy.length > 0) && (
              <div className="mb-6 space-y-4">
                {providers.flatrate.length > 0 && (
                  <div>
                    <span className={`text-xs ${subtitleColor} uppercase tracking-widest font-medium block mb-2`}>
                      Abbonamento
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {providers.flatrate.map((p, i) => (
                        <div
                          key={i}
                          className="relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        >
                          {p.logo_path ? (
                            <img
                              src={getProviderLogo(p.provider_name, p.logo_path) || "/placeholder.svg"}
                              alt={p.provider_name}
                              className="h-12 w-12 rounded-xl object-contain bg-white/90 p-2 shadow-lg hover:shadow-xl border border-white/10"
                              title={p.provider_name}
                            />
                          ) : (
                            <span
                              className={`text-xs px-3 py-2 rounded-lg ${titleColor} bg-white/10 font-medium border border-white/20`}
                            >
                              {p.provider_name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {providers.rent.length > 0 && (
                  <div>
                    <span className={`text-xs ${subtitleColor} uppercase tracking-widest font-medium block mb-2`}>
                      Noleggio
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {providers.rent.map((p, i) => (
                        <div
                          key={i}
                          className="relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        >
                          {p.logo_path ? (
                            <img
                              src={getProviderLogo(p.provider_name, p.logo_path) || "/placeholder.svg"}
                              alt={p.provider_name}
                              className="h-12 w-12 rounded-xl object-contain bg-white/90 p-2 shadow-lg hover:shadow-xl border border-white/10"
                              title={p.provider_name}
                            />
                          ) : (
                            <span
                              className={`text-xs px-3 py-2 rounded-lg ${titleColor} bg-white/10 font-medium border border-white/20`}
                            >
                              {p.provider_name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {providers.buy.length > 0 && (
                  <div>
                    <span className={`text-xs ${subtitleColor} uppercase tracking-widest font-medium block mb-2`}>
                      Acquisto
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {providers.buy.map((p, i) => (
                        <div
                          key={i}
                          className="relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        >
                          {p.logo_path ? (
                            <img
                              src={getProviderLogo(p.provider_name, p.logo_path) || "/placeholder.svg"}
                              alt={p.provider_name}
                              className="h-12 w-12 rounded-xl object-contain bg-white/90 p-2 shadow-lg hover:shadow-xl border border-white/10"
                              title={p.provider_name}
                            />
                          ) : (
                            <span
                              className={`text-xs px-3 py-2 rounded-lg ${titleColor} bg-white/10 font-medium border border-white/20`}
                            >
                              {p.provider_name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShare}
                className={`${btnSecondaryBg} ${btnSecondaryHover} ${btnSecondaryText} border border-[#262626] font-medium py-3 px-6 rounded-xl transition-all text-sm transform hover:-translate-y-1 tracking-wide`}
              >
                Condividi
              </button>
              <button
                onClick={handleWatch}
                className={`${btnPrimaryBg} ${btnPrimaryHover} ${btnPrimaryText} font-semibold py-3 px-6 rounded-xl transition-all text-sm transform hover:-translate-y-1 shadow-lg tracking-wide`}
              >
                Guarda
              </button>
              <div
                className={`font-medium py-3 px-6 rounded-xl text-sm tracking-wide ${
                  watched ? "bg-emerald-600 text-white" : "bg-[#1a1a1a] text-stone-600 border border-[#262626]"
                }`}
              >
                {watched ? "✓ Guardato" : "Non guardato"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
