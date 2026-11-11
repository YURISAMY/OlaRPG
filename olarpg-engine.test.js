// Uso: node olarpg-engine.test.js [caminho/do/Livro_base.html]
const E = require('./olarpg-engine.js');
const fs = require('fs'), assert = require('assert');
let ok = 0, falhas = [];
function t(nome, fn) { try { fn(); ok++; } catch (e) { falhas.push(nome + ' → ' + e.message); } }
const mod = (expr, o) => E.fmt(E.applyModifiers(E.parseExpr(expr), o));
const seq = (...v) => { let i = 0; return () => (v[i++ % v.length] - 1) / 100; };   // rng previsível: devolve o valor face-1 em /100 (dado d100 só pra teste)

/* ── dados: exemplos do autor ── */
t('parse/fmt', () => assert.strictEqual(E.fmt(E.parseExpr('1d6 + 1d10 + 2')), '1d10+1d6+2'));
t('arco longo +1 dado → 1d10+2d6', () => assert.strictEqual(mod('1d10+1d6', { delta: 1 }), '1d10+2d6'));
t('buff +3 no menor dado', () => assert.strictEqual(mod('1d10+1d6', { delta: 3 }), '1d10+4d6'));
t('crítico dobra só a base, buff entra depois', () => assert.strictEqual(mod('1d10+1d6', { crit: true, delta: 1 }), '2d10+3d6'));
t('crítico não dobra o fixo', () => assert.strictEqual(mod('1d8+3', { crit: true }), '2d8+3'));
t('debuff −1 tira do menor dado', () => assert.strictEqual(mod('1d10+1d6', { delta: -1 }), '1d10'));
t('debuff respeita mínimo de 1 dado', () => { assert.strictEqual(mod('1d10+1d6', { delta: -2 }), '1d10'); assert.strictEqual(mod('1d8', { delta: -2 }), '1d8'); });
t('20 natural + debuff: dobra a base e só depois reduz', () => assert.strictEqual(mod('1d10+1d6', { crit: true, delta: -1 }), '2d10+1d6'));
t('sem dados (30 fixo): buff não se aplica', () => assert.strictEqual(mod('30', { delta: 2 }), '30'));
t('rolagem com rng previsível', () => { const r = E.roll(E.parseExpr('2d6+1'), seq(50, 100)); assert.strictEqual(r.total, 6 * 0 + (1 + Math.floor(0.49 * 6)) + (1 + Math.floor(0.99 * 6)) + 1); });

/* ── buffs ── */
t('damageRoll consome buff de dado não persistente', () => {
  const b = []; const r1 = E.addBuff(b, { tipo: 'buff_dado', valor: 1 });
  const d = E.damageRoll({ expr: '1d10+1d6', buffs: b, rng: () => 0 });
  assert.strictEqual(d.expr, '1d10+2d6'); assert.deepStrictEqual(d.consumidos, [r1.buff.id]);
});
t('buff persistente não é consumido', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 1, persistente: true });
  assert.deepStrictEqual(E.damageRoll({ expr: '1d8', buffs: b, rng: () => 0 }).consumidos, []);
});
t('dano fixo não consome o buff', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 2 });
  const d = E.damageRoll({ expr: '30', buffs: b }); assert.strictEqual(d.expr, '30'); assert.deepStrictEqual(d.consumidos, []); assert.ok(d.semDados);
});
t('teto de +3 dados', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 2 }); const r = E.addBuff(b, { tipo: 'buff_dado', valor: 2 });
  assert.strictEqual(r.buff.valor, 1); assert.ok(r.limitado); assert.strictEqual(E.addBuff(b, { tipo: 'buff_dado', valor: 1 }).ok, false); assert.strictEqual(E.diceDelta(b), 3);
});
t('buff e debuff somam num saldo', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 2 }); E.addBuff(b, { tipo: 'debuff_dado', valor: 1 }); assert.strictEqual(E.diceDelta(b), 1);
});
t('proxima_magia só vale em magia', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 1, consome: 'proxima_magia' });
  assert.strictEqual(E.diceDelta(b, 'ataque'), 0); assert.strictEqual(E.diceDelta(b, 'magia'), 1);
});
t('duração padrão de 2 turnos', () => {
  const b = []; E.addBuff(b, { tipo: 'status', texto: 'Tonto' });
  assert.strictEqual(E.tickTurn(b).length, 0); const exp = E.tickTurn(b); assert.strictEqual(exp.length, 1); assert.strictEqual(b.length, 0);
});
t('mesmo buff não acumula: vale o maior e renova', () => {
  const b = []; E.addBuff(b, { tipo: 'bonus', chave: 'bonus_acerto', valor: 1, duracao: 3 });
  E.tickTurn(b); const r = E.addBuff(b, { tipo: 'bonus', chave: 'bonus_acerto', valor: 3, duracao: 2 });
  assert.ok(r.renovado); assert.strictEqual(b.length, 1); assert.strictEqual(b[0].valor, 3); assert.strictEqual(b[0].restante, 2);
  E.addBuff(b, { tipo: 'bonus', chave: 'bonus_acerto', valor: 2, duracao: 2 }); assert.strictEqual(b[0].valor, 3);
});
t('buffs de tipos diferentes coexistem', () => {
  const b = []; E.addBuff(b, { tipo: 'buff_dado', valor: 1 }); E.addBuff(b, { tipo: 'bonus', chave: 'bonus_acerto', valor: 1 }); assert.strictEqual(b.length, 2);
});

