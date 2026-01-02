"use client"

import { useState, useEffect } from "react"
import { LoginView } from "@/components/login-view"
import { BasicView } from "@/components/basic-view"
import { PremiumView } from "@/components/premium-view"
import { ResultsView } from "@/components/results-view"
import { RankingsView } from "@/components/rankings-view"
import { CinemaEffects } from "@/components/cinema-effects"
import { useMovieStore } from "@/lib/store"

export type View = "login" | "choice" | "premium" | "results" | "rankings"
export type Mode = { demo: boolean; premium: boolean; label: string }

export default function MovieFinderPage() {
  const [view, setView] = useState<View>("login")
  const [mode, setMode] = useState<Mode>({ demo: false, premium: false, label: "BASIC" })
  const loadWatchedFromStorage = useMovieStore((state) => state.loadWatchedFromStorage)

  useEffect(() => {
    loadWatchedFromStorage()
  }, [loadWatchedFromStorage])

  useEffect(() => {
    const isMenuPage = view === "login" || view === "choice" || view === "premium"
    if (isMenuPage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [view])

  const handleModeSelect = (isPremium: boolean) => {
    if (isPremium) {
      localStorage.setItem("isPremium", "1")
      setMode({ demo: false, premium: true, label: "PREMIUM" })
      setView("premium")
    } else {
      localStorage.removeItem("isPremium")
      setMode({ demo: false, premium: false, label: "BASIC" })
      setView("choice")
    }
  }

  useEffect(() => {
    const isPremium = localStorage.getItem("isPremium") === "1"
    if (isPremium) {
      setMode({ demo: false, premium: true, label: "PREMIUM" })
    }
  }, [])

  return (
    <div className="movie-finder">
      {view === "login" && <CinemaEffects />}

      {view === "login" && <LoginView onModeSelect={handleModeSelect} />}
      {view === "choice" && <BasicView mode={mode} onNavigate={setView} />}
      {view === "premium" && <PremiumView mode={mode} onNavigate={setView} />}
      {view === "results" && <ResultsView mode={mode} onBack={() => setView(mode.premium ? "premium" : "choice")} />}
      {view === "rankings" && <RankingsView onNavigate={setView} />}
    </div>
  )
}
