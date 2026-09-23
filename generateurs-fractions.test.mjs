import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CEINTURES,
  genererItem,
  checkAnswer,
  randInt,
  pick,
  gcd,
  melanger,
} from './generateurs-fractions.mjs';

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 500;

test('randInt reste dans les bornes', () => {
  const rng = mulberry32(1);
  for (let i = 0; i < N; i++) {
    const v = randInt(3, 9, rng);
    assert.ok(v >= 3 && v <= 9, `valeur hors bornes: ${v}`);
  }
});

test('gcd calcule le pgcd correctement', () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(7, 13), 1);
  assert.equal(gcd(0, 5), 5);
});

test('pick choisit toujours un élément du tableau', () => {
  const rng = mulberry32(2);
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < N; i++) {
    assert.ok(arr.includes(pick(arr, rng)));
  }
});

test('melanger conserve tous les éléments, dans un ordre pas toujours identique', () => {
  const rng = mulberry32(3);
  const original = [1, 2, 3, 4, 5];
  let aTrouveUnOrdreDifferent = false;
  for (let i = 0; i < 50; i++) {
    const m = melanger(original, rng);
    assert.deepEqual(m.slice().sort(), original);
    if (JSON.stringify(m) !== JSON.stringify(original)) aTrouveUnOrdreDifferent = true;
  }
  assert.ok(aTrouveUnOrdreDifferent);
});

test('il y a exactement 8 ceintures numérotées 1 à 8', () => {
  assert.equal(CEINTURES.length, 8);
  CEINTURES.forEach((c, i) => {
    assert.equal(c.numero, i + 1);
    assert.ok(c.nom.length > 0);
    assert.ok(c.generateurs.length >= 1);
  });
});

const TYPES_VALIDES = ['nombre', 'fraction', 'choix'];

for (let n = 1; n <= 8; n++) {
  test(`ceinture ${n} : chaque item généré est bien formé et sa propre réponse passe checkAnswer`, () => {
    const rng = mulberry32(100 + n);
    for (let i = 0; i < N; i++) {
      const item = genererItem(n, rng);
      assert.equal(typeof item.enonce, 'string');
      assert.ok(item.enonce.length > 0, 'énoncé vide');
      assert.ok(Array.isArray(item.accept) && item.accept.length > 0, 'accept vide');
      assert.ok(TYPES_VALIDES.includes(item.type), `type invalide: ${item.type}`);
      if (item.type === 'choix') {
        assert.ok(Array.isArray(item.choix) && item.choix.length > 0);
        assert.ok(item.choix.includes(item.reponse), 'la réponse doit figurer parmi les choix');
        const valeurs = new Set(item.choix);
        assert.equal(valeurs.size, item.choix.length, 'les choix ne doivent pas se répéter littéralement');
      }
      assert.ok(
        checkAnswer(item, item.reponse),
        `la réponse canonique "${item.reponse}" n'est pas acceptée pour "${item.enonce}"`
      );
    }
  });
}

test('checkAnswer accepte la virgule et le point comme séparateur décimal', () => {
  const item = { type: 'nombre', accept: ['0.7'] };
  assert.ok(checkAnswer(item, '0.7'));
  assert.ok(checkAnswer(item, '0,7'));
  assert.ok(!checkAnswer(item, '0,8'));
});

test('checkAnswer accepte une fraction équivalente à la valeur attendue', () => {
  const item = { type: 'nombre', accept: ['3/4'] };
  assert.ok(checkAnswer(item, '3/4'));
  assert.ok(checkAnswer(item, '0.75'));
  assert.ok(!checkAnswer(item, '1/2'));
});

test('checkAnswer refuse une fraction avec un dénominateur nul', () => {
  const item = { type: 'nombre', accept: ['5'] };
  assert.ok(!checkAnswer(item, '5/0'));
});

