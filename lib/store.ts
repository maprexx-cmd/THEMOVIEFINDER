import { create } from "zustand"
import type { MovieResult } from "./tmdb"

interface MovieStore {
  results: MovieResult[] | null
  source: "basic" | "premium" | null
  mediaType: "movie" | "tv" | null
  watchedMovies: Set<string>
  onlineOnly: boolean
  isClosing: boolean
  preferredPlatforms: number[]
  setResults: (results: MovieResult[], source: "basic" | "premium", mediaType?: "movie" | "tv") => void
  clearResults: () => void
  toggleWatched: (mediaType: "movie" | "tv", id: number) => void
  isWatched: (mediaType: "movie" | "tv", id: number) => boolean
  setOnlineOnly: (value: boolean) => void
  loadWatchedFromStorage: () => void
  triggerClosingEffect: () => Promise<void>
  setPreferredPlatforms: (platforms: number[]) => void
}

function watchedKey(mediaType: "movie" | "tv", id: number): string {
  return `${mediaType}:${id}`
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  results: null,
  source: null,
  mediaType: null,
  watchedMovies: new Set<string>(),
  onlineOnly: false,
  isClosing: false,
  preferredPlatforms: [],

  setResults: (results, source, mediaType = "movie") => set({ results, source, mediaType }),
  clearResults: () => set({ results: null, source: null, mediaType: null }),

  toggleWatched: (mediaType, id) => {
    const key = watchedKey(mediaType, id)
    const watched = new Set(get().watchedMovies)

    if (watched.has(key)) {
      watched.delete(key)
    } else {
      watched.add(key)
    }

    set({ watchedMovies: watched })

    // Salva in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("watchedMovies", JSON.stringify(Array.from(watched)))
    }
  },

  isWatched: (mediaType, id) => {
    const key = watchedKey(mediaType, id)
    return get().watchedMovies.has(key)
  },

  setOnlineOnly: (value) => set({ onlineOnly: value }),

  loadWatchedFromStorage: () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("watchedMovies")
        if (stored) {
          const arr = JSON.parse(stored)
          set({ watchedMovies: new Set(arr) })
        }
      } catch (error) {
        console.log("[v0] Error loading watched movies:", error)
      }
    }
  },

  triggerClosingEffect: async () => {
    set({ isClosing: true })
    await new Promise((resolve) => setTimeout(resolve, 6000))
    set({ isClosing: false })

    // Tentativo di chiudere l'app dopo l'effetto
    if (typeof window !== "undefined") {
      // Prova a chiudere la finestra/tab
      window.close()

      // Se window.close() non funziona (browser policy), reindirizza alla homepage
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    }
  },

  setPreferredPlatforms: (platforms) => set({ preferredPlatforms: platforms }),
}))
