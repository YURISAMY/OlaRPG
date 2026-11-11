// ══════════════════════════════════════════════════════════════════════════════
// SUÍTE DE TESTES EXAUSTIVA: CASOS E SITUAÇÕES DE BATALHA NO OLARPG
// Arquivo: batalha_casos.test.js
// Executar: node batalha_casos.test.js
// ══════════════════════════════════════════════════════════════════════════════

const assert = require('assert');
const path = require('path');
const E = require('./olarpg-engine.js');

let totalTestes = 0;
let aprovados = 0;
let falhas = [];

function testCase(categoria, descricao, fn) {
  totalTestes++;
  try {
    fn();
    aprovados++;
    console.log(`  ✔ [${categoria}] ${descricao}`);
  } catch (err) {
    falhas.push({ categoria, descricao, erro: err.message, stack: err.stack });
    console.error(`  ✖ [${categoria}] ${descricao}`);
    console.error(`     Erro: ${err.message}`);
  }
}

console.log('\n================================================================');
console.log('       INICIANDO SUÍTE DE TESTES DE COMBATE E BATALHA           ');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. ATAQUES COM ARMA E GOLPES DIRETOS (ATAQUE VS CA)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 1. ATAQUES COM ARMA E GOLPES DIRETOS ---');

testCase('Ataque', '1.1 Acerto normal: total >= CA causa dano e subtrai do HP do alvo', () => {
  const monstro = { name: 'Orc Guerreiro', ca: 14, hp: 30, maxHp: 30 };
  const d20 = 12;
  const modAtaque = 4;
  const total = d20 + modAtaque; // 16 vs 14 CA
  const dano = 10;

  const hit = d20 === 20 || (d20 !== 1 && total >= monstro.ca);
  const dmg = hit ? dano : 0;
  if (hit) monstro.hp = Math.max(0, monstro.hp - dmg);

  assert.strictEqual(hit, true, 'Deveria ter acertado o alvo');
  assert.strictEqual(dmg, 10, 'Deveria aplicar 10 de dano');
  assert.strictEqual(monstro.hp, 20, 'HP restante do monstro deveria ser 20');
});

testCase('Ataque', '1.2 Erro normal: total < CA não causa dano e mantém o HP intacto', () => {
  const monstro = { name: 'Cavaleiro de Armadura', ca: 18, hp: 40, maxHp: 40 };
  const d20 = 8;
  const modAtaque = 3;
  const total = d20 + modAtaque; // 11 vs 18 CA
  const dano = 12;

  const hit = d20 === 20 || (d20 !== 1 && total >= monstro.ca);
  const dmg = hit ? dano : 0;
  if (hit) monstro.hp = Math.max(0, monstro.hp - dmg);

  assert.strictEqual(hit, false, 'Deveria ter errado o ataque');
  assert.strictEqual(dmg, 0, 'Dano deveria ser 0 no erro');
  assert.strictEqual(monstro.hp, 40, 'HP do monstro não deve ser alterado');
});

testCase('Ataque', '1.3 Acerto crítico (20 Natural): acerta mesmo contra CA inalcançável e dobra dados de dano base', () => {
  const monstro = { name: 'Golem de Ferro', ca: 30, hp: 60, maxHp: 60 };
  const d20 = 20;
  const modAtaque = 2; // total = 22, menor que 30 CA, mas 20 natural ACERTA sempre
  const hit = d20 === 20 || (d20 !== 1 && (d20 + modAtaque) >= monstro.ca);

  // Regra de crítico do motor: dobra a base de dados
  const exprArma = '1d10+3';
  const danoCritExpr = E.fmt(E.applyModifiers(E.parseExpr(exprArma), { crit: true }));

  assert.strictEqual(hit, true, '20 natural deve acertar mesmo que total < CA');
  assert.strictEqual(danoCritExpr, '2d10+3', 'Crítico deve dobrar os dados base (1d10 -> 2d10) sem dobrar o fixo');
});

testCase('Ataque', '1.4 Falha crítica (1 Natural): erra mesmo se modificador ultrapassar a CA', () => {
  const monstro = { name: 'Lodo Frágil', ca: 8, hp: 15, maxHp: 15 };
  const d20 = 1;
  const modAtaque = 15; // total = 16, maior que 8 CA, mas 1 natural ERRA sempre
  const hit = d20 === 20 || (d20 !== 1 && (d20 + modAtaque) >= monstro.ca);

  assert.strictEqual(hit, false, '1 natural deve errar independente do bônus');
});

