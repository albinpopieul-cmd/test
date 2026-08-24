// Système de badges : récompenses affichées à l'élève en plus des ceintures.
// Fonctions pures, indépendantes du stockage — calculées à la volée à partir
// des données d'un élève (store.eleves[nom]).

export const BADGES = [
  { id: 'ceinture-1', type: 'ceinture', numero: 1, nom: 'Blanche', description: 'Ceinture Blanche obtenue', icone: '🥋' },
  { id: 'ceinture-2', type: 'ceinture', numero: 2, nom: 'Jaune', description: 'Ceinture Jaune obtenue', icone: '🥋' },
  { id: 'ceinture-3', type: 'ceinture', numero: 3, nom: 'Orange', description: 'Ceinture Orange obtenue', icone: '🥋' },
  { id: 'ceinture-4', type: 'ceinture', numero: 4, nom: 'Verte', description: 'Ceinture Verte obtenue', icone: '🥋' },
  { id: 'ceinture-5', type: 'ceinture', numero: 5, nom: 'Bleue', description: 'Ceinture Bleue obtenue', icone: '🥋' },
  { id: 'ceinture-6', type: 'ceinture', numero: 6, nom: 'Marron', description: 'Ceinture Marron obtenue', icone: '🥋' },
  { id: 'ceinture-7', type: 'ceinture', numero: 7, nom: 'Noire', description: 'Ceinture Noire obtenue', icone: '🥋' },
  { id: 'ceinture-8', type: 'ceinture', numero: 8, nom: 'Rouge', description: 'Ceinture Rouge obtenue', icone: '🥋' },
  { id: 'premier-coup', type: 'bonus', nom: 'Premier coup', description: 'Une ceinture validée dès la première tentative', icone: '🎯' },
  { id: 'sans-faute', type: 'bonus', nom: 'Sans-faute', description: 'Un sans-faute sur une ceinture', icone: '⭐' },
  { id: 'perseverant', type: 'bonus', nom: 'Persévérant', description: '30 tentatives cumulées, on ne lâche rien', icone: '💪' },
  { id: 'toutes-ceintures', type: 'bonus', nom: 'Maître du calcul mental', description: 'Les 8 ceintures obtenues', icone: '🏆' },
];

const SEUIL_PERSEVERANCE = 30;

export function calculerBadgesObtenus(donneesEleve, ceintures, nbQuestions) {
  donneesEleve = donneesEleve || {};
  const obtenus = new Set();
  let toutesValidees = ceintures.length > 0;
  let totalTentatives = 0;

  ceintures.forEach((c) => {
    const info = donneesEleve[c.numero];
    if (!info) { toutesValidees = false; return; }
    totalTentatives += info.tentatives || 0;
    if (info.valide) {
      obtenus.add('ceinture-' + c.numero);
      if (info.meilleurScore === nbQuestions) obtenus.add('sans-faute');
      if (info.tentatives === 1) obtenus.add('premier-coup');
    } else {
      toutesValidees = false;
    }
  });

  if (toutesValidees) obtenus.add('toutes-ceintures');
  if (totalTentatives >= SEUIL_PERSEVERANCE) obtenus.add('perseverant');

  return BADGES.filter((b) => obtenus.has(b.id));
}
