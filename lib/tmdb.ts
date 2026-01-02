const TMDB_API_KEY = "f8ecb75282e8dcea2d4845598cc7d030"
const TMDB_BASE = "https://api.themoviedb.org/3"
const TMDB_REGION = "IT"
const TMDB_LANG = "it-IT"

export interface TMDBMovie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
}

export interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

export interface Providers {
  flatrate: Provider[]
  rent: Provider[]
  buy: Provider[]
}

export interface MovieResult {
  item: TMDBMovie
  providers: Providers
  mediaType: "movie" | "tv"
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: TMDB_LANG,
    ...params,
  })

  const url = `${TMDB_BASE}${path}?${searchParams}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Errore TMDB: ${response.status}`)
  }

  return response.json()
}

async function fetchProviders(mediaType: "movie" | "tv", id: number): Promise<Providers> {
  try {
    const data = await tmdbFetch(`/${mediaType}/${id}/watch/providers`)
    const it = data?.results?.[TMDB_REGION]

    if (!it) {
      return { flatrate: [], rent: [], buy: [] }
    }

    return {
      flatrate: it.flatrate || [],
      rent: it.rent || [],
      buy: it.buy || [],
    }
  } catch (error) {
    console.log("[v0] Error fetching providers:", error)
    return { flatrate: [], rent: [], buy: [] }
  }
}

function scoreMovie(movie: TMDBMovie, providers?: Providers, preferredPlatforms: number[] = []): number {
  const vote = movie.vote_average || 0
  const voteCount = movie.vote_count || 0
  const popularity = movie.popularity || 0

  // Normalizzazione con pesi bilanciati per risultati più pertinenti
  const voteNorm = Math.min(vote / 10, 1) // Voto medio normalizzato
  const countNorm = Math.min(Math.log10(voteCount + 1) / 4, 1) // Numero voti (affidabilità)
  const popNorm = Math.min(Math.log10(popularity + 1) / 3, 1) // Popolarità attuale

  // Formula bilanciata: privilegia qualità (voto) ma considera anche consenso (numero voti) e tendenza (popolarità)
  let baseScore = 0.6 * voteNorm + 0.25 * countNorm + 0.15 * popNorm

  if (preferredPlatforms.length > 0 && providers) {
    const allProviders = [...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])]
    const hasPreferred = allProviders.some((p) => preferredPlatforms.includes(p.provider_id))
    if (hasPreferred) {
      baseScore += 50 // Bonus enorme per garantire priorità assoluta
    }
  }

  return baseScore
}

