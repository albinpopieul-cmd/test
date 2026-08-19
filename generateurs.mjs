// Générateurs d'items de calcul mental — 8 ceintures progressives (CM2)
// Contenu construit à partir des attendus de calcul mental du programme de
// mathématiques cycle 3 (BO n°16 du 17 avril 2025) :
//  1 Blanche : compléments à 10 / 100, additions et soustractions simples
//  2 Jaune   : doubles, moitiés, tables de 2, 5, 10
//  3 Orange  : tables de multiplication (2 à 9) et divisions associées
//  4 Verte   : calcul réfléchi sur nombres ronds, ×÷10/100/1000
//  5 Bleue   : nombres décimaux (addition, soustraction, comparaison, ×10/100/1000)
//  6 Marron  : fractions simples (fraction d'une quantité, écriture décimale, somme)
//  7 Noire   : proportionnalité, pourcentages usuels, ordres de grandeur
//  8 Rouge   : calcul réfléchi expert (distributivité, calculs combinés, grands nombres)
//
// Chaque générateur est une fonction pure (rng: () => [0,1)) -> item.
// item = { enonce, reponse, accept: string[], type: 'nombre' | 'choix', choix?: string[] }

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

function fmtFR(n) {
  // affichage français d'un nombre (virgule décimale)
  return String(n).replace('.', ',');
}