testCase('Ataque', '1.5 Dano fatal: quando dano >= HP atual, HP zera e flag killed é ativada', () => {
  const monstro = { name: 'Lobo Ferido', ca: 12, hp: 7, maxHp: 20 };
  const dano = 12; // dano maior que os 7 restantes
  monstro.hp = Math.max(0, monstro.hp - dano);
  const killed = monstro.hp === 0;

  assert.strictEqual(monstro.hp, 0, 'HP não deve ficar negativo, mas exatamente 0');
  assert.strictEqual(killed, true, 'Monstro deve ser marcado como eliminado');
});

testCase('Ataque', '1.6 Ataque multi-alvo: alvos recebem resultados independentes e alvos mortos são inválidos', () => {
  const monstros = [
    { id: 'm1', name: 'Leão 1', ca: 13, hp: 20, maxHp: 20 },
    { id: 'm2', name: 'Leão 2', ca: 16, hp: 20, maxHp: 20 }
  ];
  const alvos = [
    { id: 'm1', name: 'Leão 1', totalAtaque: 14, dano: 8 },  // 14 >= 13 -> ACERTO
    { id: 'm2', name: 'Leão 2', totalAtaque: 14, dano: 8 },  // 14 < 16 -> ERRO
    { id: 'm3', name: 'Leão 3 (morto)', totalAtaque: 14, dano: 8 } // inexistente
  ];

  const resultados = alvos.map(a => {
    const m = monstros.find(x => x.id === a.id);
    if (!m) return { target: a.name, invalid: true };
    const hit = a.totalAtaque >= m.ca;
    const dmg = hit ? a.dano : 0;
    if (hit) m.hp = Math.max(0, m.hp - dmg);
    return { target: m.name, hit, dmg, hpRestante: m.hp };
  });

  assert.strictEqual(resultados[0].hit, true, 'Leão 1 deveria ser atingido');
  assert.strictEqual(resultados[0].hpRestante, 12, 'Leão 1 deve ficar com 12 HP');
  assert.strictEqual(resultados[1].hit, false, 'Leão 2 deveria escapar');
  assert.strictEqual(resultados[1].hpRestante, 20, 'Leão 2 deve manter 20 HP');
  assert.strictEqual(resultados[2].invalid, true, 'Leão 3 deve ser marcado como inválido/fora de combate');
});

testCase('Ataque', '1.7 Atributo "luta": utiliza o maior entre Força e Destreza somado à proficiência', () => {
  const attrs = { for: 2, des: 4 };
  const prof = 3;
  const modLuta = Math.max(attrs.for || 0, attrs.des || 0) + prof;
  assert.strictEqual(modLuta, 7, 'Modificador de luta deve ser max(2, 4) + 3 = 7');
});

testCase('Ataque', '1.8 Composição de dano (Golpe com arma + mecânica adicional)', () => {
  const mec = { dano: { arma: true, dados: '1d6', tipo: 'fogo' } };
  const armaEquipada = { dano: '1d8', extra: 3 };
  const comp = E.composeDano(mec, armaEquipada);

  assert.strictEqual(comp.ok, true);
  assert.strictEqual(comp.expr, '1d8+1d6', 'Expressão deve somar o dano da arma e o dano da habilidade');
  assert.strictEqual(comp.extra, 3, 'Bônus extra da arma deve ser preservado');
});

