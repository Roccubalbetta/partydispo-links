"use client";

import { useEffect, useMemo, useState } from "react";

const HERO_MOCKUP_SRC = "/hero-mockup.png";

const featureCards = [
  {
    eyebrow: "Inviti",
    title: "Crea un invito che sembra davvero un evento.",
    text: "Link privati, approvazioni e dettagli dell’evento in un flusso semplice e molto più bello della solita chat.",
    accent: "#ff84c1",
  },
  {
    eyebrow: "Gestione",
    title: "Tieni tutto sotto controllo senza impazzire.",
    text: "Partecipanti, conferme, richieste e pagamenti organizzati in un’unica esperienza pensata per il telefono.",
    accent: "#7dbfff",
  },
  {
    eyebrow: "Memories",
    title: "Rivivi la serata con una disposable gallery.",
    text: "Le foto si sbloccano al momento giusto, così l’evento resta vivo anche dopo la festa.",
    accent: "#ffd36a",
  },
];

const miniStats = [
  { label: "Esperienza", value: "mobile-first" },
  { label: "Inviti", value: "privati" },
  { label: "Foto", value: "disposable" },
];

const showcaseCards = [
  {
    title: "Invita solo chi vuoi tu",
    text: "Echo è pensata per eventi privati: richieste, approvazioni e controllo completo della lista.",
  },
  {
    title: "Gestisci anche colletta e conferme",
    text: "Quando serve, puoi tenere ordinati pagamenti, quote e stato degli invitati senza uscire dal flusso dell’evento.",
  },
  {
    title: "Rendi la serata più memorabile",
    text: "Le foto non sono solo una gallery: diventano parte dell’esperienza, con un reveal più divertente e curato.",
  },
];

const reviews = [
  {
    quote:
      "Finalmente un modo bello e ordinato per organizzare una festa privata senza perdersi tra chat, liste e conferme sparse.",
    name: "Marco R.",
    place: "Milano",
  },
  {
    quote:
      "La parte migliore è la gestione degli invitati: approvazioni, presenza e dettagli evento tutto nello stesso posto.",
    name: "Chiara T.",
    place: "Bologna",
  },
  {
    quote:
      "L’effetto disposable camera dà davvero personalità alla serata. Non sembra la solita app per eventi.",
    name: "Luca P.",
    place: "Roma",
  },
  {
    quote:
      "Molto chiara, molto pulita e soprattutto coerente con un uso mobile reale. Sembra un prodotto rifinito davvero bene.",
    name: "Giulia S.",
    place: "Torino",
  },
];

