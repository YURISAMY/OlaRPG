# Guia de Criação de Criaturas

> Todas as criaturas devem ter: **HP**, **Stamina (🟡)**, **Foco/Mana (🔵)** e **Recuperação**. Opcionalmente: skills que consomem recursos e passivas.

---

## 1. VIDA (HP)

O HP varia com o **porte** e a **robustez** da criatura.

| Faixa | Significado | Exemplo |
|---|---|---|
| 1 – 19 | Pouquíssima vida | Imp, fada minúscula, rato gigante |
| 20 – 50 | Pouca vida | Jogador iniciante, lobo, goblin |
| 51 – 100 | Vida média | Mago nível 10 (~70), guerreiro nível 10 (~90) |
| 101 – 160 | Vida alta | Mago late game (~120), Troll, Golem comum (~140) |
| 161 – 240 | Vida altíssima | Marcial nível 20 (~200) |
| 300 – 450 | Vida colossal | Dragões, chefes mid-late game |
| 500 – 800+ | End game | Último boss de campanha nível 15–20 |

### Diretrizes por criatura

| Criatura | HP Sugerido |
|---|---|
| Imp, Fada | 5 – 12 |
| Kobold, Goblin, Rato Gigante | 15 – 25 |
| Lobo, Serpente, Humano comum | 20 – 40 |
| Bandido, Guarda, Urso | 30 – 50 |
| Troll, Ogro, Mímico | 80 – 120 |
| Golem de Pedra, Múmia | 100 – 150 |
| Vampiro Elite, Lich | 60 – 90 |
| Dragão Jovem | 200 – 300 |
| Dragão Ancião, Behemoth | 400 – 600 |
| Boss Final (nível 20) | 600 – 800+ |

---

## 2. STAMINA (🟡)

Stamina é usada para ataques físicos e ações de combate.

### Reserva de Stamina

Para reserva de Stamina, o valor atribuído depende da **natureza** da criatura:

#### Criaturas Físicas

| Categoria | ST | Ritmo de combate |
|---|---|---|
| **Espadachim / Ágil / Astuto** | 16 – 21 | Bate com frequência e agilidade. Ataca 2x (mas não tão forte) ou 1x forte gastando boa parte. |
| **Guerreiro / Troll** | 11 – 15 | Bate forte com boa frequência. Ataca 2x com frequência, vive pra briga. |
| **Troll / Leão / Medusa** | 10 – 11 | Faz ações valer. Ataca 1x por turno, raramente 2x. |
| **Dragão / Serpente / Grande** | 9 – 10 | Mover tanto músculo cansa. 1x por turno, mas imponente. |
| **Golem / Colossal** | 7 – 8 | Perigosos só por existir. Atacam a cada ~1.5 turnos. Cada tacada é "me ferrei". RD alto. |

#### Mágicos Puros (sem habilidades físicas relevantes)

Um mago puro **não treina fôlego** — treina a mente. Sua stamina é comparável à de criaturas colossais: pouca, e regenera devagar.

| Categoria | ST | Exemplo |
|---|---|---|
| **Mago iniciante / fraco** | 5 – 8 | Cultista, Bruxa do Pântano, Slime Arcano |
| **Mago experiente** | 9 – 10 | Mago de batalha, Piromante, Elemental maior focado em magia |
| **Arquimago / Lich / late game** | 10 – 11 | Arquimago, Lich, Bruxa Ancestral |

> Um jogador arcano no nível máximo tem ~11 ST. Um Lich teria algo similar.

### Recuperação de Stamina

A recuperação por turno depende da **estatura física** e do **tipo**:

#### Físicos

| Categoria | Rec ST |
|---|---|
| **Colossal / Bruto** | 2 ST ou 3 ST |
| **Pesado / Grande** | 5 ST ou 6 ST |
| **Combatente** | Ataque mais barato + 2 ST **ou** Ataque mais barato + 1 ST |
| **Ágil / Ligeiro** | 7 ST ou 8 ST |
| **Deus do Kung Fu** | 10 ST ou 11 ST |

#### Mágicos Puros

| Categoria | Rec ST |
|---|---|
| **Mago iniciante / fraco** | 2 ST ou 3 ST |
| **Mago experiente** | 3 ST ou 4 ST |
| **Arquimago / Lich / avançado** | 5 ST ou 6 ST |

