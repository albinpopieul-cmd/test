import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estConfigure,
  encoderValeur,
  decoderValeur,
  encoderChamps,
  decoderChamps,
  construireUrlDocument,
  construireRequeteEcriture,
  construireRequeteLecture,
  construireRequeteListe,
  construireRequeteConnexionAnonyme,
  analyserDocument,
  analyserListeDocuments,
  analyserReponseConnexion,
} from './sync.mjs';

test('estConfigure : faux tant que projectId/apiKey manquent', () => {
  assert.equal(estConfigure(null), false);
  assert.equal(estConfigure({}), false);
  assert.equal(estConfigure({ projectId: 'x' }), false);
  assert.equal(estConfigure({ projectId: 'x', apiKey: 'y' }), true);
});

test('encoderValeur : types simples', () => {
  assert.deepEqual(encoderValeur('Alice'), { stringValue: 'Alice' });
  assert.deepEqual(encoderValeur(8), { integerValue: '8' });
  assert.deepEqual(encoderValeur(8.5), { doubleValue: 8.5 });
  assert.deepEqual(encoderValeur(true), { booleanValue: true });
  assert.deepEqual(encoderValeur(null), { nullValue: null });
});

test('encoderValeur : tableau et objet imbriqués', () => {
  const encode = encoderValeur({ a: 1, b: ['x', 'y'], c: { d: true } });
  assert.deepEqual(encode, {
    mapValue: {
      fields: {
        a: { integerValue: '1' },
        b: { arrayValue: { values: [{ stringValue: 'x' }, { stringValue: 'y' }] } },
        c: { mapValue: { fields: { d: { booleanValue: true } } } },
      },
    },
  });
});

test('decoderValeur : inverse exactement encoderValeur pour tous les types', () => {
  const valeurs = ['texte', 42, 3.14, true, false, null, ['a', 'b', 3], { x: 1, y: { z: 2 } }];
  valeurs.forEach((v) => {
    assert.deepEqual(decoderValeur(encoderValeur(v)), v);
  });
});

test('encoderChamps / decoderChamps : aller-retour sur un objet élève complet', () => {
  const donnees = {
    3: { meilleurScore: 9, valide: true, tentatives: 2, date: '2026-08-24T10:00:00.000Z' },
  };
  const champs = encoderChamps(donnees);
  const retour = decoderChamps(champs);
  assert.deepEqual(retour, donnees);
});

test('construireUrlDocument : chemin correct', () => {
  const url = construireUrlDocument({ projectId: 'mon-projet' }, 'classes/ABC12/scores/Alice');
  assert.equal(url, 'https://firestore.googleapis.com/v1/projects/mon-projet/databases/(default)/documents/classes/ABC12/scores/Alice');
});

test('construireRequeteEcriture : PATCH avec fields encodés et clé API en query', () => {
  const req = construireRequeteEcriture({ projectId: 'p', apiKey: 'K' }, 'classes/ABC/scores/Alice', { meilleurScore: 9 });
  assert.equal(req.methode, 'PATCH');
  assert.ok(req.url.includes('key=K'));
  assert.ok(req.url.includes('classes/ABC/scores/Alice'));
  assert.deepEqual(JSON.parse(req.corps), { fields: { meilleurScore: { integerValue: '9' } } });
  assert.equal(req.entetes.Authorization, undefined);
});

test('construireRequeteEcriture : ajoute l\'en-tête Authorization si un idToken est fourni', () => {
  const req = construireRequeteEcriture({ projectId: 'p', apiKey: 'K' }, 'x', {}, 'MON_TOKEN');
  assert.equal(req.entetes.Authorization, 'Bearer MON_TOKEN');
});

test('construireRequeteLecture / construireRequeteListe : méthode GET', () => {
  const lecture = construireRequeteLecture({ projectId: 'p', apiKey: 'K' }, 'classes/ABC');
  assert.equal(lecture.methode, 'GET');
  const liste = construireRequeteListe({ projectId: 'p', apiKey: 'K' }, 'classes/ABC/scores');
  assert.equal(liste.methode, 'GET');
  assert.ok(liste.url.endsWith('classes/ABC/scores?key=K'));
});

test('construireRequeteConnexionAnonyme : POST vers Identity Toolkit', () => {
  const req = construireRequeteConnexionAnonyme({ projectId: 'p', apiKey: 'K' });
  assert.equal(req.methode, 'POST');
  assert.ok(req.url.startsWith('https://identitytoolkit.googleapis.com/'));
  assert.deepEqual(JSON.parse(req.corps), { returnSecureToken: true });
});

test('analyserDocument : extrait les champs décodés, null si absent', () => {
  const reponse = { fields: { nom: { stringValue: 'Alice' }, score: { integerValue: '9' } } };
  assert.deepEqual(analyserDocument(reponse), { nom: 'Alice', score: 9 });
  assert.equal(analyserDocument(null), null);
  assert.equal(analyserDocument({}), null);
});

test('analyserListeDocuments : indexe par id de document (dernier segment du chemin)', () => {
  const reponse = {
    documents: [
      { name: 'projects/p/databases/(default)/documents/classes/ABC/scores/Alice', fields: { meilleurScore: { integerValue: '9' } } },
      { name: 'projects/p/databases/(default)/documents/classes/ABC/scores/Bilal', fields: { meilleurScore: { integerValue: '5' } } },
    ],
  };
  assert.deepEqual(analyserListeDocuments(reponse), {
    Alice: { meilleurScore: 9 },
    Bilal: { meilleurScore: 5 },
  });
});

test('analyserListeDocuments : liste vide ou absente -> objet vide', () => {
  assert.deepEqual(analyserListeDocuments({}), {});
  assert.deepEqual(analyserListeDocuments(null), {});
});

test('analyserReponseConnexion : extrait idToken/localId, null si absent', () => {
  assert.deepEqual(analyserReponseConnexion({ idToken: 'T', localId: 'L' }), { idToken: 'T', localId: 'L' });
  assert.equal(analyserReponseConnexion({}), null);
  assert.equal(analyserReponseConnexion(null), null);
});
