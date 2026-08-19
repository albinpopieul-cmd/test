// Gestion des données multi-élèves : liste de classe, code enseignant,
// scores par élève et par ceinture, fusion de plusieurs appareils, export CSV.
// Fonctions pures : (store, ...) -> nouveau store (ou valeur), jamais de mutation.
import { CEINTURES } from './generateurs.mjs';

export function creerStockageVide() {
  return { code: null, roster: [], eleves: {} };
}

export function definirCode(store, code) {
  return { ...store, code: String(code).trim() };
}

export function verifierCode(store, code) {
  return store.code !== null && store.code !== '' && String(code).trim() === store.code;
}

export function ajouterEleve(store, nom) {
  const propre = String(nom).trim();
  if (!propre || store.roster.includes(propre)) return store;
  return { ...store, roster: [...store.roster, propre] };
}

export function retirerEleve(store, nom) {
  const roster = store.roster.filter((n) => n !== nom);
  const eleves = { ...store.eleves };
  delete eleves[nom];
  return { ...store, roster, eleves };
}

export function reinitialiserScoresEleve(store, nom) {
  const eleves = { ...store.eleves };
  delete eleves[nom];
  return { ...store, eleves };
}

export function enregistrerScore(store, nom, numeroCeinture, score, seuilReussite) {
  const roster = store.roster.includes(nom) ? store.roster : [...store.roster, nom];
  const eleves = { ...store.eleves };
  const donneesEleve = { ...(eleves[nom] || {}) };
  const precedent = donneesEleve[numeroCeinture] || { meilleurScore: 0, valide: false, tentatives: 0, date: null };
  const valide = precedent.valide || score >= seuilReussite;
  donneesEleve[numeroCeinture] = {
    meilleurScore: Math.max(precedent.meilleurScore, score),
    valide,
    tentatives: precedent.tentatives + 1,
    date: !precedent.valide && valide ? new Date().toISOString() : precedent.date,
  };
  eleves[nom] = donneesEleve;
  return { ...store, roster, eleves };
}

function fusionnerEntreeCeinture(a, b) {
  if (!a) return b;
  if (!b) return a;
  return {
    meilleurScore: Math.max(a.meilleurScore, b.meilleurScore),
    valide: a.valide || b.valide,
    tentatives: (a.tentatives || 0) + (b.tentatives || 0),
    date: a.date && b.date ? (a.date < b.date ? a.date : b.date) : a.date || b.date || null,
  };
}

export function fusionnerStockages(local, importe) {
  const roster = [...local.roster];
  importe.roster.forEach((n) => {
    if (!roster.includes(n)) roster.push(n);
  });

  const eleves = {};
  const noms = new Set([...Object.keys(local.eleves), ...Object.keys(importe.eleves)]);
  noms.forEach((nom) => {
    const a = local.eleves[nom] || {};
    const b = importe.eleves[nom] || {};
    const numeros = new Set([...Object.keys(a), ...Object.keys(b)]);
    const fusion = {};
    numeros.forEach((num) => {
      fusion[num] = fusionnerEntreeCeinture(a[num], b[num]);
    });
    eleves[nom] = fusion;
  });

  return { code: local.code, roster, eleves };
}

function champCSV(valeur) {
  const s = String(valeur);
  if (/[;"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function genererCSV(store) {
  const entetes = ['Élève', ...CEINTURES.map((c) => 'Ceinture ' + c.nom)];
  const lignes = [entetes];
  store.roster.forEach((nom) => {
    const ligne = [nom];
    CEINTURES.forEach((c) => {
      const info = store.eleves[nom] && store.eleves[nom][c.numero];
      ligne.push(info ? (info.valide ? 'Validée (' + info.meilleurScore + '/10)' : info.meilleurScore + '/10') : '');
    });
    lignes.push(ligne);
  });
  return lignes.map((ligne) => ligne.map(champCSV).join(';')).join('\r\n');
}
