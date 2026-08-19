// Construit ceintures.html en injectant le code testé de generateurs.mjs
// (dépouillé des mots-clés `export`) dans le gabarit ceintures.template.html.
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('./generateurs.mjs', import.meta.url), 'utf8');
const gabarit = readFileSync(new URL('./ceintures.template.html', import.meta.url), 'utf8');

const codeInline = source
  .split('\n')
  .filter((ligne) => !ligne.startsWith('//') || ligne.includes('---'))
  .join('\n')
  .replace(/^export function/gm, 'function')
  .replace(/^export const/gm, 'const');

const sortie = gabarit.replace('__GENERATEURS__', codeInline.trim());

writeFileSync(new URL('./ceintures.html', import.meta.url), sortie);
console.log('ceintures.html généré (' + sortie.length + ' octets).');