**Critério maior ou menor (escolha esquerda ou direita):**

| Tipo | Valor |
|---|---|
| Puramente físico | Valor da **direita** (maior) |
| Híbrido (usa magia) | Valor da **esquerda** (menor) |
| Boss puramente físico | Direita + 1 |
| Boss Híbrido | Esquerda + 1 (ou direita limpa) |
| Boss mago puro | Direita (magos avançados) |

---

## 3. FOCO / MANA (🔵)

Foco é usado para conjurar magias e habilidades mágicas.

### A criatura tem magia?

→ **Não:** FO = 0. A criatura só usa ST para ataques e técnicas. Todas as habilidades consomem apenas 🟡.

→ **Sim:** continuar.

### Qual é o papel da magia?

| Papel | Tipo |
|---|---|
| Principal forma de ação | **Mago** |
| Secundária / suporte | **Híbrido** |
| Com habilidades mas não é o foco | **Levemente mágico** |
| Nenhuma magia | **Sem mana** |

### Reserva de Foco

| Faixa | Significado | Exemplo |
|---|---|---|
| 0 | Nenhuma mana | Lobos, Ogros, Zumbis, Bárbaros |
| 1 – 6 | Pouca mana | Paladino, guerreiro com 1 truque |
| 7 – 14 | Mana média | Cavaleiro arcano, demônio guerreiro |
| 15 – 25 | Muita mana | Mago experiente, fadas |
| 26 – 30+ | Insanidade de mana | Arquimago, Lich, jogador arcano max |

### Recuperação de Foco

| Tipo | Rec FO | Exemplos |
|---|---|---|
| **Mago comum** | 2 + mod Arcano | Arcanista, Piromante, Bruxa, Xamã, Espírito Elemental, Slime Arcano, Cultista |
| **Híbrido** | 1 + mod Arcano | Paladino, Espadachim Arcano, Caçador Sombrio, Guardião da Floresta 🌿, Mímico, Múmia, Gárgula, Besta Rúnica, Lobo Espiritual, Ent |
| **Boss mágico** | 4 + mod Arcano | Lich, Arquimago, Bruxa Ancestral, Elemental Maior, Olho Aberrante, Dragão Arcano |
| **Boss híbrido** | 2 + mod Arcano | Dragão, Anjo, Titã Desperto, Avatar Elemental, Fênix, Leviatã, Espírito Ancião |

> **mod Arcano** = maior entre INT / SAB / CAR

---

## 4. CUSTO DE MAGIA / HABILIDADE

> **Regra:** Pode conjurar uma magia se tiver 🔵 suficiente **+** um terço do valor dela em 🟡. Arredonda para cima.
>
> Exemplo: Magia de **9🔵** custa **3🟡** (9 ÷ 3 = 3)

> **Sugestão (Cooldown / TR):** Habilidades de alto impacto (custo elevado em 🟡, efeitos fortes ou controle significativo) podem receber um *Tempo de Recarga (TR)* para limitar uso repetido. Recomendações práticas:
>
>- Habilidades de custo 7–9🟡: TR 1–2 turnos
>- Habilidades de custo 10🟡 ou mais (épicos): TR ≈ 2 turnos (ex.: épico 10🟡 → TR 2)
>- TR começa a contar no turno seguinte ao uso; enquanto em TR a habilidade não pode ser ativada.
>
Use TR quando quiser limitar spam sem forçar dependência exclusiva da acumulação de ST.

> **Regra de Reserva:** uma habilidade não pode ter custo em 🟡 maior do que a reserva máxima de ST da criatura; da mesma forma, uma magia não pode exigir mais 🔵 do que a reserva máxima de FO. Se um efeito parecer exigir mais do que a reserva permite, ajuste: reduza o custo, torne-o multi-turno, aumente o TR, ou transforme-o em custo condicional.

Uma mana pool alta é balanceada pela **falta de stamina** para gastá-la toda.

---

## 5. DEFINIÇÃO DO TIER DE DIFICULDADE

O tier de dificuldade indica quão letal uma criatura é em combate. Como criaturas variam entre **tanques** (HP alto) e **canhões de vidro** (HP baixo, dano alto), o tier é calculado **somando** os fatores abaixo:

