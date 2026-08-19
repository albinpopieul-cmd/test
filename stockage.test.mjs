import test from 'node:test';
import assert from 'node:assert/strict';
import {
  creerStockageVide,
  definirCode,
  verifierCode,
  ajouterEleve,
  retirerEleve,
  reinitialiserScoresEleve,
  enregistrerScore,
  fusionnerStockages,
  genererCSV,
} from './stockage.mjs';

test('creerStockageVide donne une structure vide cohérente', () => {
  const store = creerStockageVide();
  assert.equal(store.code, null);
  assert.deepEqual(store.roster, []);
  assert.deepEqual(store.eleves, {});
});

test('definirCode / verifierCode : cycle complet', () => {
  let store = creerStockageVide();
  assert.equal(verifierCode(store, '1234'), false);
  store = definirCode(store, '1234');
  assert.equal(verifierCode(store, '1234'), true);
  assert.equal(verifierCode(store, ' 1234 '), true);
  assert.equal(verifierCode(store, '0000'), false);
});

test('ajouterEleve ajoute, ignore les doublons et les chaînes vides', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, 'Alice');
  store = ajouterEleve(store, 'Bilal');
  store = ajouterEleve(store, 'Alice');
  store = ajouterEleve(store, '   ');
  assert.deepEqual(store.roster, ['Alice', 'Bilal']);
});

test('ajouterEleve retire les espaces superflus', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, '  Chloé  ');
  assert.deepEqual(store.roster, ['Chloé']);
});

test('retirerEleve supprime l\'élève de la liste et ses scores', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, 'Alice');
  store = enregistrerScore(store, 'Alice', 1, 9, 8);
  store = retirerEleve(store, 'Alice');
  assert.deepEqual(store.roster, []);
  assert.equal(store.eleves.Alice, undefined);
});

test('enregistrerScore : première tentative sous le seuil ne valide pas', () => {
  let store = creerStockageVide();
  store = enregistrerScore(store, 'Alice', 1, 5, 8);
  const info = store.eleves.Alice[1];
  assert.equal(info.meilleurScore, 5);
  assert.equal(info.valide, false);
  assert.equal(info.tentatives, 1);
  assert.equal(info.date, null);
});

test('enregistrerScore : ajoute automatiquement l\'élève au roster', () => {
  let store = creerStockageVide();
  store = enregistrerScore(store, 'Bilal', 2, 10, 8);
  assert.deepEqual(store.roster, ['Bilal']);
});

test('enregistrerScore : le meilleur score progresse, ne redescend jamais', () => {
  let store = creerStockageVide();
  store = enregistrerScore(store, 'Alice', 1, 9, 8);
  store = enregistrerScore(store, 'Alice', 1, 4, 8);
  assert.equal(store.eleves.Alice[1].meilleurScore, 9);
  assert.equal(store.eleves.Alice[1].tentatives, 2);
});

test('enregistrerScore : la validation reste acquise même si une tentative suivante échoue', () => {
  let store = creerStockageVide();
  store = enregistrerScore(store, 'Alice', 1, 9, 8);
  assert.equal(store.eleves.Alice[1].valide, true);
  const dateValidation = store.eleves.Alice[1].date;
  assert.ok(dateValidation);
  store = enregistrerScore(store, 'Alice', 1, 2, 8);
  assert.equal(store.eleves.Alice[1].valide, true);
  assert.equal(store.eleves.Alice[1].date, dateValidation, 'la date de validation ne doit pas changer');
});

test('reinitialiserScoresEleve efface les scores mais garde l\'élève dans la liste', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, 'Alice');
  store = enregistrerScore(store, 'Alice', 1, 9, 8);
  store = reinitialiserScoresEleve(store, 'Alice');
  assert.deepEqual(store.roster, ['Alice']);
  assert.equal(store.eleves.Alice, undefined);
});

test('fusionnerStockages : union des listes d\'élèves, ordre local puis nouveaux', () => {
  let a = creerStockageVide();
  a = ajouterEleve(a, 'Alice');
  a = ajouterEleve(a, 'Bilal');
  let b = creerStockageVide();
  b = ajouterEleve(b, 'Chloé');
  b = ajouterEleve(b, 'Alice');
  const fusion = fusionnerStockages(a, b);
  assert.deepEqual(fusion.roster, ['Alice', 'Bilal', 'Chloé']);
});

test('fusionnerStockages : conserve le meilleur score et la validation la plus favorable', () => {
  let a = creerStockageVide();
  a = enregistrerScore(a, 'Alice', 3, 6, 8);
  let b = creerStockageVide();
  b = enregistrerScore(b, 'Alice', 3, 9, 8);
  const fusion = fusionnerStockages(a, b);
  assert.equal(fusion.eleves.Alice[3].meilleurScore, 9);
  assert.equal(fusion.eleves.Alice[3].valide, true);
  assert.equal(fusion.eleves.Alice[3].tentatives, 2);
});

test('fusionnerStockages : garde le code enseignant local, pas celui importé', () => {
  let a = definirCode(creerStockageVide(), '1111');
  let b = definirCode(creerStockageVide(), '2222');
  const fusion = fusionnerStockages(a, b);
  assert.equal(fusion.code, '1111');
});

test('fusionnerStockages : un élève présent dans un seul store est repris tel quel', () => {
  let a = creerStockageVide();
  a = enregistrerScore(a, 'Alice', 1, 9, 8);
  let b = creerStockageVide();
  const fusion = fusionnerStockages(a, b);
  assert.equal(fusion.eleves.Alice[1].meilleurScore, 9);
});

test('genererCSV : en-tête avec 8 ceintures + colonne élève', () => {
  const store = creerStockageVide();
  const csv = genererCSV(store);
  const premiereLigne = csv.split('\r\n')[0];
  assert.equal(premiereLigne.split(';').length, 9);
});

test('genererCSV : cellules vides pour les ceintures non tentées, formatées sinon', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, 'Alice');
  store = enregistrerScore(store, 'Alice', 1, 9, 8); // validée
  store = enregistrerScore(store, 'Alice', 2, 3, 8); // non validée
  const lignes = genererCSV(store).split('\r\n');
  const ligneAlice = lignes[1].split(';');
  assert.equal(ligneAlice[0], 'Alice');
  assert.equal(ligneAlice[1], 'Validée (9/10)');
  assert.equal(ligneAlice[2], '3/10');
  assert.equal(ligneAlice[3], '');
});

test('genererCSV : échappe les points-virgules et guillemets dans les noms', () => {
  let store = creerStockageVide();
  store = ajouterEleve(store, 'Jean "JJ"; Dupont');
  const premiereLigneEleve = genererCSV(store).split('\r\n')[1];
  assert.equal(premiereLigneEleve.startsWith('"Jean ""JJ""; Dupont"'), true);
});
