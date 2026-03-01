// app/i/[token]/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
type Sex = "M" | "F";

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
  const cleaned = p.replace(/[^\d+]/g, "").trim();

  // Normalize to a safe length. E.164 allows up to 15 digits (+ optional leading '+').
  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\D/g, "").slice(0, 15);
  }
  return cleaned.replace(/\D/g, "").slice(0, 15);
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());
}

function sanitizeOtp(code: string) {
  // Keep only digits (users often paste with spaces) and cap to 8 digits.
  return code.replace(/\D/g, "").trim().slice(0, 8);
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
  const [sex, setSex] = useState<Sex>("M");

  // OTP
  const [otp, setOtp] = useState("");
  // Anti-spam OTP resend cooldown (Supabase returns 429 if you spam requests)
  const [otpCooldownSec, setOtpCooldownSec] = useState(0);
  const otpCooldownTimerRef = useRef<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // RSVP result (match DB statuses used by the mobile app)
  const [resultStatus, setResultStatus] = useState<"yes" | "no" | null>(null);

  // Nasconde subito i bottoni dopo click
  const [pendingChoice, setPendingChoice] = useState<"yes" | "no" | null>(null);

  function asMsg(e: any): string {
    if (!e) return "";
    if (typeof e === "string") return e;
    if (e?.message && typeof e.message === "string") return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }

  async function safeClearBrokenSession() {
    // On web it is common to have a stale refresh token in localStorage.
    // When that happens Supabase may throw "Invalid Refresh Token" and subsequent calls behave oddly.
    // We proactively sign out locally to reset the client state.
    try {
      const { error } = await supabase.auth.getSession();
      const msg = asMsg(error);
      if (error && /refresh token/i.test(msg)) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
  }

  function startOtpCooldown(seconds: number) {
    if (otpCooldownTimerRef.current) {
      window.clearInterval(otpCooldownTimerRef.current);
      otpCooldownTimerRef.current = null;
    }
    setOtpCooldownSec(seconds);
    otpCooldownTimerRef.current = window.setInterval(() => {
      setOtpCooldownSec((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0 && otpCooldownTimerRef.current) {
          window.clearInterval(otpCooldownTimerRef.current);
          otpCooldownTimerRef.current = null;
        }
        return next;
      });
    }, 1000);
  }

  const title = invite?.party_title ?? previewTitle;
  const day = fmtDay(invite?.party_date ?? null) ?? previewDay;

  // UX: keep state changes visible on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);


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

    setErrorText("L’app non è ancora disponibile sugli store. Riprova più avanti.");
  };

  // Bootstrap: token + session
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStep("loading");
        setErrorText(null);
        await safeClearBrokenSession();

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

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (otpCooldownTimerRef.current) {
        window.clearInterval(otpCooldownTimerRef.current);
        otpCooldownTimerRef.current = null;
      }
    };
  }, []);

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
      if (otpCooldownSec > 0) {
        setErrorText(`Per sicurezza puoi richiedere un nuovo codice tra ${otpCooldownSec}s.`);
        return;
      }
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

      // Email OTP: usiamo SOLO il codice (niente magic link) per evitare mismatch tra redirect URL e flussi.
      // Nota: `emailRedirectTo` non è necessario per l’OTP e può generare confusione se il dominio non coincide.
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      // Supabase rate limit: avoid spamming requests
      startOtpCooldown(30);

      setOtp("");
      setStep("verifyCode");
    } catch (e) {
      console.error("[invite] send otp error:", e);
      const msg = asMsg(e);
      if (/429|too many requests/i.test(msg) || /only request this after/i.test(msg)) {
        // Extract seconds if present
        const m = msg.match(/after\s+(\d+)\s+seconds/i);
        const sec = m ? parseInt(m[1], 10) : 30;
        if (Number.isFinite(sec) && sec > 0) startOtpCooldown(sec);
        setErrorText(m ? `Per sicurezza puoi richiedere un nuovo codice tra ${sec}s.` : "Hai richiesto troppi codici. Riprova tra qualche secondo.");
      } else {
        setErrorText("Non sono riuscito a inviare il codice. Riprova.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyCode() {
    try {
      setBusy(true);
      setErrorText(null);
      await safeClearBrokenSession();
      // Nota: safeClearBrokenSession può fare signOut se trova un refresh token rotto; va bene prima della verifyOtp.

      const em = email.trim().toLowerCase();
      const code = sanitizeOtp(otp);

      if (!isValidEmail(em)) {
        setErrorText("Email non valida.");
        return;
      }

      // Nel tuo caso l'OTP arriva a 8 cifre.
      // Se l'utente incolla con spazi o trattini li rimuoviamo con sanitizeOtp.
      if (!code || code.length !== 8) {
        setErrorText("Inserisci le 8 cifre del codice OTP.");
        return;
      }

      // Verifica OTP: proviamo prima `type: "email"` (OTP classico),
      // poi fallback a `type: "magiclink"` (alcune configurazioni inviano un codice a 8 cifre con questo tipo).
      let verify = await supabase.auth.verifyOtp({
        email: em,
        token: code,
        type: "email",
      });

      if (verify.error) {
        verify = await supabase.auth.verifyOtp({
          email: em,
          token: code,
          type: "magiclink",
        });
      }

      if (verify.error) {
        console.error("[invite] verifyOtp failed (OTP invalid/expired):", verify.error);
        const msg = asMsg(verify.error);
        if (/expired|scadut/i.test(msg)) {
          setErrorText("Codice scaduto. Premi 'Reinvia codice' e usa l’ULTIMO codice ricevuto.");
        } else {
          setErrorText("Codice non valido o scaduto. Assicurati di usare l’ULTIMO codice ricevuto.");
        }
        return;
      }

      // In alcune combinazioni (client/web) il user può non essere presente nel payload,
      // ma la session viene comunque creata. Quindi recuperiamo sempre la sessione.
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        console.error("[invite] getSession after verify error:", sessErr);
        setErrorText("Accesso riuscito ma non riesco a inizializzare la sessione. Riprova.");
        return;
      }

      const uid = sessData.session?.user?.id ?? verify.data.user?.id ?? null;
      if (!uid) {
        setErrorText("Accesso non riuscito. Riprova.");
        return;
      }

      setSessionUserId(uid);
      // Defensive: ensure the session is really in place
      try {
        await supabase.auth.getUser();
      } catch {
        // ignore
      }

      // Upsert profilo: NON deve bloccare il flusso OTP.
      // Se qui fallisce (RLS / schema cache / colonna mancante), l’utente è comunque autenticato
      // e può continuare a rispondere all’invito.
      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = normalizePhone(phone);

      if (!fn || !ln || !ph) {
        setErrorText("Compila nome, cognome e telefono.");
        return;
      }

      const profilePayload: any = {
        id: uid,
        first_name: fn,
        last_name: ln,
        phone: ph,
        email: em,
        // NB: la colonna corretta nel tuo DB è `sex` (NON `gender`).
        sex,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });

      if (upsertErr) {
        // IMPORTANT: non trattare questo come errore OTP.
        console.error("[invite] profile upsert failed (OTP OK):", {
          code: (upsertErr as any)?.code,
          message: (upsertErr as any)?.message,
          details: (upsertErr as any)?.details,
          hint: (upsertErr as any)?.hint,
          payloadKeys: Object.keys(profilePayload),
        });

        // Caso tipico: schema cache di PostgREST non aggiornata / colonna non trovata.
        // Permettiamo di proseguire ma mostriamo un messaggio chiaro.
        const msg = asMsg(upsertErr);
        if (/could not find the 'gender' column/i.test(msg)) {
          setErrorText(
            "OTP verificato correttamente ✅. Tuttavia il sito sta provando a scrivere un campo non più presente (gender). Hai già corretto il codice per usare `sex`, quindi ora serve solo una nuova build/deploy del sito (e svuotare la cache del browser) per caricare la versione aggiornata. Nel frattempo puoi continuare."
          );
        } else if (/could not find the 'sex' column/i.test(msg) || /PGRST204/i.test(msg)) {
          setErrorText(
            "OTP verificato correttamente ✅. Non riesco a salvare il profilo (colonna `sex` non trovata o schema cache non aggiornata). Puoi continuare, ma per sistemare definitivamente verifica che la tabella `profiles` abbia la colonna `sex` e poi ricarica la schema cache di PostgREST."
          );
        } else {
          setErrorText(
            "OTP verificato correttamente ✅. Non riesco a salvare il profilo (probabile RLS). Puoi continuare, ma verifica le RLS sulla tabella `profiles` (permesso di upsert per l’utente autenticato)."
          );
        }
      }

      // Reset RSVP UI state
      setPendingChoice(null);
      setResultStatus(null);

      setStep("ready");
    } catch (e) {
      console.error("[invite] verify otp unexpected error:", e);
      setErrorText(
        "Codice non valido o scaduto. Controlla di aver inserito le 6 cifre ESATTE e che sia l'ULTIMO codice ricevuto, poi riprova (o premi Reinvia codice)."
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRespond(next: "yes" | "no") {
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
                      style={sex === "M" ? S.genderBtnActive : S.genderBtn}
                      onClick={() => setSex("M")}
                    >
                      Uomo
                    </button>
                    <button
                      type="button"
                      style={sex === "F" ? S.genderBtnActive : S.genderBtn}
                      onClick={() => setSex("F")}
                    >
                      Donna
                    </button>
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onSendCode}>
                      {busy ? "Invio…" : otpCooldownSec > 0 ? `Riprova tra ${otpCooldownSec}s` : "Invia codice OTP"}
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
  placeholder="Codice OTP (8 cifre)"
  value={otp}
  onChange={(e) => {
    const next = sanitizeOtp(e.target.value);
    setOtp(next);
  }}
  inputMode="numeric"
  autoComplete="one-time-code"
  maxLength={8}
/>

<div style={{ height: 8 }} />
<div style={{ ...S.muted, textAlign: "center" }}>
  Inserisci esattamente <b>8 cifre</b> e assicurati di usare <b>l’ultimo</b> codice ricevuto.
</div>
                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onVerifyCode}>
                      {busy ? "Verifica…" : "Verifica e continua"}
                    </button>

                    <button style={S.linkBtn} disabled={busy || otpCooldownSec > 0} onClick={onSendCode}>
                      {otpCooldownSec > 0 ? `Reinvia tra ${otpCooldownSec}s` : "Reinvia codice"}
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
                        onClick={() => onRespond("yes")}
                      >
                        {busy ? "Invio…" : "Ci sono"}
                      </button>

                      <button
                        style={{ ...S.secondaryBtn, opacity: busy ? 0.7 : 1 }}
                        disabled={busy}
                        onClick={() => onRespond("no")}
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
                    {resultStatus === "yes" ? "✅ Presenza confermata!" : "✅ Risposta inviata!"}
                  </div>

                  <div style={{ ...S.muted, textAlign: "center" }}>
                    {resultStatus === "yes"
                      ? "Hai confermato che parteciperai. La tua risposta è stata inviata all’organizzatore."
                      : "Hai indicato che non parteciperai. La tua risposta è stata inviata all’organizzatore."}
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={S.primaryBtn} onClick={onGetApp}>
                      Scarica l’app
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