| Fator | Pontos |
|---|---|
| **HP** | HP ÷ 15 |
| **Poder de ataque** | Bônus de Ataq × 2 |
| **Defesa** | CA - 10 |
| **Poder de Dano** | Média de dano do golpe mais forte ÷ 2 |
| **Skills de controle** (Derrubado, Preso, Cego, agarrado, Seduzido, etc) | +1 a +3 por skill (dependendo da gravidade e se for em área) |
| **Passivas defensivas** (RD, imunidade, cura, regeneração, escudos) | +1 a +2 por passiva (dependendo do poder de mitigação) |

### Tabela de Tiers

| Score | Tier | Nível sugerido dos jogadores |
|---|---|---|
| **0–8** | 🟢 Fácil | Nível 1–5 |
| **9–16** | 🔵 Médio | Nível 6–10 |
| **17–25** | 🟠 Difícil | Nível 11–15 |
| **26–40** | 🔴 Mortal | Nível 16–20 |
| **41+** | ⚫ Lendário | Level 20+ (boss final) |

### Por que Lich é Mortal com pouco HP?

O Lich tem HP 80 (score ~5.3), mas seu Atq +7 dá 14 pontos de ameaça de ataque, CA 17 dá +7, dano médio de Raio de Desintegração (~22/2) = 11, skills defensivas/controle ~8 = score **~45.3** → **⚫ Lendário** (ou **🔴 Mortal** se balancearmos os debuffs de controle menores).

Um Lobo com HP 18 (score ~1.2), Atq +3 = 6 pontos, CA 13 = +3, dano médio ~3/2 = 1.5 = score **~11.7** → **🔵 Médio**.

---

## 6. ATRIBUTOS

Toda criatura tem 6 atributos com seus modificadores:

```
FOR: +X | DES: +X | CON: +X | INT: +X | CAR: +X | SAB: +X
```

Use como referência:

| Atributo | Faixa típica | Descrição |
|---|---|---|
| -4 a -2 | Horrível | Imp, rato morto-vivo |
| -1 a 0 | Fraco | Civil, criatura simples |
| +1 a +2 | Acima da média | Guerreiro treinado, animal forte |
| +3 a +4 | Muito alto | Elite, criatura especial |
| +5 a +7 | Sobre-humano | Boss, dragão, colosso |
| +8+ | Lendário | Boss final, entidade cósmica |

---

## 7. ARMADURA E ATAQUE

```
CA: XX | Atq: +X
```

- **CA (Classe de Armadura):** 8 é desprotegido, 12 é couro, 15 é cota, 17+ é armadura mágica/placas
- **Ataq (+X):** Bônus de acerto nos ataques. +2-3 fraco, +5-6 médio, +7-8 forte, +10+ aterrorizante

---

## 8. CLASSE DA CRIATURA (data-cat)

Use uma das categorias do bestiário:

| Categoria | data-cat | Cor do título | Exemplo |
|---|---|---|---|
| Besta | `besta` | verde (`#6aaa46`) | Rato Gigante, Serpente, Pantera |
| Humanoide | `humanoide` | dourado (`#c9921a`) | Bandido, Kobold, Goblin |
| Morto-Vivo | `morto-vivo` | roxo (`#7060a0`) | Zumbi, Esqueleto, Múmia |
| Sobrenatural | `sobrenatural` | magenta (`#c040c0`) | Vampiro, Demônio, Succubus |
| Celestial | `celestial` | dourado claro (`#d4b060`) | Anjo, Serafim |
| Constructo | `construto` | cinza (`#a0a0a0`) | Golem, Autômato |
| Monstruosidade | `monstruosidade` | vermelho (`#a03030`) | Hidra, Jacaroá, Troll |

**Demônios** usam a categoria `sobrenatural`.

---

## 9. HABILIDADES (SKILLS)

### Formato

```
⚪ Nome da Habilidade - Tipo de Ação
CUSTO
Descrição
```

### Tipos de Ação

| Tipo | Descrição |
|---|---|
| **Padrão** | Ação principal de ataque/magia |
| **Rápida** | Reação, movimento, escape |
| **Livre** | Instantânea, sem custo |
| **Passiva** | Sempre ativa, sem custo |

### Diretrizes de Design

