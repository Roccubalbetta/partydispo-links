const features = [
  {
    title: "Inviti privati",
    text: "Condividi l’evento con un link pulito, gestisci richieste e approvazioni in un unico flusso.",
  },
  {
    title: "Gestione invitati",
    text: "Controlla partecipanti, pagamenti e presenza con un’esperienza semplice e pensata per il mobile.",
  },
  {
    title: "Disposable camera vibe",
    text: "Rivivi la serata con foto in perfetto stile camera usa e getta, sbloccate al momento giusto.",
  },
];

const reviews = [
  {
    quote:
      "Finalmente un modo pulito per organizzare una festa privata senza perdersi tra chat, liste e conferme sparse.",
    name: "Marco R.",
    place: "Milano",
  },
  {
    quote:
      "La parte migliore è la gestione degli invitati: approvazioni, pagamenti e dettagli evento tutto nello stesso posto.",
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
      "Molto veloce da usare, molto chiara e soprattutto bella. Finalmente qualcosa che sembra fatto per il telefono.",
    name: "Giulia S.",
    place: "Torino",
  },
];

function PhoneMock({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="relative h-[520px] w-[250px] overflow-hidden rounded-[36px] border border-white/10 bg-[#0f1117] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#090b10]">
        <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />

        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at top, ${accent} 0%, rgba(255,255,255,0) 55%)`,
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-5 pt-12 text-[11px] text-white/75">
          <span>9:41</span>
          <span>echo</span>
        </div>

        <div className="relative z-10 mt-5 px-5">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/70 backdrop-blur">
            {subtitle}
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{title}</h3>
          <p className="mt-2 max-w-[180px] text-sm leading-6 text-white/60">
            Un’esperienza pulita, moderna e pensata per eventi privati.
          </p>
        </div>

        <div className="relative z-10 mt-6 flex-1 px-4 pb-4">
          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Party preview</div>
                  <div className="mt-1 text-xs text-white/55">Sabato · 23:30</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/70">
                  Private
                </div>
              </div>
              <div className="mt-4 h-28 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Invitati</div>
                <div className="mt-3 text-2xl font-semibold text-white">128</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Confermati</div>
                <div className="mt-3 text-2xl font-semibold text-white">84</div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Disposable gallery</span>
                <span className="text-white/40">24h unlock</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="aspect-[0.72] rounded-2xl bg-white/10" />
                <div className="aspect-[0.72] rounded-2xl bg-white/10" />
                <div className="aspect-[0.72] rounded-2xl bg-white/10" />
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
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-base leading-7 text-white/80">“{quote}”</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-sm text-white/45">{place}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute right-0 top-[220px] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute left-0 top-[520px] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
              e
            </div>
            <span className="text-sm font-medium text-white/80">echo</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
            <a href="#features" className="transition hover:text-white/90">
              Features
            </a>
            <a href="#reviews" className="transition hover:text-white/90">
              Reviews
            </a>
            <a href="/privacy" className="transition hover:text-white/90">
              Privacy
            </a>
          </nav>

          <a
            href="/get"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Apri echo
          </a>
        </header>

        <section className="grid items-center gap-16 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/65 backdrop-blur-xl">
              Per eventi privati che lasciano l’echo
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Organizza la festa. Gestisci gli invitati. Rivivi la serata.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              echo ti aiuta a creare eventi privati con un’esperienza semplice, moderna e mobile-first:
              inviti, approvazioni, pagamenti e foto in stile disposable camera, tutto nello stesso posto.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                href="/get"
              >
                Apri echo
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                href="#features"
              >
                Scopri di più
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center">
            <div className="relative flex w-full max-w-[760px] items-center justify-center gap-4 sm:gap-6">
              <div className="hidden -translate-y-8 rotate-[-10deg] sm:block">
                <PhoneMock title="Gestisci tutto" subtitle="Inviti & approvazioni" accent="rgba(139,92,246,0.34)" />
              </div>
              <div className="z-10 scale-[1.02] sm:scale-100">
                <PhoneMock title="La tua festa, meglio" subtitle="echo experience" accent="rgba(34,211,238,0.30)" />
              </div>
              <div className="hidden translate-y-10 rotate-[10deg] lg:block">
                <PhoneMock title="Disposable moments" subtitle="Photos unlocked later" accent="rgba(244,114,182,0.28)" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-white/10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-white/35">Features</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Tutto quello che serve per gestire un evento privato, senza attriti.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              >
                <div className="text-lg font-semibold text-white">{feature.title}</div>
                <p className="mt-3 text-sm leading-7 text-white/58">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className="border-t border-white/10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-white/35">Reviews</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pensata per chi organizza serate che devono funzionare davvero.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => (
              <ReviewCard key={`${review.name}-${review.place}`} {...review} />
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-16 sm:py-20">
          <div className="rounded-[36px] border border-white/10 bg-white/[0.04] px-6 py-10 text-center backdrop-blur-xl sm:px-10 sm:py-14">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-sm text-white/65">
              echo
            </div>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Crea eventi privati con un’esperienza più bella, più chiara e più tua.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/58">
              Dall’invito alla gallery, echo rende ogni passaggio più semplice da gestire e più bello da vivere.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/get"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Apri echo
              </a>
              <a
                href="/privacy"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Privacy
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm text-white/40 sm:flex-row">
          <div>© 2026 echo. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="transition hover:text-white/75">
              Privacy
            </a>
            <a href="/get" className="transition hover:text-white/75">
              Apri echo
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
