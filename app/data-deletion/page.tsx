import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellazione dati | echo",
  description: "Come richiedere la cancellazione dell'account e dei dati in echo.",
  robots: { index: true, follow: true },
};

export default function DataDeletionPage() {
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
          Cancellazione dati / account
        </h1>

        <p style={{ margin: "12px 0", lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Puoi cancellare il tuo account echo direttamente dall'app, nella pagina <strong>Profilo</strong>, utilizzando l'opzione <strong>"Elimina account"</strong>.
          In alternativa, puoi richiedere la cancellazione del tuo account e dei dati associati inviando una email a{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#2A7FFF", fontWeight: 800 }}>
            {contactEmail}
          </a>.
        </p>

        <p style={{ margin: "12px 0", lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Nell’email indica:
        </p>

        <ul style={{ paddingLeft: 18, margin: "8px 0", color: "rgba(0,0,0,0.78)", lineHeight: 1.6 }}>
          <li>Email usata in echo</li>
          <li>Numero di telefono associato (se presente)</li>
          <li>Oggetto: “Richiesta cancellazione account”</li>
        </ul>

        <p style={{ margin: "12px 0", lineHeight: 1.6, color: "rgba(0,0,0,0.78)" }}>
          Ti risponderemo appena possibile per confermare la presa in carico della richiesta.
        </p>
      </div>
    </main>
  );
}