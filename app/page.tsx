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

function PhoneMock({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="relative h-[560px] w-[276px] rounded-[46px] border border-black/10 bg-[#1b1b1f] p-[10px] shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
      <div className="relative h-full overflow-hidden rounded-[38px] bg-[#eef1fb]">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, rgba(217,232,255,0.92) 0%, rgba(244,236,255,0.88) 52%, ${accent} 100%)`,
          }}
        />

        <div className="absolute left-1/2 top-3 z-20 h-7 w-32 -translate-x-1/2 rounded-full bg-black/95" />

        <div className="relative z-10 flex items-center justify-between px-5 pt-14 text-[11px] font-medium text-black/55">
          <span>9:41</span>
          <span>echo</span>
        </div>

        <div className="relative z-10 px-5 pt-5 text-left">
          <div className="inline-flex items-center rounded-full border border-black/8 bg-white/55 px-3 py-1 text-[10px] font-semibold text-black/55 backdrop-blur-xl">
            {subtitle}
          </div>
          <h3 className="mt-4 max-w-[190px] text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-black">
            {title}
          </h3>
          <p className="mt-3 max-w-[210px] text-[15px] leading-6 text-black/45">
            Gestisci eventi, invitati e momenti della serata con un’esperienza pulita e mobile-first.
          </p>
        </div>

        <div className="relative z-10 mt-7 px-4 pb-4">
          <div className="space-y-3 rounded-[30px] border border-black/8 bg-white/72 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold text-black">Compleanno Giovanni 🎉</div>
                <div className="mt-1 text-[12px] text-black/40">Gestisci inviti, partecipanti e preferenze</div>
              </div>
              <div className="rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold text-white">Privato</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-black px-4 py-4 text-center text-[13px] font-semibold text-white">
                Modifica evento
              </div>
              <div className="rounded-[22px] bg-black px-4 py-4 text-center text-[13px] font-semibold text-white">
                Partecipanti
              </div>
            </div>

            <div className="rounded-[26px] border border-black/8 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-black">Partecipazione</div>
                  <div className="mt-1 text-[12px] text-black/40">Approva richieste e monitora presenze</div>
                </div>
                <div className="rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold text-white">Richieste</div>
              </div>

              <div className="mt-4 grid grid-cols-[96px_1fr] items-center gap-4">
                <div className="flex aspect-square items-center justify-center rounded-full border-[12px] border-[#52be61] bg-white text-center">
                  <div>
                    <div className="text-3xl font-semibold leading-none text-black">1</div>
                    <div className="mt-1 text-xs font-medium text-black/45">Totale</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Approvati</span>
                    <span className="font-semibold text-[#52be61]">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">In attesa</span>
                    <span className="font-semibold text-[#f0a126]">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Rifiutati</span>
                    <span className="font-semibold text-[#e65858]">0%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-black/8 bg-white p-4">
              <div className="text-[14px] font-semibold text-black">Galleria disposable</div>
              <div className="mt-1 text-[12px] text-black/40">Le foto si sbloccano al momento giusto</div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="aspect-[0.72] rounded-[18px] bg-[linear-gradient(180deg,rgba(90,161,255,0.22),rgba(255,255,255,0.92))]" />
                <div className="aspect-[0.72] rounded-[18px] bg-[linear-gradient(180deg,rgba(255,167,203,0.22),rgba(255,255,255,0.92))]" />
                <div className="aspect-[0.72] rounded-[18px] bg-[linear-gradient(180deg,rgba(160,135,255,0.22),rgba(255,255,255,0.92))]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <div className="min-h-screen bg-[#f4f5fb] text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f5fb_0%,#f8f3ff_36%,#edf5ff_100%)]" />
        <div className="absolute left-[-80px] top-[80px] h-[340px] w-[340px] rounded-full bg-[#b8d4ff]/40 blur-[110px]" />
        <div className="absolute right-[-60px] top-[220px] h-[360px] w-[360px] rounded-full bg-[#e8b8ff]/35 blur-[120px]" />
        <div className="absolute left-1/3 top-[560px] h-[320px] w-[320px] rounded-full bg-[#c9c4ff]/28 blur-[120px]" />
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

        <section className="grid items-center gap-16 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/62 px-4 py-1.5 text-sm text-black/50 shadow-[0_6px_18px_rgba(15,23,42,0.04)] backdrop-blur-xl">
              Per eventi privati che lasciano l’echo
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
              Organizza la festa. Gestisci gli invitati. Rivivi la serata.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-black/48 sm:text-lg">
              echo ti aiuta a creare eventi privati con un’esperienza semplice, moderna e mobile-first:
              inviti, approvazioni, pagamenti e foto in stile disposable camera, tutto nello stesso posto.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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

          <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center">
            <div className="relative flex w-full max-w-[760px] items-center justify-center gap-4 sm:gap-6">
              <div className="hidden -translate-y-8 rotate-[-10deg] sm:block">
                <PhoneMock title="Calendario eventi" subtitle="Vista chiara" accent="rgba(194,221,255,0.95)" />
              </div>
              <div className="z-10 scale-[1.02] sm:scale-100">
                <PhoneMock title="La tua festa, meglio" subtitle="echo experience" accent="rgba(235,210,255,0.92)" />
              </div>
              <div className="hidden translate-y-10 rotate-[10deg] lg:block">
                <PhoneMock title="Disposable moments" subtitle="Gallery unlock" accent="rgba(214,236,255,0.95)" />
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
