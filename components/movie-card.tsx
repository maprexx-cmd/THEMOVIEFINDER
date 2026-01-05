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

  const title = mediaType === "tv" ? item.name : item.title
  const date = mediaType === "tv" ? item.first_air_date : item.release_date
  const year = date ? date.slice(0, 4) : ""
  const rating = item.vote_average ? item.vote_average.toFixed(1) : ""

  // più leggero su Android
  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : null

  useEffect(() => {
    setWatched(isWatched(mediaType, item.id))
  }, [mediaType, item.id, isWatched])

  const truncateOverview = (text: string, isBasic: boolean) => {
    if (!text) return "Trama non disponibile."
    const max = isBasic ? 140 : 220
    return text.length > max ? text.substring(0, max) + "..." : text
  }

  const handleShare = async () => {
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareText = `Sto guardando: ${title}\n\nL'ho trovato grazie a THE MOVIE FINDER\n\n${appUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} - THE MOVIE FINDER`,
          text: shareText,
          url: appUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        alert("Link copiato negli appunti!")
      } else {
        alert("Condivisione non disponibile")
      }
    } catch {}
  }

  const handleWatch = async () => {
    toggleWatched(mediaType, item.id)
    setWatched(true)
    await triggerClosingEffect()
  }

  const getProviderLogo = (logo_path?: string) => {
    if (!logo_path) return null
    return `https://image.tmdb.org/t/p/w92${logo_path}`
  }

  const providerList = [...providers.flatrate, ...providers.rent, ...providers.buy]
  const shownProviders = providerList.slice(0, 8)

  return (
    <div
      className={`glass-card ${isBasicMode ? "glass-card-basic" : "glass-card-premium"} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div className="flex flex-row">
        {posterUrl && (
          <div className="w-24 sm:w-28 flex-shrink-0 overflow-hidden bg-black/30">
            <img
              src={posterUrl}
              alt={title || "Poster"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ aspectRatio: "2 / 3" }}
            />
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className={`text-xl sm:text-2xl font-light ${titleColor} tracking-wide leading-tight`}>
                {title || "Titolo non disponibile"}
              </h3>
              <div className={`flex items-center gap-3 text-xs ${subtitleColor} mt-1`}>
                {year && <span className="tracking-wide">{year}</span>}
                {rating && <span className={`${accentColor} font-medium`}>★ {rating}</span>}
              </div>
            </div>
          </div>

          <p className={`${textColor} mb-3 leading-relaxed text-sm`}>
            {truncateOverview(item.overview || "", isBasicMode)}
          </p>

          {shownProviders.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {shownProviders.map((p, i) => (
                  <div key={i} className="transform transition-all duration-200 hover:scale-105">
                    {p.logo_path ? (
                      <img
                        src={getProviderLogo(p.logo_path) || "/placeholder.svg"}
                        alt={p.provider_name}
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-10 rounded-lg object-contain bg-white/90 p-1.5 border border-white/10"
                        title={p.provider_name}
                      />
                    ) : (
                      <span className={`text-xs px-2 py-2 rounded-lg ${titleColor} bg-white/10 border border-white/20`}>
                        {p.provider_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className={`${btnSecondaryBg} ${btnSecondaryHover} ${btnSecondaryText} border border-[#262626] font-medium py-2 px-4 rounded-xl transition-all text-sm`}
            >
              Condividi
            </button>

            <button
              onClick={handleWatch}
              className={`${btnPrimaryBg} ${btnPrimaryHover} ${btnPrimaryText} font-semibold py-2 px-4 rounded-xl transition-all text-sm shadow-lg`}
            >
              Guarda
            </button>

            <div
              className={`font-medium py-2 px-4 rounded-xl text-sm ${
                watched ? "bg-emerald-600 text-white" : "bg-[#1a1a1a] text-stone-600 border border-[#262626]"
              }`}
            >
              {watched ? "✓ Guardato" : "Non guardato"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