1. **Respeite a fantasia** da criatura
   - Serpente abissal → mordida colossal, pele escorregadia
   - Pantera deslocadora → golpes baratos, baixa dano individual, alta frequência
   - Golem → poucos ataques, mas devastadores; alta RD a físico

2. **Balanceamento de combate**
   - Golpes baratos (2-3🟡): dano moderado (1d6-1d8), efeitos leves
   - Golpes médios (4-6🟡): dano sólido (1d8+mod ou 2d6+mod), status
   - Golpes caros (7+🟡): dano alto (2d8+mod ou mais), efeitos fortes
   - Boss fights: podem ter ações que quebram as regras para criar tensão
 
4. **Cooldowns / Tempo de Recarga (TR)**
  - Skills de alto impacto (ex.: custo ≥ 7🟡, grande controle ou área) podem ter TR (1–3 turnos) para evitar spam.
  - Exemplo prático: habilidade épica de 10🟡 → TR 2.
  - Prefira TR quando a limitação por acumulação de ST seja pouco elegante para a fantasia.

5. **Esperar / Defender (abrir mão do ataque básico)**
  - Permitir uma ação custo `0🟡` que representa defender, esperar ou focar em recuperação.
  - Ao usar essa ação, a criatura (ou jogador) ganha a Recuperação de ST inteira daquele turno (Rec ST), permitindo acelerar cargas épicas.
  - Observação: esta opção já aparece nos exemplos como "Não agir" (+2🟡); aqui formalizamos a regra como trade-off tático.

3. **Passivas são quase sempre bem-vindas** (não obrigatórias)

   Abaixo são **exemplos** do que uma passiva poderia ser para cada tipo, não regras fixas — sinta-se livre para inventar:

   - Zumbi → "resiste a golpe fatal 1x"
   - Golem → "resistência flat a dano físico (ex: -8 damage físico)"
   - Lobo → "vantagem contra alvos derrubados"

---

## 10. FLUXO DE CRIAÇÃO (CHECKLIST)

```
1. Qual o NOME, PORTE e CLASSE da criatura?
   → Ex: Kobold Escavador · Pequeno · Monstruosidade

2. Qual o HP? (consulte a tabela da Seção 1)

3. A criatura tem magia?
   → Não: FO = 0, sem recuperação
   → Sim: continue

4. A magia é principal ou secundária?
   → Principal: tipo Mago
   → Secundária: tipo Híbrido

5. É um boss?
   → Sim: versão Boss da categoria
   → Não: versão normal

6. Definir ST e FO (consulte Seções 2 e 3)

7. Definir o Tier de Dificuldade (Seção 5)

8. Definir ATRIBUTOS (Seção 6)

9. Definir CA e bônus de Ataque (Seção 7)

10. Criar HABILIDADES ativas
    → 2-4 ataques/skills com custos (Seção 9)

11. Criar PASSIVAS
    → 1-3 traços temáticos (Seção 9)
```

---

## 10. EXEMPLO PRÁTICO

### Kobold Escavador

```
Nome: Kobold Escavador
Porte: Pequeno
Classe: Monstruosidade
HP: 18 (pouca vida, criatura frágil)
Tem magia? → Não (puramente físico)

ST: 7 (Ágil/Ligeiro, puro → direita: 7)
FO: 0

Rec ST = Ágil/Ligeiro, puro → direita: 8🟡 por turno

Atributos: FOR:+1  DES:+3  CON:+0  INT:-1  CAR:-2  SAB:+1
CA: 13 | Atq: +4

HABILIDADES:
  ⚪ Mordida Afiada - Padrão — 2🟡
    1d6+1 perfurante.

  ⚪ Lança Enferrujada - Padrão — 3🟡
    1d8+1 perfurante. Alcance 5 blocos.

  ⚪ Escavar - Rápida — 3🟡
    Move 3 blocos, pode passar por terreno difícil. Passa por baixo de terreno raso: não pode ser alvo de reações.

PASSIVAS:
  ⚪ Covarde e Astuto - Passiva
    +2 em Furtividade. Se começar o turno escondido, +1d6 em ataques.

  ⚪ Armadilha Improvisada - Reação — 4🟡
    Quando inimigo entra a 2 blocos: DES 12 ou fica Preso. 1x por combate.
```

