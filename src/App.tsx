// src/App.tsx
import React from "react";

/** ===========================
 *  Helpers UI
 *  =========================== */

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < value ? "text-amber-500" : "text-slate-400/40"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

type Mode = "normal" | "hardcore";

type Epreuve = {
  id: string;
  titre: string;
  duree: string;
  descriptionCourte: string;
  // niveaux par mode
  physique: Record<Mode, number>;
  adresse: Record<Mode, number>;
  reflexion: Record<Mode, number>;
  sabotage: Record<Mode, number>;
  hasHardcore?: boolean;
};

/** ===========================
 *  Données démo (remplace par ton import si tu as déjà tout)
 *  =========================== */
const EPREUVES: Epreuve[] = [
  {
    id: "sentence-pilier",
    titre: "La Sentence du Pilier",
    duree: "5 - 10 min",
    descriptionCourte:
      "Lancez et faites tomber toutes les cibles. La distance augmente à chaque palier.",
    physique: { normal: 1, hardcore: 1 },
    adresse: { normal: 5, hardcore: 5 },
    reflexion: { normal: 0, hardcore: 0 },
    sabotage: { normal: 0, hardcore: 3 },
    hasHardcore: true,
  },
  {
    id: "course-eau",
    titre: "La Course de l'Eau",
    duree: "10 - 15 min",
    descriptionCourte:
      "Courez, remplissez, recommencez jusqu’à atteindre le niveau, puis terminez par un lancer de précision.",
    physique: { normal: 4, hardcore: 5 },
    adresse: { normal: 2, hardcore: 4 },
    reflexion: { normal: 2, hardcore: 3 },
    sabotage: { normal: 0, hardcore: 5 },
    hasHardcore: true,
  },
  {
    id: "mer-brasiers",
    titre: "La Mer des Brasiers",
    duree: "5 min par équipe",
    descriptionCourte:
      "Bataille navale XXL : déplacez des poids sur une grille géante pour couler le navire ennemi.",
    physique: { normal: 5, hardcore: 5 },
    adresse: { normal: 1, hardcore: 0 },
    reflexion: { normal: 3, hardcore: 3 },
    sabotage: { normal: 0, hardcore: 0 },
    hasHardcore: false,
  },
  {
    id: "cercle-codes",
    titre: "Le Cercle des Codes",
    duree: "15 - 20 min",
    descriptionCourte:
      "Déjouez les pièges et craquez le code avant les autres.",
    physique: { normal: 0, hardcore: 0 },
    adresse: { normal: 0, hardcore: 0 },
    reflexion: { normal: 5, hardcore: 2 },
    sabotage: { normal: 0, hardcore: 3 },
    hasHardcore: true,
  },
];

/** ===========================
 *  Composant Carte Epreuve
 *  =========================== */

function EpreuveCard({
  epreuve,
  mode,
  imageUrl,
}: {
  epreuve: Epreuve;
  mode: Mode;
  imageUrl?: string;
}) {
  return (
    <div className="rounded-xl border bg-white/70 p-3 shadow-sm">
      {/* Image + Titre/Durée */}
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <div
          className="h-36 w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl || "/epreuve-placeholder.jpg"})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8">
          <div className="flex items-baseline justify-between text-white">
            <h3 className="text-lg md:text-xl leading-tight tracking-wide">
              {epreuve.titre}{" "}
              <span className="text-sm opacity-80 align-middle">
                ({mode})
              </span>
            </h3>
            <div className="text-xs md:text-sm opacity-90 whitespace-nowrap">
              {epreuve.duree}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-1 text-[15px] leading-relaxed tracking-wide text-slate-700">
        {epreuve.descriptionCourte}
      </p>

      {/* Caractéristiques */}
      <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed tracking-wide text-slate-800">
        <li className="flex items-center justify-between">
          <span>Physique</span>
          <StarRating value={epreuve.physique[mode]} />
        </li>
        <li className="flex items-center justify-between">
          <span>Adresse</span>
          <StarRating value={epreuve.adresse[mode]} />
        </li>
        <li className="flex items-center justify-between">
          <span>Réflexion</span>
          <StarRating value={epreuve.reflexion[mode]} />
        </li>
        <li className="flex items-center justify-between">
          <span>Sabotage</span>
          <StarRating value={epreuve.sabotage[mode]} />
        </li>
      </ul>
    </div>
  );
}

