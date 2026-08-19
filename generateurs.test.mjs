import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CEINTURES,
  genererItem,
  checkAnswer,
  randInt,
  pick,
  gcd,
} from './generateurs.mjs';

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
  assert.equal(gcd(9, 3), 3);
});

test('pick choisit toujours un élément du tableau', () => {
  const rng = mulberry32(2);
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < N; i++) {
    assert.ok(arr.includes(pick(arr, rng)));
  }
});

test('il y a exactement 8 ceintures numérotées 1 à 8', () => {
  assert.equal(CEINTURES.length, 8);
  CEINTURES.forEach((c, i) => {
    assert.equal(c.numero, i + 1);
    assert.ok(c.nom.length > 0);
    assert.ok(c.generateurs.length >= 3);
  });
});

for (let n = 1; n <= 8; n++) {
  test(`ceinture ${n} : chaque item généré est bien formé et sa propre réponse passe checkAnswer`, () => {
    const rng = mulberry32(100 + n);
    for (let i = 0; i < N; i++) {
      const item = genererItem(n, rng);
      assert.equal(typeof item.enonce, 'string');
      assert.ok(item.enonce.length > 0, 'énoncé vide');
      assert.ok(Array.isArray(item.accept) && item.accept.length > 0, 'accept vide');
      assert.ok(item.type === 'nombre' || item.type === 'choix', `type invalide: ${item.type}`);
      if (item.type === 'choix') {
        assert.ok(Array.isArray(item.choix) && item.choix.length > 0);
        assert.ok(item.choix.includes(item.reponse), 'la réponse doit figurer parmi les choix');
      }
      // La réponse canonique doit toujours être acceptée par checkAnswer.
      assert.ok(
        checkAnswer(item, item.reponse),
        `la réponse canonique "${item.reponse}" n'est pas acceptée pour "${item.enonce}"`
      );
    }
  });
}

test('checkAnswer accepte la virgule et le point comme séparateur décimal', () => {
  const item = { type: 'nombre', accept: ['3.5'] };
  assert.ok(checkAnswer(item, '3.5'));
  assert.ok(checkAnswer(item, '3,5'));
  assert.ok(checkAnswer(item, ' 3,5 '));
  assert.ok(!checkAnswer(item, '3,6'));
});

test('checkAnswer accepte une fraction équivalente à un décimal accepté', () => {
  const item = { type: 'nombre', accept: ['0.75'] };
  assert.ok(checkAnswer(item, '3/4'));
  assert.ok(!checkAnswer(item, '1/2'));
});

test('checkAnswer refuse une entrée non numérique pour un item de type nombre', () => {
  const item = { type: 'nombre', accept: ['5'] };
  assert.ok(!checkAnswer(item, 'abc'));
  assert.ok(!checkAnswer(item, ''));
});

test('checkAnswer (type choix) compare la casse et les espaces sans plantage', () => {
  const item = { type: 'choix', accept: ['<'], choix: ['<', '=', '>'] };
  assert.ok(checkAnswer(item, '<'));
  assert.ok(checkAnswer(item, ' < '));
  assert.ok(!checkAnswer(item, '>'));
});

// --- Vérifications de cohérence pédagogique par ceinture ------------------

test('ceinture 1 : compléments à 10 et à 100 sont exacts', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < N; i++) {
    const item = genererItem(1, rng);
    const m = item.enonce.match(/^(\d+) \+ \? = (\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const total = Number(m[2]);
      assert.equal(a + Number(item.reponse), total);
    }
  }
});

test('ceinture 3 : les divisions générées sont exactes (pas de reste)', () => {
  const rng = mulberry32(8);
  for (let i = 0; i < N; i++) {
    const item = genererItem(3, rng);
    const m = item.enonce.match(/^(\d+) ÷ (\d+) = \?$/);
    if (m) {
      const dividende = Number(m[1]);
      const diviseur = Number(m[2]);
      assert.equal(dividende % diviseur, 0);
      assert.equal(dividende / diviseur, Number(item.reponse));
    }
  }
});

test('ceinture 6 : fraction de quantité donne toujours un entier', () => {
  const rng = mulberry32(9);
  for (let i = 0; i < N; i++) {
    const item = genererItem(6, rng);
    if (item.enonce.includes(' de ')) {
      assert.ok(Number.isInteger(Number(item.reponse)), `réponse non entière: ${item.enonce} -> ${item.reponse}`);
    }
  }
});

test('ceinture 6 : somme de fractions reste inférieure ou égale à 1', () => {
  const rng = mulberry32(10);
  for (let i = 0; i < N; i++) {
    const item = genererItem(6, rng);
    const m = item.enonce.match(/^(\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/);
    if (m) {
      const [, n1, d1, n2] = m.map(Number);
      assert.ok((n1 + n2) / d1 <= 1 + 1e-9);
    }
  }
});

test('ceinture 7 : pourcentages usuels donnent un résultat entier', () => {
  const rng = mulberry32(11);
  for (let i = 0; i < N; i++) {
    const item = genererItem(7, rng);
    if (item.enonce.includes('%')) {
      assert.ok(Number.isInteger(Number(item.reponse)));
    }
  }
});

test('genererItem lève une erreur pour une ceinture hors bornes', () => {
  assert.throws(() => genererItem(0));
  assert.throws(() => genererItem(9));
});