---

### Vampiro (referência de monstro hibrido existente)

```
HP: 70 (vida média-alta para elite)
ST: 12 (combatente híbrido)
FO: 14 (muita mana, mago experiente)
Rec: 3🟡 / 5🔵 por turno

mod Físico = máx(+4 FOR, +3 DES, +4 CON) = +4
mod Arcano = máx(+3 INT, +2 CAR, +3 SAB) = +3
Híbrido mágico → Rec FO = 1 + mod Arcano = 1+3 = 4 (mas tem 5, ajuste de boss)
Combatente → Rec ST = 2 + mod Físico = 2+4 = 6 (mas tem 8, ajuste de elite)

Atributos: FOR:+4  DES:+3  CON:+4  INT:+3  CAR:+2  SAB:+3
CA: 16 | Atq: +7
```

---

## 11. ADICIONAR CRIATURA AO BESTIÁRIO (HTML)

Para inserir uma criatura no `bestiario.html`, use este template HTML e insira após o último card da categoria correspondente (antes do primeiro card de outra categoria ou antes de `</div>` do container):

### Template HTML

```html
      <div class="base-card medium criatura-card hidden" data-cat="CATEGORIA" style="overflow: visible;">
        <div class="base-card-title" style="color:#COR; margin-bottom:4px;">NOME DA CRIATURA</div>
        <p style="font-size:12px;color:rgba(245,234,214,0.45);margin-bottom:12px;font-style:italic;">Classe Porte — Subtipo</p>

        <p style="font-size:11px;color:rgba(245,234,214,0.6);margin-bottom:12px;line-height:1.5;">Descrição em 1-2 frases.</p>

        <div class="stat-row">
          <span class="stat-pill hp">❤️ HP: VALOR</span>
          <span class="stat-pill st">🟡 ST: VALOR</span>
          <span class="stat-pill fo">🔵 FO: VALOR</span>
          <span class="stat-pill rec" style="border-color:rgba(255,255,255,0.15);color:rgba(245,234,214,0.6);">🔄 Rec: X🟡 por turno</span>
          <span class="stat-pill rec" style="border-color:rgba(255,255,255,0.2);">CA: X | Atq: +X</span>
        </div>

        <div class="skill-base-row" style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); padding:6px 12px; margin-bottom:6px;">
          <span style="font-family:&#39;Share Tech Mono&#39;; font-size:10px; color:rgba(245,234,214,0.5); letter-spacing:0.05em;">FOR: +X | DES: +X | CON: +X | INT: +X | CAR: +X | SAB: +X</span>
        </div>

        <p style="font-size:11px;color:rgba(245,234,214,0.4);margin-top:16px;margin-bottom:8px;font-family:&#39;Share Tech Mono&#39;,monospace;letter-spacing:0.08em;">HABILIDADES</p>
              <div class="skill-base-row">
                <span class="skname">⚪ Nome da Skill - Tipo</span><span class="skcost">X🟡</span>
                <div class="skdesc">Descrição da habilidade.</div>
              </div>

            <button class="add-battle-btn">Adicionar ➕</button></div>
      ```

      ---

      ### Exemplos Recalculados (regra 1/3 de ST para conjurar)

      > Nota: valores de **ST acima de 13** são indicativos de criaturas ágeis/experientes (alto nível). Exemplos abaixo respeitam esse limite — um duelista iniciante não teria 18 de ST, mas pode manter recuperação alta.

      #### Guerreiro de Campo
      ```
      Nome: Guerreiro de Campo
      Porte: Médio | Classe: Humanoide
      HP: 95
      ST: 12 | FO: 0
      Rec: 🔄 Rec: 6🟡 / turno

      Ataque básico: 4🟡
      Golpe Épico: Investida Brutal — 10🟡 (Padrão)

      Cálculo: spare_por_turno = Rec − Custo_básico = 6 − 4 = 2🟡
      Turns_para_épico = ceil(10 / 2) = 5 turnos (se sempre usar básico).
      Observação: usar a ação “Não agir” (+2🟡) reduz o tempo de espera; ST máximo limita acúmulo.
      ```

      #### Lâmina Veloz (Ágil) — duelista iniciante
      ```
      Nome: Lâmina Veloz (Ex: Duelista iniciante)
      Porte: Pequeno | Classe: Humanoide (Ágil)
      HP: 36
      ST: 12 | FO: 0
      Rec: 🔄 Rec: 7🟡 / turno

      Ataque básico: 4🟡
      Habilidade de Burst: Sequência Mortal — 8🟡 (Padrão)

      Cálculo: spare_por_turno = 7 − 4 = 3🟡
      Turns_para_burst = ceil(8 / 3) = 3 turnos.
      Nota: ST = 12 respeita o limite (valores >13 indicam mulltiplos níveis/elite). Recuperação alta permite decidir entre spam de básicos ou guardar por ~3 turnos para burst.
      ```

      #### Golem de Pedra (Colosso)
      ```
      Nome: Golem de Pedra
      Porte: Colossal | Classe: Construto
      HP: 140
      ST: 8 | FO: 0
      Rec: 🔄 Rec: 3🟡 / turno

      Ataque pesado: Tacada Devastadora — 6🟡 (Padrão)
      Dano: 3d8 + 7; RD flat: 8

      Comentário prático: spare_por_turno = 3 − 4 = −1 (não sustentável se usar ataque básico de 4🟡). Em vez de frações, aplicar ritmo: "Golem ataca ~2 vezes a cada 3 turnos" (ex.: turno A: Tacada, turno B: pausa/recolhimento, turno C: ataque reduzido). Mantém fantasia de poder alto + lentidão.
      ```

      ---

      Relembrando a regra de conjuração: conjurar magia exige ter 🔵 suficiente **+** ⌈(custo🔵 / 3)⌉ 🟡 (arredonda para cima). Ex.: magia de 9🔵 → 3🟡.

