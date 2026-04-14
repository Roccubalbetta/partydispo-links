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

export default function TermsOfUsePage() {
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
          Termini di utilizzo
        </h1>

        <P>
          <strong>Ultimo aggiornamento:</strong> {lastUpdated}
        </P>

        <P>
          I presenti Termini di utilizzo disciplinano l'accesso e l'uso di echo, inclusi l'app mobile,
          il sito web e i servizi correlati. Accedendo o utilizzando echo, accetti di essere vincolato
          dai presenti Termini di utilizzo, dall'Informativa sulla Privacy e dalle Regole della community.
        </P>

        <SectionTitle>1. Requisiti di idoneità</SectionTitle>
        <P>
          Puoi utilizzare echo solo se ciò ti è consentito dalla legge applicabile.
          Utilizzando echo, dichiari di avere la capacità giuridica necessaria per accettare i presenti Termini.
        </P>

        <SectionTitle>2. Account e accesso</SectionTitle>
        <P>
          Potrebbe essere necessario creare un account per accedere ad alcune o a tutte le funzionalità di echo.
          Sei responsabile di fornire informazioni accurate e di mantenere la sicurezza del tuo account e delle tue credenziali di accesso.
        </P>
        <P>
          Sei responsabile di tutte le attività svolte tramite il tuo account, salvo ove diversamente previsto dalla legge.
        </P>

        <SectionTitle>3. Contenuti generati dagli utenti</SectionTitle>
        <P>
          echo può consentire agli utenti di creare, caricare, inviare, condividere o mostrare contenuti, inclusi
          dettagli di eventi, inviti, informazioni di partecipazione, conferme relative ai pagamenti, testi,
          immagini e altri materiali ("Contenuti degli utenti").
        </P>
        <P>
          Rimani responsabile dei Contenuti degli utenti che invii e delle tue interazioni con altri utenti.
        </P>

        <SectionTitle>4. Nessuna tolleranza per contenuti inappropriati o utenti abusivi</SectionTitle>
        <P>
          echo applica una politica di tolleranza zero verso contenuti inappropriati e comportamenti abusivi.
        </P>
        <P>Non devi utilizzare echo per creare, caricare, condividere o promuovere contenuti che siano:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li>offensivi, diffamatori, molesti, abusivi, pieni d'odio o minacciosi;</Li>
          <Li>sessualmente espliciti o sfruttatori;</Li>
          <Li>violenti o che incoraggino la violenza;</Li>
          <Li>discriminatori sulla base di razza, etnia, nazionalità, religione, genere, orientamento sessuale, disabilità o caratteristiche protette simili;</Li>
          <Li>fraudolenti, ingannevoli o finalizzati a impersonare un'altra persona;</Li>
          <Li>illeciti o volti a promuovere attività illegali;</Li>
          <Li>lesivi della privacy o dei diritti di un'altra persona.</Li>
        </ul>
        <P>
          Qualsiasi condotta abusiva verso altri utenti, inclusi molestie, intimidazioni, truffe o contatti indesiderati ripetuti,
          è severamente vietata.
        </P>

        <SectionTitle>5. Segnalazioni e blocco utenti</SectionTitle>
        <P>
          echo può mettere a disposizione degli utenti meccanismi per segnalare contenuti inappropriati o utenti abusivi
          e per bloccare utenti abusivi.
        </P>
        <P>
          Quando un utente blocca un altro utente, i contenuti dell'utente bloccato possono essere rimossi immediatamente
          dall'esperienza dell'utente che ha effettuato il blocco, ove applicabile.
        </P>
        <P>
          Utilizzando echo, riconosci e accetti che le segnalazioni e le azioni di blocco possano essere esaminate
          e trattate da echo per finalità di sicurezza, moderazione e applicazione delle regole.
        </P>

        <SectionTitle>6. Moderazione e applicazione delle regole</SectionTitle>
        <P>
          echo si riserva il diritto, ma non l'obbligo, di esaminare, filtrare, limitare, rimuovere
          o rifiutare contenuti; avvisare utenti; limitare l'accesso a funzionalità; sospendere account; o terminare permanentemente account
          che violino i presenti Termini, le Regole della community o la legge applicabile.
        </P>
        <P>
          echo può intervenire sulle segnalazioni di contenuti inappropriati e utenti abusivi e punta a esaminare
          le segnalazioni valide entro 24 ore.
        </P>
        <P>
          Possiamo rimuovere contenuti illeciti o vietati ed espellere utenti che forniscano contenuti proibiti
          o che assumano comportamenti abusivi.
        </P>

        <SectionTitle>7. Licenza d'uso di echo</SectionTitle>
        <P>
          A condizione che tu rispetti i presenti Termini, echo ti concede una licenza limitata, non esclusiva,
          non trasferibile e revocabile per accedere e utilizzare il servizio per finalità personali e non commerciali.
        </P>
        <P>
          Non puoi copiare, modificare, distribuire, vendere, concedere in licenza, fare reverse engineering
          o altrimenti sfruttare qualsiasi parte di echo, salvo quanto espressamente consentito dalla legge o previa autorizzazione scritta.
        </P>

        <SectionTitle>8. Le tue responsabilità</SectionTitle>
        <P>Accetti di non:</P>
        <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
          <Li>violare i presenti Termini o qualsiasi legge applicabile;</Li>
          <Li>utilizzare echo per danneggiare, molestare, sfruttare o ingannare altri;</Li>
          <Li>tentare di ottenere accessi non autorizzati a sistemi o account;</Li>
          <Li>interferire con il corretto funzionamento o la sicurezza del servizio;</Li>
          <Li>caricare malware, codice malevolo o contenuti dannosi;</Li>
          <Li>utilizzare strumenti automatici per accedere o effettuare scraping del servizio senza autorizzazione.</Li>
        </ul>

        <SectionTitle>9. Licenza sui contenuti degli utenti</SectionTitle>
        <P>
          Per consentire il funzionamento del servizio, concedi a echo una licenza limitata, non esclusiva,
          mondiale e gratuita per ospitare, conservare, trattare, riprodurre e mostrare i tuoi Contenuti degli utenti
          esclusivamente allo scopo di gestire, migliorare, proteggere e moderare il servizio.
        </P>

        <SectionTitle>10. Pagamenti e servizi di terze parti</SectionTitle>
        <P>
          Alcune funzionalità possono includere flussi relativi ai pagamenti o link a servizi di terze parti. echo non è responsabile
          per fornitori di pagamento, siti web o servizi di terzi e il tuo utilizzo di tali servizi può essere disciplinato
          da termini e informative sulla privacy separati.
        </P>

        <SectionTitle>11. Privacy</SectionTitle>
        <P>
          L'utilizzo di echo è disciplinato anche dalla nostra Informativa sulla Privacy. Puoi contattarci a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>{" "}
          per richieste relative alla privacy.
        </P>

        <SectionTitle>12. Sospensione e cessazione</SectionTitle>
        <P>
          Puoi interrompere l'utilizzo di echo in qualsiasi momento. echo può sospendere o terminare il tuo accesso in qualsiasi momento,
          con o senza preavviso, se riteniamo ragionevolmente che tu abbia violato i presenti Termini, creato rischi per altri utenti,
          esposto echo a responsabilità legali o tenuto comportamenti abusivi o inappropriati.
        </P>

        <SectionTitle>13. Esclusioni di garanzia</SectionTitle>
        <P>
          echo è fornita "così com'è" e "come disponibile", nella massima misura consentita dalla legge.
          Non garantiamo disponibilità ininterrotta, funzionamento privo di errori o che tutti i contenuti siano sempre sicuri o accurati.
        </P>

        <SectionTitle>14. Limitazione di responsabilità</SectionTitle>
        <P>
          Nella misura massima consentita dalla legge, echo e i suoi gestori non saranno responsabili per danni indiretti,
          incidentali, speciali, consequenziali, esemplari o punitivi, né per perdita di profitti, dati, avviamento o opportunità di business,
          derivanti da o connessi all'utilizzo del servizio.
        </P>

        <SectionTitle>15. Modifiche ai Termini</SectionTitle>
        <P>
          Possiamo aggiornare periodicamente i presenti Termini di utilizzo. La data di "Ultimo aggiornamento" indica quando
          sono state apportate le modifiche più recenti. Continuando a utilizzare echo dopo l'entrata in vigore dei Termini aggiornati,
          accetti la versione aggiornata, nella misura consentita dalla legge.
        </P>

        <SectionTitle>16. Contatti</SectionTitle>
        <P>
          Per domande sui presenti Termini di utilizzo, sulle azioni di moderazione o su questioni relative alla sicurezza,
          contattaci a{" "}
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </a>
          .
        </P>
      </div>
    </main>
  );
}