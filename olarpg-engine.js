/*!
 * OlaRPG Engine — regras puras do sistema (sem DOM, sem Firebase).
 * Funciona no navegador (window.OlaEngine) e no Node (require).
 * Usado pela Ficha (conjurar, buffs), pelo Bestiário (resolver saves) e pelos testes.
 *
 * Decisões de regra já fechadas com o autor:
 *  - CD mágica  = 8 + proficiência + maior mod entre INT/SAB/CAR      (magias, 🔵)
 *  - CD física  = 8 + proficiência + maior mod entre FOR/DES          (técnicas, 🟡)
 *  - Buff/debuff de dado: soma/subtrai dados SEMPRE no menor dado da jogada; teto de 3; mínimo 1 dado.
 *  - Crítico/20 natural: dobra só os dados da base; depois aplica buff/debuff no menor dado.
 *  - Duração padrão: 2 turnos de quem recebeu. Buffs de mesma "chave" não somam (vale o maior, renova a duração);
 *    buff de dado é a exceção (soma até o teto).
 *  - Dano sem dados (fixo) não recebe buff de dado e não o consome.
 *  - Alcance padrão quando a magia não diz: 10 blocos.
 *
 * Suposições minhas (marcadas ASSUMIDO): debuff de dado tem o mesmo teto de 3; buff e debuff de dado
 * são somados num saldo líquido; crítico não dobra o bônus fixo.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OlaEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ELEMENTOS = ['Fogo', 'Água', 'Terra', 'Trovão', 'Raio', 'Luz', 'Escuridão'];
  var DURACAO_PADRAO = 2, ALCANCE_PADRAO = 10, TETO_DADOS = 3, MIN_DADOS = 1;
  var COM_DURACAO_PADRAO = { buff_dado: 1, debuff_dado: 1, bonus: 1, status: 1, hp_temp: 1, regen: 1, vantagem: 1, desvantagem: 1 };

  /* ───────── Dados ───────── */
  function parseExpr(expr) {
    var terms = [], flat = 0, re = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi, m;
    expr = String(expr == null ? '' : expr);
    while ((m = re.exec(expr))) {
      var sg = m[1] === '-' ? -1 : 1;
      if (m[3]) terms.push({ n: parseInt(m[2] || '1', 10), s: parseInt(m[3], 10), sign: sg });
      else flat += sg * parseInt(m[4], 10);
    }
    return normalize({ terms: terms, flat: flat });
  }
  function normalize(p) { // junta termos de mesmo dado e mesmo sinal; ordena do maior dado pro menor
    var by = {};
    p.terms.forEach(function (t) { var k = t.sign + ':' + t.s; if (by[k]) by[k].n += t.n; else by[k] = { n: t.n, s: t.s, sign: t.sign }; });
    var terms = Object.keys(by).map(function (k) { return by[k]; }).filter(function (t) { return t.n > 0; });
    terms.sort(function (a, b) { return (b.sign - a.sign) || (b.s - a.s); });
    return { terms: terms, flat: p.flat };
  }
  function fmt(p) {
    var out = p.terms.map(function (t, i) { return (t.sign < 0 ? '-' : (i ? '+' : '')) + t.n + 'd' + t.s; }).join('');
    if (p.flat) out += (p.flat > 0 ? (out ? '+' : '') : '-') + Math.abs(p.flat);
    return out || '0';
  }
  function temDados(p) { return p.terms.some(function (t) { return t.sign > 0 && t.n > 0; }); }
  function totalDados(p) { return p.terms.reduce(function (a, t) { return a + (t.sign > 0 ? t.n : 0); }, 0); }
  function menorDado(p) {
    var pos = p.terms.filter(function (t) { return t.sign > 0 && t.n > 0; });
    pos.sort(function (a, b) { return a.s - b.s; });
    return pos[0] || null;
  }
  /** Crítico dobra só a base; delta>0 soma no menor dado; delta<0 tira do menor dado respeitando o mínimo de dados. */
  function applyModifiers(p, o) {
    o = o || {};
    var r = { terms: p.terms.map(function (t) { return { n: t.n, s: t.s, sign: t.sign }; }), flat: p.flat };
    if (o.crit) r.terms.forEach(function (t) { if (t.sign > 0) t.n *= 2; });
    var d = o.delta || 0, minD = o.minDados == null ? MIN_DADOS : o.minDados;
    if (d > 0) { var m = menorDado(r); if (m) m.n += d; }
    else if (d < 0) {
      for (var rem = -d; rem > 0; rem--) {
        if (totalDados(r) <= minD) break;
        var s = menorDado(r); if (!s) break; s.n -= 1;
      }
    }
    return normalize(r);
  }
  function roll(p, rng) {
    rng = rng || Math.random;
    var groups = [], parts = [], total = 0;
    p.terms.forEach(function (t) {
      var n = Math.min(t.n, 20), rs = [];
      for (var i = 0; i < n; i++) rs.push(1 + Math.floor(rng() * t.s));
      var sum = rs.reduce(function (a, b) { return a + b; }, 0);
      total += t.sign * sum;
      parts.push((t.sign < 0 ? '−' : '') + '[' + rs.join(',') + ']');
      if (t.sign > 0) groups.push({ sides: t.s, dice: rs });
    });
    if (p.flat) { total += p.flat; parts.push((p.flat < 0 ? '−' : '+') + Math.abs(p.flat)); }
    return { total: total, flat: p.flat, groups: groups, text: parts.join(' ') };
  }

  /* ───────── Buffs / debuffs ───────── */
  var _seq = 0;
  function isDado(b) { return b.tipo === 'buff_dado' || b.tipo === 'debuff_dado'; }
  function somaTipo(list, tipo) { return list.filter(function (b) { return b.tipo === tipo; }).reduce(function (a, b) { return a + (b.valor || 0); }, 0); }
  function aplicaEm(b, kind) { return b.consome === 'proxima_magia' ? kind === 'magia' : true; }
  /** Saldo líquido de dados (ASSUMIDO: cada lado limitado a 3 e depois subtraídos). */
  function diceDelta(list, kind) {
    var l = (list || []).filter(function (b) { return aplicaEm(b, kind); });
    return Math.min(somaTipo(l, 'buff_dado'), TETO_DADOS) - Math.min(somaTipo(l, 'debuff_dado'), TETO_DADOS);
  }
  function addBuff(list, b) {
    var nb = Object.assign({ id: 'b' + (++_seq), duracao: null, persistente: false }, b);
    if (nb.duracao == null && COM_DURACAO_PADRAO[nb.tipo] && !b.semDuracao) nb.duracao = DURACAO_PADRAO;
    nb.restante = nb.duracao;
    if (isDado(nb)) {
      var cabe = Math.max(0, TETO_DADOS - somaTipo(list, nb.tipo));
      if (cabe <= 0) return { ok: false, motivo: 'teto', buff: null };
      nb.valor = Math.min(nb.valor || 1, cabe); list.push(nb);
      return { ok: true, buff: nb, limitado: nb.valor < (b.valor || 1) };
    }
    nb.chave = nb.chave || (nb.tipo + ':' + (nb.texto || ''));
    var ex = list.filter(function (x) { return x.chave === nb.chave; })[0];
    if (ex) {
      if (Math.abs(nb.valor || 0) > Math.abs(ex.valor || 0)) ex.valor = nb.valor;
      ex.duracao = nb.duracao; ex.restante = nb.restante;
      return { ok: true, buff: ex, renovado: true };
    }
    list.push(nb); return { ok: true, buff: nb };
  }
  /** Chamar no FIM do turno de quem tem os buffs. Devolve os que expiraram (e já os remove). */
  function tickTurn(list) {
    var expirados = [];
    for (var i = list.length - 1; i >= 0; i--) {
      var b = list[i]; if (b.restante == null) continue;
      b.restante -= 1;
      if (b.restante <= 0) { expirados.unshift(b); list.splice(i, 1); }
    }
    return expirados;
  }
  function removeBuffs(list, ids) {
    ids.forEach(function (id) { var i = list.findIndex(function (b) { return b.id === id; }); if (i >= 0) list.splice(i, 1); });
  }

  /* ───────── Dano ───────── */
  /**
   * @param {{expr:string, flat?:number, crit?:boolean, buffs?:Array, kind?:'ataque'|'magia'|'skill', rng?:Function}} o
   * @returns resultado da rolagem + ids dos buffs que devem ser consumidos (só se a jogada tem dados).
   */
  function damageRoll(o) {
    var base = parseExpr(o.expr), kind = o.kind || 'ataque', buffs = o.buffs || [];
    var tem = temDados(base), delta = tem ? diceDelta(buffs, kind) : 0;
    var mod = applyModifiers(base, { crit: !!o.crit, delta: delta });
    var r = roll(mod, o.rng), flatExtra = o.flat || 0;
    var consumidos = tem ? buffs.filter(function (b) { return isDado(b) && !b.persistente && aplicaEm(b, kind); }).map(function (b) { return b.id; }) : [];
    return { base: fmt(base), expr: fmt(mod), delta: delta, total: Math.max(0, r.total + flatExtra), flat: r.flat + flatExtra,
             groups: r.groups, text: r.text, consumidos: consumidos, semDados: !tem };
  }

  /* ───────── CD e testes ───────── */
  function cdMagica(prof, m) { return 8 + prof + Math.max(m.int, m.sab, m.car); }
  function cdFisica(prof, m) { return 8 + prof + Math.max(m.for, m.des); }
  function resolveCD(cd, ctx) {
    if (cd && typeof cd === 'object' && cd.fixa != null) return cd.fixa;
    return cd === 'fisica' ? ctx.cdFisica : ctx.cdMagica;
  }
  /** Teste de resistência de quem sofre o efeito: d20 + mod >= CD passa. Sem regra especial para 1 ou 20 natural. */
  function rollSave(o) {
    var rng = o.rng || Math.random, d20 = o.d20 != null ? o.d20 : 1 + Math.floor(rng() * 20);
    var total = d20 + (o.mod || 0);
    return { d20: d20, total: total, cd: o.cd, passou: total >= o.cd };
  }
  /** passou: 'metade' | 'nada' | 'anula'. Dano rolado uma vez; quem falha toma tudo. */
  function applySave(dano, passou, regra) {
    if (!passou) return dano;
    return regra === 'metade' ? Math.floor(dano / 2) : 0;
  }

  /** Resolve o teste de resistência de UM alvo e o dano que ele toma. dano = valor já rolado (uma vez só pra todos). */
  function resolveSaveAlvo(o) {
    var s = rollSave({ d20: o.d20, mod: o.mod, cd: o.cd, rng: o.rng });
    return { d20: s.d20, total: s.total, cd: s.cd, passou: s.passou, dano: o.dano ? applySave(o.dano, s.passou, o.regra) : 0 };
  }
  /** Efeitos (só os que recaem sobre o alvo) que valem pra quem passou ou falhou no teste. */
  function efeitosAlvo(efeitos, passou) {
    return (efeitos || []).filter(function (f) {
      return f.quando === 'sempre' || (f.quando === 'falha' && !passou) || (f.quando === 'passou' && passou);
    });
  }

  /* ───────── Custo e escala ───────── */
  function taxaSt(fo) { return Math.ceil(fo / 3); }            // igual ao foTax da Ficha
  function custoMin(c) { return typeof c === 'number' ? c : (c && typeof c === 'object' && c.min != null ? c.min : null); }
  function custoMax(c) { return c && typeof c === 'object' && c.max != null ? c.max : null; }
  function danoExpr(d) {
    if (!d) return '';
    var s = d.dados || '';
    if (d.fixo != null && d.fixo !== '' && typeof d.fixo === 'number') s += (d.fixo >= 0 && s ? '+' : '') + d.fixo;
    return s;
  }
  function somaDados(base, ganha, vezes) {
    if (!ganha || !vezes) return base;
    var g = parseExpr(ganha); g.terms.forEach(function (t) { t.n *= vezes; });
    var b = parseExpr(base); return fmt(normalize({ terms: b.terms.concat(g.terms), flat: b.flat + g.flat * vezes }));
  }
  /**
   * Reforço por mana extra. Devolve o que a magia faz gastando `gasto` e quanto sobra sem efeito.
   * @param {object} mec  entrada do Livro
   * @param {number} gasto  mana (🔵) que o jogador escolheu gastar
   * @param {{nivel?:number}} [ctx]
   */
  function scaleSpell(mec, gasto, ctx) {
    var min = custoMin(mec.custo), max = custoMax(mec.custo), e = mec.escala || {};
    if (min == null) return { ok: false, motivo: 'custo não numérico' };
    if (gasto < min) return { ok: false, motivo: 'abaixo do custo mínimo (' + min + ')' };
    if (max != null && gasto > max) return { ok: false, motivo: 'acima do máximo (' + max + ')' };
    var res = { ok: true, gasto: gasto, custoSt: taxaSt(gasto), steps: 0, desperdicio: 0,
                dano: danoExpr(mec.dano) || null, cura: mec.cura ? danoExpr(mec.cura) : null, dardos: mec.dano && mec.dano.dardos != null ? mec.dano.dardos : null };
    if (!e.passo) { res.desperdicio = 0; res.semEscala = !!(mec.escala); return res; }   // escala especial (ex.: Armadura de Agathys): manual
    if (e.requer_nivel && ctx && ctx.nivel != null && ctx.nivel < e.requer_nivel) return res;
    var de = e.a_partir_de != null ? e.a_partir_de : min;
    var maxSteps = e.max != null ? e.max : (e.max_dados != null ? e.max_dados - 1 : (max != null ? Math.floor((max - de) / e.passo) : Infinity));
    var steps = Math.min(Math.floor(Math.max(0, gasto - de) / e.passo), maxSteps);
    res.steps = steps; res.desperdicio = Math.max(0, gasto - de) - steps * e.passo;
    var g = e.ganha || {};
    if (g.dano) res.dano = somaDados(res.dano || '', g.dano, steps);
    if (g.cura) res.cura = somaDados(res.cura || '', g.cura, steps);
    if (g.dardos) res.dardos = (res.dardos || 0) + g.dardos * steps;
    return res;
  }

  /**
   * Monta a expressão de dano de um mec de ataque (arma + dados + fixo).
   * arma = { dano: '1d8', extra: n }  (extra = mod + atributo + bônus de dano da arma, já somado pela Ficha).
   * ok:false quando o mec tem algo que o motor ainda não resolve (golpes, multiplicador) — a Ficha cai no fluxo antigo.
   */
  function composeDano(mec, arma) {
    var d = mec && mec.dano;
    if (!d) {
      if (mec && mec.resolucao && mec.resolucao.tipo === 'ataque') {
        return { ok: true, expr: '', extra: 0, semDano: true, tipo: null, alt: null, golpes: 1 };
      }
      return { ok: false, motivo: 'sem dano' };
    }
    if (d.por || d.so_se_falhar || (d.multiplicador && d.multiplicador < 0.5)) return { ok: false, motivo: 'esse formato de dano ainda é manual' };
    var parts = [], extra = 0;
    if (d.arma) {
      if (!arma || !arma.dano || !String(arma.dano).trim()) return { ok: false, motivo: 'defina o dano da arma' };
      var mult = (typeof d.multiplicador === 'number' && d.multiplicador > 0) ? d.multiplicador : 1;
      var wParsed = parseExpr(arma.dano);
      var wTerms = wParsed.terms.map(function (t) {
        var num = mult < 1 ? Math.max(1, Math.floor(t.n * mult)) : Math.round(t.n * mult);
        return num + 'd' + t.s;
      });
      if (wTerms.length) parts.push(wTerms.join('+'));
      extra += Math.round((arma.extra || 0) * (d.multiplica_extra ? mult : 1)) + Math.round(wParsed.flat * mult);
    }
    if (d.dados) parts.push(d.dados);
    if (typeof d.fixo === 'number') extra += d.fixo;
    var expr = fmt(parseExpr(parts.join('+')));
    return { ok: true, expr: expr === '0' ? '' : expr, extra: extra, tipo: d.tipo || null, alt: d.alt || null, golpes: d.golpes || d.ataques || null };
  }

  /* ───────── Validador do mec ───────── */
  var V = {
    top: 'v id nome revisado origem acao recurso custo dano cura alvos resolucao efeitos escala opcoes uso requisito preparo usa_arma automacao manual duvidas elemento distribuicao perguntas manutencao nivel_minimo duracao'.split(' '),
    acao: 'padrao rapida assinatura gratuita reacao passiva'.split(' '), recurso: 'fo st misto'.split(' '),
    papel: 'inimigo aliado si qualquer si_ou_aliado zona'.split(' '), forma: 'quadrado raio linha cone'.split(' '),
    res: 'nenhuma ataque save automatico'.split(' '), passou: 'metade anula nada'.split(' '), attr: 'for des con int sab car'.split(' '),
    ef: 'status bonus dano_condicional efeito_livre dano_por_turno vantagem desvantagem hp_temp buff_dado debuff_dado regen dano_proprio multiplicador_dano cura desbloqueio'.split(' '),
    quando: 'sempre falha acerto condicional fim passou'.split(' '), em: 'alvo zona todos conjurador aliado'.split(' '),
    uso: 'sessao combate turnos furia turno'.split(' '), autom: 'total parcial manual texto'.split(' ')
  };
  function inn(l, v) { return l.indexOf(v) >= 0; }
  function validateMec(m) {
    var err = [], warn = [];
    function chk(c, msg) { if (!c) err.push(msg); }
    Object.keys(m).forEach(function (k) { if (!inn(V.top, k)) warn.push('campo desconhecido: ' + k); });
    chk(m.v === 1, 'v deve ser 1'); chk(typeof m.id === 'string' && m.id, 'id ausente'); chk(inn(V.acao, m.acao), 'acao inválida: ' + m.acao);
    if (m.recurso != null) chk(inn(V.recurso, m.recurso), 'recurso inválido');
    if (m.custo != null) {
      var c = m.custo, ok = typeof c === 'number' || typeof c === 'string' || (typeof c === 'object' && (c.min != null || c.fo != null));
      chk(ok, 'custo inválido'); if (typeof c === 'object' && c.min != null) chk(c.max >= c.min, 'custo max < min');
    }
    (m.alvos || []).forEach(function (a, i) {
      chk(inn(V.papel, a.papel), 'alvo[' + i + '].papel inválido: ' + a.papel);
      if (a.qtd != null) chk(a.qtd === 'marcar' || (Number.isInteger(a.qtd) && a.qtd > 0), 'alvo[' + i + '].qtd inválida');
      if (a.area) { chk(inn(V.forma, a.area.forma), 'area.forma inválida'); if (a.area.tamanho == null) warn.push('alvo[' + i + '] área sem tamanho'); }
    });
    var r = m.resolucao;
    if (r) {
      chk(inn(V.res, r.tipo), 'resolucao.tipo inválido');
      if (r.tipo === 'save') {
        chk(inn(V.attr, r.save), 'save sem atributo válido');
        chk(r.cd === 'magica' || r.cd === 'fisica' || (r.cd && r.cd.fixa != null), 'save sem cd válida');
        chk(inn(V.passou, r.passou), 'save sem regra de passou');
      }
    }
    if (m.dano && m.dano.dados) chk(/^\d*d\d+([+-]\d+)?$/i.test(m.dano.dados), 'dano.dados inválido: ' + m.dano.dados);
    if (m.cura && m.cura.dados) chk(/^\d*d\d+$/i.test(m.cura.dados), 'cura.dados inválido: ' + m.cura.dados);
    (m.efeitos || []).forEach(function (e, i) {
      chk(inn(V.ef, e.tipo), 'efeito[' + i + '].tipo inválido: ' + e.tipo); chk(inn(V.quando, e.quando), 'efeito[' + i + '].quando inválido');
      chk(inn(V.em, e.em), 'efeito[' + i + '].em inválido');
      if (isDado(e)) chk(Number.isInteger(e.valor) && e.valor >= 1 && e.valor <= TETO_DADOS, 'efeito[' + i + '] dado fora de 1..3');
    });
    if (m.opcoes) {
      var ids = {}; (m.opcoes.lista || []).forEach(function (o) { chk(o.id && !ids[o.id], 'opção sem id ou repetida'); ids[o.id] = 1; chk(o.nome, 'opção sem nome'); });
      chk((m.opcoes.lista || []).length >= 2, 'opcoes com menos de 2 itens');
    }
    if (m.uso) chk(inn(V.uso, m.uso.limite), 'uso.limite inválido');
    if (m.escala && m.escala.passo != null) chk(m.escala.passo > 0, 'escala.passo inválido');
    if (m.automacao) chk(inn(V.autom, m.automacao), 'automacao inválida');
    return { erros: err, avisos: warn };
  }

  return { ELEMENTOS: ELEMENTOS, DURACAO_PADRAO: DURACAO_PADRAO, ALCANCE_PADRAO: ALCANCE_PADRAO, TETO_DADOS: TETO_DADOS, MIN_DADOS: MIN_DADOS,
    parseExpr: parseExpr, fmt: fmt, applyModifiers: applyModifiers, roll: roll, temDados: temDados,
    diceDelta: diceDelta, addBuff: addBuff, tickTurn: tickTurn, removeBuffs: removeBuffs, damageRoll: damageRoll,
    cdMagica: cdMagica, cdFisica: cdFisica, resolveCD: resolveCD, rollSave: rollSave, applySave: applySave,
    taxaSt: taxaSt, scaleSpell: scaleSpell, danoExpr: danoExpr, composeDano: composeDano, resolveSaveAlvo: resolveSaveAlvo, efeitosAlvo: efeitosAlvo, validateMec: validateMec };
});