### Cores por categoria (data-cat e color)

| Categoria | data-cat | Cor |
|---|---|---|
| Besta | `besta` | `#6aaa46` |
| Humanoide | `humanoide` | `#c9921a` |
| Morto-Vivo | `morto-vivo` | `#7060a0` |
| Sobrenatural | `sobrenatural` | `#c040c0` |
| Celestial | `celestial` | `#d4b060` |
| Constructo | `construto` | `#a0a0a0` |
| Monstruosidade | `monstruosidade` | `#a03030` |

Demônios usam `sobrenatural`. Criaturas únicas (Boss Lendário) podem ter o badge `★ CRIATURA ÚNICA` com borda dourada.

### Onde inserir

- Após o `</button></div>` do **último card** da mesma categoria
- **Antes** do primeiro `<div class="base-card medium criatura-card hidden" data-cat="OUTRA_CATEGORIA">` de uma categoria diferente
- Se for a **primeira criatura** de uma categoria nova, adicione o `<div class="criatura-filter-btn">` na barra de filtros (linha ~744 do bestiário.html)

### Regras de formatação

1. **Acentos em HTML**: use entidades HTML para acentos especiais (`&#231;` = ç, `&#227;` = ã, `&#237;` = í) **ou** escreva sem acento. Emojis (🟡, 🔵, ❤️, ⚪) são usados diretamente.
2. **`&#39;`** = apóstrofo em strings inline (font-family Share Tech Mono).
3. **Custos de skill (Físico)**: sempre no formato `<span class="skcost">X🟡</span>` — sem aspas extras, sem `"/>`.
4. **Custos de skill (Mágico)**: Para magias, coloque **apenas** o custo de Foco no HTML (`<span class="skcost">X🔵</span>`). **NUNCA** adicione o custo de Stamina ao lado. O sistema de batalha calcula e deduz a Stamina automaticamente (1/3 do custo de Foco) no momento do uso.
5. **Skills com custo baixo**: use `3🟡` ou mais para ataques básicos (nenhum ataque que causa dano deve custar 0🟡).
6. **Recuperação dupla** (ST e FO): `<span class="stat-pill rec">🔄 Rec: X🟡 / Y🔵 por turno</span>`
7. **Recuperação só ST**: `<span class="stat-pill rec">🔄 Rec: X🟡 por turno</span>`
8. **Sem recuperação**: Apenas em casos de FO = 0. Stamina sempre deve ter alguma recuperação.
9. **FO = 0**: ainda deve aparecer `<span class="stat-pill fo">🔵 FO: 0</span>` no card.