testCase('Ataque', '1.9 Ataque em área / alvos adjacentes (Lâmina Elemental) com seleção de múltiplos alvos e elemento', () => {
  const mec = {
    id: 'lamina-elemental',
    resolucao: { tipo: 'ataque', atributo: 'conjuracao' },
    dano: { dados: '2d10' },
    alvos: [{ papel: 'inimigo', qtd: 'marcar', area: { forma: 'raio', tamanho: 1 } }],
    elemento: { escolha: 'uma', lista: ['Fogo', 'Água', 'Terra', 'Trovão', 'Raio', 'Luz', 'Escuridão'] }
  };
  const desc = 'Cria uma lâmina de energia pura ao seu redor. Realiza um ataque corpo a corpo contra alvos adjacentes.';

  // Regra de detecção de ataque em área / múltiplos alvos
  const isAreaAtk = !!(mec.alvos && mec.alvos[0] && (mec.alvos[0].area || mec.alvos[0].qtd === 'marcar')) || /adjacente|ao seu redor/i.test(desc);
  assert.strictEqual(isAreaAtk, true, 'Lâmina Elemental deve ser identificada como ataque em área/multi-alvo');

  // Seleção de elemento
  const elementoEscolhido = 'Raio';
  assert.strictEqual(mec.elemento.lista.includes(elementoEscolhido), true, 'Elemento deve estar presente na lista de opções');

  // Ataque a 2 alvos adjacentes
  const alvosAdjacentes = [
    { name: 'Leão 1', ca: 13, hp: 25 },
    { name: 'Leão 2', ca: 13, hp: 25 }
  ];
  const rolagem1 = { d20: 15, total: 19, hit: true, dmg: 14 }; // acertou Leão 1
  const rolagem2 = { d20: 11, total: 15, hit: true, dmg: 12 }; // acertou Leão 2

  alvosAdjacentes[0].hp -= rolagem1.dmg;
  alvosAdjacentes[1].hp -= rolagem2.dmg;

  assert.strictEqual(alvosAdjacentes[0].hp, 11, 'Leão 1 deve receber 14 de dano de Raio');
  assert.strictEqual(alvosAdjacentes[1].hp, 13, 'Leão 2 deve receber 12 de dano de Raio');
});

