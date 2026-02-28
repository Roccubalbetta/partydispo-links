// app/i/[token]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type InviteRow = {
  token: string;
  role: "guest" | "organizer" | string;
  party_id: string;
  expires_at: string | null;
  party_title: string | null;
  party_date: string | null;
};

type Step = "loading" | "needAuth" | "verifyCode" | "ready" | "done" | "error";
type Gender = "male" | "female";

const IOS_APP_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";
const ANDROID_PLAY_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL || "";

function fmtDay(dateIso: string | null) {
  if (!dateIso) return null;

  // Supabase può ritornare timestamp con o senza timezone.
  // Se manca la timezone, assumiamo Europe/Rome per coerenza.
  const raw = String(dateIso).trim();
  if (!raw) return null;

  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw);
  const parsed = hasTz ? new Date(raw) : new Date(raw.replace(" ", "T") + "+01:00");

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, "").trim();
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const routeParams = useParams<{ token?: string | string[] }>();
  const pathname = usePathname();

  const token = useMemo(() => {
    const fromProps = params?.token;
    if (typeof fromProps === "string" && fromProps.trim()) return fromProps;

    const rp = routeParams?.token;
    if (typeof rp === "string" && rp.trim()) return rp;
    if (Array.isArray(rp) && typeof rp[0] === "string" && rp[0].trim()) return rp[0];

    if (typeof pathname === "string") {
      const m = pathname.match(/^\/i\/([^/?#]+)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    }

    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      const q = qs.get("token");
      if (q && q.trim()) return q;
    }

    return "";
  }, [params, routeParams, pathname]);

  const [invite, setInvite] = useState<InviteRow | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("Evento");
  const [previewDay, setPreviewDay] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("loading");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Dati utente (sempre richiesti)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("male");

  // OTP
  const [otp, setOtp] = useState("");

  const [busy, setBusy] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // RSVP result
  const [resultStatus, setResultStatus] = useState<"accepted" | "declined" | null>(null);

  // Nasconde subito i bottoni dopo click
  const [pendingChoice, setPendingChoice] = useState<"accepted" | "declined" | null>(null);

  const title = invite?.party_title ?? previewTitle;
  const day = fmtDay(invite?.party_date ?? null) ?? previewDay;

  const onOpenApp = () => {
    if (!token) return;
    window.location.href = `partydispo://i/${encodeURIComponent(token)}`;
  };

  const onGetApp = () => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isIOS && IOS_APP_STORE_URL) {
      window.location.href = IOS_APP_STORE_URL;
      return;
    }
    if (isAndroid && ANDROID_PLAY_STORE_URL) {
      window.location.href = ANDROID_PLAY_STORE_URL;
      return;
    }

    // Non ancora sugli store: tentiamo comunque il deeplink (se per caso è installata)
    // e mostriamo un messaggio coerente.
    onOpenApp();
    setErrorText("L’app non è ancora disponibile sugli store. Riprova più avanti.");
  };

  // Bootstrap: token + session
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStep("loading");
        setErrorText(null);

        if (!token) {
          setStep("error");
          setErrorText("Link non valido: token mancante o URL non corretta.");
          return;
        }

        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id ?? null;
        if (cancelled) return;

        setSessionUserId(uid);

        // Anche se c'è sessione, il flusso che vuoi è: form dati -> OTP.
        // Quindi restiamo su needAuth finché non si completa l’OTP.
        setStep("needAuth");
      } catch (e) {
        console.error("[invite] bootstrap error", e);
        if (!cancelled) {
          setStep("needAuth");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Preview (titolo + giorno) via RPC, anche senza login
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!token) return;

        const { data, error } = await supabase.rpc("get_invite_public", { p_token: token });
        if (error) {
          console.error("[invite] get_invite_public preview error", error);
          if (!cancelled) setErrorText("Non riesco a caricare i dettagli dell’evento. Riprova tra poco.");
          return;
        }

        const row = Array.isArray(data) ? data[0] : (data as any);
        if (!cancelled && row) {
          const t = row.party_title;
          const d = fmtDay(row.party_date ?? null);

          if (typeof t === "string" && t.trim()) setPreviewTitle(t.trim());
          if (d) setPreviewDay(d);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Dopo login (OTP completato) carichiamo dettagli invito (sempre via RPC public)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (step !== "ready") return;
        if (!token) return;

        setErrorText(null);

        const { data, error } = await supabase.rpc("get_invite_public", { p_token: token });
        if (error) throw error;

        const row = Array.isArray(data) ? data[0] : (data as any);
        if (!row) {
          setInvite(null);
          setStep("error");
          setErrorText("Invito non trovato o non più valido.");
          return;
        }

        // scadenza (se la usi)
        if (row.expires_at) {
          const exp = new Date(row.expires_at).getTime();
          if (Number.isFinite(exp) && exp < Date.now()) {
            setInvite(null);
            setStep("error");
            setErrorText("Questo invito è scaduto.");
            return;
          }
        }

        if (cancelled) return;
        setInvite(row as any);
      } catch (e) {
        console.error("[invite] post-login load error", e);
        if (!cancelled) {
          setInvite(null);
          setErrorText("Non riesco a caricare tutti i dettagli dell’invito. Puoi comunque rispondere.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, token]);

  async function onSendCode() {
    try {
      setBusy(true);
      setErrorText(null);

      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = normalizePhone(phone);
      const em = email.trim().toLowerCase();

      if (!fn || !ln || !ph || !em) {
        setErrorText("Compila nome, cognome, telefono ed email.");
        return;
      }
      if (!isValidEmail(em)) {
        setErrorText("Inserisci un’email valida.");
        return;
      }
      if (!token) {
        setErrorText("Link non valido.");
        return;
      }

      // OTP email: se user esiste -> login, se non esiste -> create user
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          emailRedirectTo: `https://www.partydispo.app/i/${encodeURIComponent(token)}`,
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

      const em = email.trim().toLowerCase();
      const code = otp.trim();

      if (!code) {
        setErrorText("Inserisci il codice OTP.");
        return;
      }
      if (!isValidEmail(em)) {
        setErrorText("Email non valida.");
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: em,
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

      // Upsert profilo: se esiste -> update, se non esiste -> insert
      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = normalizePhone(phone);

      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: uid,
            first_name: fn,
            last_name: ln,
            phone: ph,
            email: em,
            gender,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: "id" }
        );

      if (upsertErr) throw upsertErr;

      // Reset RSVP UI state
      setPendingChoice(null);
      setResultStatus(null);

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
      // spariscono subito
      setPendingChoice(next);

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
        setPendingChoice(null);
        setErrorText("Non sono riuscito a registrare la risposta. Riprova.");
      }
    } catch (e) {
      console.error("[invite] respond error:", e);
      setPendingChoice(null);
      setErrorText("Invito non valido oppure scaduto. Chiedi all’organizzatore di reinviarlo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={S.page}>
      <div style={S.bg} />

      <div style={S.container}>
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
              <div style={{ height: 12 }} />
              <div style={S.btnCol}>
                <button style={S.primaryBtn} onClick={onGetApp}>
                  Scarica l’app
                </button>
                <button style={S.secondaryBtn} onClick={onOpenApp}>
                  Apri l’app (se già installata)
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={S.hero}>
                <h1 style={S.h1}>Sei stato invitato all’evento</h1>
                <div style={S.heroEvent}>{previewTitle}</div>
                {previewDay ? <div style={S.heroSub}>🗓️ {previewDay}</div> : null}
              </div>

              {errorText ? <p style={{ ...S.muted, marginTop: 10, textAlign: "center" }}>{errorText}</p> : null}

              <div style={S.divider} />

              {/* STEP 1: DATI + INVIO OTP */}
              {step === "needAuth" ? (
                <>
                  <div style={S.sectionTitleCenter}>Accedi</div>
                  <div style={{ ...S.muted, textAlign: "center" }}>
                    Inserisci i tuoi dati. Ti invieremo un codice via email per confermare l’accesso.
                  </div>

                  <div style={{ height: 12 }} />

                  <input style={S.input} placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <div style={{ height: 10 }} />
                  <input style={S.input} placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <div style={{ height: 10 }} />
                  <input
                    style={S.input}
                    placeholder="Telefono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  <div style={{ height: 10 }} />
                  <input
                    style={S.input}
                    placeholder="Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />

                  <div style={{ height: 12 }} />

                  <div style={S.genderRow}>
                    <button
                      type="button"
                      style={gender === "male" ? S.genderBtnActive : S.genderBtn}
                      onClick={() => setGender("male")}
                    >
                      Uomo
                    </button>
                    <button
                      type="button"
                      style={gender === "female" ? S.genderBtnActive : S.genderBtn}
                      onClick={() => setGender("female")}
                    >
                      Donna
                    </button>
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onSendCode}>
                      {busy ? "Invio…" : "Invia codice OTP"}
                    </button>

                    <button style={S.secondaryBtn} onClick={onGetApp}>
                      Scarica l’app
                    </button>
                  </div>
                </>
              ) : null}

              {/* STEP 2: VERIFICA OTP */}
              {step === "verifyCode" ? (
                <>
                  <div style={S.sectionTitleCenter}>Inserisci il codice</div>
                  <div style={{ ...S.muted, textAlign: "center" }}>
                    Ti abbiamo inviato un codice OTP via email. Inseriscilo qui sotto.
                  </div>

                  <div style={{ height: 12 }} />

                  <input
                    style={S.input}
                    placeholder="Codice OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputMode="numeric"
                  />

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onVerifyCode}>
                      {busy ? "Verifica…" : "Verifica e continua"}
                    </button>

                    <button style={S.linkBtn} disabled={busy} onClick={onSendCode}>
                      Reinvia codice
                    </button>
                  </div>
                </>
              ) : null}

              {/* STEP 3: POST OTP - EVENTO + CTA APP + RSVP */}
              {step === "ready" ? (
                <>
                  <div style={S.partyBox}>
                    <div style={S.partyTitle}>{title}</div>
                    <div style={S.partyMeta}>
                      {day ? <div>🗓️ {day}</div> : <div>🗓️ (data non disponibile)</div>}
                      <div style={S.partyHint}>
                        Luogo e orario saranno visibili solo dentro l’app (dopo conferma/approvazione).
                      </div>
                    </div>
                  </div>

                  <div style={S.divider} />

                  <div style={S.ctaBoxStrong}>
                    <div style={S.ctaTitleStrong}>Scarica PartyDispo 🔥</div>
                    <div style={S.ctaTextStrong}>
                      Con l’app ricevi:
                      <ul style={S.ctaList}>
                        <li>Notifiche istantanee quando vieni approvato</li>
                        <li>Luogo e orario dell’evento (appena disponibili)</li>
                        <li>Info e aggiornamenti in tempo reale</li>
                        <li>Scatti “vintage” con un tocco, stile disposable camera</li>
                      </ul>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={S.btnCol}>
                      <button style={S.primaryBtn} onClick={onGetApp}>
                        Scarica l’app
                      </button>
                      <button style={S.secondaryBtn} onClick={onOpenApp}>
                        Apri l’app (se già installata)
                      </button>
                    </div>

                    <div style={S.ctaSmall}>
                      Non vuoi scaricarla? Puoi comunque rispondere qui sotto (non potrai modificare la scelta).
                    </div>
                  </div>

                  <div style={S.divider} />

                  <div style={S.sectionTitleCenter}>Conferma partecipazione</div>
                  <div style={{ ...S.muted, textAlign: "center" }}>
                    La tua risposta verrà inviata all’organizzatore. Dopo l’invio non potrai cambiarla.
                  </div>

                  <div style={{ height: 12 }} />

                  {pendingChoice ? (
                    <div style={{ ...S.muted, textAlign: "center" }}>Sto inviando la tua risposta all’organizzatore…</div>
                  ) : (
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
                  )}

                  <div style={S.debug}>
                    {sessionUserId ? (
                      <>
                        Utente: <code style={S.code}>{sessionUserId.slice(0, 8)}…</code>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}

              {/* STEP 4: DONE */}
              {step === "done" ? (
                <div style={S.confirm}>
                  <div style={S.confirmTitle}>
                    {resultStatus === "accepted" ? "✅ Presenza confermata!" : "✅ Risposta inviata!"}
                  </div>

                  <div style={{ ...S.muted, textAlign: "center" }}>
                    {resultStatus === "accepted"
                      ? "Hai confermato che parteciperai. La tua risposta è stata inviata all’organizzatore."
                      : "Hai indicato che non parteciperai. La tua risposta è stata inviata all’organizzatore."}
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={S.primaryBtn} onClick={onGetApp}>
                      Scarica l’app
                    </button>
                    <button style={S.secondaryBtn} onClick={onOpenApp}>
                      Apri l’app (se già installata)
                    </button>
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

  card: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    padding: 18,
  },

  hero: { display: "grid", gap: 8, justifyItems: "center", textAlign: "center" },
  heroSub: { color: "rgba(255,255,255,0.62)", fontSize: 14, fontWeight: 800 },
  heroEvent: { fontSize: 18, fontWeight: 950, color: "rgba(255,255,255,0.88)", letterSpacing: -0.2 },

  h1: { margin: 0, fontSize: 28, fontWeight: 950, letterSpacing: -0.3, textAlign: "center" },
  muted: { color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: "18px" },

  divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "16px 0" },

  sectionTitleCenter: { fontWeight: 950, marginBottom: 6, textAlign: "center" },

  input: {
    width: "100%",
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(255,255,255,0.92)",
    padding: "0 12px",
    outline: "none",
    fontWeight: 800,
  },

  genderRow: { display: "flex", gap: 10, justifyContent: "center" },
  genderBtn: {
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.82)",
    fontWeight: 950,
    cursor: "pointer",
    flex: 1,
  },
  genderBtnActive: {
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 950,
    cursor: "pointer",
    flex: 1,
  },

  btnCol: {
    display: "grid",
    justifyItems: "center",
    gap: 10,
    marginTop: 6,
  },

  row: {
    display: "grid",
    gap: 10,
    marginTop: 10,
    justifyItems: "center",
  },

  primaryBtn: {
    height: 46,
    borderRadius: 14,
    border: 0,
    padding: "0 14px",
    fontWeight: 950,
    cursor: "pointer",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    width: "100%",
    maxWidth: 320,
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0 14px",
    fontWeight: 950,
    cursor: "pointer",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    width: "100%",
    maxWidth: 320,
  },
  linkBtn: {
    width: "100%",
    maxWidth: 320,
    height: 40,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },

  partyBox: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
    textAlign: "center",
  },
  partyTitle: { fontSize: 22, fontWeight: 950 },
  partyMeta: {
    marginTop: 10,
    display: "grid",
    gap: 6,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
  },
  partyHint: {
    marginTop: 6,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: "16px",
  },

  ctaBoxStrong: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    padding: 16,
    textAlign: "center",
  },
  ctaTitleStrong: { fontWeight: 950, fontSize: 18, marginBottom: 8, letterSpacing: -0.2 },
  ctaTextStrong: { color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: "18px" },
  ctaList: { marginTop: 10, marginBottom: 0, paddingLeft: 18, display: "grid", gap: 6, textAlign: "left" },
  ctaSmall: { marginTop: 10, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 12 },

  confirm: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
    display: "grid",
    justifyItems: "center",
    gap: 8,
    textAlign: "center",
  },
  confirmTitle: { fontWeight: 950, fontSize: 16 },

  debug: { marginTop: 14, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 },
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