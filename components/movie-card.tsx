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

  const title = mediaType === "tv" ? item.name : item.title
  const date = mediaType === "tv" ? item.first_air_date : item.release_date
  const year = date ? date.slice(0, 4) : ""
  const rating = item.vote_average ? item.vote_average.toFixed(1) : ""
  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null

  useEffect(() => {
    setWatched(isWatched(mediaType, item.id))
  }, [mediaType, item.id, isWatched])

  const truncateOverview = (text: string, isBasic: boolean) => {
    if (!text) return "Trama non disponibile."
    const max = isBasic ? 110 : 180
    return text.length > max ? text.substring(0, max) + "…" : text
  }

  const handleShare = async () => {
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareText = `Sto guardando: ${title}\n\nTrovato con THE MOVIE FINDER\n${appUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} - THE MOVIE FINDER`,
          text: shareText,
          url: appUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        alert("Link copiato negli appunti")
      }
    } catch {}
  }

  const handleWatch = async () => {
    toggleWatched(mediaType, item.id)
    setWatched(true)
    await triggerClosingEffect()
  }

  return (
    <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden transition-all hover:shadow-xl">
      <div className="flex">
        {posterUrl && (
          <div className="w-24 sm:w-28 flex-shrink-0 bg-black">
            <img
              src={posterUrl}
              alt={title || "Poster"}
              className="w-full h-full object-cover"
              style={{ aspectRatio: "2 / 3" }}
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-lg font-medium text-white leading-tight">
                {title || "Titolo non disponibile"}
              </h3>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                {year && <span>{year}</span>}
                {rating && <span className="text-yellow-400">★ {rating}</span>}
              </div>
            </div>
          </div>

          <p className="text-sm text-stone-400 leading-snug mb-3">
            {truncateOverview(item.overview || "", isBasicMode)}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-sm rounded-lg bg-[#1a1a1a] text-stone-300 hover:bg-[#262626]"
            >
              Condividi
            </button>
            <button
              onClick={handleWatch}
              className="px-3 py-1.5 text-sm rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Guarda
            </button>
            <div
              className={`px-3 py-1.5 text-sm rounded-lg ${
                watched ? "bg-emerald-600 text-white" : "bg-[#1a1a1a] text-stone-500"
              }`}
            >
              {watched ? "✓ Guardato" : "Non guardato"}
            </div>
          </div>

          {(providers.flatrate.length > 0 ||
            providers.rent.length > 0 ||
            providers.buy.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {[...providers.flatrate, ...providers.rent, ...providers.buy].slice(0, 6).map((p, i) => (
                <div key={i} className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  {p.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                      alt={p.provider_name}
                      className="w-6 h-6 object-contain"
                      title={p.provider_name}
                    />
                  ) : (
                    <span className="text-[10px] text-black font-semibold">
                      {p.provider_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// COMMENTO MIO: qui voglio ricordarmi perché ho fatto questa scelta
