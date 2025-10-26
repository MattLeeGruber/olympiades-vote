import React, { useEffect, useMemo, useState } from "react";

/* =======================
   API base
======================= */
const API = "/api";

/* =======================
   Types
======================= */
type ModeStats = { phy: number; adr: number; ref: number; sab: number; desc: string };
type Epreuve = {
  id: string;
  nom: string;
  categorie: string; // Conservé dans le type, mais on n'affiche plus la catégorie
  duree: string;
  normal: ModeStats;
  hardcore: ModeStats | null;
  imageUrl?: string;
};

type Item = { key: string; mode: "normal" | "hardcore"; ev: Epreuve };
type From = "pool" | "incontournable" | "chaud" | "avoir" | "non";
type BucketId = "incontournable" | "chaud" | "avoir" | "non";

/* =======================
   Données épreuves (extraites du tableau)
======================= */
const DATA: Epreuve[] = [
  {
    id: "sentence-pilier",
    nom: "La Sentence du Pilier",
    categorie: "Adresse",
    duree: "5 - 10 min",
    normal: {
      phy: 1,
      adr: 5,
      ref: 0,
      sab: 0,
      desc: "Lancez et faites tomber toutes les cibles. La distance augmente à chaque palier."
    },
    hardcore: {
      phy: 1,
      adr: 5,
      ref: 0,
      sab: 3,
      desc: "Seul face au temps qui file, encerclé par ceux qui veulent vous voir échouer."
    }
  },
  {
    id: "course-eau",
    nom: "La Course de l’Eau",
    categorie: "Physique & Adresse",
    duree: "10 - 15 min",
    normal: {
      phy: 4, adr: 2, ref: 2, sab: 0,
      desc: "Courez, remplissez, recommencez jusqu’à atteindre le niveau, puis terminez par un lancer de précision."
    },
    hardcore: {
      phy: 5, adr: 4, ref: 3, sab: 5,
      desc: "Pas de récipient, uniquement avec vos mains. Et faites tomber les cibles ennemies pour éliminer les adversaires."
    }
  },
  {
    id: "mer-brasiers",
    nom: "La Mer des Brasiers",
    categorie: "Physique & Réflexion",
    duree: "5 min par équipe",
    normal: {
      phy: 5, adr: 1, ref: 3, sab: 0,
      desc: "Bataille navale XXL : déplacez des poids sur une grille géante pour couler le navire ennemi."
    },
    hardcore: null
  },
  {
    id: "cercle-codes",
    nom: "Le Cercle des Codes",
    categorie: "Réflexion",
    duree: "15 - 20 min",
    normal: { phy: 0, adr: 0, ref: 5, sab: 0, desc: "Déjouez les pièges et craquez le code avant les autres !" },
    hardcore: null
  },
  {
    id: "secret-anciens",
    nom: "Le Secret des Anciens",
    categorie: "Réflexion",
    duree: "15 min",
    normal: { phy: 0, adr: 0, ref: 5, sab: 0, desc: "Soyez les plus rapides à résoudre les 3 énigmes." },
    hardcore: null
  },
  {
    id: "cryptogramme-final",
    nom: "Le Cryptogramme Final",
    categorie: "Réflexion & Stratégie",
    duree: "10 - 20 min",
    normal: { phy: 0, adr: 1, ref: 5, sab: 0, desc: "Séparés, vous devrez vous synchroniser pour reproduire le cryptogramme." },
    hardcore: null
  },
  {
    id: "traversee-cibles",
    nom: "La Traversée des Cibles",
    categorie: "Adresse",
    duree: "10 - 15 min",
    normal: { phy: 2, adr: 5, ref: 0, sab: 0, desc: "Des cibles variées, des lancers en tout genre. Tout doit tomber !" },
    hardcore: { phy: 2, adr: 5, ref: 2, sab: 3, desc: "Terminez par les cibles des adversaires pour les éliminer de la course." }
  },
  {
    id: "souffle-serpent",
    nom: "Le Souffle du Serpent",
    categorie: "Adresse",
    duree: "20 - 30 min",
    normal: { phy: 2, adr: 5, ref: 0, sab: 0, desc: "Tir à l’arc : cumulez les points jusqu’au seuil pour ouvrir les portes de la victoire !" },
    hardcore: { phy: 2, adr: 5, ref: 2, sab: 5, desc: "Vague après vague, les meilleurs dépouillent les autres de leurs flèches." }
  },
  {
    id: "nid-scorpion",
    nom: "Le Nid du Scorpion",
    categorie: "Adresse",
    duree: "20 - 30 min",
    normal: { phy: 1, adr: 5, ref: 0, sab: 0, desc: "Cornhole en simultané : foncez vers le score avant les autres !" },
    hardcore: { phy: 1, adr: 5, ref: 4, sab: 4, desc: "Grimper au score… ou saboter celui des autres ?" }
  },
  {
    id: "relais-reliques",
    nom: "Le Relais des Reliques",
    categorie: "Physique",
    duree: "5 min par équipe",
    normal: { phy: 5, adr: 2, ref: 1, sab: 0, desc: "Portez les charges à l'endroit prévu. Préparez-vous à souffrir." },
    hardcore: { phy: 5, adr: 4, ref: 1, sab: 0, desc: "Au choix : être attachés ensemble ou utiliser la planche instable." }
  },
  {
    id: "souleve-pack",
    nom: "Le Soulevé de Pack",
    categorie: "Physique",
    duree: "5 min",
    normal: { phy: 5, adr: 0, ref: 0, sab: 3, desc: "Force et résistance : gardez les bras tendus, chargés de poids, jusqu’à l’abandon des rivaux." },
    hardcore: { phy: 5, adr: 0, ref: 0, sab: 3, desc: "Un seul joueur se sacrifie aux charges. Les autres gênent les adversaires." }
  },
  {
    id: "traque-dunes",
    nom: "La Traque des Dunes",
    categorie: "Physique & Adresse",
    duree: "5 min par équipe",
    normal: { phy: 4, adr: 4, ref: 2, sab: 2, desc: "Biathlon revisité : courez, visez, abattez tout tant qu’il reste une cible debout." },
    hardcore: { phy: 3, adr: 4, ref: 3, sab: 2, desc: "Chasse corsée et pénalités à déclencher au bon moment." }
  },
  {
    id: "labyrinthe-tourments",
    nom: "Le Labyrinthe des Tourments",
    categorie: "Physique & Adresse",
    duree: "10 - 15 min",
    normal: { phy: 3, adr: 4, ref: 0, sab: 2, desc: "Dénichez le palet puis placez-le sur la planche !" },
    hardcore: { phy: 3, adr: 4, ref: 3, sab: 2, desc: "Une fois posé, l’enquête s’ouvre : à vous de la résoudre." }
  },
  {
    id: "pauvres-fous",
    nom: "Fuyez ! Pauvres Fous !",
    categorie: "Réflexion & Stratégie",
    duree: "20 - 30 min",
    normal: { phy: 1, adr: 1, ref: 5, sab: 0, desc: "Votre compagnon est prisonnier. Explorez, déjouez et trouvez la clé." },
    hardcore: null
  },
  {
    id: "equations-feu",
    nom: "Les Equations du Feu",
    categorie: "Réflexion & Adresse",
    duree: "15 - 20 min",
    normal: { phy: 2, adr: 4, ref: 5, sab: 0, desc: "1 équation 1 cible. Et on recommence jusqu’à la fin !" },
    hardcore: null
  }
];

