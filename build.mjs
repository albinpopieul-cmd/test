// Construit ceintures.html en injectant le code testé de generateurs.mjs et
// stockage.mjs (dépouillés des mots-clés `import`/`export`) dans le gabarit
// ceintures.template.html.
import { readFileSync, writeFileSync } from 'node:fs';

function inline(cheminModule) {
  const source = readFileSync(new URL(cheminModule, import.meta.url), 'utf8');
  return source
    .split('\n')
    .filter((ligne) => !ligne.startsWith('//') || ligne.includes('---'))
    .filter((ligne) => !ligne.startsWith('import '))
    .join('\n')
    .replace(/^export function/gm, 'function')
    .replace(/^export const/gm, 'const')
    .trim();
}

const codeGenerateurs = inline('./generateurs.mjs');
const codeStockage = inline('./stockage.mjs');
const codeBadges = inline('./badges.mjs');
const gabarit = readFileSync(new URL('./ceintures.template.html', import.meta.url), 'utf8');

const sortie = gabarit
  .replace('__GENERATEURS__', codeGenerateurs)
  .replace('__STOCKAGE__', codeStockage)
  .replace('__BADGES__', codeBadges);

writeFileSync(new URL('./ceintures.html', import.meta.url), sortie);
console.log('ceintures.html généré (' + sortie.length + ' octets).');
