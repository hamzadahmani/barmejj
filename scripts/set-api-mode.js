const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const urls = {
  // 10.0.2.2 désigne le PC hôte depuis l'émulateur Android.
  local: 'http://10.0.2.2:8091',
  online: 'https://barmej-backend.onrender.com',
};

if (!Object.prototype.hasOwnProperty.call(urls, mode)) {
  console.error('Mode invalide. Utilisez "local" ou "online".');
  process.exit(1);
}

const destination = path.join(__dirname, '..', 'src', 'config', 'api.ts');
const content = `/**
 * Fichier généré par scripts/set-api-mode.js.
 * Utilisez les commandes npm/yarn prévues dans package.json au lieu de
 * modifier cette valeur manuellement.
 */
export const API_URI = '${urls[mode]}';
export const API_MODE: 'local' | 'online' = '${mode}';
`;

fs.mkdirSync(path.dirname(destination), {recursive: true});
fs.writeFileSync(destination, content, 'utf8');
console.log(`API ${mode}: ${urls[mode]}`);