test('checkAnswer (type choix) compare la casse et les espaces sans plantage', () => {
  const item = { type: 'choix', accept: ['<'], choix: ['<', '=', '>'] };
  assert.ok(checkAnswer(item, '<'));
  assert.ok(checkAnswer(item, ' < '));
  assert.ok(!checkAnswer(item, '>'));
});

// --- Vérifications de cohérence pédagogique par ceinture ------------------

test('ceinture 1 : la lecture du partage correspond exactement au dessin', () => {
  const rng = mulberry32(11);
  for (let i = 0; i < N; i++) {
    const item = genererItem(1, rng);
    const m = item.enonce.match(/Quelle fraction est coloriée \? ([■□]+)/);
    if (!m) continue;
    const dessin = m[1];
    const pleines = (dessin.match(/■/g) || []).length;
    const total = dessin.length;
    assert.equal(item.reponse, `${pleines}/${total}`);
  }
});

test('ceinture 1 : le nombre de cases à colorier correspond au numérateur de l\'énoncé', () => {
  const rng = mulberry32(12);
  for (let i = 0; i < N; i++) {
    const item = genererItem(1, rng);
    const m = item.enonce.match(/bande de (\d+) cases égales.*représenter (\d+)\/(\d+)/);
    if (!m) continue;
    const [, total, n, d] = m;
    assert.equal(total, d);
    assert.equal(item.reponse, n);
  }
});

test('ceinture 2 : numérateur/dénominateur identifiés correspondent à la fraction énoncée', () => {
  const rng = mulberry32(13);
  for (let i = 0; i < N; i++) {
    const item = genererItem(2, rng);
    const m = item.enonce.match(/Dans la fraction (\d+)\/(\d+), quel est le (numérateur|dénominateur) \?/);
    if (!m) continue;
    const [, n, d, quel] = m;
    assert.equal(item.reponse, quel === 'numérateur' ? n : d);
  }
});

test('ceinture 2 : conversion mots -> fraction cohérente avec la table de vocabulaire', () => {
  const rng = mulberry32(14);
  for (let i = 0; i < N; i++) {
    const item = genererItem(2, rng);
    const m = item.enonce.match(/Écris en chiffres : « (.+) »/);
    if (!m) continue;
    const [n, d] = item.reponse.split('/').map(Number);
    assert.ok(n >= 1 && n < d);
  }
});

test('ceinture 3 : partie entière correcte et jamais une fraction dont le numérateur est multiple du dénominateur', () => {
  const rng = mulberry32(15);
  for (let i = 0; i < N; i++) {
    const item = genererItem(3, rng);
    const m = item.enonce.match(/partie entière de la fraction (\d+)\/(\d+) \?/);
    if (!m) continue;
    const num = Number(m[1]);
    const den = Number(m[2]);
    assert.notEqual(num % den, 0);
    assert.equal(item.reponse, String(Math.floor(num / den)));
  }
});

test('ceinture 3 : fraction égale à un entier est bien un multiple exact', () => {
  const rng = mulberry32(16);
  for (let i = 0; i < N; i++) {
    const item = genererItem(3, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+) est égal à quel nombre entier \?$/);
    if (!m) continue;
    const num = Number(m[1]);
    const den = Number(m[2]);
    assert.equal(num % den, 0);
    assert.equal(item.reponse, String(num / den));
  }
});

test('ceinture 4 : comparaison à 1/2 est mathématiquement correcte', () => {
  const rng = mulberry32(17);
  for (let i = 0; i < N; i++) {
    const item = genererItem(4, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+)  \?  1\/2$/);
    if (!m) continue;
    const n = Number(m[1]);
    const d = Number(m[2]);
    const attendu = 2 * n < d ? '<' : 2 * n > d ? '>' : '=';
    assert.equal(item.reponse, attendu);
  }
});

test('ceinture 4 : comparaison à 1 est mathématiquement correcte', () => {
  const rng = mulberry32(18);
  for (let i = 0; i < N; i++) {
    const item = genererItem(4, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+)  \?  1$/);
    if (!m) continue;
    const n = Number(m[1]);
    const d = Number(m[2]);
    const attendu = n < d ? '<' : n > d ? '>' : '=';
    assert.equal(item.reponse, attendu);
  }
});

