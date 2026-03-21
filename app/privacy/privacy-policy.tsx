// app/privacy/privacy-policy.tsx
import React from "react";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 22,
        marginTop: 28,
        marginBottom: 10,
        fontWeight: 900,
        color: "#0E0F12", // ✅ forza contrasto (evita titoli "sbiaditi")
        opacity: 1,
        letterSpacing: "-0.2px",
      }}
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "10px 0",
        lineHeight: 1.7,
        color: "rgba(14,15,18,0.82)",
        fontSize: 16,
      }}
    >
      {children}
    </p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        margin: "6px 0",
        lineHeight: 1.7,
        color: "rgba(14,15,18,0.82)",
        fontSize: 16,
      }}
    >
      {children}
    </li>
  );
}

export default function PrivacyPolicy() {
  // Aggiorna qui se vuoi mostrare anche una data “Ultimo aggiornamento”
  const lastUpdated = "03 Marzo 2026";

  // Email usata per supporto/privacy (come mi hai detto)
  const contactEmail = "echo.partydispo.app@gmail.com";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "#FFFFFF",
          border: "1px solid rgba(14,15,18,0.08)",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 10px 30px rgba(14,15,18,0.08)",
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0, color: "#0E0F12" }}>
          Privacy Policy
        </h1>

        <P>
          <strong>Ultimo aggiornamento:</strong> {lastUpdated}
        </P>

        <P>
          Questa Informativa descrive come echo (“<strong>noi</strong>”) raccoglie e utilizza i dati personali
          quando usi l’app e i relativi servizi.
        </P>

        <SectionTitle>1. Titolare del trattamento</SectionTitle>
        <P>
          Il titolare del trattamento è echo. Per qualsiasi richiesta puoi contattarci a{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#2A7FFF", fontWeight: 800 }}>
            {contactEmail}
          </a>
          .
        </P>

        <SectionTitle>2. Dati personali raccolti</SectionTitle>
        <P>Quando crei un account o utilizzi echo, possiamo raccogliere i seguenti dati:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li><strong>Nome</strong></Li>
          <Li><strong>Cognome</strong></Li>
          <Li><strong>Numero di telefono</strong></Li>
          <Li><strong>Email</strong></Li>
          <Li><strong>Sesso</strong> (es. “male/female”)</Li>
        </ul>

        <SectionTitle>3. Finalità del trattamento</SectionTitle>
        <P>I dati vengono trattati per:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li>creare e gestire l’account utente;</Li>
          <Li>permettere funzionalità dell’app (inviti, gestione partecipanti, pagamenti/quote e notifiche);</Li>
          <Li>fornire assistenza e rispondere alle richieste di supporto;</Li>
          <Li>migliorare affidabilità e sicurezza del servizio (prevenzione abusi e troubleshooting).</Li>
        </ul>

        <SectionTitle>4. Base giuridica</SectionTitle>
        <P>
          Il trattamento è necessario per l’esecuzione del servizio richiesto (es. creazione account e gestione
          funzionalità) e, ove applicabile, per il legittimo interesse a garantire sicurezza e corretto funzionamento.
        </P>

        <SectionTitle>5. Conservazione dei dati</SectionTitle>
        <P>
          Conserviamo i dati per il tempo necessario a fornire il servizio e rispettare eventuali obblighi di legge.
          Puoi richiedere la cancellazione dell’account come indicato sotto.
        </P>

        <SectionTitle>6. Condivisione dei dati</SectionTitle>
        <P>
          Non vendiamo i tuoi dati. Possiamo condividerli con fornitori tecnici strettamente necessari al funzionamento
          del servizio (es. infrastruttura backend e notifiche push), nei limiti di quanto richiesto per erogare l’app.
        </P>

        <SectionTitle>7. Notifiche</SectionTitle>
        <P>
          echo può inviare notifiche push per aggiornamenti relativi a inviti, partecipazione e pagamenti.
          Puoi gestire le notifiche dalle impostazioni del tuo dispositivo.
        </P>

        <SectionTitle>8. Diritti dell’utente</SectionTitle>
        <P>
          In base alla normativa applicabile, puoi chiedere accesso, rettifica o cancellazione dei tuoi dati, nonché
          limitazione/opposizione al trattamento, contattandoci a{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#2A7FFF", fontWeight: 800 }}>
            {contactEmail}
          </a>.
        </P>

        <SectionTitle>9. Richiesta di cancellazione dati / account</SectionTitle>
        <P>
          Per richiedere la cancellazione del tuo account e dei dati associati, scrivi a{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#2A7FFF", fontWeight: 800 }}>
            {contactEmail}
          </a>{" "}
          indicando:
        </P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li>email utilizzata in echo;</Li>
          <Li>numero di telefono associato (se presente);</Li>
          <Li>oggetto: “Richiesta cancellazione account”.</Li>
        </ul>

        <SectionTitle>10. Modifiche a questa informativa</SectionTitle>
        <P>
          Possiamo aggiornare questa informativa. La data di “Ultimo aggiornamento” indica quando è stata modificata
          l’ultima volta.
        </P>
      </div>
    </main>
  );
}