function ReviewCard({ quote, name, place }: { quote: string; name: string; place: string }) {
  return (
    <div className="rounded-[30px] border border-black/8 bg-white/78 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="text-base leading-7 text-black/72">“{quote}”</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold text-black">{name}</div>
          <div className="text-sm text-black/40">{place}</div>
        </div>
      </div>
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-black/8 bg-white/76 px-4 py-1.5 text-sm text-black/48 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      {children}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroTransforms = useMemo(() => {
    const limited = Math.min(scrollY, 900);
    return {
      mockup: {
        transform: `translate3d(${limited * -0.018}px, ${limited * 0.11}px, 0) rotate(${ -5 + limited * 0.0035 }deg) scale(${1 + limited * 0.00006})`,
      },
      glowLeft: {
        transform: `translate3d(${-limited * 0.028}px, ${limited * 0.08}px, 0) scale(${1 + limited * 0.0001})`,
      },
      glowRight: {
        transform: `translate3d(${limited * 0.032}px, ${limited * 0.11}px, 0) scale(${1 + limited * 0.00012})`,
      },
      badgeFloat: {
        transform: `translate3d(0, ${limited * 0.02}px, 0)`,
      },
      cardA: {
        transform: `translate3d(0, ${limited * 0.035}px, 0)`,
      },
      cardB: {
        transform: `translate3d(0, ${limited * 0.05}px, 0)`,
      },
      cardC: {
        transform: `translate3d(0, ${limited * 0.065}px, 0)`,
      },
    };
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-[#f4f5fb] text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f5fb_0%,#f7f0ff_34%,#edf5ff_100%)]" />
        <div className="absolute left-[-80px] top-[80px] h-[340px] w-[340px] rounded-full bg-[#b8d4ff]/40 blur-[110px]" />
        <div className="absolute right-[-60px] top-[220px] h-[360px] w-[360px] rounded-full bg-[#e8b8ff]/35 blur-[120px]" />
        <div className="absolute left-1/3 top-[560px] h-[320px] w-[320px] rounded-full bg-[#c9c4ff]/28 blur-[120px]" />
        <div className="absolute left-[72%] top-[70px] h-[240px] w-[240px] rounded-full bg-[#ffd7a8]/22 blur-[100px]" />
        <div className="absolute left-[6%] top-[520px] h-[260px] w-[260px] rounded-full bg-[#b8ffe2]/18 blur-[110px]" />
        <div className="absolute left-[10%] top-[180px] h-4 w-4 rounded-full bg-[#ff82bc]/60 blur-[2px]" />
        <div className="absolute right-[16%] top-[140px] h-5 w-5 rounded-full bg-[#7ad8ff]/55 blur-[2px]" />
        <div className="absolute left-[72%] top-[420px] h-3 w-3 rounded-full bg-[#ffd66f]/70 blur-[1px]" />
        <div className="absolute left-[18%] top-[560px] h-3.5 w-3.5 rounded-full bg-[#96efc9]/55 blur-[1px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-24 pt-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-40 flex items-center justify-between rounded-full border border-black/8 bg-white/68 px-4 py-3 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              e
            </div>
            <span className="text-sm font-medium text-black/72">echo</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-black/45 md:flex">
            <a href="#features" className="transition hover:text-black/85">
              Features
            </a>
            <a href="#showcase" className="transition hover:text-black/85">
              Experience
            </a>
            <a href="#reviews" className="transition hover:text-black/85">
              Reviews
            </a>
          </nav>

          <a
            href="/get"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/90"
          >
            Scarica l’app
          </a>
        </header>

        <section className="relative overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24">
          <div
            className="absolute left-[10%] top-[14%] h-[260px] w-[260px] rounded-full bg-white/58 blur-[90px]"
            style={heroTransforms.glowLeft}
          />
          <div
            className="absolute right-[10%] top-[12%] h-[280px] w-[280px] rounded-full bg-[#ffd6ef]/42 blur-[110px]"
            style={heroTransforms.glowRight}
          />

          <div className="relative z-20 grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10">
            <div className="relative max-w-2xl">
              <div style={heroTransforms.badgeFloat}>
                <SectionBadge>Per eventi privati che lasciano l’echo</SectionBadge>
              </div>

              <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.085em] text-black sm:text-7xl lg:text-[108px]">
                L’app che rende le feste più belle, più semplici, più vive.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-black/52 sm:text-lg">
                Echo ti aiuta a organizzare eventi privati con inviti curati, gestione smart degli invitati,
                pagamenti ordinati e una disposable gallery pensata per far parlare della serata anche dopo.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
                  href="/get"
                >
                  Scarica echo
                </a>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/76 px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                  href="#showcase"
                >
                  Guarda come funziona
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {miniStats.map((item, index) => {
                  const accent = ["#ff84c1", "#7dbfff", "#ffd36a"][index] ?? "#ff84c1";
                  const style = [heroTransforms.cardA, heroTransforms.cardB, heroTransforms.cardC][index];
                  return (
                    <div
                      key={item.label}
                      className="rounded-[26px] border border-black/8 bg-white/78 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5"
                      style={style}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                        <div className="text-[11px] uppercase tracking-[0.18em] text-black/35">{item.label}</div>
                      </div>
                      <div className="mt-2 text-lg font-semibold text-black">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="group relative mx-auto flex w-full max-w-[760px] items-center justify-center lg:justify-end">
              <div className="pointer-events-none relative h-[620px] w-full sm:h-[760px]">
                <div
                  className="absolute right-[-2%] top-[0] w-[96%] sm:w-[100%]"
                  style={heroTransforms.mockup}
                >
                  <img
                    src={HERO_MOCKUP_SRC}
                    alt="Echo app preview"
                    className="h-auto w-full object-contain drop-shadow-[0_60px_120px_rgba(15,23,42,0.2)] transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[1deg]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="showcase" className="border-t border-black/8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <SectionBadge>Designed to convert</SectionBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-black sm:text-5xl">
              Una landing deve far venire voglia di scaricare l’app. Tutto qui spinge in quella direzione.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/50 sm:text-lg">
              Per questo il messaggio è chiaro, le schermate sono protagoniste e i punti forti dell’app si capiscono subito.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {showcaseCards.map((card, index) => {
              const accents = ["from-[#ffd6ef]/55", "from-[#d7ebff]/70", "from-[#fff0c8]/70"];
              return (
                <div
                  key={card.title}
                  className="relative overflow-hidden rounded-[32px] border border-black/8 bg-white/78 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${accents[index] ?? accents[0]} to-transparent`} />
                  <div className="relative z-10">
                    <div className="h-2.5 w-2.5 rounded-full bg-black/70" />
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-black">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/50">{card.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="features" className="border-t border-black/8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <SectionBadge>Features</SectionBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Tutto quello che serve per gestire un evento privato, senza attriti.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[30px] border border-black/8 bg-white/78 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: feature.accent }} />
                  <div className="text-[11px] uppercase tracking-[0.18em] text-black/35">{feature.eyebrow}</div>
                </div>
                <div className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-black">{feature.title}</div>
                <p className="mt-4 text-sm leading-7 text-black/50">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className="border-t border-black/8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <SectionBadge>Social proof</SectionBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Pensata per chi organizza serate che devono funzionare davvero.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => (
              <ReviewCard key={`${review.name}-${review.place}`} {...review} />
            ))}
          </div>
        </section>

        <section className="border-t border-black/8 py-16 sm:py-20">
          <div className="rounded-[38px] border border-black/8 bg-white/76 px-6 py-10 text-center shadow-[0_12px_34px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-10 sm:py-14">
            <SectionBadge>Download echo</SectionBadge>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-black sm:text-5xl">
              La prossima festa che organizzi può sembrare già un ricordo prima ancora di iniziare.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/50">
              Scarica echo e trasforma inviti, gestione e gallery in un’esperienza più curata, più condivisibile e molto più memorabile.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/get"
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
              >
                Scarica l’app
              </a>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/76 px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Esplora le feature
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-black/8 py-8 text-sm text-black/35 sm:flex-row">
          <div>© 2026 echo. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="transition hover:text-black/70">
              Privacy
            </a>
            <a href="/get" className="transition hover:text-black/70">
              Scarica echo
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
