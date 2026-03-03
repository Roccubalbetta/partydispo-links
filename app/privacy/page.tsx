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
  return (
    <main
      style={{
        background: "#FFFFFF",
        minHeight: "100vh",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          background: "#FFFFFF",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <SectionTitle>Privacy Policy</SectionTitle>
        <P>
          La tua privacy è importante per noi. Questa policy descrive come
          raccogliamo, utilizziamo e proteggiamo le tue informazioni personali
          quando utilizzi il nostro servizio.
        </P>
        <SectionTitle>Informazioni che raccogliamo</SectionTitle>
        <P>
          Raccogliamo informazioni che ci fornisci direttamente, come il tuo
          nome, indirizzo email e altre informazioni di contatto.
        </P>
        <SectionTitle>Come utilizziamo le informazioni</SectionTitle>
        <P>
          Utilizziamo le informazioni raccolte per fornire e migliorare il
          servizio, comunicare con te e rispettare gli obblighi legali.
        </P>
        <SectionTitle>Protezione delle informazioni</SectionTitle>
        <P>
          Implementiamo misure di sicurezza per proteggere le tue informazioni
          da accessi non autorizzati, alterazioni o distruzione.
        </P>
        <SectionTitle>Diritti dell'utente</SectionTitle>
        <P>
          Hai il diritto di accedere, correggere o cancellare le tue informazioni
          personali. Puoi anche opporti al trattamento in determinate
          circostanze.
        </P>
        <SectionTitle>Contatti</SectionTitle>
        <P>
          Per domande o richieste riguardanti questa privacy policy, contattaci
          all'indirizzo email partydispo.app@gmail.com.
        </P>
      </div>
    </main>
  );
}