import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standard di sicurezza dei minori | PartyDispo",
  description:
    "Informazioni sugli standard di sicurezza di PartyDispo relativi alla protezione dei minori e sulle modalità di segnalazione.",
  robots: { index: true, follow: true },
};

export default function SafetyStandardsPage() {
  const contactEmail = "echo.partydispo.app@gmail.com";

  return (
    <main style={{ minHeight: "100vh", background: "#F6F8FF", padding: "32px 16px" }}>
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(14,15,18,0.08)",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 10px 30px rgba(14,15,18,0.08)",
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0, color: "#0E0F12" }}>
          Standard di sicurezza dei minori
        </h1>

        <p style={{ margin: "12px 0", lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          PartyDispo si impegna a mantenere la piattaforma sicura per tutti gli utenti. Non è consentito pubblicare,
          condividere o promuovere contenuti che includano abuso, sfruttamento o sessualizzazione di minori.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 900, margin: "18px 0 8px", color: "#0E0F12" }}>
          Contenuti vietati
        </h2>
        <ul style={{ paddingLeft: 18, margin: 0, color: "rgba(0,0,0,0.78)", lineHeight: 1.6 }}>
          <li>Qualsiasi contenuto che raffiguri o promuova abuso o sfruttamento sessuale di minori.</li>
          <li>Contenuti che sessualizzano minori o incentivano interazioni inappropriate.</li>
          <li>Materiale illegale o non consensuale, inclusi link o richieste di tale materiale.</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 900, margin: "18px 0 8px", color: "#0E0F12" }}>
          Azioni di moderazione
        </h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          In caso di violazioni, PartyDispo può rimuovere contenuti, limitare funzionalità, sospendere o eliminare
          account. Nei casi in cui sia richiesto dalla legge, collaboriamo con le autorità competenti.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 900, margin: "18px 0 8px", color: "#0E0F12" }}>
          Segnalazioni
        </h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Per segnalare contenuti o comportamenti sospetti, contattaci via email indicando, se possibile, i dettagli
          dell’evento (nome festa, data) e qualsiasi informazione utile.
        </p>
        <p style={{ margin: "10px 0 0", lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Email di contatto:{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#2A7FFF", fontWeight: 800 }}>
            {contactEmail}
          </a>
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 900, margin: "18px 0 8px", color: "#0E0F12" }}>
          Eliminazione account
        </h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Puoi richiedere la cancellazione del tuo account e dei dati associati dalla pagina dedicata:{" "}
          <a href="/data-deletion" style={{ color: "#2A7FFF", fontWeight: 800 }}>
            /data-deletion
          </a>
          .
        </p>
      </div>
    </main>
  );
}