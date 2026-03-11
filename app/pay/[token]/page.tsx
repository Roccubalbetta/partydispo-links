"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentPageRow = {
  token: string;
  party_id: string;
  guest_user_id: string;
  party_title: string;
  party_date: string | null;
  party_mode: string | null;
  fee_amount_cents: number | null;
  fee_eur: number | string | null;
  satispay_url: string | null;
  paypal_url: string | null;
  approval_status: string | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  expires_at: string | null;
};

function formatEuro(feeAmountCents: number | null, feeEur: number | string | null) {
  if (typeof feeAmountCents === "number" && Number.isFinite(feeAmountCents)) {
    return `€ ${(feeAmountCents / 100).toFixed(2)}`;
  }
  if (typeof feeEur === "number" && Number.isFinite(feeEur)) {
    return `€ ${feeEur.toFixed(2)}`;
  }
  if (feeEur != null && String(feeEur).trim()) {
    return `€ ${String(feeEur).trim()}`;
  }
  return "€ 0.00";
}

function formatPartyDate(value: string | null) {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw);
  const parsed = hasTz
    ? new Date(raw)
    : new Date(raw.replace(" ", "T") + "+01:00");

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function notifyOrganizerPaymentUpdate(params: {
  token: string;
  method: "cash" | "satispay" | "paypal";
}) {
  const { data, error } = await supabase.functions.invoke("notify-organizer-payment-from-link", {
    body: {
      token: params.token,
      method: params.method,
    },
  });

  console.log("[pay-link] notify-organizer-payment-from-link response", { data, error });

  if (error) {
    let detailedMessage = "Failed to send a request to the edge function";

    try {
      const maybeAny = error as any;
      if (maybeAny?.context?.json) {
        const errJson = await maybeAny.context.json();
        detailedMessage = errJson?.error ?? errJson?.message ?? detailedMessage;
      } else if (error instanceof Error && error.message) {
        detailedMessage = error.message;
      }
    } catch {
      if (error instanceof Error && error.message) {
        detailedMessage = error.message;
      }
    }

    throw new Error(detailedMessage);
  }
}

