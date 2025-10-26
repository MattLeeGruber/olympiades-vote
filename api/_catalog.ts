// api/_catalog.ts
export type CatItem = { id: string; name: string; categorie: string; duree: string };
export const CATALOG: Record<string, CatItem> = {
  "sentence-pilier": { id:"sentence-pilier", name:"La Sentence du Pilier", categorie:"Adresse", duree:"5 - 10 min" },
  "course-eau":      { id:"course-eau",      name:"La Course de l’Eau",    categorie:"Physique & Adresse", duree:"10 - 15 min" },
  "mer-brasiers":    { id:"mer-brasiers",    name:"La Mer des Brasiers",   categorie:"Physique & Réflexion", duree:"5 min par équipe" },
  "cercle-codes":    { id:"cercle-codes",    name:"Le Cercle des Codes",   categorie:"Réflexion", duree:"15 - 20 min" },
  "secret-anciens":  { id:"secret-anciens",  name:"Le Secret des Anciens", categorie:"Réflexion", duree:"15 min" },
  "cryptogramme-final": { id:"cryptogramme-final", name:"Le Cryptogramme Final", categorie:"Réflexion & Stratégie", duree:"10 - 20 min" },
  "traversee-cibles":{ id:"traversee-cibles", name:"La Traversée des Cibles", categorie:"Adresse", duree:"10 - 15 min" },
  "souffle-serpent": { id:"souffle-serpent", name:"Le Souffle du Serpent", categorie:"Adresse", duree:"20 - 30 min" },
  "nid-scorpion":    { id:"nid-scorpion",    name:"Le Nid du Scorpion",   categorie:"Adresse", duree:"20 - 30 min" },
  "relais-reliques": { id:"relais-reliques", name:"Le Relais des Reliques", categorie:"Physique", duree:"5 min par équipe" },
  "souleve-pack":    { id:"souleve-pack",    name:"Le Soulevé de Pack",    categorie:"Physique", duree:"5 min" },
  "traque-dunes":    { id:"traque-dunes",    name:"La Traque des Dunes",   categorie:"Physique & Adresse", duree:"5 min par équipe" },
  "labyrinthe-tourments": { id:"labyrinthe-tourments", name:"Le Labyrinthe des Tourments", categorie:"Physique & Adresse", duree:"10 - 15 min" },
  "pauvres-fous":    { id:"pauvres-fous",    name:"Fuyez ! Pauvres Fous !", categorie:"Réflexion & Stratégie", duree:"20 - 30 min" },
  "equations-feu":   { id:"equations-feu",   name:"Les Equations du Feu",  categorie:"Réflexion & Adresse", duree:"15 - 20 min" },
};
