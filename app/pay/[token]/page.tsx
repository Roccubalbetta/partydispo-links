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
  const { error } = await supabase.functions.invoke("notify-organizer-payment-from-link", {
    body: {
      token: params.token,
      method: params.method,
    },
  });

  if (error) throw error;
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
    return <main style={styles.page}><div style={styles.card}>Caricamento…</div></main>;
  }

  if (!row) {
    return <main style={styles.page}><div style={styles.card}>Link non valido o scaduto.</div></main>;
  }

  const quota = formatEuro(row.fee_amount_cents, row.fee_eur);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Pagamento festa</h1>
        <div style={styles.title}>{row.party_title}</div>
        <div style={styles.muted}>Quota: {quota}</div>
        {row.party_date ? (
          <div style={styles.muted}>
            Data: {formatPartyDate(row.party_date)}
          </div>
        ) : null}

        <div style={{ height: 16 }} />

        <div style={styles.statusBox}>
          <div><b>Stato invito:</b> {row.approval_status ?? "-"}</div>
          <div><b>Metodo pagamento:</b> {row.payment_method ?? "non selezionato"}</div>
          <div><b>Stato pagamento:</b> {row.payment_status ?? "non disponibile"}</div>
        </div>

        <div style={{ height: 16 }} />

        {row.satispay_url ? (
          <>
            <a href={row.satispay_url} target="_blank" rel="noreferrer" style={styles.primaryBtn}>
              Apri Satispay
            </a>
            <div style={{ height: 10 }} />
            <button style={styles.secondaryBtn} disabled={busy} onClick={() => void markPaid("satispay")}>
              Ho pagato con Satispay
            </button>
            <div style={{ height: 10 }} />
          </>
        ) : null}

        {row.paypal_url ? (
          <>
            <a href={row.paypal_url} target="_blank" rel="noreferrer" style={styles.primaryBtn}>
              Apri PayPal
            </a>
            <div style={{ height: 10 }} />
            <button style={styles.secondaryBtn} disabled={busy} onClick={() => void markPaid("paypal")}>
              Ho pagato con PayPal
            </button>
            <div style={{ height: 10 }} />
          </>
        ) : null}

        <button style={styles.secondaryBtn} disabled={busy} onClick={() => void chooseCash()}>
          Pago in contanti
        </button>

        {msg ? <div style={{ marginTop: 16, color: "#666" }}>{msg}</div> : null}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#0B0D12",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
  },
  h1: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 800,
  },
  muted: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
  },
  statusBox: {
    display: "grid",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  primaryBtn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "14px 16px",
    borderRadius: 14,
    textDecoration: "none",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 900,
  },
  secondaryBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};