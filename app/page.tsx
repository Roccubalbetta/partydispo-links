"use client";

import { useEffect, useMemo, useState } from "react";

const features = [
  {
    title: "Inviti privati",
    text: "Condividi l’evento con un link pulito e gestisci richieste, approvazioni e conferme in un unico flusso.",
  },
  {
    title: "Partecipanti e pagamenti",
    text: "Controlla presenza, quote e stato degli invitati con un’esperienza semplice, chiara e pensata per il telefono.",
  },
  {
    title: "Foto disposable",
    text: "Rivivi la serata con foto in stile usa e getta, sbloccate al momento giusto per mantenere l’effetto sorpresa.",
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

const HERO_MOCKUP_SRC = "/hero-mockup.png";

function ReviewCard({ quote, name, place }: { quote: string; name: string; place: string }) {
  return (
    <div className="rounded-[28px] border border-black/8 bg-white/72 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
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

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroTransforms = useMemo(() => {
    const limited = Math.min(scrollY, 700);
    return {
      mockup: {
        transform: `translate3d(${limited * -0.015}px, ${limited * 0.09}px, 0) rotate(${ -6 + limited * 0.004 }deg) scale(${1 + limited * 0.00006})`,
      },
      glowLeft: {
        transform: `translate3d(${-limited * 0.03}px, ${limited * 0.1}px, 0) scale(${1 + limited * 0.00008})`,
      },
      glowRight: {
        transform: `translate3d(${limited * 0.035}px, ${limited * 0.11}px, 0) scale(${1 + limited * 0.0001})`,
      },
      halo: {
        transform: `translate3d(0, ${limited * 0.06}px, 0) scale(${1 + limited * 0.00012})`,
      },
      badgeFloat: {
        transform: `translate3d(0, ${limited * 0.025}px, 0)`,
      },
    };
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-[#f4f5fb] text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f5fb_0%,#f7f0ff_36%,#edf5ff_100%)]" />
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

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-black/8 bg-white/65 px-4 py-3 shadow-[0_6px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
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
            <a href="#reviews" className="transition hover:text-black/85">
              Reviews
            </a>
            <a href="/privacy" className="transition hover:text-black/85">
              Privacy
            </a>
          </nav>

          <a
            href="/get"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/90"
          >
            Apri echo
          </a>
        </header>

        <section className="relative overflow-hidden pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div
            className="absolute left-[12%] top-[18%] h-[240px] w-[240px] rounded-full bg-white/55 blur-[80px]"
            style={heroTransforms.halo}
          />
          <div
            className="absolute right-[8%] top-[10%] h-[260px] w-[260px] rounded-full bg-[#ffd6ef]/45 blur-[100px]"
            style={heroTransforms.glowRight}
          />
          <div
            className="absolute left-[4%] top-[42%] h-[220px] w-[220px] rounded-full bg-[#cfe4ff]/55 blur-[100px]"
            style={heroTransforms.glowLeft}
          />

          <div className="relative z-20 grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-8">
            <div className="relative">
              <div
                className="inline-flex items-center rounded-full border border-black/8 bg-white/72 px-4 py-1.5 text-sm text-black/50 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl"
                style={heroTransforms.badgeFloat}
              >
                Per eventi privati che lasciano l’echo
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.08em] text-black sm:text-7xl lg:text-[112px]">
                echo
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-black/52 sm:text-lg">
                Organizza la festa, gestisci gli invitati e rivivi la serata con un’esperienza pulita,
                elegante e più viva, pensata per eventi che devono lasciare il segno.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-black/38 sm:text-base">
                Inviti privati, approvazioni, pagamenti e foto disposable nello stesso flusso.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
                  href="/get"
                >
                  Apri echo
                </a>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/72 px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                  href="#features"
                >
                  Scopri di più
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-[26px] border border-black/8 bg-white/78 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff84c1]" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-black/35">Inviti</div>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-black">Privati</div>
                </div>
                <div className="rounded-[26px] border border-black/8 bg-white/78 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#7dbfff]" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-black/35">Foto</div>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-black">Disposable</div>
                </div>
                <div className="rounded-[26px] border border-black/8 bg-white/78 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ffd36a]" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-black/35">Gestione</div>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-black">Smart</div>
                </div>
              </div>
            </div>

            <div className="group relative mx-auto flex w-full max-w-[680px] items-center justify-center lg:justify-end">
              <div className="pointer-events-none relative h-[600px] w-full sm:h-[720px]">
                <div
                  className="absolute right-[0] top-[0] w-[90%] sm:w-[95%]"
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

        <section id="features" className="border-t border-black/8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-black/28">Features</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Tutto quello che serve per gestire un evento privato, senza attriti.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[30px] border border-black/8 bg-white/72 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="text-lg font-semibold text-black">{feature.title}</div>
                <p className="mt-3 text-sm leading-7 text-black/50">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className="border-t border-black/8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-black/28">Reviews</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
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
          <div className="rounded-[36px] border border-black/8 bg-white/70 px-6 py-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-10 sm:py-14">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/70 px-4 py-1.5 text-sm text-black/50">
              echo
            </div>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-black sm:text-5xl">
              Crea eventi privati con un’esperienza più bella, più chiara e più tua.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/50">
              Dall’invito alla gallery, echo rende ogni passaggio più semplice da gestire e più bello da vivere.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/get"
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
              >
                Apri echo
              </a>
              <a
                href="/privacy"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Privacy
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
              Apri echo
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
