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
        color: "#0E0F12",
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

const linkStyle: React.CSSProperties = {
  color: "#2A7FFF",
  fontWeight: 800,
  textDecoration: "none",
};

export default function PrivacyPolicy() {
  const lastUpdated = "14 aprile 2026";
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
          Informativa sulla Privacy
        </h1>

        <P>
          <strong>Ultimo aggiornamento:</strong> {lastUpdated}
        </P>

        <P>
          La presente Informativa sulla Privacy descrive come echo ("<strong>echo</strong>", "<strong>noi</strong>", "<strong>nostro</strong>")
          raccoglie, utilizza, conserva e condivide i dati personali quando utilizzi l'app echo, il sito web e i servizi correlati.
        </P>

        <SectionTitle>1. Titolare del trattamento</SectionTitle>
        <P>
          Il titolare del trattamento dei dati personali descritti nella presente Informativa sulla Privacy è echo.
          Per richieste relative alla privacy, domande o richieste di cancellazione dell'account, puoi contattarci a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>
          .
        </P>

        <SectionTitle>2. Dati personali raccolti</SectionTitle>
        <P>In base a come utilizzi echo, potremmo raccogliere le seguenti categorie di dati personali:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li><strong>Informazioni dell'account</strong>, come nome, cognome, numero di telefono, indirizzo email e dettagli del profilo che scegli di fornire.</Li>
          <Li><strong>Dati di autenticazione</strong>, come i dati di verifica tramite codice temporaneo necessari per accedere in modo sicuro.</Li>
          <Li><strong>Contenuti generati dagli utenti</strong>, inclusi dettagli degli eventi, inviti, risposte di partecipazione, messaggi o contenuti inviati tramite il servizio e altri contenuti che carichi o condividi volontariamente.</Li>
          <Li><strong>Informazioni relative ai pagamenti</strong>, come metodi di pagamento selezionati, stato del pagamento o dettagli di conferma del pagamento condivisi all'interno dell'app. echo non memorizza intenzionalmente numeri completi di carte di pagamento.</Li>
          <Li><strong>Informazioni tecniche e del dispositivo</strong>, come token per notifiche push, tipo di dispositivo, sistema operativo, versione dell'app, dati di log, dati di crash e informazioni diagnostiche.</Li>
          <Li><strong>Dati relativi a sicurezza e moderazione</strong>, come segnalazioni inviate dagli utenti, liste di utenti bloccati, esiti di moderazione e informazioni necessarie per investigare contenuti inappropriati o comportamenti abusivi.</Li>
          <Li><strong>Dati di utilizzo</strong>, come interazioni con le funzionalità dell'app, flussi di partecipazione agli eventi e richieste di supporto.</Li>
        </ul>

        <SectionTitle>3. Come utilizziamo i dati personali</SectionTitle>
        <P>Utilizziamo i dati personali per:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li>creare, autenticare e gestire il tuo account;</Li>
          <Li>fornire le principali funzionalità dell'app, incluse creazione eventi, inviti, gestione partecipazioni, funzionalità per organizzatori, flussi relativi ai pagamenti e notifiche;</Li>
          <Li>gestire, mantenere, monitorare, diagnosticare e migliorare il servizio;</Li>
          <Li>inviare comunicazioni transazionali e notifiche push relative al tuo account o ai tuoi eventi;</Li>
          <Li>proteggere gli utenti, rilevare abusi, filtrare contenuti inappropriati, esaminare segnalazioni, investigare violazioni, bloccare utenti abusivi e rimuovere contenuti o account quando necessario;</Li>
          <Li>adempiere a obblighi di legge e far rispettare i nostri Termini di utilizzo.</Li>
        </ul>

        <SectionTitle>4. Basi giuridiche del trattamento</SectionTitle>
        <P>Laddove previsto dalla normativa applicabile in materia di privacy, ci basiamo su una o più delle seguenti basi giuridiche:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li><strong>Esecuzione di un contratto</strong>, quando il trattamento è necessario per fornire i servizi da te richiesti.</Li>
          <Li><strong>Legittimo interesse</strong>, inclusi sicurezza del servizio, prevenzione delle frodi, prevenzione degli abusi, moderazione, risoluzione di problemi tecnici e miglioramento del prodotto.</Li>
          <Li><strong>Adempimento di obblighi legali</strong>, quando dobbiamo trattare dati per rispettare la legge applicabile o richieste legittime delle autorità.</Li>
          <Li><strong>Consenso</strong>, ove il consenso sia richiesto, ad esempio per permessi opzionali non strettamente necessari al servizio.</Li>
        </ul>

        <SectionTitle>5. Contenuti generati dagli utenti, sicurezza e moderazione</SectionTitle>
        <P>
          echo può includere contenuti generati dagli utenti. Per mantenere un ambiente sicuro, possiamo utilizzare
          revisione manuale, filtri automatici, segnalazioni degli utenti e funzioni di blocco utenti per identificare e gestire
          contenuti inappropriati o comportamenti abusivi.
        </P>
        <P>
          Quando invii una segnalazione o blocchi un altro utente, possiamo trattare i contenuti rilevanti,
          le informazioni dell'account, le informazioni relative all'evento e i segnali di sicurezza necessari per investigare la segnalazione,
          adottare misure di moderazione, rimuovere contenuti dalla tua esperienza e, ove opportuno, sospendere o terminare account.
        </P>
        <P>
          Possiamo conservare registri di moderazione, dati di prevenzione degli abusi e cronologia delle segnalazioni nella misura necessaria
          a documentare le azioni intraprese, risolvere controversie, proteggere gli utenti e rispettare obblighi di legge.
        </P>

        <SectionTitle>6. Condivisione dei dati personali</SectionTitle>
        <P>
          Non vendiamo i tuoi dati personali. Possiamo condividere dati personali solo nella misura ragionevolmente necessaria con:
        </P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li><strong>Fornitori di servizi tecnici</strong> che ci aiutano a gestire l'app, l'infrastruttura backend, l'autenticazione, l'hosting, l'invio di email, l'analisi o le notifiche push;</Li>
          <Li><strong>Altri utenti</strong>, ma solo nella misura necessaria per le funzionalità sociali e di gestione eventi dell'app;</Li>
          <Li><strong>Autorità o altri soggetti</strong> quando richiesto dalla legge, da regolamenti, da procedimenti legali o per proteggere diritti, sicurezza e integrità del servizio;</Li>
          <Li><strong>Successori o acquirenti</strong>, nell'ambito di fusioni, acquisizioni, riorganizzazioni o cessioni di asset, nel rispetto della normativa applicabile.</Li>
        </ul>

        <SectionTitle>7. Notifiche push e comunicazioni</SectionTitle>
        <P>
          echo può inviare notifiche push, email o comunicazioni in-app relative a inviti, eventi,
          partecipazione, pagamenti, accesso all'account, azioni di moderazione, segnalazioni, misure di sicurezza e aggiornamenti del servizio.
          Puoi gestire alcuni permessi di notifica tramite le impostazioni del tuo dispositivo.
        </P>

        <SectionTitle>8. Conservazione dei dati</SectionTitle>
        <P>
          Conserviamo i dati personali per il tempo necessario a fornire il servizio, mantenere la sicurezza,
          investigare abusi, adempiere a obblighi di legge, risolvere controversie e far rispettare i nostri accordi.
          I periodi di conservazione possono variare in base al tipo di dato e al motivo per cui è stato raccolto.
        </P>

        <SectionTitle>9. Trasferimenti internazionali di dati</SectionTitle>
        <P>
          I tuoi dati possono essere trattati in Paesi diversi da quello in cui vivi, a seconda di dove operano i nostri
          fornitori di servizi. Quando richiesto, adottiamo misure ragionevoli per utilizzare adeguate garanzie nei trasferimenti internazionali.
        </P>

        <SectionTitle>10. I tuoi diritti</SectionTitle>
        <P>
          In base alla tua posizione geografica e alla normativa applicabile, potresti avere il diritto di accedere,
          correggere, aggiornare, cancellare, limitare, opporti al trattamento o ricevere una copia dei tuoi dati personali.
          Potresti inoltre avere il diritto di revocare il consenso quando il consenso costituisce la base giuridica del trattamento.
        </P>
        <P>
          Per esercitare i tuoi diritti, contattaci a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>
          . Potremmo dover verificare la tua identità prima di completare la richiesta.
        </P>

        <SectionTitle>11. Richieste di cancellazione account e dati</SectionTitle>
        <P>
          Per richiedere la cancellazione del tuo account e dei dati personali associati, invia un'email a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>
          {" "}con oggetto <strong>Richiesta cancellazione account</strong> e includi l'indirizzo email e, se disponibile,
          il numero di telefono associati al tuo account echo.
        </P>
        <P>
          Potremmo conservare informazioni limitate quando necessario per conformità legale, prevenzione delle frodi,
          sicurezza, registri di moderazione, risoluzione di controversie o finalità di enforcement.
        </P>

        <SectionTitle>12. Privacy dei minori</SectionTitle>
        <P>
          echo non è destinata a minori di età inferiore a quella minima consentita dalla legge applicabile e non raccogliamo
          consapevolmente dati personali di minori in violazione della normativa applicabile. Se ritieni che un minore
          abbia fornito impropriamente dati personali, contattaci così da poter verificare e adottare le misure appropriate.
        </P>

        <SectionTitle>13. Sicurezza</SectionTitle>
        <P>
          Adottiamo misure amministrative, tecniche e organizzative ragionevoli volte a proteggere i dati personali.
          Tuttavia, nessun metodo di trasmissione o conservazione è completamente sicuro e non possiamo garantire una sicurezza assoluta.
        </P>

        <SectionTitle>14. Modifiche alla presente Informativa sulla Privacy</SectionTitle>
        <P>
          Possiamo aggiornare periodicamente la presente Informativa sulla Privacy. La data di "Ultimo aggiornamento" sopra indicata mostra quando
          sono state apportate le modifiche più recenti. L'utilizzo continuato di echo dopo un aggiornamento può essere considerato,
          ove consentito dalla legge, come presa visione della versione aggiornata dell'Informativa sulla Privacy.
        </P>

        <SectionTitle>15. Contatti</SectionTitle>
        <P>
          Per domande sulla privacy, richieste in materia di protezione dei dati, quesiti sulla privacy relativi alla moderazione
          o richieste di cancellazione account, contattaci a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>
          .
        </P>
      </div>
    </main>
  );
}