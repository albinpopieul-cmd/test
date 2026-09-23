// Générateurs d'items — Ceintures de fractions (CM1-CM2)
// Contenu construit à partir des attendus « Fractions » du programme de
// mathématiques cycle 3 (rentrée 2025), pour la partie évaluable par saisie
// numérique / fraction / choix multiple :
//  1 Blanche : la fraction comme partage (lecture et production d'un partage)
//  2 Jaune   : vocabulaire (numérateur/dénominateur), lecture en lettres
//  3 Orange  : fractions et nombres entiers (partie entière, fractions = entiers)
//  4 Verte   : comparer une fraction aux repères usuels (1/2 et 1)
//  5 Bleue   : comparer deux fractions (même dénominateur, même numérateur)
//  6 Marron  : fractions décimales et nombres décimaux
//  7 Noire   : addition de deux fractions de même dénominateur
//  8 Rouge   : fractions égales (équivalence simple), multiplier une fraction
//              par un entier
//
// Non couvert ici (nécessite une interaction graphique — glisser-déposer,
// tracé, pliage — hors de portée d'une saisie clavier/QCM) : placement libre
// sur une droite graduée, pliage/découpage de figures, fractions non
// décimales de dénominateurs différents (simplification, réduction au même
// dénominateur), qui relèvent davantage de la 6e.
//
// Chaque générateur est une fonction pure (rng: () => [0,1)) -> item.
// item = { enonce, reponse, accept: string[], type: 'nombre' | 'fraction' | 'choix', choix?: string[] }
// Le type 'fraction' est saisi par l'application via deux champs numérateur/
// dénominateur assemblés en chaîne "num/den" avant vérification : checkAnswer
// n'a donc pas besoin de connaître ce type, il le traite comme 'nombre'.