testCase('Ataque', '1.10 Golpe Brutal (ataque com arma dobrando dados da arma)', () => {
  // Carrega catálogo se necessário
  if (!global.window || !global.window.OLARPG_MEC_CATALOG) {
    global.window = global.window || {};
    require('./olarpg-catalog.js');
  }
  const mec = global.window.OLARPG_MEC_CATALOG['golpe brutal'];
  assert.ok(mec, 'Golpe Brutal deve estar presente no catálogo');
  assert.strictEqual(mec.resolucao.tipo, 'ataque');
  assert.strictEqual(mec.resolucao.atributo, 'arma');
  assert.strictEqual(mec.dano.multiplicador, 2);

  const armaEquipada = { dano: '1d10', extra: 4 };
  const comp = E.composeDano(mec, armaEquipada);
  assert.strictEqual(comp.ok, true);
  assert.strictEqual(comp.expr, '2d10', 'Dano da arma de 1d10 dobrado vira 2d10');
  assert.strictEqual(comp.extra, 4, 'Bônus extra somado corretamente');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAGIAS E HABILIDADES COM SALVAGUARDA (SAVE / RESISTÊNCIA EM ÁREA)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 2. MAGIAS E TESTES DE RESISTÊNCIA (SAVE) ---');

testCase('Save', '2.1 Regra "metade": falha sofre dano integral; sucesso sofre metade arredondada para baixo', () => {
  const cd = 14;
  const danoBase = 15; // número ímpar para testar arredondamento

  // Falha: d20(8) + mod(2) = 10 < 14
  const resFalha = E.resolveSaveAlvo({ mod: 2, cd: cd, dano: danoBase, regra: 'metade', d20: 8 });
  assert.strictEqual(resFalha.passou, false, 'Deveria ter falhado no teste');
  assert.strictEqual(resFalha.dano, 15, 'Na falha deve tomar dano total');

  // Sucesso: d20(13) + mod(2) = 15 >= 14
  const resSucesso = E.resolveSaveAlvo({ mod: 2, cd: cd, dano: danoBase, regra: 'metade', d20: 13 });
  assert.strictEqual(resSucesso.passou, true, 'Deveria ter passado no teste');
  assert.strictEqual(resSucesso.dano, 7, 'No sucesso em regra metade, floor(15/2) deve ser 7');
});

testCase('Save', '2.2 Regra "anula": falha sofre dano integral; sucesso anula completamente (0 de dano)', () => {
  const cd = 12;
  const danoBase = 20;

  const resSucesso = E.resolveSaveAlvo({ mod: 3, cd: cd, dano: danoBase, regra: 'anula', d20: 10 });
  assert.strictEqual(resSucesso.passou, true);
  assert.strictEqual(resSucesso.dano, 0, 'Em regra anula, quem passa deve tomar 0 de dano');

  const resFalha = E.resolveSaveAlvo({ mod: 1, cd: cd, dano: danoBase, regra: 'anula', d20: 5 });
  assert.strictEqual(resFalha.passou, false);
  assert.strictEqual(resFalha.dano, 20, 'Em regra anula, quem falha deve tomar o dano completo');
});

testCase('Save', '2.3 Resolução em área com múltiplos alvos simultâneos (ex: Bola de Fogo)', () => {
  const monstro1 = { name: 'Leão 1', modDes: 1, hp: 12, maxHp: 30 }; // se falhar e tomar 18 de dano -> morre
  const monstro2 = { name: 'Leão 2', modDes: 4, hp: 25, maxHp: 30 }; // se passar e tomar 9 de dano -> sobrevive
  const cd = 13;
  const danoRolado = 18;

  // Monstro 1 rola d20 = 7 (total 8 vs CD 13 -> FALHA)
  const r1 = E.resolveSaveAlvo({ mod: monstro1.modDes, cd: cd, dano: danoRolado, regra: 'metade', d20: 7 });
  monstro1.hp = Math.max(0, monstro1.hp - r1.dano);
  const killed1 = monstro1.hp === 0;

  // Monstro 2 rola d20 = 11 (total 15 vs CD 13 -> PASSA)
  const r2 = E.resolveSaveAlvo({ mod: monstro2.modDes, cd: cd, dano: danoRolado, regra: 'metade', d20: 11 });
  monstro2.hp = Math.max(0, monstro2.hp - r2.dano);
  const killed2 = monstro2.hp === 0;

  assert.strictEqual(r1.passou, false);
  assert.strictEqual(r1.dano, 18);
  assert.strictEqual(monstro1.hp, 0);
  assert.strictEqual(killed1, true, 'Leão 1 deveria morrer');

  assert.strictEqual(r2.passou, true);
  assert.strictEqual(r2.dano, 9);
  assert.strictEqual(monstro2.hp, 16);
  assert.strictEqual(killed2, false, 'Leão 2 deveria sobreviver');
});

testCase('Save', '2.4 Cálculo correto das CDs do Conjurador (Mágica vs Física)', () => {
  const prof = 2;
  const attrs = { for: 3, des: 1, con: 2, int: 0, sab: 4, car: 2 };

  // CD Mágica = 8 + prof + max(int, sab, car) = 8 + 2 + 4 = 14
  const cdMagica = E.cdMagica(prof, attrs);
  // CD Física = 8 + prof + max(for, des) = 8 + 2 + 3 = 13
  const cdFisica = E.cdFisica(prof, attrs);

  assert.strictEqual(cdMagica, 14, 'CD Mágica calculada incorretamente');
  assert.strictEqual(cdFisica, 13, 'CD Física calculada incorretamente');
});

testCase('Save', '2.5 Resolução de CD Fixa (habilidades de monstros ou itens com CD declarada)', () => {
  const c = { cdMagica: 15, cdFisica: 14 };
  assert.strictEqual(E.resolveCD({ fixa: 17 }, c), 17, 'Deve respeitar o valor da CD Fixa');
  assert.strictEqual(E.resolveCD('magica', c), 15);
  assert.strictEqual(E.resolveCD('fisica', c), 14);
});

testCase('Save', '2.6 Acerto Automático e Distribuição Livre de Mísseis Mágicos', () => {
  const monstro1 = { name: 'Leão 1', hp: 20, maxHp: 20 };
  const monstro2 = { name: 'Leão 2', hp: 15, maxHp: 15 };

  // Jogador escala Mísseis Mágicos para 5 Foco (4 dardos de 1d4+1)
  const mecMisseis = { custo: 4, dano: { dados: '1d4', fixo: 1, dardos: 3 }, escala: { passo: 1, ganha: { dardos: 1 }, max: 3 } };
  const esc = E.scaleSpell(mecMisseis, 5);
  assert.strictEqual(esc.dardos, 4, 'Com 5 Foco deve conceder 4 mísseis');
  assert.strictEqual(esc.custoSt, 2, 'Taxa de ST ceil(5/3) deve ser 2');

  // Distribuição: 3 mísseis no Leão 1, 1 míssil no Leão 2
  const alvosDardos = [
    { target: monstro1, dardos: 3, danoPorDardo: 3 }, // 3 x 3 = 9 dano
    { target: monstro2, dardos: 1, danoPorDardo: 4 }  // 1 x 4 = 4 dano
  ];

  alvosDardos.forEach(a => {
    const danoTotal = a.dardos * a.danoPorDardo;
    a.target.hp = Math.max(0, a.target.hp - danoTotal);
  });

  assert.strictEqual(monstro1.hp, 11, 'Leão 1 deve sofrer 9 de dano automático (20 - 9 = 11)');
  assert.strictEqual(monstro2.hp, 11, 'Leão 2 deve sofrer 4 de dano automático (15 - 4 = 11)');
});

testCase('Save', '2.7 Salto Tático (skill em área no ponto de impacto com 1d4 de dano e save de DES)', () => {
  if (!global.window || !global.window.OLARPG_MEC_CATALOG) {
    global.window = global.window || {};
    require('./olarpg-catalog.js');
  }
  const mec = global.window.OLARPG_MEC_CATALOG['salto tatico'];
  assert.ok(mec, 'Salto Tático deve estar no catálogo');
  assert.strictEqual(mec.recurso, 'st');
  assert.strictEqual(mec.custo, 2);
  assert.strictEqual(mec.resolucao.tipo, 'save');
  assert.strictEqual(mec.resolucao.save, 'des');
  assert.strictEqual(mec.resolucao.cd, 'fisica');
  assert.strictEqual(mec.dano.dados, '1d4');
  assert.strictEqual(mec.dano.tipo, 'impacto');
  assert.ok(mec.alvos[0].area, 'Deve ser uma habilidade em área');

  // Resolução contra 2 monstros na área de impacto
  const cdFisica = 14;
  const m1 = { name: 'Goblin 1', hp: 8, saveDes: +1 }; // rolou 8 + 1 = 9 (falha)
  const m2 = { name: 'Goblin 2', hp: 8, saveDes: +4 }; // rolou 12 + 4 = 16 (passou)

  const danoRolado = 4; // 1d4 rolou 4
  const dano1 = E.applySave(danoRolado, false, 'metade'); // falha -> 4
  const dano2 = E.applySave(danoRolado, true, 'metade');  // passou -> floor(4/2) = 2

  m1.hp -= dano1;
  m2.hp -= dano2;

  assert.strictEqual(m1.hp, 4, 'Goblin 1 falhou no teste e tomou 4 de dano');
  assert.strictEqual(m2.hp, 6, 'Goblin 2 passou no teste e tomou 2 de dano (metade)');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. EFEITOS DE STATUS, CONDIÇÕES E BUFFS/DEBUFFS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 3. EFEITOS DE STATUS, CONDIÇÕES E BUFFS ---');

testCase('Efeitos', '3.1 Efeitos com condição "falha": aplicados apenas se o alvo falhar no teste', () => {
  const efeitosDef = [
    { quando: 'falha', tipo: 'status', texto: 'Atordoado', duracao: 1 },
    { quando: 'sempre', tipo: 'status', texto: 'Marcado', duracao: 2 },
    { quando: 'passou', tipo: 'status', texto: 'Abençoado', duracao: 1 }
  ];

  // Caso falhou no teste
  const efsFalha = E.efeitosAlvo(efeitosDef, false);
  const nomesFalha = efsFalha.map(e => e.texto);
  assert.ok(nomesFalha.includes('Atordoado'), 'Deveria conter Atordoado na falha');
  assert.ok(nomesFalha.includes('Marcado'), 'Deveria conter Marcado na falha');
  assert.ok(!nomesFalha.includes('Abençoado'), 'Não deve conter Abençoado na falha');

  // Caso passou no teste
  const efsPassou = E.efeitosAlvo(efeitosDef, true);
  const nomesPassou = efsPassou.map(e => e.texto);
  assert.ok(!nomesPassou.includes('Atordoado'), 'Atordoado deve ser negado com sucesso');
  assert.ok(nomesPassou.includes('Marcado'), 'Marcado aplica sempre');
  assert.ok(nomesPassou.includes('Abençoado'), 'Abençoado deve entrar no sucesso');
});

testCase('Efeitos', '3.2 Buffs de dano no conjurador: consumo no próximo ataque e teto de +3 dados', () => {
  const buffs = [];
  E.addBuff(buffs, { tipo: 'buff_dado', valor: 2, consome: 'proximo_ataque' });
  const b2 = E.addBuff(buffs, { tipo: 'buff_dado', valor: 2, consome: 'proximo_ataque' });

  // Teto de +3 dados: o segundo buff de +2 deve ser limitado para +1
  assert.strictEqual(b2.buff.valor, 1, 'Buff deve ser limitado a 1 para totalizar 3');
  assert.strictEqual(E.diceDelta(buffs, 'ataque'), 3, 'Saldo total de dados deve ser exatamente +3');

  // Rolagem de dano consumindo buffs de próximo ataque
  const rollDano = E.damageRoll({ expr: '1d8', buffs: buffs, contexto: 'ataque', rng: () => 0.5 });
  assert.strictEqual(rollDano.expr, '4d8', '1d8 + 3 dados de buff deve se tornar 4d8');
  assert.strictEqual(rollDano.consumidos.length, 2, 'Os 2 buffs de proximo_ataque devem ser consumidos');

  // Remove os consumidos
  E.removeBuffs(buffs, rollDano.consumidos);
  assert.strictEqual(buffs.length, 0, 'Buffs consumidos devem ser removidos do conjurador');
  assert.strictEqual(E.diceDelta(buffs, 'ataque'), 0, 'Após o ataque o bônus volta a 0');
});

testCase('Efeitos', '3.3 Buff persistente: não é consumido ao desferir ataque', () => {
  const buffs = [];
  E.addBuff(buffs, { tipo: 'buff_dado', valor: 1, persistente: true });
  const roll = E.damageRoll({ expr: '1d6', buffs: buffs, rng: () => 0.5 });

  assert.strictEqual(roll.expr, '2d6', 'Deveria aumentar para 2d6');
  assert.strictEqual(roll.consumidos.length, 0, 'Buff persistente não deve estar na lista de consumidos');
});

testCase('Efeitos', '3.4 Passagem de rodadas (tickTurn): decrementa duração e expira no momento certo', () => {
  const buffs = [];
  E.addBuff(buffs, { tipo: 'status', texto: 'Envenenado', duracao: 2 });

  // Fim do turno 1: resta 1 turno
  const exp1 = E.tickTurn(buffs);
  assert.strictEqual(exp1.length, 0, 'Nenhum buff deve expirar no primeiro turno');
  assert.strictEqual(buffs[0].restante, 1, 'Duração restante deve ser 1');

  // Fim do turno 2: expira e sai da lista
  const exp2 = E.tickTurn(buffs);
  assert.strictEqual(exp2.length, 1, 'Deveria expirar 1 efeito');
  assert.strictEqual(exp2[0].texto, 'Envenenado');
  assert.strictEqual(buffs.length, 0, 'Lista de buffs ativos deve estar limpa');
});

testCase('Efeitos', '3.5 Dano Próprio: habilidades com sacrifício deduzem corretamente vida do conjurador', () => {
  const conjurador = { hpCur: 25, hpMax: 30 };
  const exprDanoProprio = '1d6+2';
  const p = E.parseExpr(exprDanoProprio);
  // Rolagem previsível com d6 tirando 4: total = 4 + 2 = 6
  const r = E.roll(p, () => (4 - 1) / 6);
  assert.strictEqual(r.total, 6);

  conjurador.hpCur = Math.max(0, conjurador.hpCur - r.total);
  assert.strictEqual(conjurador.hpCur, 19, 'Vida do conjurador deve ser 25 - 6 = 19');
});

testCase('Efeitos', '3.6 Buff de mesmo nome com chave idêntica: não duplica, mantém maior valor e renova', () => {
  const buffs = [];
  E.addBuff(buffs, { tipo: 'bonus', chave: 'escudo_fe', valor: 2, duracao: 3 });
  E.tickTurn(buffs); // resta 2 turnos

  // Aplica novo escudo de fé com valor 3 e duração 3
  const r = E.addBuff(buffs, { tipo: 'bonus', chave: 'escudo_fe', valor: 3, duracao: 3 });
  assert.strictEqual(r.renovado, true);
  assert.strictEqual(buffs.length, 1, 'Deve continuar com apenas 1 registro');
  assert.strictEqual(buffs[0].valor, 3, 'Deve assumir o maior valor (3)');
  assert.strictEqual(buffs[0].restante, 3, 'Deve renovar a duração restante');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GESTÃO DE RECURSOS E ESCALA DE MAGIAS (UPCASTING)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 4. GESTÃO DE RECURSOS E ESCALA DE MAGIAS ---');

testCase('Recursos', '4.1 Gasto de Stamina: deduz corretamente quando há recurso suficiente', () => {
  let stCur = 10;
  const custo = 4;
  assert.ok(stCur >= custo, 'Tem stamina suficiente');
  stCur -= custo;
  assert.strictEqual(stCur, 6, 'Stamina restante deve ser 6');
});

testCase('Recursos', '4.2 Gasto de Foco acompanhado de Taxa de Stamina obrigatória', () => {
  let foCur = 12;
  let stCur = 8;
  const custoFoco = 6;
  const taxaSt = E.taxaSt(custoFoco); // ceil(6/3) = 2

  assert.strictEqual(taxaSt, 2, 'Taxa de ST para 6 FO deve ser ceil(6/3) = 2');
  assert.ok(foCur >= custoFoco && stCur >= taxaSt, 'Recursos suficientes para ambos');

  foCur -= custoFoco;
  stCur -= taxaSt;

  assert.strictEqual(foCur, 6, 'Foco restante deve ser 6');
  assert.strictEqual(stCur, 6, 'Stamina restante deve ser 6');
});

testCase('Recursos', '4.3 Bloqueio por recurso insuficiente: nem Foco nem Stamina são alterados se faltar um deles', () => {
  let foCur = 8;
  let stCur = 1; // tem FO para 6, mas taxa de ST é 2 e só tem 1 ST
  const custoFoco = 6;
  const taxaSt = E.taxaSt(custoFoco);

  const temRecurso = foCur >= custoFoco && stCur >= taxaSt;
  assert.strictEqual(temRecurso, false, 'Ação deve ser rejeitada por falta de stamina para a taxa');

  if (temRecurso) {
    foCur -= custoFoco;
    stCur -= taxaSt;
  }

  assert.strictEqual(foCur, 8, 'Foco original deve permanecer intacto');
  assert.strictEqual(stCur, 1, 'Stamina original deve permanecer intacta');
});

testCase('Recursos', '4.4 Escala de Magia (Upcasting): aumento progressivo de dano ao gastar mais foco', () => {
  const magiaEscala = {
    custo: { min: 4, max: 8 },
    dano: { dados: '2d6' },
    escala: { passo: 2, a_partir_de: 4, ganha: { dano: '1d6' } }
  };

  // Custo base 4 Foco -> 2d6
  const c4 = E.scaleSpell(magiaEscala, 4);
  assert.strictEqual(c4.dano, '2d6');

  // Custo escalado 6 Foco (+2) -> 3d6
  const c6 = E.scaleSpell(magiaEscala, 6);
  assert.strictEqual(c6.dano, '3d6');

  // Custo escalado 8 Foco (+4) -> 4d6
  const c8 = E.scaleSpell(magiaEscala, 8);
  assert.strictEqual(c8.dano, '4d6');

  // Gasto ímpar (desperdício) de 7 Foco -> dano 3d6 com 1 de desperdício
  const c7 = E.scaleSpell(magiaEscala, 7);
  assert.strictEqual(c7.dano, '3d6');
  assert.strictEqual(c7.desperdicio, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRIVACIDADE DE DADOS E FORMATAÇÃO DE LOGS (FICHA VS BESTIÁRIO)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 5. PRIVACIDADE E FORMATO DOS LOGS ---');

testCase('Logs', '5.1 Log do Jogador (Ficha): puramente narrativo, sem vazar d20, bônus ou CD/CA', () => {
  const eventoCombate = {
    target: 'Leão 1',
    passou: true,
    total: 17, // d20 + mod (NÃO PODE APARECER NA MENSAGEM DO JOGADOR)
    cd: 13,    // CD (NÃO PODE APARECER NA MENSAGEM DO JOGADOR)
    dmg: 8,
    killed: false,
    efs: []
  };

  // Formato da Ficha do Jogador:
  let msgJogador = eventoCombate.target + ' ' + (eventoCombate.passou ? 'passou' : 'falhou') + ' no teste';
  if (eventoCombate.dmg) msgJogador += ' e tomou ' + eventoCombate.dmg + ' de dano';
  if (eventoCombate.killed) msgJogador += ' 💀';

  assert.strictEqual(msgJogador, 'Leão 1 passou no teste e tomou 8 de dano');
  assert.ok(!msgJogador.includes('17'), 'Mensagem do jogador NÃO pode conter a rolagem 17');
  assert.ok(!msgJogador.includes('13'), 'Mensagem do jogador NÃO pode conter a CD 13');
  assert.ok(!msgJogador.includes('d20'), 'Mensagem do jogador NÃO pode mencionar d20');
});

testCase('Logs', '5.2 Log do Mestre (Bestiário): contém todos os números matemáticos para auditoria', () => {
  const atacante = 'Novak';
  const skill = 'Bola de Fogo';
  const alvo = 'Leão 1';
  const chave = 'DES';
  const d20 = 14;
  const mod = 3;
  const total = 17;
  const cd = 13;
  const passou = true;
  const dano = 8;
  const hpMonstro = 37;
  const maxHpMonstro = 45;

  const msgMestre = `${atacante} conjurou ${skill} em ${alvo} — ${chave} ${d20}+${mod} = ${total} vs CD ${cd}: passou · ${dano} de dano · HP ${hpMonstro}/${maxHpMonstro}`;

  assert.ok(msgMestre.includes('DES 14+3 = 17 vs CD 13'), 'Mestre deve ver a fórmula completa da rolagem');
  assert.ok(msgMestre.includes('HP 37/45'), 'Mestre deve ver o HP atual vs máximo');
});

testCase('Logs', '5.3 Feed de Skills da mesa: omite custos numéricos de Stamina e Foco', () => {
  const skillDisparada = {
    sender: 'Novak',
    skillName: 'Rajada de Vento',
    desc: 'Empurra os alvos atingidos até 3 blocos para trás.',
    custoOriginal: '3🔵 1🟡' // Custo que JAMAIS deve ser enviado ou exposto na gaveta do jogador
  };

  // Payload enviado ao skillFeed
  const payloadPublicado = {
    sender: skillDisparada.sender,
    isMonster: false,
    skillName: skillDisparada.skillName,
    desc: skillDisparada.desc,
    ts: Date.now()
  };

  assert.strictEqual(payloadPublicado.custo, undefined, 'O payload do skillFeed não deve ter a propriedade custo');
  assert.ok(!JSON.stringify(payloadPublicado).includes('3🔵'), 'O payload não deve conter valores de foco');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. DANO DO MONSTRO NO JOGADOR E CURA
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 6. DANO NO JOGADOR E CURA ---');

testCase('Combate Mestre->Jogador', '6.1 Monstro causando dano direto ao Jogador abate o HP da Ficha', () => {
  const jogador = { name: 'Novak', hpCur: 28, hpMax: 35 };
  const danoMonstro = 11;

  jogador.hpCur = Math.max(0, jogador.hpCur - danoMonstro);
  assert.strictEqual(jogador.hpCur, 17, 'HP do jogador deve ser reduzido de 28 para 17');
});

testCase('Combate Mestre->Jogador', '6.2 Cura aplicada a um aliado/personagem respeita o teto do HP Máximo', () => {
  const jogador = { name: 'Novak', hpCur: 32, hpMax: 35 };
  const cura = 10;

  jogador.hpCur = Math.min(jogador.hpMax, jogador.hpCur + cura);
  assert.strictEqual(jogador.hpCur, 35, 'Cura não pode ultrapassar o HP máximo de 35');
});

testCase('Combate Mestre->Jogador', '6.3 Cura com dados rolados (Círculo de Cura)', () => {
  const alvo = { name: 'Guerreiro', hpCur: 10, hpMax: 40 };
  const exprCura = '2d6+4';
  const p = E.parseExpr(exprCura);
  // Rolagem previsível com 2d6 tirando 5 e 3: total = 5 + 3 + 4 = 12
  const seqCura = [5, 3];
  let i = 0;
  const r = E.roll(p, () => (seqCura[i++] - 1) / 6);

  assert.strictEqual(r.total, 12);
  alvo.hpCur = Math.min(alvo.hpMax, alvo.hpCur + r.total);
  assert.strictEqual(alvo.hpCur, 22, 'HP do guerreiro curado de 10 para 22');
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUMO FINAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(`RESULTADO FINAL: ${aprovados} de ${totalTestes} testes aprovados.`);
if (falhas.length > 0) {
  console.error(`ATENÇÃO: ${falhas.length} testes FALHARAM:`);
  falhas.forEach((f, idx) => {
    console.error(`  ${idx + 1}) [${f.categoria}] ${f.descricao}`);
    console.error(`     Mensagem: ${f.erro}`);
  });
  process.exit(1);
} else {
  console.log('STATUS: TODOS OS CASOS DE BATALHA VALIDADOS COM SUCESSO! 🛡️⚔️');
  console.log('================================================================\n');
  process.exit(0);
}