test('ceinture 5 : comparaison même dénominateur correcte', () => {
  const rng = mulberry32(19);
  for (let i = 0; i < N; i++) {
    const item = genererItem(5, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+)  \?  (\d+)\/\2$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = Number(m[3]);
    const attendu = a < b ? '<' : a > b ? '>' : '=';
    assert.equal(item.reponse, attendu);
  }
});

test('ceinture 5 : comparaison même numérateur correcte (plus le dénominateur est grand, plus la part est petite)', () => {
  const rng = mulberry32(20);
  for (let i = 0; i < N; i++) {
    const item = genererItem(5, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+)  \?  \1\/(\d+)$/);
    if (!m) continue;
    const d1 = Number(m[2]);
    const d2 = Number(m[3]);
    const attendu = d1 < d2 ? '>' : d1 > d2 ? '<' : '=';
    assert.equal(item.reponse, attendu);
  }
});

test('ceinture 6 : écriture décimale correspond bien à la fraction décimale', () => {
  const rng = mulberry32(21);
  for (let i = 0; i < N; i++) {
    const item = genererItem(6, rng);
    const m = item.enonce.match(/^Écris (\d+)\/(\d+) en écriture décimale\.$/);
    if (!m) continue;
    const n = Number(m[1]);
    const d = Number(m[2]);
    const attendu = Math.abs(n / d - parseFloat(item.reponse.replace(',', '.'))) < 1e-9;
    assert.ok(attendu);
  }
});

test('ceinture 6 : fraction décimale reconstituée depuis une écriture décimale', () => {
  const rng = mulberry32(22);
  for (let i = 0; i < N; i++) {
    const item = genererItem(6, rng);
    const m = item.enonce.match(/^Écris (0,\d+) sous forme de fraction décimale\.$/);
    if (!m) continue;
    const decimal = parseFloat(m[1].replace(',', '.'));
    const [n, d] = item.reponse.split('/').map(Number);
    assert.ok(Math.abs(n / d - decimal) < 1e-9);
    assert.ok(d === 10 || d === 100);
  }
});

test('ceinture 7 : la somme des deux fractions de même dénominateur est exacte', () => {
  const rng = mulberry32(23);
  for (let i = 0; i < N; i++) {
    const item = genererItem(7, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+) \+ (\d+)\/\2 = \?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const d = Number(m[2]);
    const b = Number(m[3]);
    assert.equal(item.reponse, `${a + b}/${d}`);
  }
});

test('ceinture 8 : équivalence — la réponse a bien la même valeur que la fraction de départ, les distracteurs non', () => {
  const rng = mulberry32(24);
  for (let i = 0; i < N; i++) {
    const item = genererItem(8, rng);
    const m = item.enonce.match(/^Quelle fraction est égale à (\d+)\/(\d+) \?$/);
    if (!m) continue;
    const n0 = Number(m[1]);
    const d0 = Number(m[2]);
    const [rn, rd] = item.reponse.split('/').map(Number);
    assert.equal(n0 * rd, rn * d0);
    item.choix.forEach((c) => {
      if (c === item.reponse) return;
      const [cn, cd] = c.split('/').map(Number);
      assert.notEqual(n0 * cd, cn * d0, `le distracteur ${c} a la même valeur que ${n0}/${d0}`);
    });
  }
});

test('ceinture 8 : multiplication entier × fraction est exacte', () => {
  const rng = mulberry32(25);
  for (let i = 0; i < N; i++) {
    const item = genererItem(8, rng);
    const m = item.enonce.match(/^(\d+) × (\d+)\/(\d+) = \?$/);
    if (!m) continue;
    const k = Number(m[1]);
    const n = Number(m[2]);
    const d = Number(m[3]);
    assert.equal(item.reponse, `${k * n}/${d}`);
  }
});
