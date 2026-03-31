
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

const HERO_MOCKUP_SRC = "public/hero-mockup.png";

function ReviewCard({ quote, name, place }: { quote: string; name: string; place: string }) {
  return (
    <div className="rounded-[28px] border border-black/8 bg-white/72 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
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
        transform: `translate3d(0, ${limited * 0.12}px, 0) scale(${1 + limited * 0.00008})`,
      },
      glowLeft: {
        transform: `translate3d(${-limited * 0.03}px, ${limited * 0.1}px, 0)`,
      },
      glowRight: {
        transform: `translate3d(${limited * 0.04}px, ${limited * 0.14}px, 0)`,
      },
      halo: {
        transform: `translate3d(0, ${limited * 0.08}px, 0) scale(${1 + limited * 0.00015})`,
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

        <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden pb-14 pt-14 sm:pb-20 lg:pb-24">
          <div
            className="absolute left-1/2 top-[12%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.55)_38%,rgba(255,255,255,0)_72%)] blur-[6px]"
            style={heroTransforms.halo}
          />

          <div className="relative z-20 mx-auto mt-[34vh] flex max-w-4xl flex-col items-center text-center sm:mt-[40vh] lg:mt-[44vh]">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/62 px-4 py-1.5 text-sm text-black/50 shadow-[0_6px_18px_rgba(15,23,42,0.04)] backdrop-blur-xl">
              Per eventi privati che lasciano l’echo
            </div>

            <h1 className="mt-7 text-[72px] font-semibold leading-[0.95] tracking-[-0.09em] text-black sm:text-[104px] lg:text-[148px]">
              echo
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-black/48 sm:text-lg">
              Organizza la festa, gestisci gli invitati e rivivi la serata con un’esperienza più bella,
              più chiara e un po’ più festaiola.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
                href="/get"
              >
                Apri echo
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/62 px-6 text-sm font-semibold text-black transition hover:bg-white/80"
                href="#features"
              >
                Scopri di più
              </a>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div
              className="absolute left-[10%] top-[24%] h-[260px] w-[260px] rounded-full bg-[#8fc8ff]/28 blur-[90px]"
              style={heroTransforms.glowLeft}
            />
            <div
              className="absolute right-[8%] top-[30%] h-[300px] w-[300px] rounded-full bg-[#f0a9ff]/22 blur-[110px]"
              style={heroTransforms.glowRight}
            />

            <div className="absolute left-1/2 top-[16%] w-[min(94vw,780px)] -translate-x-1/2" style={heroTransforms.mockup}>
              <img
                src={HERO_MOCKUP_SRC}
                alt="Echo app preview"
                className="h-auto w-full object-contain drop-shadow-[0_45px_80px_rgba(15,23,42,0.20)]"
              />
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
                className="rounded-[30px] border border-black/8 bg-white/72 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl"
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
