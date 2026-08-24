// Aide à la synchronisation cloud via l'API REST Firestore (pas de SDK à
// charger : de simples requêtes HTTP, ce qui garde l'appli légère). Toutes
// les fonctions ici sont pures — elles construisent des requêtes ou
// interprètent des réponses, sans jamais appeler fetch elles-mêmes. Cela
// permet de les tester sans connexion ni projet Firebase réel ; l'appel
// réseau lui-même est fait dans le code de l'application, une fois la
// configuration (projectId, apiKey) renseignée par l'enseignant.

export function estConfigure(config) {
  return !!(config && config.projectId && config.apiKey);
}

// --- Encodage / décodage des valeurs au format REST Firestore -----------

export function encoderValeur(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encoderValeur) } };
  if (typeof v === 'object') return { mapValue: { fields: encoderChamps(v) } };
  throw new Error('Type non pris en charge pour Firestore : ' + typeof v);
}

export function encoderChamps(objetJS) {
  var champs = {};
  Object.keys(objetJS || {}).forEach(function (k) { champs[k] = encoderValeur(objetJS[k]); });
  return champs;
}

export function decoderValeur(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decoderValeur);
  if ('mapValue' in v) return decoderChamps(v.mapValue.fields || {});
  return null;
}

export function decoderChamps(champs) {
  var obj = {};
  Object.keys(champs || {}).forEach(function (k) { obj[k] = decoderValeur(champs[k]); });
  return obj;
}

// --- Construction des requêtes REST --------------------------------------

function urlBase(config) {
  return 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents';
}

export function construireUrlDocument(config, chemin) {
  return urlBase(config) + '/' + chemin;
}

export function construireRequeteEcriture(config, chemin, objetJS, idToken) {
  var entetes = { 'Content-Type': 'application/json' };
  if (idToken) entetes.Authorization = 'Bearer ' + idToken;
  return {
    url: construireUrlDocument(config, chemin) + '?key=' + config.apiKey,
    methode: 'PATCH',
    entetes: entetes,
    corps: JSON.stringify({ fields: encoderChamps(objetJS) }),
  };
}

export function construireRequeteLecture(config, chemin, idToken) {
  var entetes = {};
  if (idToken) entetes.Authorization = 'Bearer ' + idToken;
  return {
    url: construireUrlDocument(config, chemin) + '?key=' + config.apiKey,
    methode: 'GET',
    entetes: entetes,
  };
}

export function construireRequeteListe(config, cheminCollection, idToken) {
  var entetes = {};
  if (idToken) entetes.Authorization = 'Bearer ' + idToken;
  return {
    url: urlBase(config) + '/' + cheminCollection + '?key=' + config.apiKey,
    methode: 'GET',
    entetes: entetes,
  };
}

export function construireRequeteConnexionAnonyme(config) {
  return {
    url: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + config.apiKey,
    methode: 'POST',
    entetes: { 'Content-Type': 'application/json' },
    corps: JSON.stringify({ returnSecureToken: true }),
  };
}

// --- Interprétation des réponses -----------------------------------------

export function analyserDocument(reponseJSON) {
  if (!reponseJSON || !reponseJSON.fields) return null;
  return decoderChamps(reponseJSON.fields);
}

export function analyserListeDocuments(reponseJSON) {
  var resultat = {};
  (reponseJSON && reponseJSON.documents || []).forEach(function (doc) {
    var segments = doc.name.split('/');
    var id = segments[segments.length - 1];
    resultat[id] = decoderChamps(doc.fields || {});
  });
  return resultat;
}

export function analyserReponseConnexion(reponseJSON) {
  if (!reponseJSON || !reponseJSON.idToken) return null;
  return { idToken: reponseJSON.idToken, localId: reponseJSON.localId };
}