/* ── CD e saves ── */
t('CD mágica e física', () => {
  assert.strictEqual(E.cdMagica(3, { int: 2, sab: 4, car: 1 }), 15); assert.strictEqual(E.cdFisica(3, { for: 1, des: 3 }), 14);
});
t('resolveCD: fixa, mágica, física', () => {
  const c = { cdMagica: 15, cdFisica: 14 };
  assert.strictEqual(E.resolveCD({ fixa: 13 }, c), 13); assert.strictEqual(E.resolveCD('magica', c), 15); assert.strictEqual(E.resolveCD('fisica', c), 14);
});
t('save: passa com total >= CD', () => { assert.ok(E.rollSave({ d20: 10, mod: 3, cd: 13 }).passou); assert.ok(!E.rollSave({ d20: 9, mod: 3, cd: 13 }).passou); });
t('applySave: metade arredonda pra baixo; anula zera; falha toma tudo', () => {
  assert.strictEqual(E.applySave(13, true, 'metade'), 6); assert.strictEqual(E.applySave(13, true, 'anula'), 0); assert.strictEqual(E.applySave(13, false, 'metade'), 13);
});

/* ── escala e custo ── */
const desint = { custo: { min: 6, max: 12 }, dano: { fixo: 30 }, escala: { passo: 2, a_partir_de: 6, ganha: { dano: '1d10' } } };
t('Desintegrar 6/8/12', () => {
  assert.strictEqual(E.scaleSpell(desint, 6).dano, '30'); assert.strictEqual(E.scaleSpell(desint, 8).dano, '1d10+30'); assert.strictEqual(E.scaleSpell(desint, 12).dano, '3d10+30');
});
t('Desintegrar: fora do intervalo e desperdício', () => {
  assert.strictEqual(E.scaleSpell(desint, 13).ok, false); assert.strictEqual(E.scaleSpell(desint, 5).ok, false); assert.strictEqual(E.scaleSpell(desint, 7).desperdicio, 1);
});
t('Círculo de Cura 8🔵 = 3d6', () => assert.strictEqual(E.scaleSpell({ custo: { min: 6, max: 8 }, cura: { dados: '2d6' }, escala: { passo: 2, a_partir_de: 6, ganha: { cura: '1d6' } } }, 8).cura, '3d6'));
t('Mísseis Mágicos: +1🔵 = +1 dardo, máx +3', () => {
  const m = { custo: 4, dano: { dados: '1d4', fixo: 1, dardos: 3 }, escala: { passo: 1, ganha: { dardos: 1 }, max: 3 } };
  assert.strictEqual(E.scaleSpell(m, 6).dardos, 5); assert.strictEqual(E.scaleSpell(m, 9).dardos, 6);
});
t('Raio Elemental: teto de 3d10 e exige nível 5', () => {
  const m = { custo: 3, dano: { dados: '1d10' }, escala: { passo: 2, ganha: { dano: '1d10' }, max_dados: 3, requer_nivel: 5 } };
  assert.strictEqual(E.scaleSpell(m, 7).dano, '3d10'); assert.strictEqual(E.scaleSpell(m, 9).dano, '3d10'); assert.strictEqual(E.scaleSpell(m, 7, { nivel: 4 }).dano, '1d10');
});
t('taxa de ST = ceil(FO/3), igual à Ficha', () => { assert.strictEqual(E.taxaSt(3), 1); assert.strictEqual(E.taxaSt(6), 2); assert.strictEqual(E.taxaSt(8), 3); });


