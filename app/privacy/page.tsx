export const metadata = {
    title: "Privacy Policy | PartyDispo",
    description: "Privacy Policy di PartyDispo",
  };
  
  export default function PrivacyPage() {
    return (
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12 }}>Privacy Policy – PartyDispo</h1>
        <p style={{ opacity: 0.75, marginBottom: 24 }}>Ultimo aggiornamento: 19 giugno 2026</p>
  
        <p>
          PartyDispo (“noi”, “l’applicazione”, “il servizio”) rispetta la tua privacy e si impegna a proteggere i tuoi
          dati personali.
        </p>
  
        <h2 style={{ marginTop: 28 }}>1. Dati raccolti</h2>
        <ul>
          <li>Nome</li>
          <li>Cognome</li>
          <li>Numero di telefono</li>
          <li>Indirizzo email</li>
          <li>Sesso</li>
        </ul>
  
        <h2 style={{ marginTop: 28 }}>2. Finalità del trattamento</h2>
        <ul>
          <li>Creazione e gestione dell’account utente</li>
          <li>Partecipazione agli eventi</li>
          <li>Identificazione degli invitati</li>
          <li>Invio di notifiche push relative agli eventi</li>
          <li>Miglioramento del servizio</li>
        </ul>
  
        <h2 style={{ marginTop: 28 }}>3. Base giuridica</h2>
        <p>Il trattamento dei dati si basa sul consenso dell’utente e sulla necessità di fornire il servizio richiesto.</p>
  
        <h2 style={{ marginTop: 28 }}>4. Conservazione dei dati</h2>
        <p>
          I dati personali vengono conservati finché l’account rimane attivo. L’utente può richiedere la cancellazione del
          proprio account in qualsiasi momento.
        </p>
  
        <h2 style={{ marginTop: 28 }}>5. Condivisione dei dati</h2>
        <p>
          Non vendiamo né condividiamo i dati personali con terze parti, salvo obblighi di legge o fornitori tecnici
          necessari al funzionamento del servizio.
        </p>
  
        <h2 style={{ marginTop: 28 }}>6. Sicurezza</h2>
        <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i dati da accessi non autorizzati.</p>
  
        <h2 style={{ marginTop: 28 }}>7. Diritti dell’utente</h2>
        <p>
          Puoi accedere ai tuoi dati, richiederne la modifica o la cancellazione e revocare il consenso contattandoci a:
          <br />
          <strong>partydispo.app@gmail.com</strong>
        </p>
  
        <h2 style={{ marginTop: 28 }}>8. Modifiche</h2>
        <p>Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche verranno pubblicate su questa pagina.</p>
      </main>
    );
  }