function rankMovies(
  movies: TMDBMovie[],
  limit: number,
  providersMap?: Map<number, Providers>,
  preferredPlatforms: number[] = [],
): TMDBMovie[] {
  return movies
    .filter((m) => m.id)
    .map((m) => ({
      movie: m,
      score: scoreMovie(m, providersMap?.get(m.id), preferredPlatforms),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.movie)
}

export async function searchBasicMovies(genreIds: number[]): Promise<MovieResult[]> {
  const now = new Date()
  const year = now.getFullYear()
  const minYear = year - 12

  const genreFilter = genreIds.join(",")
  const excludeAnimation = !genreIds.includes(16) ? "16" : ""

  const params: Record<string, string> = {
    region: TMDB_REGION,
    include_adult: "false",
    with_genres: genreFilter,
    "primary_release_date.gte": `${minYear}-01-01`,
    "primary_release_date.lte": `${year}-12-31`,
    "vote_count.gte": "100",
    page: "1",
  }

  if (excludeAnimation) {
    params["without_genres"] = excludeAnimation
  }

  const data = await tmdbFetch("/discover/movie", params)

  const movies = data.results || []
  const ranked = rankMovies(movies, 30)
  const topMovies = ranked.slice(0, 3)

  const results: MovieResult[] = await Promise.all(
    topMovies.map(async (movie) => {
      const providers = await fetchProviders("movie", movie.id)
      return { item: movie, providers, mediaType: "movie" as const }
    }),
  )

  return results
}

export async function searchPremiumMovies(
  mediaType: "movie" | "tv",
  genreIds: number[],
  preferredPlatforms: number[] = [],
): Promise<MovieResult[]> {
  const now = new Date()
  const year = now.getFullYear()
  const minYear = year - 12

  const genreFilter = genreIds.join(",")
  const excludeAnimation = !genreIds.includes(16) ? "16" : ""

  const params: Record<string, string> = {
    region: TMDB_REGION,
    include_adult: "false",
    with_genres: genreFilter,
    "vote_count.gte": "50",
  }

  if (excludeAnimation) {
    params["without_genres"] = excludeAnimation
  }

  if (mediaType === "movie") {
    params["primary_release_date.gte"] = `${minYear}-01-01`
    params["primary_release_date.lte"] = `${year}-12-31`
  } else {
    params["first_air_date.gte"] = `${minYear}-01-01`
    params["first_air_date.lte"] = `${year}-12-31`
  }

  const path = mediaType === "tv" ? "/discover/tv" : "/discover/movie"

  const allItems: TMDBMovie[] = []
  const pagesToFetch = 5

  for (let page = 1; page <= pagesToFetch; page++) {
    const pageParams = { ...params, page: page.toString() }
    const data = await tmdbFetch(path, pageParams)
    const items = data.results || []
    allItems.push(...items)

    // Stop if we've reached the last page
    if (page >= data.total_pages || items.length === 0) {
      break
    }
  }

  console.log(`[v0] Fetched ${allItems.length} total items from TMDB`)

  const itemsWithProviders: Array<{ item: TMDBMovie; providers: Providers }> = await Promise.all(
    allItems.slice(0, 100).map(async (item: TMDBMovie) => {
      const providers = await fetchProviders(mediaType, item.id)
      return { item, providers }
    }),
  )

  // Crea mappa per il ranking
  const providersMap = new Map<number, Providers>()
  itemsWithProviders.forEach(({ item, providers }) => {
    providersMap.set(item.id, providers)
  })

  const ranked = rankMovies(
    itemsWithProviders.map((x) => x.item),
    80,
    providersMap,
    preferredPlatforms,
  )
  const topItems = ranked.slice(0, 60)

  console.log(`[v0] Returning ${topItems.length} ranked results`)

  const results: MovieResult[] = topItems.map((item) => ({
    item,
    providers: providersMap.get(item.id) || { flatrate: [], rent: [], buy: [] },
    mediaType,
  }))

  return results
}

export async function getTopRatedMovies(): Promise<MovieResult[]> {
  console.log("[v0] Fetching trending movies available on Italian streaming platforms")

  const trendingData = await tmdbFetch("/trending/movie/week")

  const trendingMovies = trendingData.results || []
  console.log(`[v0] Found ${trendingMovies.length} trending movies`)

  const qualityMovies = trendingMovies.filter((movie: TMDBMovie) => movie.vote_average >= 5.5 && movie.vote_count >= 30)

  console.log(`[v0] Filtered to ${qualityMovies.length} quality movies`)

  // Ottieni i provider per ciascun film e filtra solo quelli disponibili in streaming in Italia
  const moviesWithProviders: MovieResult[] = []

  for (const movie of qualityMovies) {
    const providers = await fetchProviders("movie", movie.id)

    const hasStreamingInItaly =
      (providers.flatrate && providers.flatrate.length > 0) ||
      (providers.rent && providers.rent.length > 0) ||
      (providers.buy && providers.buy.length > 0)

    if (hasStreamingInItaly) {
      moviesWithProviders.push({
        item: movie,
        providers,
        mediaType: "movie",
      })
    }

    if (moviesWithProviders.length >= 3) {
      break
    }
  }

  console.log(`[v0] Returning ${moviesWithProviders.length} movies available on streaming platforms`)

  return moviesWithProviders
}
