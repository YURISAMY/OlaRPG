const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/yuri/Documents/rpg/OlaRPG';
const html = fs.readFileSync(path.join(dir, 'Livro base.html'), 'utf8');

const scriptRegex = /<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
let match;
const catalog = {};
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const jsonStr = match[1].trim();
  const scriptIndex = match.index;
  try {
    const data = JSON.parse(jsonStr);
    const preHtml = html.slice(Math.max(0, scriptIndex - 1200), scriptIndex);
    let name = null;
    const nameRegex = /class=["'](?:spell-name|skname|skill-name)["'][^>]*>([\s\S]*?)<\/(?:span|div|h3|h4)>/gi;
    let nm, lastMatch;
    while ((nm = nameRegex.exec(preHtml)) !== null) {
      lastMatch = nm[1];
    }
    if (lastMatch) {
      name = lastMatch.replace(/<[^>]+>/g, '').trim();
    }
    if (!name && data.id) {
      name = data.id.replace(/-/g, ' ');
    }
    if (name) {
      const norm = name.toLowerCase().trim();
      const noAcc = norm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      catalog[norm] = data;
      if (noAcc !== norm) catalog[noAcc] = data;
      count++;
    }
    if (data.id) {
      const idName = data.id.replace(/-/g, ' ').toLowerCase().trim();
      const idNoAcc = idName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      catalog[idName] = data;
      if (idNoAcc !== idName) catalog[idNoAcc] = data;
      const parts = idName.split(' ');
      if (parts.length > 1) {
        const withoutPrefix = parts.slice(1).join(' ');
        catalog[withoutPrefix] = data;
        const wpNoAcc = withoutPrefix.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (wpNoAcc !== withoutPrefix) catalog[wpNoAcc] = data;
      }
    }
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
  }
}

const outContent = 'window.OLARPG_MEC_CATALOG = ' + JSON.stringify(catalog) + ';\n';
fs.writeFileSync(path.join(dir, 'olarpg-catalog.js'), outContent, 'utf8');

console.log('Successfully generated olarpg-catalog.js with', count, 'mechanics.');
console.log('Golpe Brutal mapped:', !!catalog['golpe brutal'], catalog['golpe brutal']);
console.log('Salto Tático mapped:', !!catalog['salto tatico'], catalog['salto tatico']);
