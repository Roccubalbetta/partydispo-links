export default async function InvitePage({ params }: { params: { token: string } }) {
    const token = params.token;
  
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>🎉 Invito PartyDispo</h1>
        <p>Token: <code>{token}</code></p>
        <p>Se hai già l’app installata, il link dovrebbe aprirla automaticamente.</p>
        <button
          style={{ height: 48, borderRadius: 12, padding: "0 16px", fontWeight: 800 }}
          onClick={() => {
            // fallback scheme (opzionale)
            window.location.href = `partydispo://i/${encodeURIComponent(token)}`;
          }}
        >
          Apri nell’app
        </button>
      </main>
    );
  }