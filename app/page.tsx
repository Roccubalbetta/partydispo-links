export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70 backdrop-blur">
          echo
        </div>

        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Organizza eventi privati in modo semplice.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
          echo ti aiuta a gestire inviti, partecipanti e dettagli dell’evento con un’esperienza pulita,
          veloce e pensata per il mobile.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            href="/get"
          >
            Apri echo
          </a>
          <a
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            href="/privacy"
          >
            Privacy
          </a>
        </div>
      </main>
    </div>
  );
}
