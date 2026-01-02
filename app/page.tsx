"use client"

import { useState, useEffect } from "react"
import { LoginView } from "@/components/login-view"
import { BasicView } from "@/components/basic-view"
import { PremiumView } from "@/components/premium-view"
import { ResultsView } from "@/components/results-view"
import { RankingsView } from "@/components/rankings-view"
import { CinemaEffects } from "@/components/cinema-effects"
import { SplashScreen } from "@/components/splash-screen"
import { useMovieStore } from "@/lib/store"

export type View = "login" | "choice" | "premium" | "results" | "rankings"
export type Mode = { demo: boolean; premium: boolean; label: string }

export default function MovieFinderPage() {
  const [view, setView] = useState<View>("login")
  const [mode, setMode] = useState<Mode>({ demo: false, premium: false, label: "BASIC" })
  const [showSplash, setShowSplash] = useState(true)
  const loadWatchedFromStorage = useMovieStore((state) => state.loadWatchedFromStorage)
  const isClosing = useMovieStore((state) => state.isClosing)

  useEffect(() => {
    loadWatchedFromStorage()
  }, [loadWatchedFromStorage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const isPremium = localStorage.getItem("isPremium") === "1"
    if (isPremium) {
      setMode({ demo: false, premium: true, label: "PREMIUM" })
    }
  }, [])

  const handleModeSelect = (isPremium: boolean) => {
    const hasPremium = typeof window !== "undefined" ? localStorage.getItem("hasPremiumSubscription") === "true" : false

    if (isPremium) {
      if (hasPremium) {
        localStorage.setItem("isPremium", "1")
        setMode({ demo: false, premium: true, label: "PREMIUM" })
        setView("premium")
      } else {
        // User doesn't have premium subscription - show payment required message
        alert(
          "Premium richiede un abbonamento. Questa è una versione demo - in produzione si integra con Google Play Billing.",
        )
        // For demo purposes, allow access anyway
        localStorage.setItem("isPremium", "1")
        setMode({ demo: false, premium: true, label: "PREMIUM" })
        setView("premium")
      }
    } else {
      localStorage.removeItem("isPremium")
      setMode({ demo: false, premium: false, label: "BASIC" })
      setView("choice")
    }
  }

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <div className="movie-finder">
      {view === "login" && <CinemaEffects />}

      {view === "login" && <LoginView onModeSelect={handleModeSelect} />}
      {view === "choice" && <BasicView mode={mode} onNavigate={setView} />}
      {view === "premium" && <PremiumView mode={mode} onNavigate={setView} />}
      {view === "results" && <ResultsView mode={mode} onBack={() => setView(mode.premium ? "premium" : "choice")} />}
      {view === "rankings" && <RankingsView onNavigate={setView} />}

      {isClosing && (
        <div className="cinema-closing-overlay">
          <div className="cinema-screen-frame">
            <div className="cinema-screen-content">
              <div className="cinema-closing-text">
                METTITI COMODO
                <br />
                INIZIA LO SPETTACOLO
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
