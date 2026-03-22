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
  party_mode?: "BRING_YOUR_OWN" | "PAY_AND_DRINK" | string | null;
  party_type?: "COLLECTION" | "BRING_DRINKS" | "CLOSED_LIST" | string | null;
  show_drink_preferences?: boolean | null;
  selected_products?: string[] | null;
  visible_products?: string[] | null;
  organizer_selected_products?: string[] | null;
  products?: Partial<Record<keyof DrinkPrefs, boolean>> | null;
  [key: string]: any;
};

type Step = "loading" | "appChoice" | "needAuth" | "verifyCode" | "ready" | "done" | "error";
type Sex = "male" | "female" | null;

type DrinkPrefs = {
  rum: boolean;
  gin: boolean;
  vodka: boolean;
  tequila: boolean;
  beer: boolean;
  cola: boolean;
  tonic: boolean;
  lemonade: boolean;
};

const DEFAULT_PREFS: DrinkPrefs = {
  rum: false,
  gin: false,
  vodka: false,
  tequila: false,
  beer: false,
  cola: false,
  tonic: false,
  lemonade: false,
};

type DrinkPrefKey = keyof DrinkPrefs;

const ALCOHOL_KEYS: DrinkPrefKey[] = ["rum", "gin", "vodka", "tequila", "beer"];
const SOFT_DRINK_KEYS: DrinkPrefKey[] = ["cola", "tonic", "lemonade"];

const PRODUCT_LABELS: Record<DrinkPrefKey, string> = {
  rum: "Rum",
  gin: "Gin",
  vodka: "Vodka",
  tequila: "Tequila",
  beer: "Birra",
  cola: "Cola",
  tonic: "Tonica",
  lemonade: "Limonata",
};

function isDrinkPrefKey(value: string): value is DrinkPrefKey {
  return value in DEFAULT_PREFS;
}

function normalizeInviteSelectedProducts(invite: InviteRow | null): DrinkPrefKey[] {
  if (!invite) return [];

  const set = new Set<DrinkPrefKey>();

  const arrayCandidates = [
    invite.selected_products,
    invite.visible_products,
    invite.organizer_selected_products,
    Array.isArray(invite?.products) ? invite.products : null,
  ];

  for (const candidate of arrayCandidates) {
    if (!Array.isArray(candidate)) continue;
    for (const raw of candidate) {
      if (typeof raw !== "string") continue;
      const normalized = raw.trim().toLowerCase();
      if (isDrinkPrefKey(normalized)) set.add(normalized);
    }
  }

  const objectCandidates = [invite.products];
  for (const candidate of objectCandidates) {
    if (!candidate || Array.isArray(candidate) || typeof candidate !== "object") continue;
    for (const [rawKey, rawValue] of Object.entries(candidate)) {
      const normalized = rawKey.trim().toLowerCase();
      if (rawValue && isDrinkPrefKey(normalized)) set.add(normalized);
    }
  }

  return Array.from(set);
}

const IOS_APP_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";
const ANDROID_PLAY_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL || "";

function fmtDay(dateIso: string | null) {
  if (!dateIso) return null;

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

  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\D/g, "").slice(0, 15);
  }
  return cleaned.replace(/\D/g, "").slice(0, 15);
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());
}

function sanitizeOtp(code: string) {
  return code.replace(/\D/g, "").trim().slice(0, 8);
}

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

function hasAlcoholSelection(prefs: DrinkPrefs) {
  return !!(prefs.rum || prefs.gin || prefs.vodka || prefs.tequila || prefs.beer);
}

function isAlcoholPreferenceKey(key: keyof DrinkPrefs) {
  return key === "rum" || key === "gin" || key === "vodka" || key === "tequila" || key === "beer";
}

