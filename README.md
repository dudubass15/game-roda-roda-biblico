# Roda a Roda Bíblico - Web Canvas

Roda a Roda Bíblico é um jogo web interativo inspirado no clássico programa de televisão. Desenvolvido em JavaScript puro e HTML5 Canvas, tem foco em palavras, nomes e termos temáticos da Bíblia Sagrada. Foi projetado para rodar direto no navegador e permitir partidas dinâmicas entre amigos.

## Visão Geral do Jogo

O jogo simula a dinâmica clássica de adivinhação de painel com letras ocultas, adaptada para um contexto de perguntas e temas bíblicos. Um painel exibe os traços dos caracteres de uma palavra ou frase secreta dividida por palavras e espaços. Os jogadores se revezam para girar uma roleta virtual, escolher consoantes ou comprar vogais, acumulando pontos ou perdendo a vez em caso de erro ou falência.

## Dinâmica e Regras de Funcionamento

* **Exibição do tema:** O jogo mostra um tema bíblico no topo (ex: "Personagens do Antigo Testamento").
* **Painel central:** Exibe blocos opacos ou linhas para cada letra da palavra oculta.
* **Espaçamento:** Mantém espaços vazios entre palavras e deixa pontuações visíveis.
* **Ação do turno:** Na sua vez, o jogador clica para acionar a roleta virtual.
* **Sorteio da roleta:** Define um valor numérico de pontos ou penalidades como "Perde a Vez" e "Passa a Vez/Zera".
* **Chute de consoante:** Se cair em pontuação, o jogador tenta adivinhar uma consoante.
* **Revelação de acertos:** O Canvas revela todas as posições da letra correta na palavra.
* **Cálculo de pontos:** O jogador ganha o valor sorteado multiplicado pela quantidade de letras reveladas.
* **Bônus de acerto:** Acertar a letra mantém o turno com o mesmo jogador.
* **Erro de letra:** Errar a consoante passa a vez imediatamente para o próximo participante.
* **Ações alternativas:** O jogador pode arriscar a resposta completa ou comprar uma vogal se tiver pontos suficientes.
* **Condição de vitória:** Vence a rodada quem acertar a palavra completa e somar mais pontos.

## Especificações Técnicas

* **Linguagem:** JavaScript moderno (ES6+) sem dependências de frameworks pesados.
* **Renderização:** HTML5 Canvas API para desenhar a roleta com animação fluida baseada em `requestAnimationFrame`.
* **Interface gráfica:** Canvas ou estrutura mista para renderizar o painel de blocos de letras.
* **Estilização:** CSS3 responsivo para acomodar o Canvas e os painéis de placar laterais.
* **Arquitetura:** Estrutura orientada a objetos ou modular isolando as responsabilidades do motor do jogo.

## Banco de Dados de Palavras Bíblicas (Exemplo Inicial)

O sistema deve conter um array interno ou arquivo JSON estruturado com os seguintes atributos:

* `tema`: String descritiva do tema.
* `resposta`: String com a palavra ou frase secreta em letras maiúsculas.
* `dica`: String opcional de apoio.

### Exemplos de Estrutura

* **TEMA:** Personagens | **RESPOSTA:** MOISES
* **TEMA:** Livros do Novo Testamento | **RESPOSTA:** APOCALIPSE
* **TEMA:** Lugares | **RESPOSTA:** JERUSALEM

## Instruções para o Agente de IA

O agente de IA deve seguir estas diretrizes estritas para construir a aplicação:

1. **Estrutura HTML (`index.html`):**
   * Criar a estrutura básica do DOM.
   * Incluir tag `<canvas>` dedicada para a roleta animada.
   * Configurar o painel de letras usando DOM ou Canvas misto para garantir nitidez e acessibilidade.

2. **Estilização CSS (`style.css`):**
   * Centralizar o layout do jogo na tela.
   * Criar um painel de placar visível contendo Nome, Pontuação da Rodada e Pontuação Total.
   * Incluir campos de input acessíveis para digitação de letras ou para arriscar o palpite final.

3. **Lógica JS (`game.js`):**
   * **Classe Roleta:** Calcula ângulos dos setores, desenha fatias coloridas e gerencia a velocidade de rotação e desaceleração.
   * **Classe Painel:** Gerencia a matriz de posicionamento dos blocos, animação de revelação e checagem de caracteres.
   * **Classe GerenciadorJogo:** Controla o fluxo de turnos, pontuações, validação de inputs e estados de vitória.