/* ── composeDano (ataque via mec) ── */
t('composeDano: arma + dados do mec', () => {
  const r = E.composeDano({ dano: { arma: true, dados: '2d6', tipo: 'sagrado' } }, { dano: '1d8', extra: 3 });
  assert.ok(r.ok); assert.strictEqual(r.expr, '1d8+2d6'); assert.strictEqual(r.extra, 3);
});
t('composeDano: só dados e fixo do mec (sem arma)', () => {
  const r = E.composeDano({ dano: { dados: '3d6', fixo: 2 } }, null); assert.ok(r.ok); assert.strictEqual(r.expr, '3d6'); assert.strictEqual(r.extra, 2);
});
t('composeDano: golpes/multiplicador e arma sem dano caem no manual', () => {
  assert.strictEqual(E.composeDano({ dano: { dados: '1d6', golpes: 2 } }, null).ok, false);
  assert.strictEqual(E.composeDano({ dano: { arma: true, multiplicador: 2 } }, { dano: '1d8' }).ok, false);
  assert.strictEqual(E.composeDano({ dano: { arma: true } }, { dano: '' }).ok, false);
});


/* ── save em alvo (bestiário) ── */
t('resolveSaveAlvo: falha toma tudo, passa em "metade" toma metade, "anula" zera', () => {
  const base = { mod: 2, cd: 14, dano: 13 };
  const f = E.resolveSaveAlvo({ ...base, d20: 5, regra: 'metade' }); assert.ok(!f.passou); assert.strictEqual(f.dano, 13); assert.strictEqual(f.total, 7);
  assert.strictEqual(E.resolveSaveAlvo({ ...base, d20: 12, regra: 'metade' }).dano, 6);
  assert.strictEqual(E.resolveSaveAlvo({ ...base, d20: 12, regra: 'anula' }).dano, 0);
  assert.strictEqual(E.resolveSaveAlvo({ mod: 0, cd: 10, d20: 1, regra: 'metade' }).dano, 0);   // sem dano (só efeito)
});
t('efeitosAlvo: sempre/falha/passou', () => {
  const ef = [{ quando: 'sempre', texto: 'A' }, { quando: 'falha', texto: 'B' }, { quando: 'passou', texto: 'C' }, { quando: 'acerto', texto: 'D' }];
  assert.deepStrictEqual(E.efeitosAlvo(ef, false).map(x => x.texto), ['A', 'B']); assert.deepStrictEqual(E.efeitosAlvo(ef, true).map(x => x.texto), ['A', 'C']);
});

/* ── validação de todos os mec do Livro ── */
const livro = process.argv[2] || '../Livro_base.html';
if (fs.existsSync(livro)) {
  const html = fs.readFileSync(livro, 'utf8');
  const re = /<script type="application\/json" class="mec">([\s\S]*?)<\/script>/g; let m, n = 0, erros = [], avisos = {}, ids = {};
  while ((m = re.exec(html))) {
    n++; const mec = JSON.parse(m[1].replace(/<\\\//g, '</')); const v = E.validateMec(mec);
    if (ids[mec.id]) erros.push(mec.id + ': id repetido'); ids[mec.id] = 1;
    v.erros.forEach(e => erros.push(mec.id + ': ' + e)); v.avisos.forEach(a => avisos[a] = (avisos[a] || 0) + 1);
    (mec.opcoes ? mec.opcoes.lista : []).forEach(o => { if (o.requer && !ids[o.requer] && !html.includes('"id":"' + o.requer + '"')) erros.push(mec.id + ': opção requer id inexistente ' + o.requer); });
  }
  t('Livro: ' + n + ' mec válidos', () => assert.strictEqual(erros.length, 0, '\n  ' + erros.slice(0, 15).join('\n  ')));
  if (Object.keys(avisos).length) console.log('avisos do validador:', avisos);
} else console.log('(Livro não encontrado em ' + livro + ': validação pulada)');

console.log(ok + ' testes ok' + (falhas.length ? ', ' + falhas.length + ' FALHARAM:\n- ' + falhas.join('\n- ') : ''));
process.exit(falhas.length ? 1 : 0);
