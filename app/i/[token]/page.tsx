// FLOW B: Show login first, only load invite after authentication
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type InviteRow = {
  token: string;
  role: "guest" | "organizer";
  party_id: string;
  expires_at: string | null;
  parties?: {
    id: string;
    title: string;
    location: string | null;
    party_date: string | null;
    organizer_id: string;
  } | null;
};

type Step = "loading" | "needAuth" | "verifyCode" | "ready" | "done" | "error";

function fmtDate(dateIso: string | null) {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const token = useMemo(() => params?.token ?? "", [params]);

  const [invite, setInvite] = useState<InviteRow | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [errorText, setErrorText] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"accepted" | "declined" | null>(null);

  // ✅ FLOW B:
  // - Prima chiediamo login/registrazione (OTP email)
  // - Solo DOPO che l'utente è autenticato carichiamo i dettagli dell'invito (se servono)
  // - La validazione del token (esistenza/scadenza) avviene di fatto lato server nella RPC,
  //   e lato client (post-login) nel loadInvite.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStep("loading");
        setErrorText(null);

        if (!token) {
          setStep("error");
          setErrorText("Link non valido (token mancante). ");
          return;
        }

        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id ?? null;
        if (cancelled) return;

        setSessionUserId(uid);
        setStep(uid ? "ready" : "needAuth");
      } catch (e) {
        console.error("[invite] auth bootstrap error", e);
        if (!cancelled) {
          setStep("needAuth");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Mantieni sessionUserId aggiornato (quando l'utente completa l'OTP)
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setSessionUserId(uid);
      if (uid) {
        setStep("ready");
      }
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  // Carica dettagli invito SOLO dopo login (step=ready)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (step !== "ready") return;
        if (!sessionUserId) return;
        if (!token) return;

        setErrorText(null);

        const { data, error } = await supabase
          .from("party_invites")
          .select(
            `
            token,
            role,
            party_id,
            expires_at,
            parties (
              id,
              title,
              location,
              party_date,
              organizer_id
            )
          `
          )
          .eq("token", token)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Non blocchiamo il login, ma informiamo chiaramente.
          setInvite(null);
          setStep("error");
          setErrorText("Invito non trovato o non più valido.");
          return;
        }

        // scadenza (se la usi)
        if (data.expires_at) {
          const exp = new Date(data.expires_at).getTime();
          if (Number.isFinite(exp) && exp < Date.now()) {
            setInvite(null);
            setStep("error");
            setErrorText("Questo invito è scaduto.");
            return;
          }
        }

        if (cancelled) return;
        setInvite(data as any);
      } catch (e) {
        console.error("[invite] post-login load error", e);
        if (!cancelled) {
          // Manteniamo la UI, ma con un messaggio generico.
          setInvite(null);
          setStep("error");
          setErrorText("Non sono riuscito a caricare l’invito dopo l’accesso.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, sessionUserId, token]);

  const title = invite?.parties?.title ?? "Invito PartyDispo";
  const location = invite?.parties?.location ?? "—";
  const date = fmtDate(invite?.parties?.party_date ?? null);

  const onOpenApp = () => {
    if (!token) return;
    window.location.href = `partydispo://i/${encodeURIComponent(token)}`;
  };

  async function onSendCode() {
    try {
      setBusy(true);
      setErrorText(null);

      const e = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        setErrorText("Inserisci un’email valida.");
        return;
      }

      // OTP email: Supabase crea user se non esiste, altrimenti login
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          // Se l’utente apre la mail dal telefono, rientra su questa stessa pagina invito
          emailRedirectTo: `https://partydispo.app/i/${encodeURIComponent(token)}`,
        },
      });

      if (error) throw error;

      setStep("verifyCode");
    } catch (e) {
      console.error("[invite] send otp error:", e);
      setErrorText("Non sono riuscito a inviare il codice. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyCode() {
    try {
      setBusy(true);
      setErrorText(null);

      const e = email.trim().toLowerCase();
      const code = otp.trim();

      if (!code) {
        setErrorText("Inserisci il codice.");
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: e,
        token: code,
        type: "email",
      });

      if (error) throw error;

      const uid = data.user?.id ?? null;
      if (!uid) {
        setErrorText("Accesso non riuscito. Riprova.");
        return;
      }

      setSessionUserId(uid);
      setStep("ready");
    } catch (e) {
      console.error("[invite] verify otp error:", e);
      setErrorText("Codice non valido o scaduto. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  async function onRespond(next: "accepted" | "declined") {
    try {
      setBusy(true);
      setErrorText(null);

      // RPC autenticata: valida token e aggiorna party_participants
      const { data, error } = await supabase.rpc("respond_party_invite_auth", {
        p_token: token,
        p_status: next,
      });

      if (error) throw error;

      if (data?.ok) {
        setResultStatus(next);
        setStep("done");
      } else {
        setErrorText("Non sono riuscito a registrare la risposta. Riprova.");
      }
    } catch (e) {
      console.error("[invite] respond error:", e);
      // Se token è finto (es. <token>), qui finirà con invite_not_found lato DB.
      setErrorText("Invito non valido oppure scaduto. Chiedi all’organizzatore di reinviarlo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={S.page}>
      <div style={S.bg} />

      <div style={S.container}>
        <div style={S.brandRow}>
          <div style={S.logo}>P</div>
          <div>
            <div style={S.brand}>PartyDispo</div>
            <div style={S.subBrand}>Invito</div>
          </div>
        </div>

        <div style={S.card}>
          {step === "loading" ? (
            <div style={S.center}>
              <div style={S.spinner} />
              <div style={S.muted}>Caricamento…</div>
            </div>
          ) : step === "error" ? (
            <>
              <h1 style={S.h1}>Ops</h1>
              <p style={S.muted}>{errorText}</p>
              <div style={{ height: 10 }} />
              <button style={S.secondaryBtn} onClick={onOpenApp}>
                Apri nell’app
              </button>
            </>
          ) : (
            <>
              {/* FLOW B: prima accedi, poi mostriamo i dettagli */}
              <h1 style={S.h1}>Sei invitato 🎉</h1>

              {errorText ? <p style={{ ...S.muted, marginTop: 10 }}>{errorText}</p> : null}

              <div style={S.divider} />

              {/* AUTH */}
              {step === "needAuth" ? (
                <>
                  <div style={S.sectionTitle}>Prima accedi</div>
                  <div style={S.muted}>
                    Per confermare la partecipazione devi accedere. Se è la prima volta, creeremo automaticamente il tuo account.
                  </div>

                  <div style={{ height: 10 }} />

                  <input
                    style={S.input}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />

                  <div style={{ height: 10 }} />

                  <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onSendCode}>
                    {busy ? "Invio…" : "Invia codice"}
                  </button>

                  <div style={{ height: 10 }} />

                  <button style={S.secondaryBtn} onClick={onOpenApp}>
                    Apri nell’app
                  </button>
                </>
              ) : null}

              {step === "verifyCode" ? (
                <>
                  <div style={S.sectionTitle}>Inserisci il codice</div>
                  <div style={S.muted}>Ti abbiamo inviato un codice via email.</div>

                  <div style={{ height: 10 }} />

                  <input
                    style={S.input}
                    placeholder="Codice OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputMode="numeric"
                  />

                  <div style={{ height: 10 }} />

                  <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onVerifyCode}>
                    {busy ? "Verifica…" : "Verifica e continua"}
                  </button>

                  <div style={{ height: 10 }} />

                  <button style={S.linkBtn} disabled={busy} onClick={onSendCode}>
                    Reinvia codice
                  </button>
                </>
              ) : null}

              {/* RSVP (post-login) */}
              {step === "ready" ? (
                <>
                  <div style={S.sectionTitle}>Dettagli invito</div>
                  <div style={S.partyBox}>
                    <div style={S.partyTitle}>{title}</div>
                    <div style={S.partyMeta}>
                      <div>📍 {location}</div>
                      {date ? <div>🗓️ {date}</div> : null}
                    </div>
                  </div>

                  <div style={S.divider} />

                  <div style={S.sectionTitle}>Conferma partecipazione</div>
                  <div style={S.muted}>Ora puoi rispondere all’invito.</div>

                  <div style={{ height: 10 }} />

                  <div style={S.row}>
                    <button
                      style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }}
                      disabled={busy}
                      onClick={() => onRespond("accepted")}
                    >
                      {busy ? "Invio…" : "Ci sono"}
                    </button>

                    <button
                      style={{ ...S.secondaryBtn, opacity: busy ? 0.7 : 1 }}
                      disabled={busy}
                      onClick={() => onRespond("declined")}
                    >
                      {busy ? "Invio…" : "Non ci sono"}
                    </button>
                  </div>

                  <div style={S.divider} />

                  <div style={S.ctaBox}>
                    <div style={S.ctaTitle}>Vuoi notifiche push e funzioni extra?</div>
                    <div style={S.muted}>
                      Scarica PartyDispo per aggiornamenti in tempo reale, chat e galleria completa.
                    </div>

                    <div style={{ height: 10 }} />

                    <button style={S.primaryBtn} onClick={onOpenApp}>
                      Apri nell’app
                    </button>
                  </div>

                  <div style={{ marginTop: 14, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                    {sessionUserId ? (
                      <>
                        Utente: <code style={S.code}>{sessionUserId.slice(0, 8)}…</code>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}

              {step === "done" ? (
                <div style={S.confirm}>
                  <div style={S.confirmTitle}>
                    {resultStatus === "accepted" ? "✅ Presenza confermata!" : "✅ Risposta registrata."}
                  </div>
                  <div style={S.muted}>
                    {resultStatus === "accepted"
                      ? "Hai confermato che parteciperai."
                      : "Hai indicato che non parteciperai."}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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
  container: { width: "100%", maxWidth: 520, position: "relative", marginTop: 12 },
  brandRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 900,
  },
  brand: { fontWeight: 900, letterSpacing: 0.2 },
  subBrand: { fontSize: 12, color: "rgba(255,255,255,0.62)" },

  card: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    padding: 18,
  },
  h1: { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.3 },
  muted: { color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: "18px" },

  partyBox: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  partyTitle: { fontSize: 18, fontWeight: 900 },
  partyMeta: { marginTop: 8, display: "grid", gap: 6, color: "rgba(255,255,255,0.70)", fontSize: 13 },

  divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "16px 0" },
  sectionTitle: { fontWeight: 900, marginBottom: 6 },

  row: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    border: 0,
    padding: "0 14px",
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    flex: 1,
    minWidth: 160,
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0 14px",
    fontWeight: 900,
    cursor: "pointer",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    flex: 1,
    minWidth: 160,
  },
  linkBtn: {
    width: "100%",
    height: 40,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(255,255,255,0.92)",
    padding: "0 12px",
    outline: "none",
    fontWeight: 700,
  },

  ctaBox: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  ctaTitle: { fontWeight: 900, marginBottom: 6 },

  confirm: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  confirmTitle: { fontWeight: 900 },

  code: { background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 10 },

  center: { display: "grid", justifyItems: "center", gap: 10, padding: "18px 0" },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 99,
    border: "2px solid rgba(255,255,255,0.18)",
    borderTopColor: "rgba(255,255,255,0.85)",
    animation: "spin 0.9s linear infinite",
  },
};