/** ===========================
 *  Pages: Accueil / Créer / Join
 *  =========================== */

function Accueil() {
  return (
    <section className="relative min-h-[60vh] w-full overflow-hidden rounded-xl">
      {/* Image de fond réservée (à remplacer plus tard) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/hero-placeholder.jpg)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/85"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-14 text-center">
        <h1 className="text-3xl md:text-5xl leading-tight tracking-wide">
          Olympiades — Votez pour vos épreuves
        </h1>
        <p className="mt-4 text-lg md:text-xl leading-relaxed tracking-wide opacity-90">
          Choisissez vos épreuves préférées, classez-les, et mettez le feu à la
          compétition. L’animateur composera le programme parfait. Prêts à
          transpirer élégamment?
        </p>
      </div>
    </section>
  );
}

function Creer() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [creating, setCreating] = React.useState(false);
  const [code, setCode] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const selectedIds = React.useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  async function handleCreate() {
    try {
      setError(null);
      setCreating(true);
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds, theme: "theme-3" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Erreur inconnue");
      }
      setCode(data.code);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl tracking-wide">Créer une session</h2>
        <div className="text-sm opacity-80">
          {selectedIds.length} épreuve(s) sélectionnée(s)
        </div>
      </div>

      {/* Grille d’épreuves */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {EPREUVES.map((e) => {
          const checked = !!selected[e.id];
          return (
            <label key={e.id} className="cursor-pointer">
              <div
                className={`rounded-xl border p-2 shadow-sm transition ${
                  checked ? "ring-2 ring-amber-500" : "hover:shadow"
                }`}
              >
                <EpreuveCard epreuve={e} mode="normal" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm tracking-wide">Ajouter</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={checked}
                    onChange={(ev) =>
                      setSelected((s) => ({ ...s, [e.id]: ev.target.checked }))
                    }
                  />
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg border bg-black px-5 py-2 text-white disabled:opacity-50"
          onClick={handleCreate}
          disabled={creating || selectedIds.length === 0}
        >
          {creating ? "Création..." : "Créer la session"}
        </button>

        {code && (
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base tracking-wide">
            <span>Code de session :</span>
            <span className="font-mono tabular-nums">{code}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function Join() {
  // on lit /join/:code depuis l’URL
  const [initialCode] = React.useState(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const m = path.match(/\/join\/([\w-]+)/i);
    return m ? m[1] : "";
  });

  const [code, setCode] = React.useState(initialCode);
  const [voter, setVoter] = React.useState("");
  const [session, setSession] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Attribution de “bucket” par épreuve
  const [choices, setChoices] = React.useState<Record<string, string>>({}); // id -> "incontournable"|"chaud"|"avoir"|"non"|"" (non choisi)

  React.useEffect(() => {
    async function load() {
      if (!code) return;
      try {
        setError(null);
        setLoading(true);
        const res = await fetch(`/api/session/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Session introuvable");
        }
        setSession(data.session);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  function submitVote() {
    if (!code || !voter.trim()) {
      setError("Renseigne un pseudo.");
      return;
    }
    // on transforme choices en buckets
    const buckets = {
      incontournable: [] as string[],
      chaud: [] as string[],
      avoir: [] as string[],
      non: [] as string[],
    };
    Object.entries(choices).forEach(([id, b]) => {
      if (!b) return;
      // on vote sur le mode normal par défaut
      const key = `${id}-normal`;
      if (b === "incontournable") buckets.incontournable.push(key);
      if (b === "chaud") buckets.chaud.push(key);
      if (b === "avoir") buckets.avoir.push(key);
      if (b === "non") buckets.non.push(key);
    });

    fetch(`/api/session/${encodeURIComponent(code)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: voter.trim(), buckets }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok) throw new Error(d?.error || "Erreur vote");
        setSent(true);
      })
      .catch((e) => setError(e?.message || String(e)));
  }

  return (
    <div className="space-y-6">
      {/* Bandeau Code */}
      {code && (
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
          <span>Session</span>
          <span className="font-mono tabular-nums">{code}</span>
        </div>
      )}

      {/* Form d’accès si l’URL n’avait pas le code */}
      {!session && (
        <div className="flex items-end gap-2">
          <label className="block">
            <span className="block text-sm">Code</span>
            <input
              className="mt-1 w-40 rounded border px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </label>
          <button
            className="rounded-lg border bg-black px-4 py-2 text-white"
            onClick={() => setCode(code.trim())}
          >
            Charger
          </button>
        </div>
      )}

      {/* Chargement / erreurs */}
      {loading && <div>Chargement…</div>}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Voter */}
      {session && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-sm">Ton pseudo</span>
              <input
                className="mt-1 w-56 rounded border px-3 py-2"
                value={voter}
                onChange={(e) => setVoter(e.target.value)}
                placeholder="Ex: Léa"
              />
            </label>
            <button
              className="rounded-lg border bg-black px-4 py-2 text-white"
              onClick={submitVote}
            >
              Envoyer mes votes
            </button>
            {sent && (
              <span className="text-sm text-emerald-700">
                Vote envoyé. Tu peux modifier et renvoyer si besoin.
              </span>
            )}
          </div>

          {/* Liste simple: chaque épreuve → choix de colonne */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {EPREUVES.filter((e) =>
              (session.selectedIds || []).includes(e.id)
            ).map((e) => {
              const bucket = choices[e.id] || "";
              return (
                <div key={e.id} className="rounded-xl border p-3">
                  <EpreuveCard epreuve={e} mode="normal" />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <label className="text-sm">Classement</label>
                    <select
                      className="rounded border px-3 py-1.5 text-sm"
                      value={bucket}
                      onChange={(ev) =>
                        setChoices((c) => ({ ...c, [e.id]: ev.target.value }))
                      }
                    >
                      <option value="">— choisir —</option>
                      <option value="incontournable">Incontournable !</option>
                      <option value="chaud">Je suis chaud</option>
                      <option value="avoir">À voir</option>
                      <option value="non">Pas pour moi</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** ===========================
 *  App principale
 *  =========================== */

type Page = "home" | "create" | "join";

export default function App() {
  const [page, setPage] = React.useState<Page>(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    if (/^\/join\//i.test(path)) return "join";
    return "home";
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Nav simple */}
      <nav className="mb-6 flex items-center justify-between">
        <div className="text-xl tracking-wide">Olympiades</div>
        <div className="flex gap-2">
          <button
            className={`rounded-md px-3 py-1.5 ${
              page === "home" ? "bg-black text-white" : "border"
            }`}
            onClick={() => setPage("home")}
          >
            Accueil
          </button>
          <button
            className={`rounded-md px-3 py-1.5 ${
              page === "create" ? "bg-black text-white" : "border"
            }`}
            onClick={() => setPage("create")}
          >
            Créer
          </button>
          <button
            className={`rounded-md px-3 py-1.5 ${
              page === "join" ? "bg-black text-white" : "border"
            }`}
            onClick={() => setPage("join")}
          >
            Vote
          </button>
        </div>
      </nav>

      {/* Pages */}
      {page === "home" && <Accueil />}
      {page === "create" && <Creer />}
      {page === "join" && <Join />}

      {/* Footer mini */}
      <footer className="mt-10 text-center text-sm opacity-70">
        Bêta — thème 3, étoiles lisibles, titres ajustés, durée à droite, code
        visible.
      </footer>
    </div>
  );
}