export function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick(arr, rng = Math.random) {
  return arr[randInt(0, arr.length - 1, rng)];
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function melanger(arr, rng = Math.random) {
  const copie = arr.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randInt(0, i, rng);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function fmtFR(n) {
  return String(n).replace('.', ',');
}

function toNumericValue(raw) {
  if (raw === undefined || raw === null) return NaN;
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
  if (s === '') return NaN;
  const fracMatch = s.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const n = Number(fracMatch[1]);
    const d = Number(fracMatch[2]);
    if (d === 0) return NaN;
    return n / d;
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

export function checkAnswer(item, userInput) {
  if (item.type === 'choix') {
    const s = String(userInput).trim().toLowerCase();
    return item.accept.some((a) => String(a).trim().toLowerCase() === s);
  }
  const v = toNumericValue(userInput);
  if (Number.isNaN(v)) return false;
  return item.accept.some((a) => {
    const av = toNumericValue(a);
    return !Number.isNaN(av) && Math.abs(av - v) < 1e-9;
  });
}

function memeValeur(n1, d1, n2, d2) {
  return n1 * d2 === n2 * d1;
}

const BLOC_PLEIN = '■';
const BLOC_VIDE = '□';

function dessinerPartage(n, d) {
  return BLOC_PLEIN.repeat(n) + BLOC_VIDE.repeat(d - n);
}

// ---------------------------------------------------------------------------
// Ceinture 1 — Blanche : la fraction comme partage
// ---------------------------------------------------------------------------

const DENOMINATEURS_SIMPLES = [2, 3, 4, 5, 6, 8, 10];

function c1_lecture_partage(rng) {
  const d = pick(DENOMINATEURS_SIMPLES, rng);
  const n = randInt(1, d - 1, rng);
  const reponse = `${n}/${d}`;
  return {
    enonce: `Quelle fraction est coloriée ? ${dessinerPartage(n, d)}`,
    reponse,
    accept: [reponse],
    type: 'fraction',
  };
}

function c1_production_partage(rng) {
  const d = pick(DENOMINATEURS_SIMPLES, rng);
  const n = randInt(1, d - 1, rng);
  return {
    enonce: `Sur une bande de ${d} cases égales, combien faut-il en colorier pour représenter ${n}/${d} ?`,
    reponse: String(n),
    accept: [String(n)],
    type: 'nombre',
  };
}

export const CEINTURE_1 = [c1_lecture_partage, c1_production_partage];

// ---------------------------------------------------------------------------
// Ceinture 2 — Jaune : vocabulaire des fractions
// ---------------------------------------------------------------------------

const NOMBRES_LETTRES = { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf' };
const MOTS_DENOMINATEUR = {
  2: { sing: 'demi', plur: 'demis' },
  3: { sing: 'tiers', plur: 'tiers' },
  4: { sing: 'quart', plur: 'quarts' },
  5: { sing: 'cinquième', plur: 'cinquièmes' },
  6: { sing: 'sixième', plur: 'sixièmes' },
  7: { sing: 'septième', plur: 'septièmes' },
  8: { sing: 'huitième', plur: 'huitièmes' },
  9: { sing: 'neuvième', plur: 'neuvièmes' },
  10: { sing: 'dixième', plur: 'dixièmes' },
};

function c2_numerateur_denominateur(rng) {
  const d = randInt(2, 12, rng);
  const n = randInt(1, d - 1, rng);
  const demande = pick(['numerateur', 'denominateur'], rng);
  const reponse = demande === 'numerateur' ? n : d;
  return {
    enonce: `Dans la fraction ${n}/${d}, quel est le ${demande === 'numerateur' ? 'numérateur' : 'dénominateur'} ?`,
    reponse: String(reponse),
    accept: [String(reponse)],
    type: 'nombre',
  };
}

function c2_mots_vers_fraction(rng) {
  const d = randInt(2, 9, rng);
  const n = randInt(1, d - 1, rng);
  const mot = n === 1 ? MOTS_DENOMINATEUR[d].sing : MOTS_DENOMINATEUR[d].plur;
  const phrase = `${NOMBRES_LETTRES[n]} ${mot}`;
  const reponse = `${n}/${d}`;
  return {
    enonce: `Écris en chiffres : « ${phrase} »`,
    reponse,
    accept: [reponse],
    type: 'fraction',
  };
}

export const CEINTURE_2 = [c2_numerateur_denominateur, c2_mots_vers_fraction];

// ---------------------------------------------------------------------------
// Ceinture 3 — Orange : fractions et nombres entiers
// ---------------------------------------------------------------------------

function c3_partie_entiere(rng) {
  const d = randInt(2, 9, rng);
  let n = randInt(d + 1, 4 * d, rng);
  while (n % d === 0) n = randInt(d + 1, 4 * d, rng);
  const partieEntiere = Math.floor(n / d);
  return {
    enonce: `Quelle est la partie entière de la fraction ${n}/${d} ?`,
    reponse: String(partieEntiere),
    accept: [String(partieEntiere)],
    type: 'nombre',
  };
}

function c3_fraction_egale_entier(rng) {
  const d = randInt(2, 9, rng);
  const k = randInt(2, 6, rng);
  const n = k * d;
  return {
    enonce: `${n}/${d} est égal à quel nombre entier ?`,
    reponse: String(k),
    accept: [String(k)],
    type: 'nombre',
  };
}

export const CEINTURE_3 = [c3_partie_entiere, c3_fraction_egale_entier];

// ---------------------------------------------------------------------------
// Ceinture 4 — Verte : comparer une fraction aux repères usuels (1/2 et 1)
// ---------------------------------------------------------------------------

function symboleComparaison(a, b) {
  return a < b ? '<' : a > b ? '>' : '=';
}

function c4_comparer_un_demi(rng) {
  const d = randInt(2, 12, rng);
  let n = randInt(1, 2 * d - 1, rng);
  if (rng() < 0.15) n = d; // parfois exactement 1, testé aussi contre 1/2
  const symbole = symboleComparaison(2 * n, d);
  return {
    enonce: `${n}/${d}  ?  1/2`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

function c4_comparer_un(rng) {
  const d = randInt(2, 12, rng);
  let n = randInt(1, 2 * d - 1, rng);
  if (rng() < 0.15) n = d; // parfois exactement égal
  const symbole = symboleComparaison(n, d);
  return {
    enonce: `${n}/${d}  ?  1`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

export const CEINTURE_4 = [c4_comparer_un_demi, c4_comparer_un];

// ---------------------------------------------------------------------------
// Ceinture 5 — Bleue : comparer deux fractions
// ---------------------------------------------------------------------------

function c5_meme_denominateur(rng) {
  const d = randInt(2, 12, rng);
  const a = randInt(1, d - 1, rng);
  const b = rng() < 0.2 ? a : randInt(1, d - 1, rng);
  const symbole = symboleComparaison(a, b);
  return {
    enonce: `${a}/${d}  ?  ${b}/${d}`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

function c5_meme_numerateur(rng) {
  const n = randInt(2, 9, rng);
  const d1 = randInt(n + 1, n + 10, rng);
  const d2 = rng() < 0.2 ? d1 : randInt(n + 1, n + 10, rng);
  // même numérateur : le plus grand dénominateur donne la plus petite part
  const symbole = symboleComparaison(d2, d1);
  return {
    enonce: `${n}/${d1}  ?  ${n}/${d2}`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

export const CEINTURE_5 = [c5_meme_denominateur, c5_meme_numerateur];

// ---------------------------------------------------------------------------
// Ceinture 6 — Marron : fractions décimales et nombres décimaux
// ---------------------------------------------------------------------------

function texteDecimal(numerateur, d) {
  return d === 10 ? `0,${numerateur}` : `0,${String(numerateur).padStart(2, '0')}`;
}

function c6_fraction_vers_decimal(rng) {
  const d = pick([10, 100], rng);
  const n = randInt(1, d - 1, rng);
  const reponse = texteDecimal(n, d);
  return {
    enonce: `Écris ${n}/${d} en écriture décimale.`,
    reponse,
    accept: [reponse],
    type: 'nombre',
  };
}

function c6_decimal_vers_fraction(rng) {
  const d = pick([10, 100], rng);
  const n = randInt(1, d - 1, rng);
  const decimal = texteDecimal(n, d);
  const reponse = `${n}/${d}`;
  return {
    enonce: `Écris ${decimal} sous forme de fraction décimale.`,
    reponse,
    accept: [reponse],
    type: 'fraction',
  };
}

export const CEINTURE_6 = [c6_fraction_vers_decimal, c6_decimal_vers_fraction];

// ---------------------------------------------------------------------------
// Ceinture 7 — Noire : addition de deux fractions de même dénominateur
// ---------------------------------------------------------------------------

function c7_addition_meme_denominateur(rng) {
  const d = randInt(2, 12, rng);
  const a = randInt(1, d - 1, rng);
  const b = randInt(1, d - 1, rng);
  const somme = a + b;
  const reponse = `${somme}/${d}`;
  return {
    enonce: `${a}/${d} + ${b}/${d} = ?`,
    reponse,
    accept: [reponse],
    type: 'fraction',
  };
}

export const CEINTURE_7 = [c7_addition_meme_denominateur];

// ---------------------------------------------------------------------------
// Ceinture 8 — Rouge : fractions équivalentes, multiplier une fraction par un entier
// ---------------------------------------------------------------------------

function c8_equivalence(rng) {
  const d0 = randInt(2, 6, rng);
  const n0 = randInt(1, d0 - 1, rng);
  const k = randInt(2, 5, rng);
  const correcte = `${n0 * k}/${d0 * k}`;

  const distracteurs = [];
  let tentatives = 0;
  while (distracteurs.length < 3 && tentatives < 200) {
    tentatives++;
    const d1 = randInt(2, 12, rng);
    const n1 = randInt(1, d1 - 1, rng);
    if (memeValeur(n0, d0, n1, d1)) continue;
    const texte = `${n1}/${d1}`;
    if (texte === correcte) continue;
    if (distracteurs.some((t) => {
      const [tn, td] = t.split('/').map(Number);
      return memeValeur(tn, td, n1, d1);
    })) continue;
    distracteurs.push(texte);
  }
  // Filet de sécurité si le tirage aléatoire n'a pas trouvé 3 distracteurs distincts.
  while (distracteurs.length < 3) {
    const d1 = d0 + distracteurs.length + 1;
    distracteurs.push(`${n0}/${d1}`);
  }

  return {
    enonce: `Quelle fraction est égale à ${n0}/${d0} ?`,
    reponse: correcte,
    accept: [correcte],
    type: 'choix',
    choix: melanger([correcte, ...distracteurs], rng),
  };
}

function c8_multiplication_entier(rng) {
  const d = randInt(2, 10, rng);
  const n = randInt(1, d - 1, rng);
  const k = randInt(2, 6, rng);
  const reponse = `${n * k}/${d}`;
  return {
    enonce: `${k} × ${n}/${d} = ?`,
    reponse,
    accept: [reponse],
    type: 'fraction',
  };
}

export const CEINTURE_8 = [c8_equivalence, c8_multiplication_entier];

// ---------------------------------------------------------------------------

export const CEINTURES = [
  { numero: 1, nom: 'Blanche', couleur: '#f5f5f0', texte: '#1a1a1a', generateurs: CEINTURE_1 },
  { numero: 2, nom: 'Jaune', couleur: '#f4c430', texte: '#1a1a1a', generateurs: CEINTURE_2 },
  { numero: 3, nom: 'Orange', couleur: '#e8720c', texte: '#ffffff', generateurs: CEINTURE_3 },
  { numero: 4, nom: 'Verte', couleur: '#2e8b3d', texte: '#ffffff', generateurs: CEINTURE_4 },
  { numero: 5, nom: 'Bleue', couleur: '#1f5fa8', texte: '#ffffff', generateurs: CEINTURE_5 },
  { numero: 6, nom: 'Marron', couleur: '#6b4226', texte: '#ffffff', generateurs: CEINTURE_6 },
  { numero: 7, nom: 'Noire', couleur: '#1a1a1a', texte: '#ffffff', generateurs: CEINTURE_7 },
  { numero: 8, nom: 'Rouge', couleur: '#b5121b', texte: '#ffffff', generateurs: CEINTURE_8 },
];

export function genererItem(numeroCeinture, rng = Math.random) {
  const ceinture = CEINTURES[numeroCeinture - 1];
  if (!ceinture) throw new Error(`Ceinture inconnue : ${numeroCeinture}`);
  const generateur = pick(ceinture.generateurs, rng);
  return generateur(rng);
}
