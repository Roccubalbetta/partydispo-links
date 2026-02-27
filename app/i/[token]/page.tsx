"use client";

import { useMemo } from "react";

export default function InvitePage({ params }: { params: { token: string } }) {
  const token = useMemo(() => params?.token ?? "", [params]);

  const onOpenApp = () => {
    if (!token) return;
    window.location.href = `partydispo://i/${encodeURIComponent(token)}`;
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>🎉 Invito PartyDispo</h1>

      <p>
        Token: <code>{token}</code>
      </p>

      <p>
        Se hai già l’app installata, questo link dovrebbe aprirla automaticamente.
      </p>

      <button
        type="button"
        style={{
          height: 48,
          borderRadius: 12,
          padding: "0 16px",
          fontWeight: 800,
          cursor: "pointer",
        }}
        onClick={onOpenApp}
      >
        Apri nell’app
      </button>
    </main>
  );
}