/* =======================
   Styles (Thème 3: Bronze/Sable/Bordeaux)
======================= */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500&display=swap');
:root{
  --bronze:#7F5A2F; --sand:#E6D4B8; --bordeaux:#A6273A; --granite:#444;
  --bg:#F5F2EC; --line:#E6E0D8; --card:#fff; --hc-bg:#FFE5E8; --hc-border:#F5B6BF;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:#111;font-family:"League+Spartan",system-ui,Segoe UI,Roboto,Arial}
a{color:inherit}
.app{min-height:100%;display:flex;flex-direction:column}
.container{max-width:1420px;margin:0 auto;padding:18px; position:relative;}
/* HERO d'accueil */
.hero{position:relative; min-height:60vh; overflow:hidden; border-radius:16px;}
.hero-bg{position:absolute; inset:0; background-size:cover; background-position:center; opacity:.25;}
.hero-ov{position:absolute; inset:0; background:linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,.85));}
.hero-content{position:relative; z-index:1; max-width:900px; margin:0 auto; padding:56px 18px; text-align:center;}
.hero h1{margin:0 0 10px 0; font-size:40px; color:var(--bronze); font-weight:400;}
.hero p{margin:0 auto; max-width:800px; font-size:20px; line-height:1.55; color:#444;}
@media(min-width:900px){ .hero h1{font-size:56px} .hero p{font-size:22px} }

.h1{margin:0 0 8px 0;font-size:42px;color:var(--bronze);font-weight:400}
.sub{margin:0;color:#5b5b5b;font-size:18px}
.btn{cursor:pointer;border:1px solid var(--line);border-radius:12px;padding:10px 14px;background:#fff;font-weight:400;font-size:14px}
.btn.primary{background:var(--bronze);color:#fff;border-color:var(--bronze)} .btn.primary:hover{opacity:.92}
.btn.sm{padding:6px 10px;font-size:13px}
.toolbar{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.input{padding:10px 12px;border:1px solid var(--line);border-radius:10px;font-size:14px;background:#fff}
.grid4{display:grid;grid-template-columns:repeat(4,minmax(280px,1fr));gap:18px}
@media(max-width:1240px){.grid4{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.grid4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:580px){.grid4{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.05);display:flex;flex-direction:column}
.card-sel{outline:2px solid var(--sand)}
.card-body{display:flex;flex-direction:column;padding:12px;gap:10px;flex:1}
.card-footer{margin-top:auto;display:flex;gap:8px;justify-content:space-between}
.meta{color:#6b6b6b;font-size:13px}
.imgwrap{position:relative;width:100%;aspect-ratio:16/9;background:#efe7d7}
.imgwrap img{width:100%;height:100%;object-fit:cover}
/* Bannière titre + durée dans l'image */
.imgtitle{position:absolute;left:0;right:0;bottom:0;background:rgba(127,90,47,.92);color:#fff;padding:10px 12px;}
.imgtitle-row{display:flex; align-items:baseline; justify-content:space-between; gap:8px;}
.imgtitle .t{font-size:16px}
.imgtitle .mode{font-size:12px; opacity:.85}
.imgtitle .duree{font-size:13px; opacity:.95; white-space:nowrap}

.statsBlock{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.statRow{display:flex;justify-content:space-between;align-items:center;font-size:16px;color:#222}
/* Etoiles lisibles */
.stars{font-size:22px;line-height:1;display:inline-flex;gap:2px;letter-spacing:0}
.star.filled{color:#d97706}  /* amber-600 */
.star.empty{color:rgba(100,116,139,.35)} /* slate-500 w/ alpha */

.label{opacity:.85}
.desc{margin-top:6px; font-size:15px; line-height:1.55; color:#3a3a3a}

.detailWrap{display:grid;grid-template-columns:360px 1fr;gap:18px;align-items:start}
@media(max-width:980px){.detailWrap{grid-template-columns:1fr}}
.panel{border:1px solid var(--line);border-radius:14px;padding:14px;background:#fff}
.panel.hc{background:var(--hc-bg);border-color:var(--hc-border)}

.badges{display:flex;gap:8px;flex-wrap:wrap}
.pill{padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:13px;cursor:pointer}
.pill.active{background:var(--bordeaux);color:#fff;border-color:var(--bordeaux)}
.footerbar{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;display:flex;gap:10px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 10px;box-shadow:0 6px 20px rgba(0,0,0,.08)}
.footerbar button{background:#fff;border:0;border-radius:999px;padding:8px 12px;cursor:pointer}
.footerbar button:hover{background:#f7f4ef}
.dropRow{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
.drop{min-height:112px;border:2px dashed var(--line);border-radius:16px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:8px}
.drop h3{margin:0 0 4px 0;font-size:18px;font-weight:400;color:var(--bronze)}
.drop .hint{font-size:12px;color:#7a7a7a}
.drop.incontournable{background:#f1f8ff}
.drop.chaud{background:#fff3ef}
.drop.avoir{background:#fffaf1}
.drop.non{background:#fff1f3}
.icon{font-size:22px;margin-right:6px}
.poolGrid{display:grid;grid-template-columns:repeat(4,minmax(280px,1fr));gap:18px}
@media(max-width:1240px){.poolGrid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.poolGrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:580px){.poolGrid{grid-template-columns:1fr}}
.dragCard{background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 6px rgba(0,0,0,.05);overflow:hidden}
.dragCard .body{padding:10px 12px}

/* Badge code session (Vote) */
.sessionBadge{
  position:absolute; top:14px; right:18px;
  background:#fff; border:1px solid var(--line); border-radius:10px;
  padding:6px 10px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:14px; box-shadow:0 2px 6px rgba(0,0,0,.08)
}
`;

/* =======================
   Helpers UI
======================= */
const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < n ? "star filled" : "star empty"}>★</span>
    ))}
  </span>
);
const StatLine: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="statRow">
    <span className="label">{label}</span>
    <Stars n={value} />
  </div>
);
const getImg = (ev: Epreuve) =>
  ev.imageUrl ||
  `https://placehold.co/1200x675/e8dcc7/7f5a2f?text=${encodeURIComponent(ev.nom)}`;

/* =======================
   Drag & Drop simple
======================= */
function useDnD(initial: Item[]) {
  const [pool, setPool] = useState<Item[]>(initial);
  const [buckets, setBuckets] = useState<Record<BucketId, Item[]>>({
    incontournable: [],
    chaud: [],
    avoir: [],
    non: []
  });

  const removeFrom = (from: From, key: string) => {
    if (from === "pool") setPool(p => p.filter(i => i.key !== key));
    else setBuckets(p => ({ ...p, [from]: p[from].filter(i => i.key !== key) }));
  };

  const onDragStart = (e: React.DragEvent, item: Item, from: From) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ item, from }));
  };

  const onDropToBucket = (bucketId: BucketId, e: React.DragEvent) => {
    e.preventDefault();
    const { item, from } = JSON.parse(e.dataTransfer.getData("text/plain"));
    removeFrom(from, item.key);
    setBuckets(p => ({ ...p, [bucketId]: [...p[bucketId], item] }));
  };

  const onDropToPool = (e: React.DragEvent) => {
    e.preventDefault();
    const { item, from } = JSON.parse(e.dataTransfer.getData("text/plain"));
    removeFrom(from, item.key);
    setPool(p => [...p, item]);
  };

  const allow = (e: React.DragEvent) => e.preventDefault();

  return { pool, buckets, onDragStart, onDropToBucket, onDropToPool, allow, setPool, setBuckets };
}

/* =======================
   Petits composants
======================= */
const CardImage: React.FC<{ title: string; url?: string; duree?: string; modeTag?: string }> = ({ title, url, duree, modeTag }) => (
  <div className="imgwrap">
    <img src={url} alt="" />
    <div className="imgtitle">
      <div className="imgtitle-row">
        <div>
          <span className="t">{title} </span>
          {modeTag && <span className="mode">{modeTag}</span>}
        </div>
        {duree && <div className="duree">⏱ {duree}</div>}
      </div>
    </div>
  </div>
);

const EventMini: React.FC<{ ev: Epreuve; onClick: () => void }> = ({ ev, onClick }) => (
  <div onClick={onClick} style={{ cursor: "pointer" }}>
    <CardImage title={ev.nom} url={getImg(ev)} duree={ev.duree} />
    {/* Catégorie supprimée, on garde uniquement la durée (déjà à droite dans la bannière) */}
    <div className="statsBlock">
      <StatLine label="Physique" value={ev.normal.phy} />
      <StatLine label="Adresse" value={ev.normal.adr} />
      <StatLine label="Réflexion" value={ev.normal.ref} />
      <StatLine label="Sabotage" value={ev.normal.sab} />
    </div>
  </div>
);

/* =======================
   Screens
======================= */
const ScreenHome: React.FC<{ onOrganizer: () => void; onJoin: (code: string) => void }> = ({ onOrganizer, onJoin }) => {
  const [code, setCode] = useState("");
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: "url(/hero-placeholder.jpg)" }} aria-hidden="true" />
        <div className="hero-ov" aria-hidden="true" />
        <div className="hero-content">
          <h1>Olympiades — Quelles épreuves vas-tu préférer !</h1>
          <p>
            Choisissez vos épreuves préférées, classez-les, et préparez la mêlée.
            L’animateur composera le programme parfait. Prêts à transpirer&nbsp;?
          </p>
          <div className="toolbar" style={{ marginTop: 20 }}>
            <input className="input" placeholder="Code (ex: 123456)"
                   value={code} onChange={e => setCode(e.target.value)} />
            <button className="btn primary" onClick={() => onJoin(code || prompt("Code de session ?") || "")}>
              Rejoindre une session
            </button>
            <button className="btn" onClick={onOrganizer}>Créer une session</button>
          </div>
        </div>
      </section>
    </div>
  );
};

const ScreenCreate: React.FC<{
  selected: Set<string>;
  toggle: (id: string) => void;
  onStart: (code: string) => void;
  onDetail: (ev: Epreuve) => void;
}> = ({ selected, toggle, onStart, onDetail }) => {
  const selectedArr = DATA.filter(e => selected.has(e.id));
  const [creating, setCreating] = useState(false);

  const createSession = async () => {
    setCreating(true);
    const r = await fetch(`${API}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedIds: Array.from(selected) })
    }).then(r => r.json()).catch(() => null);
    setCreating(false);

    if (r?.ok) {
      // Met dans un éventuel badge dans l'écran Créer (si tu en ajoutes un)
      const badge = document.getElementById('session-code-badge');
      if (badge) badge.replaceChildren(document.createTextNode(r.code));
      alert(`Session créée: ${r.code}\nLien: ${location.origin}${r.url}`);
      onStart(r.code);
    } else {
      alert("Erreur création session");
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "var(--bronze)", fontSize: 28 }}>Sélection des épreuves</div>
        <button className="btn primary" onClick={createSession} disabled={!selected.size || creating}>
          {creating ? "Création..." : `Créer la session (${selected.size})`}
        </button>
      </div>
      <p className="sub">Sélection de l’animateur pour le vote des participants.</p>

      <div className="grid4" style={{ marginTop: 12 }}>
        {DATA.map(ev => (
          <div key={ev.id} className={`card ${selected.has(ev.id) ? "card-sel" : ""}`}>
            <div onClick={() => onDetail(ev)} style={{ cursor: "pointer" }}>
              <CardImage title={ev.nom} url={getImg(ev)} duree={ev.duree} />
            </div>
            <div className="card-body">
              {/* Catégorie supprimée, durée déjà affichée à droite dans la bannière */}
              <div className="statsBlock">
                <StatLine label="Physique" value={ev.normal.phy} />
                <StatLine label="Adresse" value={ev.normal.adr} />
                <StatLine label="Réflexion" value={ev.normal.ref} />
                <StatLine label="Sabotage" value={ev.normal.sab} />
              </div>
              <p className="desc">{ev.normal.desc}</p>
              <div className="card-footer">
                <button className="btn sm" onClick={() => toggle(ev.id)}>
                  {selected.has(ev.id) ? "Retirer" : "Ajouter"}
                </button>
                <button className="btn sm" onClick={() => onDetail(ev)}>Version Hardcore</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedArr.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="sub">Prévisualisation ({selectedArr.length})</div>
          <div className="grid4" style={{ marginTop: 8 }}>
            {selectedArr.map(ev => <EventMini key={ev.id} ev={ev} onClick={() => onDetail(ev)} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const ScreenDetail: React.FC<{ ev: Epreuve; onBack: () => void }> = ({ ev, onBack }) => {
  const [mode, setMode] = useState<"normal" | "hardcore">("normal");
  const hasHC = !!ev.hardcore;
  const n = ev.normal;
  const h = ev.hardcore || undefined;

  return (
    <div className="container">
      <button className="btn sm" onClick={onBack}>← Retour</button>
      <div className="detailWrap" style={{ marginTop: 12 }}>
        <div>
          <CardImage title={ev.nom} url={getImg(ev)} duree={ev.duree} />
        </div>
        <div>
          <div className="panel" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "var(--bronze)", fontSize: 24 }}>{ev.nom}</div>
                {/* Catégorie retirée ici aussi, seule la durée est utile et déjà visible dans l'image */}
              </div>
              <div className="badges">
                <button className={`pill ${mode === "normal" ? "active" : ""}`} onClick={() => setMode("normal")}>Normal</button>
                <button className={`pill ${mode === "hardcore" ? "active" : ""}`} onClick={() => setMode("hardcore")} disabled={!hasHC}>
                  {hasHC ? "Hardcore" : "Hardcore (indispo)"}
                </button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div style={{ opacity: .8 }}>Description (Normal)</div>
            <p className="desc">{n.desc}</p>
            <div className="statsBlock">
              <StatLine label="Physique" value={n.phy} />
              <StatLine label="Adresse" value={n.adr} />
              <StatLine label="Réflexion" value={n.ref} />
              <StatLine label="Sabotage" value={n.sab} />
            </div>
          </div>

          {mode === "hardcore" && hasHC && h && (
            <div className="panel hc" style={{ marginTop: 12 }}>
              <div style={{ opacity: .8 }}>+ Variante Hardcore</div>
              <p className="desc">{h.desc}</p>
              <div className="statsBlock">
                <StatLine label="Physique" value={h.phy} />
                <StatLine label="Adresse" value={h.adr} />
                <StatLine label="Réflexion" value={h.ref} />
                <StatLine label="Sabotage" value={h.sab} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BUCKETS = [
  { id: "incontournable", title: "Incontournable !", icon: "🏆" },
  { id: "chaud", title: "Je suis chaud", icon: "🔥" },
  { id: "avoir", title: "A voir", icon: "👁️" },
  { id: "non", title: "Pas pour moi", icon: "🚫" }
] as const;

function toPoolItems(selected: Epreuve[]) {
  const arr: Item[] = [];
  selected.forEach(ev => {
    arr.push({ key: `${ev.id}-normal`, mode: "normal", ev });
    if (ev.hardcore) arr.push({ key: `${ev.id}-hardcore`, mode: "hardcore", ev });
  });
  return arr;
}

const DraggableEventCard: React.FC<{ item: Item; onDragStart: (e: React.DragEvent, it: Item, from: From) => void }> =
  ({ item, onDragStart }) => {
    const stats = item.mode === "normal" ? item.ev.normal : item.ev.hardcore!;
    const fullDesc = item.mode === "normal" ? stats.desc : `${item.ev.normal.desc} — Variante Hardcore : ${stats.desc}`;
    return (
      <div className="dragCard" draggable onDragStart={(e) => onDragStart(e, item, "pool")}>
        <CardImage
          title={item.ev.nom}
          modeTag={item.mode === "normal" ? "(normal)" : "(hardcore)"}
          url={getImg(item.ev)}
          duree={item.ev.duree}
        />
        <div className="body">
          {/* Catégorie retirée */}
          <div className="statsBlock">
            <StatLine label="Physique" value={stats.phy} />
            <StatLine label="Adresse" value={stats.adr} />
            <StatLine label="Réflexion" value={stats.ref} />
            <StatLine label="Sabotage" value={stats.sab} />
          </div>
          <p className="desc" style={{ marginTop: 8 }}>{fullDesc}</p>
        </div>
      </div>
    );
  };

const ScreenVote: React.FC<{
  sessionCode: string | null;
  selected: Epreuve[];
  onNeedJoin: () => void;
}> = ({ sessionCode, selected, onNeedJoin }) => {
  const baseItems = useMemo(() => toPoolItems(selected), [selected]);
  const { pool, buckets, onDragStart, onDropToBucket, onDropToPool, allow } = useDnD(baseItems);
  const [voter, setVoter] = useState(localStorage.getItem("voter") || "");

  useEffect(() => {
    const m = location.pathname.match(/\/join\/(.+)$/);
    if (m && !sessionCode) onNeedJoin();
  }, []);

  const submit = async () => {
    if (!sessionCode) { alert("Tu dois rejoindre une session d'abord."); return; }
    if (!voter.trim()) { alert("Entre un pseudo/prénom."); return; }
    localStorage.setItem("voter", voter.trim());
    const payload = {
      voter: voter.trim(),
      buckets: {
        incontournable: buckets.incontournable.map(i => i.key),
        chaud: buckets.chaud.map(i => i.key),
        avoir: buckets.avoir.map(i => i.key),
        non: buckets.non.map(i => i.key)
      }
    };
    const r = await fetch(`${API}/session/${sessionCode}/vote`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    }).then(r => r.json()).catch(() => null);
    if (r?.ok) alert("Vote enregistré. Merci !");
    else alert("Erreur enregistrement vote");
  };

  return (
    <div className="container">
      {/* Badge code session en haut à droite */}
      {sessionCode && <div className="sessionBadge">Code&nbsp;: {sessionCode}</div>}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <input className="input" placeholder="Ton pseudo" value={voter} onChange={e => setVoter(e.target.value)} />
        <button className="btn primary" onClick={submit}>Envoyer mes votes</button>
       {sessionCode && (
  <>
    <button
      className="btn"
      onClick={() => {
        const pin = localStorage.getItem("adminPin") || prompt("PIN animateur ?") || "";
        if (!pin) return;
        window.open(
          `${API}/session/${encodeURIComponent(sessionCode)}/results?admin=${encodeURIComponent(pin)}`,
          "_blank"
        );
      }}
    >
      Résultats (JSON)
    </button>

    <button
      className="btn"
      onClick={() => {
        const pin = localStorage.getItem("adminPin") || prompt("PIN animateur ?") || "";
        if (!pin) return;
        window.open(
          `${API}/session/${encodeURIComponent(sessionCode)}/export?admin=${encodeURIComponent(pin)}`,
          "_blank"
        );
      }}
    >
      Export CSV
    </button>
  </>
)}

      </div>

      <div className="dropRow">
        {BUCKETS.map(b => (
          <div key={b.id} className={`drop ${b.id}`} onDrop={(e) => onDropToBucket(b.id, e)} onDragOver={allow}>
            <h3><span className="icon">{b.icon}</span>{b.title}</h3>
            <div className="hint">Glissez vos choix ici</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {buckets[b.id].map(it => (
                <span key={it.key} className="pill" draggable
                      onDragStart={(e) => onDragStart(e, it, b.id as BucketId)}>
                  {it.ev.nom} {it.mode === "normal" ? "(N)" : "(H)"}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="drop" style={{ marginBottom: 16 }} onDrop={onDropToPool} onDragOver={allow}>
        <h3>⬇️ Remettre dans les cartes ci-dessous</h3>
      </div>

      <div className="poolGrid">
        {pool.map(item => <DraggableEventCard key={item.key} item={item} onDragStart={onDragStart} />)}
      </div>
    </div>
  );
};

/* =======================
   App
======================= */
export default function App() {
  const [screen, setScreen] = useState<"home" | "create" | "detail" | "vote">("home");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Epreuve | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  const fetchJoinFromURL = async () => {
    const m = location.pathname.match(/\/join\/(.+)$/);
    const code = m?.[1];
    if (!code) return;
    const r = await fetch(`${API}/session/${code}`).then(r => r.json()).catch(() => null);
    if (r?.ok) {
      setSelectedIds(new Set(r.session.selectedIds || []));
      setSessionCode(code);
      setScreen("vote");
    } else {
      alert("Session introuvable");
    }
  };

  const selected = useMemo(() => DATA.filter(e => selectedIds.has(e.id)), [selectedIds]);
  const toggle = (id: string) =>
    setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="app">
      <style>{styles}</style>

      {screen === "home" && (
        <ScreenHome
          onOrganizer={() => setScreen("create")}
          onJoin={async (code) => {
            const c = code || prompt("Code de session ?") || "";
            if (!c) return;
            const r = await fetch(`${API}/session/${c}`).then(r => r.json()).catch(() => null);
            if (r?.ok) {
              setSelectedIds(new Set(r.session.selectedIds || []));
              setSessionCode(c);
              setScreen("vote");
            } else alert("Session introuvable");
          }}
        />
      )}

      {screen === "create" && (
        <div>
          <ScreenCreate
            selected={selectedIds}
            toggle={toggle}
            onStart={(code) => { setSessionCode(code); setScreen("vote"); }}
            onDetail={(ev) => { setDetail(ev); setScreen("detail"); }}
          />
          <div className="footerbar">
            <button onClick={() => setScreen("home")}>Accueil</button>
            <button onClick={() => setScreen("create")}>Créer</button>
            <button onClick={() => setScreen("vote")}>Vote</button>
          </div>
        </div>
      )}

      {screen === "detail" && detail && (
        <div>
          <ScreenDetail ev={detail} onBack={() => setScreen("create")} />
          <div className="footerbar">
            <button onClick={() => setScreen("home")}>Accueil</button>
            <button onClick={() => setScreen("create")}>Créer</button>
            <button onClick={() => setScreen("vote")}>Vote</button>
          </div>
        </div>
      )}

      {screen === "vote" && (
        <div>
          <ScreenVote
            sessionCode={sessionCode}
            selected={selected.length ? selected : DATA.slice(0, 8)}
            onNeedJoin={fetchJoinFromURL}
          />
          <div className="footerbar">
            <button onClick={() => setScreen("home")}>Accueil</button>
            <button onClick={() => setScreen("create")}>Créer</button>
            <button onClick={() => setScreen("vote")}>Vote</button>
          </div>
        </div>
      )}
    </div>
  );
}