function fraction(num, denom) {
  const g = gcd(num, denom);
  return { num: num / g, denom: denom / g };
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

// ---------------------------------------------------------------------------
// Ceinture 1 — Blanche : compléments et calculs simples
// ---------------------------------------------------------------------------

function c1_complement10(rng) {
  const a = randInt(1, 9, rng);
  const b = 10 - a;
  return {
    enonce: `${a} + ? = 10`,
    reponse: String(b),
    accept: [String(b)],
    type: 'nombre',
  };
}

function c1_complement100(rng) {
  const a = randInt(1, 9, rng) * 10;
  const b = 100 - a;
  return {
    enonce: `${a} + ? = 100`,
    reponse: String(b),
    accept: [String(b)],
    type: 'nombre',
  };
}

function c1_addition(rng) {
  const a = randInt(1, 9, rng);
  const b = randInt(1, 9, rng);
  return {
    enonce: `${a} + ${b} = ?`,
    reponse: String(a + b),
    accept: [String(a + b)],
    type: 'nombre',
  };
}

function c1_soustraction(rng) {
  const a = randInt(11, 20, rng);
  const b = randInt(1, 9, rng);
  return {
    enonce: `${a} - ${b} = ?`,
    reponse: String(a - b),
    accept: [String(a - b)],
    type: 'nombre',
  };
}

export const CEINTURE_1 = [c1_complement10, c1_complement100, c1_addition, c1_soustraction];

// ---------------------------------------------------------------------------
// Ceinture 2 — Jaune : doubles, moitiés, tables de 2, 5, 10
// ---------------------------------------------------------------------------

function c2_double(rng) {
  const n = randInt(1, 50, rng);
  return {
    enonce: `Double de ${n} = ?`,
    reponse: String(n * 2),
    accept: [String(n * 2)],
    type: 'nombre',
  };
}

function c2_moitie(rng) {
  const n = randInt(1, 50, rng) * 2;
  return {
    enonce: `Moitié de ${n} = ?`,
    reponse: String(n / 2),
    accept: [String(n / 2)],
    type: 'nombre',
  };
}

function c2_table_2_5_10(rng) {
  const table = pick([2, 5, 10], rng);
  const facteur = randInt(1, 10, rng);
  return {
    enonce: `${table} × ${facteur} = ?`,
    reponse: String(table * facteur),
    accept: [String(table * facteur)],
    type: 'nombre',
  };
}

function c2_mult_10_100(rng) {
  const n = randInt(1, 99, rng);
  const mult = pick([10, 100], rng);
  return {
    enonce: `${n} × ${mult} = ?`,
    reponse: String(n * mult),
    accept: [String(n * mult)],
    type: 'nombre',
  };
}

export const CEINTURE_2 = [c2_double, c2_moitie, c2_table_2_5_10, c2_mult_10_100];

// ---------------------------------------------------------------------------
// Ceinture 3 — Orange : tables de multiplication (2 à 9) et divisions associées
// ---------------------------------------------------------------------------

function c3_table(rng) {
  const a = randInt(2, 9, rng);
  const b = randInt(2, 9, rng);
  return {
    enonce: `${a} × ${b} = ?`,
    reponse: String(a * b),
    accept: [String(a * b)],
    type: 'nombre',
  };
}

function c3_division(rng) {
  const a = randInt(2, 9, rng);
  const b = randInt(2, 9, rng);
  const produit = a * b;
  return {
    enonce: `${produit} ÷ ${a} = ?`,
    reponse: String(b),
    accept: [String(b)],
    type: 'nombre',
  };
}

function c3_facteur_manquant(rng) {
  const a = randInt(2, 9, rng);
  const b = randInt(2, 9, rng);
  const produit = a * b;
  return {
    enonce: `? × ${a} = ${produit}`,
    reponse: String(b),
    accept: [String(b)],
    type: 'nombre',
  };
}

export const CEINTURE_3 = [c3_table, c3_division, c3_facteur_manquant];

// ---------------------------------------------------------------------------
// Ceinture 4 — Verte : calcul réfléchi sur nombres ronds, ×÷ 10/100/1000
// ---------------------------------------------------------------------------

function c4_addition_ronde(rng) {
  const base = pick([10, 100], rng);
  const a = randInt(1, 90, rng) * base;
  const b = randInt(1, 90, rng) * base;
  return {
    enonce: `${a} + ${b} = ?`,
    reponse: String(a + b),
    accept: [String(a + b)],
    type: 'nombre',
  };
}

function c4_soustraction_ronde(rng) {
  const base = pick([10, 100], rng);
  const a = randInt(10, 99, rng) * base;
  const b = randInt(1, 9, rng) * base;
  return {
    enonce: `${a} - ${b} = ?`,
    reponse: String(a - b),
    accept: [String(a - b)],
    type: 'nombre',
  };
}

function c4_mult_2chiffres(rng) {
  const a = randInt(11, 49, rng);
  const b = randInt(2, 9, rng);
  return {
    enonce: `${a} × ${b} = ?`,
    reponse: String(a * b),
    accept: [String(a * b)],
    type: 'nombre',
  };
}

function c4_multdiv_puissance10(rng) {
  const n = randInt(1, 90, rng) * 10;
  const puissance = pick([10, 100, 1000], rng);
  const op = pick(['×', '÷'], rng);
  if (op === '×') {
    return {
      enonce: `${n} × ${puissance} = ?`,
      reponse: String(n * puissance),
      accept: [String(n * puissance)],
      type: 'nombre',
    };
  }
  const dividende = n * puissance;
  return {
    enonce: `${dividende} ÷ ${puissance} = ?`,
    reponse: String(n),
    accept: [String(n)],
    type: 'nombre',
  };
}

export const CEINTURE_4 = [c4_addition_ronde, c4_soustraction_ronde, c4_mult_2chiffres, c4_multdiv_puissance10];

// ---------------------------------------------------------------------------
// Ceinture 5 — Bleue : nombres décimaux
// ---------------------------------------------------------------------------

function c5_addition_decimaux(rng) {
  const a = randInt(1, 99, rng) / 10;
  const b = randInt(1, 99, rng) / 10;
  const somme = Math.round((a + b) * 10) / 10;
  return {
    enonce: `${fmtFR(a)} + ${fmtFR(b)} = ?`,
    reponse: fmtFR(somme),
    accept: [String(somme), fmtFR(somme)],
    type: 'nombre',
  };
}

function c5_soustraction_decimaux(rng) {
  const a = randInt(10, 99, rng) / 10;
  const b = randInt(1, Math.round(a * 10) - 1, rng) / 10;
  const diff = Math.round((a - b) * 10) / 10;
  return {
    enonce: `${fmtFR(a)} - ${fmtFR(b)} = ?`,
    reponse: fmtFR(diff),
    accept: [String(diff), fmtFR(diff)],
    type: 'nombre',
  };
}

function c5_mult_puissance10(rng) {
  const n = randInt(1, 999, rng) / 10;
  const puissance = pick([10, 100, 1000], rng);
  const resultat = Math.round(n * puissance * 100) / 100;
  return {
    enonce: `${fmtFR(n)} × ${puissance} = ?`,
    reponse: fmtFR(resultat),
    accept: [String(resultat), fmtFR(resultat)],
    type: 'nombre',
  };
}

function c5_comparer(rng) {
  const a = randInt(1, 99, rng) / 10;
  let b = randInt(1, 99, rng) / 10;
  if (rng() < 0.2) b = a; // égalités parfois
  const symbole = a < b ? '<' : a > b ? '>' : '=';
  return {
    enonce: `${fmtFR(a)}  ?  ${fmtFR(b)}`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

export const CEINTURE_5 = [c5_addition_decimaux, c5_soustraction_decimaux, c5_mult_puissance10, c5_comparer];

// ---------------------------------------------------------------------------
// Ceinture 6 — Marron : fractions simples
// ---------------------------------------------------------------------------

function c6_fraction_de_quantite(rng) {
  const denom = pick([2, 3, 4, 5, 10], rng);
  const num = randInt(1, denom - 1, rng);
  const k = randInt(2, 12, rng);
  const quantite = denom * k;
  const resultat = num * k;
  return {
    enonce: `${num}/${denom} de ${quantite} = ?`,
    reponse: String(resultat),
    accept: [String(resultat)],
    type: 'nombre',
  };
}

function c6_ecriture_decimale(rng) {
  const denom = pick([10, 100], rng);
  const num = randInt(1, denom - 1, rng);
  const decimal = Math.round((num / denom) * 100) / 100;
  return {
    enonce: `${num}/${denom} = ?`,
    reponse: fmtFR(decimal),
    accept: [String(decimal), fmtFR(decimal)],
    type: 'nombre',
  };
}

function c6_somme_fractions(rng) {
  const denom = pick([2, 3, 4, 5, 6, 8, 10], rng);
  const num1 = randInt(1, denom - 2, rng);
  const num2 = randInt(1, denom - 1 - num1, rng);
  const somme = num1 + num2;
  const reduite = fraction(somme, denom);
  const canonique = `${reduite.num}/${reduite.denom}`;
  const brute = `${somme}/${denom}`;
  const decimal = Math.round((somme / denom) * 1000) / 1000;
  return {
    enonce: `${num1}/${denom} + ${num2}/${denom} = ?`,
    reponse: canonique,
    accept: [canonique, brute, String(decimal), fmtFR(decimal)],
    type: 'nombre',
  };
}

function c6_comparer_a_un(rng) {
  const denom = randInt(2, 10, rng);
  let num = randInt(1, denom + 3, rng);
  if (num === denom && rng() < 0.5) num = denom; // garde parfois l'égalité
  const symbole = num < denom ? '<' : num > denom ? '>' : '=';
  return {
    enonce: `${num}/${denom}  ?  1`,
    reponse: symbole,
    accept: [symbole],
    type: 'choix',
    choix: ['<', '=', '>'],
  };
}

export const CEINTURE_6 = [c6_fraction_de_quantite, c6_ecriture_decimale, c6_somme_fractions, c6_comparer_a_un];

// ---------------------------------------------------------------------------
// Ceinture 7 — Noire : proportionnalité, pourcentages, ordres de grandeur
// ---------------------------------------------------------------------------

function c7_pourcentage(rng) {
  const pourcentage = pick([10, 25, 50, 75], rng);
  const diviseur = pourcentage === 10 ? 10 : pourcentage === 50 ? 2 : 4; // 25 % et 75 % -> quarts
  const k = randInt(1, 20, rng);
  const base = diviseur * k;
  const resultat = (base * pourcentage) / 100;
  return {
    enonce: `${pourcentage} % de ${base} = ?`,
    reponse: String(resultat),
    accept: [String(resultat)],
    type: 'nombre',
  };
}

function c7_proportionnalite(rng) {
  const objets = ['stylos', 'cahiers', 'billes', 'gâteaux', 'images', 'bonbons'];
  const objet = pick(objets, rng);
  const u = randInt(2, 6, rng);
  const prixUnitaire = randInt(2, 15, rng);
  const m = randInt(2, 6, rng);
  const quantite2 = u * m;
  const prixU = u * prixUnitaire;
  const reponse = quantite2 * prixUnitaire;
  return {
    enonce: `Si ${u} ${objet} coûtent ${prixU} €, combien coûtent ${quantite2} ${objet} ?`,
    reponse: String(reponse),
    accept: [String(reponse)],
    type: 'nombre',
  };
}

function c7_ordre_grandeur(rng) {
  const a = randInt(1, 9, rng) * 100 + randInt(0, 9, rng) * 10 + randInt(0, 9, rng);
  const b = randInt(2, 9, rng);
  const aArrondi = Math.round(a / 100) * 100;
  const estimation = aArrondi * b;
  return {
    enonce: `Ordre de grandeur (à la centaine) de ${a} × ${b} = ?`,
    reponse: String(estimation),
    accept: [String(estimation)],
    type: 'nombre',
  };
}

function c7_vitesse(rng) {
  const v = randInt(1, 12, rng) * 10;
  const t = randInt(1, 6, rng);
  const distance = v * t;
  return {
    enonce: `Une voiture roule à ${v} km/h pendant ${t} h. Distance parcourue (en km) ?`,
    reponse: String(distance),
    accept: [String(distance)],
    type: 'nombre',
  };
}

export const CEINTURE_7 = [c7_pourcentage, c7_proportionnalite, c7_ordre_grandeur, c7_vitesse];

// ---------------------------------------------------------------------------
// Ceinture 8 — Rouge : calcul réfléchi expert
// ---------------------------------------------------------------------------

function c8_distributivite(rng) {
  const a = randInt(2, 12, rng);
  const proche = pick([98, 99, 101, 102, 998, 999, 1001, 1002], rng);
  const resultat = a * proche;
  return {
    enonce: `${a} × ${proche} = ?`,
    reponse: String(resultat),
    accept: [String(resultat)],
    type: 'nombre',
  };
}

function c8_calcul_combine(rng) {
  const a = randInt(2, 12, rng);
  const b = randInt(2, 12, rng);
  const c = randInt(2, 20, rng);
  const forme = pick(['somme_fois', 'fois_moins', 'moins_fois'], rng);
  if (forme === 'somme_fois') {
    const resultat = (a + b) * c;
    return {
      enonce: `(${a} + ${b}) × ${c} = ?`,
      reponse: String(resultat),
      accept: [String(resultat)],
      type: 'nombre',
    };
  }
  if (forme === 'fois_moins') {
    const resultat = a * b - c;
    return {
      enonce: `${a} × ${b} - ${c} = ?`,
      reponse: String(resultat),
      accept: [String(resultat)],
      type: 'nombre',
    };
  }
  const d = a * b + randInt(1, 20, rng);
  const resultat = d - a * b;
  return {
    enonce: `${d} - (${a} × ${b}) = ?`,
    reponse: String(resultat),
    accept: [String(resultat)],
    type: 'nombre',
  };
}

function c8_grands_nombres(rng) {
  const type = pick(['mult', 'div'], rng);
  if (type === 'mult') {
    const a = randInt(2, 9, rng) * 10;
    const b = randInt(2, 9, rng) * 10;
    const resultat = a * b;
    return {
      enonce: `${a} × ${b} = ?`,
      reponse: String(resultat),
      accept: [String(resultat)],
      type: 'nombre',
    };
  }
  const puissance = pick([10, 100, 1000], rng);
  const quotient = randInt(2, 90, rng);
  const dividende = quotient * puissance;
  return {
    enonce: `${dividende} ÷ ${puissance} = ?`,
    reponse: String(quotient),
    accept: [String(quotient)],
    type: 'nombre',
  };
}

function c8_mix(rng) {
  const toutesCeintures = [CEINTURE_4, CEINTURE_5, CEINTURE_6, CEINTURE_7];
  const ceinture = pick(toutesCeintures, rng);
  const generateur = pick(ceinture, rng);
  return generateur(rng);
}

export const CEINTURE_8 = [c8_distributivite, c8_calcul_combine, c8_grands_nombres, c8_mix];

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