function hasCompletedDrinkPrefs(currentPrefs: DrinkPrefs, currentIntoxLevel: number) {
  const alcoholSelected = hasAlcoholSelection(currentPrefs);
  const safeIntoxLevel = currentIntoxLevel <= 0 ? 0 : currentIntoxLevel >= 2 ? 2 : 1;
  return safeIntoxLevel === 0 ? !alcoholSelected : alcoholSelected;
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState<Sex>(null);

  const [otp, setOtp] = useState("");
  const [otpCooldownSec, setOtpCooldownSec] = useState(0);
  const otpCooldownTimerRef = useRef<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const [resultStatus, setResultStatus] = useState<"yes" | "no" | null>(null);
  const [pendingChoice, setPendingChoice] = useState<"yes" | "no" | null>(null);

  const [prefs, setPrefs] = useState<DrinkPrefs>(DEFAULT_PREFS);
  const [intoxLevel, setIntoxLevel] = useState<number>(0);
  const [prefsTouched, setPrefsTouched] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [wantsToJoin, setWantsToJoin] = useState(false);

  const rsvpStorageKey = useMemo(() => (token ? `pd_invite_rsvp_${token}` : ""), [token]);

  function loadSavedRsvp(): "yes" | "no" | null {
    if (typeof window === "undefined") return null;
    if (!rsvpStorageKey) return null;
    const v = window.localStorage.getItem(rsvpStorageKey);
    return v === "yes" || v === "no" ? v : null;
  }

  function saveRsvp(v: "yes" | "no") {
    if (typeof window === "undefined") return;
    if (!rsvpStorageKey) return;
    try {
      window.localStorage.setItem(rsvpStorageKey, v);
    } catch {
      // ignore
    }
  }

  async function safeClearBrokenSession() {
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

  const partyTypeLabel = useMemo(() => {
    const rawMode = String(invite?.party_mode ?? "").toUpperCase().trim();
    const rawType = String(invite?.party_type ?? "").toUpperCase().trim();

    if (rawMode === "PAY_AND_DRINK" || rawType === "COLLECTION") return "A pagamento";
    if (rawType === "CLOSED_LIST") return "Gratis";
    if (rawType === "BRING_DRINKS") return "Porta il tuo";
    return rawMode === "PAY_AND_DRINK" ? "A pagamento" : "Gratis";
  }, [invite]);
  
  const alcoholDisabled = false;

  const requiresPreferencesBeforeJoin = useMemo(() => {
    const partyModeRaw = String(invite?.party_mode ?? "").toUpperCase().trim();
    return partyModeRaw === "PAY_AND_DRINK" && invite?.show_drink_preferences === true;
  }, [invite]);

  const visibleProductKeys = useMemo(() => {
    const selected = normalizeInviteSelectedProducts(invite);
    return selected.length > 0 ? selected : [...ALCOHOL_KEYS, ...SOFT_DRINK_KEYS];
  }, [invite]);

  const visibleAlcoholKeys = useMemo(
    () => ALCOHOL_KEYS.filter((key) => visibleProductKeys.includes(key)),
    [visibleProductKeys]
  );

  const visibleSoftDrinkKeys = useMemo(
    () => SOFT_DRINK_KEYS.filter((key) => visibleProductKeys.includes(key)),
    [visibleProductKeys]
  );

  useEffect(() => {
    console.log("[invite-web] preferences gate", {
      step,
      wantsToJoin,
      requiresPreferencesBeforeJoin,
      invitePartyMode: invite?.party_mode ?? null,
      inviteShowDrinkPreferences: invite?.show_drink_preferences ?? null,
      invitePartyId: invite?.party_id ?? null,
      sessionUserId,
    });
  }, [step, wantsToJoin, requiresPreferencesBeforeJoin, invite, sessionUserId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, wantsToJoin]);

  useEffect(() => {
    if (step !== "ready") return;
    setResultStatus(null);
    setPendingChoice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rsvpStorageKey]);

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
        setStep("appChoice");
      } catch (e) {
        console.error("[invite] bootstrap error", e);
        if (!cancelled) setStep("appChoice");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (otpCooldownTimerRef.current) {
        window.clearInterval(otpCooldownTimerRef.current);
        otpCooldownTimerRef.current = null;
      }
    };
  }, []);

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (step !== "ready" || !token) return;

        setErrorText(null);

        const { data, error } = await supabase.rpc("get_invite_public", { p_token: token });
        if (error) throw error;

        const row = Array.isArray(data) ? data[0] : (data as any);
        console.log("[invite-web] get_invite_public row", row);
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

        if (!cancelled) setInvite(row as InviteRow);
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (step !== "ready" || !sessionUserId || !invite?.party_id || !requiresPreferencesBeforeJoin) return;

        const { data, error } = await supabase
          .from("party_drink_preferences")
          .select("rum, gin, vodka, tequila, beer, cola, tonic, lemonade, intox_level")
          .eq("party_id", invite.party_id)
          .eq("user_id", sessionUserId)
          .maybeSingle();

        if (error) {
          console.error("[invite] load web drink prefs error", error);
          return;
        }
        if (!data || cancelled) return;

        setPrefs({
          rum: !!data.rum,
          gin: !!data.gin,
          vodka: !!data.vodka,
          tequila: !!data.tequila,
          beer: !!data.beer,
          cola: !!data.cola,
          tonic: !!data.tonic,
          lemonade: !!data.lemonade,
        });

        const raw = typeof data.intox_level === "number" ? data.intox_level : 0;
        setIntoxLevel(raw <= 0 ? 0 : raw >= 2 ? 2 : 1);
        setPrefsTouched(true);
      } catch (e) {
        console.error("[invite] load web drink prefs unexpected error", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, sessionUserId, invite?.party_id, requiresPreferencesBeforeJoin]);

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

      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      startOtpCooldown(30);
      setOtp("");
      setStep("verifyCode");
    } catch (e) {
      console.error("[invite] send otp error:", e);
      const msg = asMsg(e);
      if (/429|too many requests/i.test(msg) || /only request this after/i.test(msg)) {
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

      const em = email.trim().toLowerCase();
      const code = sanitizeOtp(otp);

      if (!isValidEmail(em)) {
        setErrorText("Email non valida.");
        return;
      }
      if (!code || code.length !== 8) {
        setErrorText("Inserisci le 8 cifre del codice OTP.");
        return;
      }

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
        const msg = asMsg(verify.error);
        if (/expired|scadut/i.test(msg)) {
          setErrorText("Codice scaduto. Premi 'Reinvia codice' e usa l’ULTIMO codice ricevuto.");
        } else {
          setErrorText("Codice non valido o scaduto. Assicurati di usare l’ULTIMO codice ricevuto.");
        }
        return;
      }

      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setErrorText("Accesso riuscito ma non riesco a inizializzare la sessione. Riprova.");
        return;
      }

      const uid = sessData.session?.user?.id ?? verify.data.user?.id ?? null;
      if (!uid) {
        setErrorText("Accesso non riuscito. Riprova.");
        return;
      }

      setSessionUserId(uid);

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
        sex,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });

      if (upsertErr) {
        console.error("[invite] profile upsert failed (OTP OK):", upsertErr);
      }

      setPendingChoice(null);
      setResultStatus(null);
      setWantsToJoin(false);
      setStep("ready");
    } catch (e) {
      console.error("[invite] verify otp unexpected error:", e);
      setErrorText("Codice non valido o scaduto. Controlla di aver inserito le 8 cifre esatte e che sia l'ultimo codice ricevuto.");
    } finally {
      setBusy(false);
    }
  }

  function setPref<K extends keyof DrinkPrefs>(key: K, value: boolean) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      setPrefsTouched(true);

      const selectedAlcoholKey = isAlcoholPreferenceKey(key);
      const alcoholSelected = hasAlcoholSelection(next);

      if (selectedAlcoholKey && alcoholSelected && intoxLevel === 0) {
        setIntoxLevel(1);
      }

      if (!alcoholSelected) {
        setIntoxLevel(0);
      }

      return next;
    });
  }

  async function saveDrinkPreferences() {
    if (!invite?.party_id || !sessionUserId) {
      throw new Error("Sessione non valida. Riprova.");
    }

    const safeIntoxLevel = intoxLevel <= 0 ? 0 : intoxLevel >= 2 ? 2 : 1;

    const payload = {
      party_id: invite.party_id,
      user_id: sessionUserId,
      ...prefs,
      water: false,
      intox_level: safeIntoxLevel,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("party_drink_preferences")
      .upsert(payload, { onConflict: "party_id,user_id" });

    if (error) throw error;
  }

  async function onRespond(next: "yes" | "no") {
    try {
      console.log("[invite-web] onRespond:start", {
        next,
        wantsToJoin,
        requiresPreferencesBeforeJoin,
        invitePartyMode: invite?.party_mode ?? null,
        inviteShowDrinkPreferences: invite?.show_drink_preferences ?? null,
        invitePartyId: invite?.party_id ?? null,
        sessionUserId,
      });
      if (next === "yes" && requiresPreferencesBeforeJoin) {
        console.log("[invite-web] onRespond:preferences-required -> opening prefs UI");
        setPendingChoice(null);
        setResultStatus(null);
        setWantsToJoin(true);
        setErrorText(null);
        return;
      }

      setPendingChoice(next);
      setBusy(true);
      setErrorText(null);

      const { data, error } = await supabase.rpc("respond_party_invite_auth", {
        p_token: token,
        p_status: next,
      });

      if (error) throw error;

      if (data?.ok) {
        saveRsvp(next);
        setResultStatus(next);
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

  async function onSavePrefsAndRespond() {
    try {
      setPrefsSaving(true);
      setErrorText(null);
      setPendingChoice("yes");

      if (!hasCompletedDrinkPrefs(prefs, intoxLevel)) {
        setPendingChoice(null);
        setErrorText("Per continuare devi mantenere coerenti le preferenze: se scegli “Non bevo” non puoi selezionare alcolici; se scegli di bere devi selezionare almeno una bevanda alcolica.");
        return;
      }

      await saveDrinkPreferences();

      const { data, error } = await supabase.rpc("respond_party_invite_auth", {
        p_token: token,
        p_status: "yes",
      });

      if (error) throw error;

      if (data?.ok) {
        saveRsvp("yes");
        setResultStatus("yes");
        setWantsToJoin(false);
      } else {
        setPendingChoice(null);
        setErrorText("Non sono riuscito a inviare la tua partecipazione. Riprova.");
      }
    } catch (e) {
      console.error("[invite] save prefs and respond error:", e);
      setPendingChoice(null);
      setErrorText("Non sono riuscito a salvare le preferenze o a inviare la risposta. Riprova.");
    } finally {
      setPrefsSaving(false);
      setBusy(false);
    }
  }

  console.log("[invite-web] render state", {
    step,
    wantsToJoin,
    requiresPreferencesBeforeJoin,
    showPrefsCard: wantsToJoin && requiresPreferencesBeforeJoin,
    invitePartyMode: invite?.party_mode ?? null,
    inviteShowDrinkPreferences: invite?.show_drink_preferences ?? null,
  });
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
  <h1 style={S.h1}>Sei stato invitato</h1>
</div>

              {errorText ? <p style={{ ...S.muted, marginTop: 10, textAlign: "center" }}>{errorText}</p> : null}

              <div style={S.divider} />

              {step === "appChoice" ? (
                <>
                  <div style={S.ctaBoxStrong}>
                    <div style={S.ctaTitleStrong}>Scarica Echo 🔥</div>
                    <ul style={S.ctaList}>
                      <li>Notifiche istantanee quando vieni approvato</li>
                      <li>Luogo e orario dell’evento appena disponibili</li>
                      <li>Info e aggiornamenti in tempo reale</li>
                      <li>Fotocamera usa e getta della festa, nel tuo telefono</li>
                    </ul>

                    <div style={{ height: 12 }} />

                    <div style={S.btnCol}>
                      <button style={S.primaryBtn} onClick={onGetApp}>
                        Scarica Echo
                      </button>
                      <button style={S.secondaryBtn} onClick={() => setStep("needAuth")}>
                        Preferisco continuare sul web
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
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
                  <input style={S.input} placeholder="Telefono" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                  <div style={{ height: 10 }} />
                  <input style={S.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />

                  <div style={{ height: 12 }} />

                  <div style={S.genderCol}>
                    <div style={S.genderRow}>
                      <button type="button" style={sex === "male" ? S.genderBtnActive : S.genderBtn} onClick={() => setSex("male")}>
                        Uomo
                      </button>
                      <button type="button" style={sex === "female" ? S.genderBtnActive : S.genderBtn} onClick={() => setSex("female")}>
                        Donna
                      </button>
                    </div>
                    <button type="button" style={sex === null ? S.genderBtnActive : S.genderBtn} onClick={() => setSex(null)}>
                      Preferisco non indicarlo
                    </button>
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={S.btnCol}>
                    <button style={{ ...S.primaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onSendCode}>
                      {busy ? "Invio…" : otpCooldownSec > 0 ? `Riprova tra ${otpCooldownSec}s` : "Invia codice"}
                    </button>
                    <button style={S.secondaryBtn} onClick={onGetApp}>
                      Scarica l’app
                    </button>
                  </div>
                </>
              ) : null}

              {step === "verifyCode" ? (
                <>
                  <div style={S.sectionTitleCenter}>Inserisci il codice</div>
                  <div style={{ ...S.muted, textAlign: "center" }}>
                    Ti abbiamo inviato un codice a <b>{email.trim().toLowerCase()}</b>. 
                  </div>

                  <div style={{ height: 8 }} />

                  <div style={{ display: "grid", justifyItems: "center" }}>
                    <button
                      type="button"
                      style={S.linkBtnCentered}
                      disabled={busy}
                      onClick={() => {
                        setStep("needAuth");
                        setOtp("");
                        setErrorText(null);
                      }}
                    >
                      Cambia email
                    </button>
                  </div>

                  <div style={{ height: 12 }} />
                  <input
                    style={S.input}
                    placeholder="Codice di accesso"
                    value={otp}
                    onChange={(e) => setOtp(sanitizeOtp(e.target.value))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                  />

                  <div style={{ height: 8 }} />
              

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

              {step === "ready" ? (
                <>
                  <div style={S.partyBox}>
  <div style={S.partyTitle}>{title}</div>
  <div style={S.partyMeta}>
    {day ? <div>🗓️ {day}</div> : <div>🗓️ (data non disponibile)</div>}
    <div>🍾 {partyTypeLabel}</div>
    <div style={S.partyHint}>
      Luogo e orario saranno visibili solo dentro l’app.
    </div>
  </div>
</div>

                  <div style={S.divider} />

                  <div style={S.ctaBoxStrong}>
  <div style={S.ctaTitleStrong}>Scarica echo 🔥</div>
  <ul style={S.ctaList}>
    <li>Notifiche istantanee quando vieni approvato</li>
    <li>Luogo e orario dell’evento appena disponibili</li>
    <li>Info e aggiornamenti in tempo reale</li>
    <li>Fotocamera usa e getta della festa, nel tuo telefono</li>
  </ul>

  <div style={{ height: 12 }} />

  <div style={S.btnCol}>
    <button style={S.primaryBtn} onClick={onGetApp}>
      Scarica echo
    </button>
  </div>

  <div style={S.ctaSmall}>
    Preferisci non scaricarla? Rispondi qui sotto.
  </div>
</div>

                  <div style={S.divider} />

                  <div style={S.sectionTitleCenter}>Facci sapere se ci sei</div>
<div style={{ ...S.muted, textAlign: "center" }}>
  {requiresPreferencesBeforeJoin
    ? "Indica anche le tue preferenze"
    : "La tua risposta verrà inviata all’organizzatore. Riceverai una mail di conferma"}
</div>


                  <div style={{ height: 12 }} />

                  {wantsToJoin && requiresPreferencesBeforeJoin ? (
                    <div style={S.prefsCard}>
                      <div style={S.prefsTitle}>Cosa vuoi bere</div>
                      <div style={S.prefsCard}>
                        {visibleAlcoholKeys.length > 0 ? (
                          <>
                            <div style={S.prefsSectionTitle}>Alcolici</div>
                            <div style={S.toggleList}>
                              {visibleAlcoholKeys.map((key) => {
                                const checked = prefs[key];
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    style={checked ? S.toggleRowActive : S.toggleRow}
                                    onClick={() => setPref(key, !checked)}
                                  >
                                    <span>{PRODUCT_LABELS[key]}</span>
                                    <span style={checked ? S.toggleTrackActive : S.toggleTrack}>
                                      <span style={checked ? S.toggleThumbActive : S.toggleThumb} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : null}

                        {visibleSoftDrinkKeys.length > 0 ? (
                          <>
                            <div style={S.prefsSectionTitle}>Analcolici</div>
                            <div style={S.toggleList}>
                              {visibleSoftDrinkKeys.map((key) => {
                                const checked = prefs[key];
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    style={checked ? S.toggleRowActive : S.toggleRow}
                                    onClick={() => setPref(key, !checked)}
                                  >
                                    <span>{PRODUCT_LABELS[key]}</span>
                                    <span style={checked ? S.toggleTrackActive : S.toggleTrack}>
                                      <span style={checked ? S.toggleThumbActive : S.toggleThumb} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : null}

                        <div style={S.prefsSectionTitle}>Quanto vuoi bere?</div>
                        <div style={S.levelRow}>
                          {[0, 1, 2].map((n) => {
                            const active = intoxLevel === n;
                            const label = n === 0 ? "Non bevo" : n === 1 ? "Moderato" : "Carico";
                            return (
                              <button
                                key={n}
                                type="button"
                                style={active ? S.levelBtnActive : S.levelBtn}
                                onClick={() => {
                                  setPrefsTouched(true);

                                  if (n === 0) {
                                    setPrefs((prev) => ({
                                      ...prev,
                                      rum: false,
                                      gin: false,
                                      vodka: false,
                                      tequila: false,
                                      beer: false,
                                    }));
                                    setIntoxLevel(0);
                                    return;
                                  }

                                  if (!hasAlcoholSelection(prefs)) {
                                    return;
                                  }

                                  setIntoxLevel(n);
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {!prefsTouched ? (
                        <div style={S.smallMuted}>
                          Prima scegli cosa vuoi bere oppure indica che non bevi, poi invia la partecipazione.
                        </div>
                      ) : !hasCompletedDrinkPrefs(prefs, intoxLevel) ? (
                        <div style={S.smallMuted}>
                          Le preferenze non sono complete: se scegli di bere devi indicare almeno un alcolico; se non bevi non puoi lasciare alcolici selezionati.
                        </div>
                      ) : (
                        <div style={S.smallMuted}>Preferenze complete. Ora puoi inviare la tua partecipazione.</div>
                      )}

                      <div style={S.row}>
                        <button
                          style={{ ...S.primaryBtn, opacity: prefsSaving ? 0.7 : 1 }}
                          disabled={prefsSaving}
                          onClick={onSavePrefsAndRespond}
                        >
                          {prefsSaving ? "Invio…" : "Salva preferenze e invia"}
                        </button>

                        <button
                          style={S.secondaryBtn}
                          disabled={prefsSaving}
                          onClick={() => {
                            setPendingChoice(null);
                            setResultStatus(null);
                            setWantsToJoin(false);
                            setErrorText(null);
                          }}
                        >
                          Torna indietro
                        </button>
                      </div>
                    </div>
                  ) : pendingChoice || resultStatus ? (
                    <div style={{ ...S.muted, textAlign: "center" }}>
                      {pendingChoice ? "Sto inviando la tua risposta all’organizzatore…" : "Risposta già inviata."}
                    </div>
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

                </>
              ) : null}

{step === "done" ? (
  <div style={S.confirm}>
    <div style={S.confirmTitle}>Richiesta inviata.</div>

    <div style={{ ...S.muted, textAlign: "center" }}>
      L'organizzatore riceverà la tua richiesta e ti confermerà al più presto.
    </div>

    <div style={S.divider} />

    <div style={S.confirmBox}>
      <div style={S.confirmBoxTitle}>Vuoi sapere subito quando sei dentro?</div>
      <div style={{ ...S.muted, textAlign: "center" }}>
        Scarica Echo e ricevi una notifica non appena l'organizzatore ti approva.
      </div>

      <div style={{ height: 12 }} />

      <button style={S.primaryBtn} onClick={onGetApp}>
        Scarica Echo
      </button>

      <div style={S.ctaSmall}>Altrimenti guarda nelle mail</div>
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
  genderCol: { display: "grid", gap: 10 },
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
  linkBtnCentered: {
    width: "100%",
    maxWidth: 220,
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
  ctaList: {
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 18,
    display: "grid",
    gap: 8,
    textAlign: "left",
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    lineHeight: "18px",
  },
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
  center: { display: "grid", justifyItems: "center", gap: 10, padding: "18px 0" },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 99,
    border: "2px solid rgba(255,255,255,0.18)",
    borderTopColor: "rgba(255,255,255,0.85)",
    animation: "spin 0.9s linear infinite",
  },
  prefsCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
    display: "grid",
    gap: 12,
  },
  prefsSectionTitle: { fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.82)" },
  levelRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    alignItems: "stretch",
  },
  levelBtn: {
    minHeight: 56,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 900,
    fontSize: 13,
    lineHeight: "16px",
    padding: "10px 8px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  levelBtnActive: {
    minHeight: 56,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 900,
    fontSize: 13,
    lineHeight: "16px",
    padding: "10px 8px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  smallMuted: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: "16px",
    textAlign: "center",
  },

  darkBtn: {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0 14px",
    fontWeight: 950,
    cursor: "pointer",
    background: "rgba(0,0,0,0.30)",
    color: "rgba(255,255,255,0.92)",
    width: "100%",
    maxWidth: 320,
  },
  textBtn: {
    border: 0,
    background: "transparent",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    cursor: "pointer",
    padding: 0,
    width: "100%",
    maxWidth: 320,
  },
  pillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  toggleList: {
    display: "grid",
    gap: 10,
  },
  toggleRow: {
    minHeight: 52,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
    padding: "0 14px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.88)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    textAlign: "left",
  },
  toggleRowActive: {
    minHeight: 52,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.10)",
    padding: "0 14px",
    fontWeight: 900,
    color: "rgba(255,255,255,0.96)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    textAlign: "left",
  },
  toggleTrack: {
    width: 46,
    height: 28,
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    padding: 3,
    boxSizing: "border-box",
    justifyContent: "flex-start",
    flexShrink: 0,
  },
  toggleTrackActive: {
    width: 46,
    height: 28,
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "center",
    padding: 3,
    boxSizing: "border-box",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    display: "block",
  },
  toggleThumbActive: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "#111",
    display: "block",
  },
  pillBtn: {
    minHeight: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
    padding: "0 14px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.88)",
    cursor: "pointer",
  },
  pillBtnActive: {
    minHeight: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.92)",
    padding: "0 14px",
    fontWeight: 900,
    color: "#111",
    cursor: "pointer",
  },
  pillBtnDisabled: {
    minHeight: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: "0 14px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.35)",
    cursor: "not-allowed",
  },
  confirmBox: {
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
    display: "grid",
    justifyItems: "center",
    gap: 8,
    textAlign: "center",
  },
  confirmBoxTitle: { fontWeight: 950, fontSize: 16 },
};