4. **Requisitos de Código:**
   * Incluir array robusto com pelo menos 15 termos e frases bíblicas variadas.
   * Garantir código limpo e totalmente comentado em português.
   * Aplicar tratamento para redimensionamento de tela e responsividade básica.

## Etapas Implementadas

### 1. Estrutura base da aplicação

* **HTML inicial criado:** Montagem do layout principal com sidebar de jogadores, painel de controle e área central do jogo.
* **Canvas da roleta e do painel de letras:** Estruturados em elementos dedicados para permitir renderização nativa e performance eficiente.
* **Dom de interface:** Campos de entrada para letra e resposta, botões de ação, placar de jogadores e display do tema.

### 2. Estilo visual e responsividade

* **Layout em duas colunas:** Sidebar de jogadores e controle, área de jogo principal ocupando o restante da tela.
* **Tema visual temático:** Tons azul, dourado e escuro inspirados em programas de concurso e telões de TV.
* **Responsividade aplicada:** Ajuste de layout para telas menores e reforço de visual para superfícies amplas como TVs de 40" ou maiores.
* **Painel de placar claro:** Estado atual de cada jogador com nome, pontuação total e rodada ativa.

### 3. Lógica do jogo

* **Roleta em Canvas:** Geração de setores, cálculo do ângulo de giro e animação com desaceleração visual.
* **Banco de palavras bíblicas:** Array interno com termos e temas variados, incluindo personagens, livros, lugares e frases bíblicas.
* **Sistema de turnos:** Alternância entre jogadores com destaque visual do participante ativo.
* **Pontuação por letras e escolhas:** Validação de consoante, vogal comprada, ganho de pontos e penalidades de roleta.
* **Resolução de rodadas:** Quando a resposta é revelada, o sistema marca a vitória da rodada e prepara a próxima etapa.

### 4. Ajustes de regra e fluxo

* **Validação de entradas:** Letras em maiúsculas, botão de compra de vogal e resposta final com feedback de status.
* **Penalidades e reset de rodada:** Tratamento para "Passa a vez", "Perde a vez" e "Zera" com regras aplicadas ao jogador atual.
* **Revelação de letras no painel:** A tela da palavra secreta atualiza os blocos conforme as letras acertadas aparecem.
* **Controle do tema e rodada:** Exibição do tema atual e numeração da rodada em andamento.

### 5. Validação em navegador

* **Teste de carregamento local:** Projeto executado em ambiente local via servidor HTTP.
* **Verificação funcional no navegador:** A página carregou com sucesso e a ação de girar a roleta respondeu corretamente na interface.
* **Confirmação do motor principal:** O canvas, a roleta, o painel e os controles estão interagindo de forma funcional em navegador moderno.

### 6. Ajustes de painel, vitória e administração

* **Redimensionamento inteligente do painel:** O sistema ajusta o tamanho dos quadrinhos conforme a quantidade de letras e o espaço disponível, evitando cortes quando a resposta é longa ou quando a tela é menor.
* **Revelação completa ao acertar:** Quando o jogador resolve a palavra ou completa a resposta correta, o jogo preenche automaticamente todos os quadrinhos e exibe a palavra inteira na tela, reforçando a vitória com feedback visual e sonoro.
* **Som de vencedor:** O motor de áudio adiciona um padrão musical de vitória ao final de uma rodada ou da partida, criando sensação de recompensa e clímax para os jogadores.
* **Painel administrativo de respostas:** O usuário responsável pela partida pode abrir um editor de banco de respostas em formato JSON para visualizar, editar e restaurar a lista de temas, respostas e dicas do jogo sem alterar a estrutura principal da aplicação.

## Como Executar

Para rodar o jogo localmente, execute o comando abaixo na raiz do projeto:

* `python3 -m http.server 8000`

Em seguida, abra no navegador:

* `http://localhost:8000`

## Observação Final

A aplicação já está em uma base funcional, pronta para extensão com sons, seleção de nomes dos jogadores, tela inicial de configuração, editor de banco de respostas e maior variedade de regras de competição. O projeto foi preparado para rodar em navegação desktop e também em telas grandes, como TVs de 40 polegadas, com foco em legibilidade, impacto visual e gerenciamento de conteúdo em tempo real.
