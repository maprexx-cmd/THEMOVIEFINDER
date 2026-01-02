"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a1410] text-[#F0C87A] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[#0f0a08] border border-[#D8A24A]/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-[#F0C87A] mb-6">Privacy Policy - Movie Finder</h1>

        <div className="space-y-4 text-[#F0C87A]/80 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">1. Informazioni Generali</h2>
            <p>
             The Movie Finder è un'applicazione web che aiuta gli utenti a scoprire film e serie TV disponibili sulle
              piattaforme di streaming italiane. L'app offre due modalità di utilizzo: Basic (gratuita con limitazioni)
              e Premium (ricerca avanzata illimitata).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">2. Dati Raccolti</h2>
            <p className="mb-2">The Movie Finder raccoglie e utilizza i seguenti dati:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Modalità Basic:</strong> L'app memorizza localmente (nel browser) il numero di ricerche
                giornaliere per applicare il limite di 1 ricerca al giorno. Nessun dato viene inviato a server esterni.
              </li>
              <li>
                <strong>Modalità Premium:</strong> Utilizza un servizio di autenticazione esterno. Vengono raccolti solo
                nome, email e foto profilo per personalizzare l'esperienza utente.
              </li>
              <li>
                <strong>Film guardati:</strong> La lista dei film contrassegnati come "Guardato" viene salvata
                localmente nel browser (localStorage) e non viene condivisa.
              </li>
              <li>
                <strong>Preferenze utente:</strong> Le piattaforme streaming preferite e i generi selezionati vengono
                memorizzati localmente per migliorare i risultati.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">3. Servizi Esterni</h2>
            <p>
              L'app utilizza servizi esterni per recuperare informazioni sui film, gestire l'autenticazione della
              modalità Premium e mostrare banner pubblicitari nella modalità Basic. Questi servizi possono utilizzare
              cookie e tecnologie di tracciamento secondo le loro rispettive policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">4. Condivisione Dati</h2>
            <p>
             The Movie Finder non condivide i tuoi dati personali con terze parti, ad eccezione dei servizi esterni
              necessari per il funzionamento dell'app come descritto sopra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">5. Cookie e Archiviazione Locale</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                L'app utilizza <strong>localStorage</strong> del browser per memorizzare preferenze, film guardati e
                limite giornaliero (modalità Basic).
              </li>
              <li>Non vengono utilizzati cookie di profilazione diretti dall'app.</li>
              <li>
                I servizi pubblicitari possono utilizzare cookie di terze parti per mostrare annunci pertinenti. Puoi
                bloccare i cookie nelle impostazioni del tuo browser.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">6. Sicurezza</h2>
            <p>
              L'app non memorizza password o dati sensibili. L'autenticazione Premium avviene esclusivamente tramite
              servizi esterni che utilizzano protocolli di sicurezza avanzati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">7. Diritti degli Utenti</h2>
            <p>Puoi in qualsiasi momento:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cancellare i dati memorizzati localmente svuotando la cache del browser</li>
              <li>Revocare l'accesso dalle impostazioni del tuo account di autenticazione</li>
              <li>Disattivare i cookie pubblicitari dalle impostazioni del browser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D8A24A] mb-2">8. Contatti</h2>
            <p>
              Per domande o richieste sulla privacy, contattaci a:{" "}
              <a href="mailto:maprexx@gmail.com" className="text-[#D8A24A] hover:underline">
                maprexx@gmail.com
              </a>
            </p>
          </section>

          <p className="text-xs text-[#A0826D] mt-6">Ultimo aggiornamento: Gennaio 2026</p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-[#D8A24A] text-[#1a1410] rounded-lg hover:bg-[#F0C87A] transition-colors font-semibold"
        >
          Torna alla Home
        </Link>
      </div>
    </div>
  )
}
