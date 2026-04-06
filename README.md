# OlaRPG

Projeto de RPG de mesa com sistema proprietário, contendo fichas de personagem interativas, livro de regras com magias e técnicas, e um bestiário completo.

## Estrutura de Arquivos

### Páginas Principais

- **`Ficha final.html`** — Ficha de personagem interativa para preenchimento e gerenciamento de stats, habilidades, relíquias e inventário.
- **`Livro base.html`** — Referência completa do sistema contendo:
  - 📜 **Magias gerais**: Destruição, Proteção, Ilusão e outras escolas de magia
  - 🥋 **Técnicas gerais**: divididas por estilos de combate:
    - **Ofensivo**: Golpe Carregado, Ataque Duplo, Romper Defesa, Golpe Decisivo
    - **Defensivo**: Postura Defensiva, Desviar, Recuar Tático, Adrenalina de Combate
    - **Controle**: Derrubar, Empurrão, Desarmar, Marcar
    - **Mobilidade**: Salto Tático, Correr, Flanquear
    - **Híbrido**: Lâmina de Vácuo, Sobrecarga Nervosa, Pulso Gravitacional
  - 🔮 **Relíquias**: organizadas por raridade (Comum, Incomum, Raro, Épico e Lendário)
  - 🗡️ **Armaduras e armas mágicas** para equipamentos
- **`bestiario.html`** — Referência de criaturas e monstros do sistema.

### Backups

- **`Versões estaveis/`** — Backups estáveis dos arquivos principais (Livro base, Ficha final e Bestiário).

## Sistema de Jogo

### Recursos

- **HP** — Pontos de vida
- **ST (🟡)** — Stamina, usado para técnicas
- **FO (🔵)** — Força espiritual / Mana, usado para magias

### Estilos de Combate

- **Ofensivo** — Foco em dano e pressão
- **Defensivo** — Proteção e sobrevivência
- **Controle** — Manipulação de campo e desarmamento
- **Mobilidade** — Movimento e posicionamento tático
- **Híbrido** — Combina ST + FO para habilidades poderosas

### Combate

Baseado em grid com áreas de efeito (blocos 1x3, 3x3, etc.) e posicionamento tático.
