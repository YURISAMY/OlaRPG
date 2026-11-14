const fs = require('fs');
const path = require('path');

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'Livro base.html'), 'utf8');

const scriptRegex = /<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
let match;
const parsedItems = [];
const nameOccurrences = {};

while ((match = scriptRegex.exec(html)) !== null) {
  const jsonStr = match[1].trim();
  const scriptIndex = match.index;
  try {
    const data = JSON.parse(jsonStr);
    if (!data.id) continue;
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
    const norm = name ? name.toLowerCase().trim() : '';
    const noAcc = norm ? norm.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    parsedItems.push({ data, name, norm, noAcc, id: data.id });
    if (norm) {
      nameOccurrences[norm] = (nameOccurrences[norm] || 0) + 1;
      if (noAcc && noAcc !== norm) {
        nameOccurrences[noAcc] = (nameOccurrences[noAcc] || 0) + 1;
      }
    }
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
  }
}

const catalog = {};
let count = 0;
const ambiguous = {};

parsedItems.forEach(item => {
  const { data, id, norm, noAcc } = item;
  count++;

  // 1. Sempre indexa pelo ID único e imutável
  catalog[id] = data;
  const idNorm = id.toLowerCase().trim();
  catalog[idNorm] = data;
  const idNoAcc = idNorm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (idNoAcc !== idNorm) catalog[idNoAcc] = data;

  // 2. Se o ID tiver prefixo de classe (ex: guerreiro-golpe-brutal), também mapeia classe:nome
  const idParts = idNorm.split('-');
  if (idParts.length > 1 && norm) {
    const classPrefix = idParts[0];
    catalog[`${classPrefix}:${norm}`] = data;
    if (noAcc) catalog[`${classPrefix}:${noAcc}`] = data;
  }

  // 3. Para busca por nome: só mapeia o nome simples global se NÃO houver colisão de nomes
  if (norm) {
    if (nameOccurrences[norm] === 1) {
      catalog[norm] = data;
      if (noAcc) catalog[noAcc] = data;
    } else {
      if (!ambiguous[norm]) ambiguous[norm] = [];
      ambiguous[norm].push(id);
    }
  }
});

catalog['_ambiguous'] = ambiguous;

const outContent = 'window.OLARPG_MEC_CATALOG = ' + JSON.stringify(catalog) + ';\n';
fs.writeFileSync(path.join(dir, 'olarpg-catalog.js'), outContent, 'utf8');

console.log('Successfully generated olarpg-catalog.js with', count, 'mechanics.');
console.log('Ambiguous names avoided from global collision:', Object.keys(ambiguous));
console.log('Sample verified: guerreiro-golpe-brutal:', !!catalog['guerreiro-golpe-brutal']);
console.log('Sample verified: raio-tracante:', !!catalog['raio-tracante']);
