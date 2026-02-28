// FLOW B: Show login first, only load invite after authentication
"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function InvitePage({ params }: { params: { token: string } }) {
  const routeParams = useParams<{ token?: string | string[] }>();
  const pathname = usePathname();

  const token = useMemo(() => {
    // 1) Preferred: params passed by Next
    const fromProps = params?.token;
    if (typeof fromProps === "string" && fromProps.trim()) return fromProps;

    // 2) Client-side route params
    const rp = routeParams?.token;
    if (typeof rp === "string" && rp.trim()) return rp;
    if (Array.isArray(rp) && typeof rp[0] === "string" && rp[0].trim()) return rp[0];

    // 3) Parse from pathname (/i/<token>)
    if (typeof pathname === "string") {
      const m = pathname.match(/^\/i\/([^/?#]+)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    }

    // 4) Fallback: querystring (?token=...)
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

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [busy, setBusy] = useState(false);

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"accepted" | "declined" | null>(null);

  // ✅ NEW: nasconde subito i bottoni dopo click, mentre inviamo la risposta
  const [pendingChoice, setPendingChoice] = useState<"accepted" | "declined" | null>(null);

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
        setStep(uid ? "ready" : "needAuth");
      } catch (e) {
        console.error("[invite] auth bootstrap error", e);
        if (!cancelled) setStep("needAuth");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setSessionUserId(uid);
      if (uid) setStep("ready");
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  // Preview (titolo + giorno) via RPC, anche senza login.
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

  // Carica dettagli invito SOLO dopo login
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (step !== "ready") return;
        if (!sessionUserId) return;
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
          setErrorText("Non riesco a caricare i dettagli dell’invito (permessi). Puoi comunque rispondere qui sotto.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, sessionUserId, token]);

  const title = invite?.party_title ?? previewTitle;
  const day = fmtDay(invite?.party_date ?? null) ?? previewDay;

  // Deep link (fallback se l'utente ha comunque l'app installata)
  const onOpenApp = () => {
    if (!token) return;
    window.location.href = `partydispo://i/${encodeURIComponent(token)}`;
  };

  // Store links (quando sarai sugli store)
  const IOS_APP_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";
  const ANDROID_PLAY_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL || "";

  // Fallback web finché non sei sugli store
  const DOWNLOAD_FALLBACK_URL = process.env.NEXT_PUBLIC_DOWNLOAD_FALLBACK_URL || "https://partydispo.app/get";

  const onGetApp = () => {
    // Non pubblicata sugli store -> vai alla pagina download
    if (!IOS_APP_STORE_URL && !ANDROID_PLAY_STORE_URL) {
      window.location.href = DOWNLOAD_FALLBACK_URL;
      return;
    }

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

    window.location.href = DOWNLOAD_FALLBACK_URL;
  };

  async function onSendCode() {
    try {
      setBusy(true);
      setErrorText(null);

      const e = email.trim().toLowerCase();
      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = normalizePhone(phone);

      if (!fn || !ln || !ph || !e) {
        setErrorText("Compila nome, cognome, telefono ed email.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        setErrorText("Inserisci un’email valida.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
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

      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = normalizePhone(phone);
      const em = e;

      if (!fn || !ln || !ph || !em) {
        setStep("needAuth");
        setErrorText("Completa i tuoi dati prima di continuare.");
        return;
      }

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
      setPendingChoice(next); // nasconde i bottoni subito

      setBusy(true);
      setErrorText(null);

      const { data, error } = await supabase.rpc("respond_party_invite_auth", {
        p_token: token,
        p_status: next,
      });

      if (error) throw error;

      if (data?.ok) {
        setResultStatus(next);
        setErrorText(null);
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
              <div style={{ height: 10 }} />
              <button style={S.secondaryBtn} onClick={onGetApp}>
                Scarica l’app
              </button>
            </>
          ) : (
            <>
              <div style={S.hero}>
                <h1 style={S.h1}>Sei stato invitato all’evento</h1>
              </div>

              {errorText ? <p style={{ ...S.muted, marginTop: 10 }}>{errorText}</p> : null}

              <div style={S.divider} />

              {step === "needAuth" ? (
                <>
                  <div style={S.sectionTitle}>Accedi</div>
                  <div style={S.muted}>
                    Inserisci i tuoi dati. Ti invieremo un codice via email per confermare l’accesso.
                  </div>

                  <div style={{ height: 10 }} />

                  <input style={S.input} placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <div style={{ height: 10 }} />
                  <input style={S.input} placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <div style={{ height: 10 }} />
                  <input style={S.input} placeholder="Telefono" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                  <div style={{ height: 10 }} />
                  <input style={S.input} placeholder="Mail" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />

                  <div style={{ height: 10 }} />

                  <div style={S.genderRow}>
                    <button type="button" style={gender === "male" ? S.genderBtnActive : S.genderBtn} onClick={() => setGender("male")}>
                      Uomo
                    </button>
                    <button type="button" style={gender === "female" ? S.genderBtnActive : S.genderBtn} onClick={() => setGender("female")}>
                      Donna
                    </button>
                  </div>

                  <div style={{ height: 10 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onSendCode}>
                      {busy ? "Invio…" : "Accedi"}
                    </button>
                    <button style={S.secondaryBtn} onClick={onGetApp}>
                      Scarica l’app
                    </button>
                  </div>
                </>
              ) : null}

              {step === "verifyCode" ? (
                <>
                  <div style={S.sectionTitle}>Inserisci il codice</div>
                  <div style={S.muted}>Ti abbiamo inviato un codice OTP via email.</div>

                  <div style={{ height: 10 }} />

                  <input style={S.input} placeholder="Codice OTP" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" />

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

              {step === "ready" ? (
                <>
                  <div style={S.sectionTitle}>Dettagli invito</div>

                  <div style={S.partyBox}>
                    <div style={S.partyTitle}>{title}</div>
                    <div style={S.partyMeta}>
                      {day ? <div>🗓️ {day}</div> : <div>🗓️ (data non disponibile)</div>}
                      <div style={S.partyHint}>Luogo e orario saranno visibili solo dentro l'app.</div>
                    </div>
                  </div>

                  <div style={S.divider} />

                  <div style={S.ctaBoxStrong}>
                    <div style={S.ctaTitleStrong}>Scarica PartyDispo 🔥</div>
                    <div style={S.ctaTextStrong}>
                      Con l’app ricevi:
                      <ul style={S.ctaList}>
                        <li>Notifiche istantanee quando la tua presenza viene approvata</li>
                        <li>Luogo e orario dell’evento disponibili in anteprima sull’app</li>
                        <li>Aggiornamenti live direttamente dall’organizzatore</li>
                        <li>Scatta foto uniche con la nostra modalità vintage esclusiva</li>
                      </ul>
                    </div>

                    <div style={{ height: 10 }} />

                    <button style={S.primaryBtn} onClick={onGetApp}>
                      Scarica l’app
                    </button>

                    <div style={S.ctaSmall}>Non vuoi scaricarla? Puoi comunque rispondere qui sotto.</div>
                  </div>

                  <div style={S.divider} />

                  <div style={S.sectionTitle}>Conferma partecipazione</div>
                  <div style={S.muted}>Rispondi all’invito. La risposta verrà inviata all’organizzatore.</div>

                  <div style={{ height: 10 }} />

                  {pendingChoice ? (
                    <div style={S.muted}>Sto inviando la tua risposta all’organizzatore…</div>
                  ) : (
                    <div style={S.row}>
                      <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={() => onRespond("accepted")}>
                        {busy ? "Invio…" : "Ci sono"}
                      </button>
                      <button style={{ ...S.secondaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={() => onRespond("declined")}>
                        {busy ? "Invio…" : "Non ci sono"}
                      </button>
                    </div>
                  )}
                </>
              ) : null}

              {step === "done" ? (
                <div style={S.confirm}>
                  <div style={S.confirmTitle}>{resultStatus === "accepted" ? "✅ Perfetto, ci sei!" : "✅ Ok, ricevuto."}</div>
                  <div style={S.muted}>
                    {resultStatus === "accepted"
                      ? "La tua risposta è stata inviata all’organizzatore. Riceverai aggiornamenti quando verrai approvato."
                      : "La tua risposta è stata inviata all’organizzatore."}
                  </div>
                  <div style={{ height: 12 }} />
                  <button style={S.primaryBtn} onClick={onGetApp}>
                    Scarica l’app
                  </button>
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

  hero: { display: "grid", gap: 8, justifyItems: "start" },

  card: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    padding: 18,
  },
  h1: { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.3 },
  muted: { color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: "18px" },

  divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "16px 0" },
  sectionTitle: { fontWeight: 900, marginBottom: 6 },

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

  genderRow: { display: "flex", gap: 10 },
  genderBtn: {
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.82)",
    fontWeight: 900,
    cursor: "pointer",
    flex: 1,
  },
  genderBtnActive: {
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
    flex: 1,
  },

  row: { display: "grid", gap: 10, marginTop: 10, justifyItems: "center" },
  btnCol: { display: "grid", justifyItems: "center", gap: 10, marginTop: 10 },

  // ✅ Centrati ovunque
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    border: 0,
    padding: "0 14px",
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    width: "100%",
    maxWidth: 320,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
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
    width: "100%",
    maxWidth: 320,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
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

  partyBox: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  partyTitle: { fontSize: 22, fontWeight: 900 },
  partyMeta: { marginTop: 8, display: "grid", gap: 6, color: "rgba(255,255,255,0.70)", fontSize: 13 },
  partyHint: { marginTop: 6, color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: "16px" },

  ctaBoxStrong: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    padding: 16,
  },
  ctaTitleStrong: { fontWeight: 900, fontSize: 18, marginBottom: 6, letterSpacing: -0.2 },
  ctaTextStrong: { color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: "18px" },
  ctaList: { marginTop: 10, marginBottom: 0, paddingLeft: 18, display: "grid", gap: 6 },
  ctaSmall: { marginTop: 10, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 12 },

  confirm: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
    display: "grid",
    justifyItems: "center",
    gap: 6,
    textAlign: "center",
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