export default function GuestPaymentPage() {
  const params = useParams<{ token?: string | string[] }>();
  const token = useMemo(() => {
    const t = params?.token;
    if (typeof t === "string") return t;
    if (Array.isArray(t) && typeof t[0] === "string") return t[0];
    return "";
  }, [params]);

  const [row, setRow] = useState<PaymentPageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function load() {
    if (!token) return;

    setLoading(true);
    setMsg("");

    const { data, error } = await supabase.rpc("get_guest_payment_page_public", {
      p_token: token,
    });

    if (error) {
      setMsg("Impossibile caricare la pagina pagamento.");
      setLoading(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setRow(result ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function chooseCash() {
    try {
      setBusy(true);
      setMsg("");

      const { data, error } = await supabase.rpc("choose_cash_payment_from_link", {
        p_token: token,
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.ok) throw new Error("Impossibile salvare il pagamento in contanti.");

      await notifyOrganizerPaymentUpdate({ token, method: "cash" });

      setMsg("Metodo di pagamento aggiornato: contanti.");
      await load();
    } catch (e: any) {
      console.error("[pay-link] chooseCash error", e);
      setMsg(e?.message ?? "Errore.");
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(method: "satispay" | "paypal") {
    try {
      setBusy(true);
      setMsg("");

      const { data, error } = await supabase.rpc("mark_guest_payment_claim_from_link", {
        p_token: token,
        p_method: method,
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.ok) throw new Error("Impossibile aggiornare il pagamento.");

      await notifyOrganizerPaymentUpdate({ token, method });

      setMsg(`Pagamento ${method} inviato all'organizzatore per verifica.`);
      await load();
    } catch (e: any) {
      console.error("[pay-link] markPaid error", e);
      setMsg(e?.message ?? "Errore.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.bg} />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.center}>
              <div style={styles.spinner} />
              <div style={styles.muted}>Caricamento…</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!row) {
    return (
      <main style={styles.page}>
        <div style={styles.bg} />
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.h1}>Ops</h1>
            <p style={styles.mutedText}>Link non valido o scaduto.</p>
          </div>
        </div>
      </main>
    );
  }

  const quota = formatEuro(row.fee_amount_cents, row.fee_eur);

  return (
    <main style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.hero}>
            <h1 style={styles.h1}>Pagamento festa</h1>
            <div style={styles.heroEvent}>{row.party_title}</div>
            <div style={styles.heroSub}>Quota: {quota}</div>
            {row.party_date ? <div style={styles.heroSub}>🗓️ {formatPartyDate(row.party_date)}</div> : null}
          </div>

          <div style={styles.divider} />

          <div style={styles.statusCard}>
            <div style={styles.sectionTitleCenter}>Stato attuale</div>
            <div style={styles.statusGrid}>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Invito</span>
                <span style={styles.statusValue}>{row.approval_status ?? "-"}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Metodo</span>
                <span style={styles.statusValue}>{row.payment_method ?? "non selezionato"}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Pagamento</span>
                <span style={styles.statusValue}>{row.payment_status ?? "non disponibile"}</span>
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.ctaBoxStrong}>
            <div style={styles.ctaTitleStrong}>Scegli come pagare</div>
            <div style={styles.ctaTextStrong}>
              Se usi Satispay o PayPal, dopo il pagamento premi il pulsante di conferma per avvisare l’organizzatore.
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={styles.btnCol}>
            {row.satispay_url ? (
              <>
                <a href={row.satispay_url} target="_blank" rel="noreferrer" style={styles.primaryLinkBtn}>
                  Apri Satispay
                </a>
                <button style={{ ...styles.secondaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={() => void markPaid("satispay")}>
                  Ho pagato con Satispay
                </button>
              </>
            ) : null}

            {row.paypal_url ? (
              <>
                <a href={row.paypal_url} target="_blank" rel="noreferrer" style={styles.primaryLinkBtn}>
                  Apri PayPal
                </a>
                <button style={{ ...styles.secondaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={() => void markPaid("paypal")}>
                  Ho pagato con PayPal
                </button>
              </>
            ) : null}

            <button style={{ ...styles.secondaryBtn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={() => void chooseCash()}>
              Pago in contanti
            </button>
          </div>

          {msg ? <div style={styles.feedback}>{msg}</div> : null}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  container: {
    width: "100%",
    maxWidth: 520,
    position: "relative",
    marginTop: 12,
  },
  card: {
    width: "100%",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    padding: 18,
  },
  hero: {
    display: "grid",
    gap: 8,
    justifyItems: "center",
    textAlign: "center",
  },
  h1: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  heroEvent: {
    fontSize: 18,
    fontWeight: 950,
    color: "rgba(255,255,255,0.88)",
    letterSpacing: -0.2,
  },
  heroSub: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: 800,
  },
  muted: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: "18px",
  },
  mutedText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: "18px",
    textAlign: "center",
    margin: 0,
    marginTop: 10,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.10)",
    margin: "16px 0",
  },
  sectionTitleCenter: {
    fontWeight: 950,
    marginBottom: 10,
    textAlign: "center",
  },
  statusCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  statusGrid: {
    display: "grid",
    gap: 10,
  },
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
  },
  statusLabel: {
    color: "rgba(255,255,255,0.62)",
    fontWeight: 800,
  },
  statusValue: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    textTransform: "capitalize",
    textAlign: "right",
  },
  ctaBoxStrong: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    padding: 16,
    textAlign: "center",
  },
  ctaTitleStrong: {
    fontWeight: 950,
    fontSize: 18,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  ctaTextStrong: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    lineHeight: "18px",
  },
  btnCol: {
    display: "grid",
    justifyItems: "center",
    gap: 10,
    marginTop: 6,
  },
  primaryLinkBtn: {
    display: "block",
    width: "100%",
    maxWidth: 320,
    height: 46,
    lineHeight: "46px",
    textAlign: "center",
    borderRadius: 14,
    textDecoration: "none",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 950,
    padding: "0 14px",
    boxSizing: "border-box",
  },
  secondaryBtn: {
    width: "100%",
    maxWidth: 320,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0 14px",
    fontWeight: 950,
    cursor: "pointer",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
  },
  feedback: {
    marginTop: 16,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: "18px",
    textAlign: "center",
  },
  center: {
    display: "grid",
    justifyItems: "center",
    gap: 10,
    padding: "18px 0",
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 99,
    border: "2px solid rgba(255,255,255,0.18)",
    borderTopColor: "rgba(255,255,255,0.85)",
    animation: "spin 0.9s linear infinite",
  },
};