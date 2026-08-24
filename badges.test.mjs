import test from 'node:test';
import assert from 'node:assert/strict';
import { BADGES, calculerBadgesObtenus } from './badges.mjs';

const CEINTURES_TEST = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ numero: n }));
const NB_QUESTIONS = 10;

function badge(donnees) {
  return calculerBadgesObtenus(donnees, CEINTURES_TEST, NB_QUESTIONS).map((b) => b.id);
}

test('aucune donnée : aucun badge', () => {
  assert.deepEqual(badge({}), []);
});

test('une ceinture validée sans autre condition : seul le badge de ceinture', () => {
  const ids = badge({ 3: { valide: true, meilleurScore: 8, tentatives: 3 } });
  assert.deepEqual(ids, ['ceinture-3']);
});

test('ceinture non validée : aucun badge', () => {
  const ids = badge({ 3: { valide: false, meilleurScore: 5, tentatives: 2 } });
  assert.deepEqual(ids, []);
});

test('score parfait sur une ceinture validée : badge sans-faute en plus', () => {
  const ids = badge({ 2: { valide: true, meilleurScore: 10, tentatives: 4 } });
  assert.ok(ids.includes('ceinture-2'));
  assert.ok(ids.includes('sans-faute'));
});

test('score parfait mais ceinture non validée : pas de sans-faute (cas impossible en pratique mais on vérifie la logique)', () => {
  const ids = badge({ 2: { valide: false, meilleurScore: 10, tentatives: 1 } });
  assert.ok(!ids.includes('sans-faute'));
});

test('validation dès la première tentative : badge premier-coup', () => {
  const ids = badge({ 5: { valide: true, meilleurScore: 8, tentatives: 1 } });
  assert.ok(ids.includes('premier-coup'));
});

test('validation à la deuxième tentative : pas de badge premier-coup', () => {
  const ids = badge({ 5: { valide: true, meilleurScore: 9, tentatives: 2 } });
  assert.ok(!ids.includes('premier-coup'));
});

test('les 8 ceintures validées : badge toutes-ceintures + les 8 badges de ceinture', () => {
  const donnees = {};
  for (let i = 1; i <= 8; i++) donnees[i] = { valide: true, meilleurScore: 8, tentatives: 2 };
  const ids = badge(donnees);
  assert.ok(ids.includes('toutes-ceintures'));
  for (let i = 1; i <= 8; i++) assert.ok(ids.includes('ceinture-' + i));
});

test('7 ceintures sur 8 validées : pas de badge toutes-ceintures', () => {
  const donnees = {};
  for (let i = 1; i <= 7; i++) donnees[i] = { valide: true, meilleurScore: 8, tentatives: 2 };
  assert.ok(!badge(donnees).includes('toutes-ceintures'));
});

test('30 tentatives cumulées sans validation : badge persévérant seul', () => {
  const donnees = {
    1: { valide: false, meilleurScore: 6, tentatives: 15 },
    2: { valide: false, meilleurScore: 7, tentatives: 15 },
  };
  assert.deepEqual(badge(donnees), ['perseverant']);
});

test('29 tentatives cumulées : pas encore de badge persévérant', () => {
  const donnees = { 1: { valide: false, meilleurScore: 6, tentatives: 29 } };
  assert.ok(!badge(donnees).includes('perseverant'));
});

test('BADGES contient bien 12 badges (8 ceintures + 4 bonus), tous avec un id unique', () => {
  assert.equal(BADGES.length, 12);
  const ids = new Set(BADGES.map((b) => b.id));
  assert.equal(ids.size, 12);
});
