// app/get/page.tsx
"use client";

import { useMemo } from "react";

const IOS_APP_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";
const ANDROID_PLAY_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL || "";

// Deep link (utile se l’utente ha già l’app installata)
const DEEPLINK_BASE = process.env.NEXT_PUBLIC_APP_DEEPLINK_BASE || "partydispo://";

function detectPlatform(ua: string) {
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return { isAndroid, isIOS };
}

export default function GetAppPage() {
  const { isAndroid, isIOS } = useMemo(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    return detectPlatform(ua);
  }, []);

  const primaryHref = useMemo(() => {
    if (isIOS && IOS_APP_STORE_URL) return IOS_APP_STORE_URL;
    if (isAndroid && ANDROID_PLAY_STORE_URL) return ANDROID_PLAY_STORE_URL;
    // Se non hai ancora gli store link, lascia solo “Apri l’app” come fallback.
    return "";
  }, [isIOS, isAndroid]);

  const primaryLabel = useMemo(() => {
    if (isIOS) return IOS_APP_STORE_URL ? "Scarica su App Store" : "App Store (non disponibile)";
    if (isAndroid) return ANDROID_PLAY_STORE_URL ? "Scarica su Google Play" : "Google Play (non disponibile)";
    return "Scarica l’app";
  }, [isIOS, isAndroid]);

  const onOpenApp = () => {
    window.location.href = DEEPLINK_BASE;
  };

  return (
    <main style={S.page}>
      <div style={S.bg} />

      <div style={S.container}>
        <div style={S.card}>
          <div style={S.hero}>
            <div style={S.kicker}>PartyDispo</div>
            <h1 style={S.h1}>Scarica l’app</h1>
            <p style={S.muted}>
              Per vedere luogo, orario e aggiornamenti in tempo reale dell’evento, ti conviene usare PartyDispo.
            </p>
          </div>

          <div style={S.divider} />

          <div style={S.featureBox}>
            <div style={S.featureTitle}>Con l’app ottieni</div>
            <ul style={S.list}>
              <li>Notifiche istantanee quando vieni approvato</li>
              <li>Luogo e orario dell’evento (appena disponibili)</li>
              <li>Info e aggiornamenti in tempo reale</li>
              <li>Scatti “vintage” con un tocco, stile disposable camera</li>
            </ul>
          </div>

          <div style={S.divider} />

          {/* CTA principali */}
          <div style={S.btnCol}>
            <a
              style={{
                ...S.primaryBtn,
                opacity: primaryHref ? 1 : 0.6,
                pointerEvents: primaryHref ? "auto" : "none",
                textDecoration: "none",
              }}
              href={primaryHref || undefined}
              aria-disabled={!primaryHref}
            >
              {primaryLabel}
            </a>

            {/* Se non sei sugli store, questo è l’unico bottone che “funziona” sempre */}
            <button style={S.secondaryBtn} onClick={onOpenApp}>
              Apri l’app (se già installata)
            </button>

            {/* Bottoni espliciti (quando avrai gli store link) */}
            {(IOS_APP_STORE_URL || ANDROID_PLAY_STORE_URL) && (
              <div style={S.storeRow}>
                <a
                  style={{
                    ...S.storeBtn,
                    opacity: IOS_APP_STORE_URL ? 1 : 0.5,
                    pointerEvents: IOS_APP_STORE_URL ? "auto" : "none",
                    textDecoration: "none",
                  }}
                  href={IOS_APP_STORE_URL || undefined}
                  aria-disabled={!IOS_APP_STORE_URL}
                >
                  iOS
                </a>
                <a
                  style={{
                    ...S.storeBtn,
                    opacity: ANDROID_PLAY_STORE_URL ? 1 : 0.5,
                    pointerEvents: ANDROID_PLAY_STORE_URL ? "auto" : "none",
                    textDecoration: "none",
                  }}
                  href={ANDROID_PLAY_STORE_URL || undefined}
                  aria-disabled={!ANDROID_PLAY_STORE_URL}
                >
                  Android
                </a>
              </div>
            )}

            {!IOS_APP_STORE_URL && !ANDROID_PLAY_STORE_URL ? (
              <div style={S.note}>
                Nota: gli store link non sono ancora disponibili. Quando pubblicherai l’app, imposta le env:
                <code style={S.code}> NEXT_PUBLIC_IOS_APP_STORE_URL</code> e
                <code style={S.code}> NEXT_PUBLIC_ANDROID_PLAY_STORE_URL</code>.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    background: "#0B0D12",
    color: "rgba(255,255,255,0.92)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 10%, rgba(42,127,255,0.18), transparent 40%), radial-gradient(circle at 90% 30%, rgba(124,77,255,0.14), transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,82,85,0.10), transparent 45%)",
    pointerEvents: "none",
  },
  container: { width: "100%", maxWidth: 560, position: "relative", marginTop: 12 },

  card: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    padding: 18,
  },

  hero: { display: "grid", gap: 8 },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 800,
  },
  h1: { margin: 0, fontSize: 30, fontWeight: 950, letterSpacing: -0.4 },
  muted: { color: "rgba(255,255,255,0.66)", fontSize: 14, lineHeight: "19px", margin: 0 },

  divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "16px 0" },

  featureBox: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  featureTitle: { fontWeight: 900, marginBottom: 8 },
  list: { margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: "rgba(255,255,255,0.74)", fontSize: 14 },

  btnCol: { display: "grid", justifyItems: "center", gap: 10 },

  primaryBtn: {
    height: 48,
    borderRadius: 14,
    border: 0,
    padding: "0 16px",
    fontWeight: 950,
    cursor: "pointer",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    width: "100%",
    maxWidth: 360,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    lineHeight: "48px",
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0 16px",
    fontWeight: 900,
    cursor: "pointer",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    width: "100%",
    maxWidth: 360,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },

  storeRow: { display: "flex", gap: 10, marginTop: 4 },
  storeBtn: {
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  note: {
    marginTop: 6,
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: "16px",
    maxWidth: 520,
  },
  code: {
    background: "rgba(255,255,255,0.08)",
    padding: "2px 6px",
    borderRadius: 10,
    marginLeft: 6,
    marginRight: 2,
  },
};