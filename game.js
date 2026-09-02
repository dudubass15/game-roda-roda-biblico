const DEFAULT_WORD_BANK = [
  { tema: "Personagens do Antigo Testamento", resposta: "MOISES", dica: "O líder que conduziu o povo de Israel." },
  { tema: "Livros do Novo Testamento", resposta: "APOCALIPSE", dica: "Livro final da Bíblia." },
  { tema: "Lugares Sagrados", resposta: "JERUSALEN", dica: "Cidade central para a fé judaica e cristã." },
  { tema: "Profetas", resposta: "DANIEL", dica: "Profeta conhecido pelos sonhos e pela cova dos leões." },
  { tema: "Pessoas da Bíblia", resposta: "DEBORAH", dica: "Juíza e profetisa do Antigo Testamento." },
  { tema: "Nomes de Mulheres Bíblicas", resposta: "ESTER", dica: "Rainha que salvou seu povo." },
  { tema: "Parábolas de Jesus", resposta: "SAMARITANO", dica: "Parábola sobre um homem socorrido por um estranho." },
  { tema: "Martírios e Fé", resposta: "PAULO", dica: "Apóstolo que escreveu grande parte do Novo Testamento." },
  { tema: "Nomes dos Discípulos", resposta: "PEDRO", dica: "Apóstolo chamado de 'rocha'." },
  { tema: "Eventos Bíblicos", resposta: "ARCA", dica: "Objeto sagrado usado no dilúvio e nos relatos de Moisés." },
  { tema: "Sacrifícios e Adoração", resposta: "TABERNACULO", dica: "Habitação móvel da presença de Deus." },
  { tema: "Livro de Peregrinação", resposta: "EXODO", dica: "Livro que narra a saída do povo de Israel do Egito." },
  { tema: "Comando Divino", resposta: "MANDAMENTO", dica: "Lei ou ordem de Deus para a vida das pessoas." },
  { tema: "Lugares Bíblicos", resposta: "CIDADE", dica: "Local de grande importância em Jerusalém." },
  { tema: "Frases Bíblicas", resposta: "AMOR", dica: "Virtude central ensinada por Jesus e pelos apóstolos." },
  { tema: "Personagens do Novo Testamento", resposta: "MARTA", dica: "Irmã de Lázaro e Maria." },
  { tema: "Histórias de Salvação", resposta: "NARIZ", dica: "Local do ministério de João Batista e Jesus." },
  { tema: "Profetas e Visões", resposta: "JONAS", dica: "Profeta que foi engolido por um grande peixe." }
];

let WORD_BANK = DEFAULT_WORD_BANK.map((item) => ({
  ...item,
  resposta: String(item.resposta || "").toUpperCase(),
  tema: String(item.tema || "").trim(),
  dica: String(item.dica || "").trim()
}));

const WHEEL_SEGMENTS = [
  100, 150, 200, 250, 300, 500,
  50, 100, 200, 300, 150,
  "PASSA", "PERDE", "ZERA"
];

const MAX_ROUNDS = 3;
const MAX_SCORE = 3000;

class AudioEngine {
  constructor() {
    this.context = null;
  }

  ensure() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    if (!this.context) {
      this.context = new AudioCtor();
    }
  }

  tone({ frequency = 440, type = "sine", duration = 0.18, gain = 0.04, delay = 0 }) {
    this.ensure();
    if (!this.context) {
      return;
    }

    const startTime = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  }

  playSpin() {
    this.tone({ frequency: 170, type: "triangle", duration: 0.14, gain: 0.03 });
    this.tone({ frequency: 260, type: "sawtooth", duration: 0.16, gain: 0.022, delay: 0.08 });
  }

  playCorrect() {
    this.tone({ frequency: 440, type: "square", duration: 0.12, gain: 0.04 });
    this.tone({ frequency: 660, type: "triangle", duration: 0.14, gain: 0.03, delay: 0.08 });
  }

  playWrong() {
    this.tone({ frequency: 180, type: "sawtooth", duration: 0.18, gain: 0.04 });
  }

  playWin() {
    this.tone({ frequency: 520, type: "triangle", duration: 0.12, gain: 0.05 });
    this.tone({ frequency: 720, type: "triangle", duration: 0.18, gain: 0.05, delay: 0.08 });
    this.tone({ frequency: 900, type: "triangle", duration: 0.2, gain: 0.04, delay: 0.18 });
  }
}

const audioEngine = new AudioEngine();

class Wheel {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.__wheel = this;
    this.ctx = canvas.getContext("2d");
    this.segments = WHEEL_SEGMENTS;
    this.rotation = 0;
    this.targetRotation = 0;
    this.isSpinning = false;
    this.resolveSpin = null;
    this.currentValue = null;
    this.size = 0;
    this.resize();
    this.render();
    this.loop();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = Math.min(rect.width, rect.height);
  }

  loop() {
    this.render();

    if (this.isSpinning) {
      const diff = this.targetRotation - this.rotation;
      this.rotation += diff * 0.09;

      if (Math.abs(diff) <= 0.25) {
        this.rotation = this.targetRotation;
        this.isSpinning = false;
        const resolved = this.currentValue;

        if (this.resolveSpin) {
          this.resolveSpin(resolved);
          this.resolveSpin = null;
        }
      }
    }

    window.requestAnimationFrame(() => this.loop());
  }

  spinRandom() {
    return new Promise((resolve) => {
      if (this.isSpinning) {
        resolve(null);
        return;
      }

      const segmentCount = this.segments.length;
      const segmentAngle = 360 / segmentCount;
      const chosenIndex = Math.floor(Math.random() * segmentCount);
      const currentNormalized = ((this.rotation % 360) + 360) % 360;
      const destinationAngle = (360 - ((chosenIndex * segmentAngle + segmentAngle / 2 + currentNormalized) % 360)) + 360 * 5;

      this.targetRotation = this.rotation + destinationAngle;
      this.currentValue = this.segments[chosenIndex];
      this.resolveSpin = resolve;
      this.isSpinning = true;
    });
  }

  render() {
    const ctx = this.ctx;
    const size = this.size || 360;
    const width = this.canvas.clientWidth || size;
    const height = this.canvas.clientHeight || size;
    const radius = size * 0.43;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);

    const sectorAngle = (Math.PI * 2) / this.segments.length;

    this.segments.forEach((segment, index) => {
      const startAngle = index * sectorAngle - Math.PI / 2;
      const endAngle = startAngle + sectorAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = index % 2 === 0 ? "#1d6ad2" : "#d65050";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sectorAngle / 2);
      ctx.translate(radius * 0.62, 0);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 22px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = typeof segment === "number" ? segment.toString() : segment;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#f7c948";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2 - radius - 10);
    ctx.lineTo(width / 2 + 18, height / 2 - radius + 42);
    ctx.lineTo(width / 2 - 18, height / 2 - radius + 42);
    ctx.closePath();
    ctx.fillStyle = "#f7c948";
    ctx.fill();
  }
}

class GameBoard {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.answer = "";
    this.revealedLetters = new Set();
  }

  setAnswer(answer) {
    this.answer = answer.toUpperCase();
    this.revealedLetters.clear();
    this.render();
  }

  revealLetter(letter) {
    if (!letter) {
      return;
    }

    const normalized = letter.toUpperCase();
    if (this.answer.includes(normalized)) {
      this.revealedLetters.add(normalized);
    }
    this.render();
  }

  revealAll() {
    this.answer.split("").forEach((char) => {
      if (char !== " ") {
        this.revealedLetters.add(char);
      }
    });
    this.render();
  }

  isSolved() {
    return this.answer.split("").every((char) => char === " " || this.revealedLetters.has(char));
  }

  isLetterUsed(letter) {
    const normalized = letter.toUpperCase();
    return this.revealedLetters.has(normalized);
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.clientWidth || 700;
    const height = this.canvas.clientHeight || 250;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const chars = this.answer.split("");
    const visibleLetters = chars.filter((char) => char !== " ");
    const cellGap = 10;
    const leftPadding = 24;
    const minCellWidth = 18;
    const maxCellWidth = 52;
    const letterCount = Math.max(visibleLetters.length, 1);
    const availableWidth = width - leftPadding * 2;
    let cellWidth = Math.min(maxCellWidth, Math.max(minCellWidth, availableWidth / letterCount - cellGap));

    if (letterCount > 1) {
      const fullWidth = letterCount * cellWidth + (letterCount - 1) * cellGap;
      if (fullWidth > availableWidth) {
        cellWidth = Math.max(minCellWidth, (availableWidth - (letterCount - 1) * cellGap) / letterCount);
      }
    }

    const cellHeight = Math.min(72, Math.max(46, cellWidth + 18));
    const maxLettersPerRow = Math.max(1, Math.min(visibleLetters.length || 1, Math.floor((width - leftPadding * 2 + cellGap) / (cellWidth + cellGap))));
    const rowsNeeded = Math.max(1, Math.ceil(visibleLetters.length / maxLettersPerRow));
    const dynamicHeight = Math.max(260, 110 + rowsNeeded * (cellHeight + 18));

    if (this.canvas.clientHeight !== dynamicHeight) {
      this.canvas.style.height = `${dynamicHeight}px`;
    }

    const drawHeight = Math.max(dynamicHeight, height);
    const startY = drawHeight - 40;
    let x = leftPadding;
    let rowY = startY;
    let currentRowIndex = 0;

    ctx.fillStyle = "#c7d5ef";
    ctx.font = `${Math.min(34, Math.max(18, Math.round(cellWidth * 0.72)))}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    chars.forEach((char) => {
      if (char === " ") {
        x += 26;
        return;
      }

      if (currentRowIndex >= maxLettersPerRow && char !== " ") {
        currentRowIndex = 0;
        rowY -= cellHeight + 18;
        x = leftPadding;
      }

      const drawX = x;
      const drawY = rowY;

      ctx.strokeStyle = "#dfe8f8";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY - cellHeight + 10, cellWidth, cellHeight);

      if (this.revealedLetters.has(char)) {
        ctx.fillStyle = "#f7c948";
        ctx.fillText(char, drawX + cellWidth / 2, drawY - cellHeight / 2 + 8);
      } else {
        ctx.fillStyle = "#e7effe";
        ctx.fillText("_", drawX + cellWidth / 2, drawY - cellHeight / 2 + 8);
      }

      x += cellWidth + cellGap;
      currentRowIndex += 1;
    });
  }
}

class GameController {
  constructor(playerNames = []) {
    this.players = playerNames.map((name, index) => ({
      nome: name.trim() || `Jogador ${index + 1}`,
      rodada: 0,
      total: 0
    }));

    if (this.players.length === 0) {
      this.players = [
        { nome: "Jogador 1", rodada: 0, total: 0 },
        { nome: "Jogador 2", rodada: 0, total: 0 },
        { nome: "Jogador 3", rodada: 0, total: 0 }
      ];
    }

    this.currentPlayerIndex = 0;
    this.round = 1;
    this.finished = false;
    this.puzzle = null;
    this.currentSpinValue = null;
    this.wheel = new Wheel(document.getElementById("wheel-canvas"));
    this.board = new GameBoard(document.getElementById("board-canvas"));
    this.bindEvents();
    this.renderPlayers();
    this.startRound();
  }

  bindEvents() {
    const spinButton = document.getElementById("spin-button");
    const guessLetterButton = document.getElementById("guess-letter-button");
    const buyVowelButton = document.getElementById("buy-vowel-button");
    const guessAnswerButton = document.getElementById("guess-answer-button");
    const newRoundButton = document.getElementById("new-round-button");

    spinButton.addEventListener("click", () => this.spinWheel());
    guessLetterButton.addEventListener("click", () => this.guessLetter());
    buyVowelButton.addEventListener("click", () => this.buyVowel());
    guessAnswerButton.addEventListener("click", () => this.guessAnswer());
    newRoundButton.addEventListener("click", () => {
      if (this.finished) {
        this.resetMatch();
        return;
      }
      this.startRound();
    });

    const letterInput = document.getElementById("letter-input");
    letterInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.guessLetter();
      }
    });

    const answerInput = document.getElementById("answer-input");
    answerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.guessAnswer();
      }
    });
  }

  setControlsState(enabled) {
    document.getElementById("spin-button").disabled = !enabled;
    document.getElementById("guess-letter-button").disabled = !enabled;
    document.getElementById("buy-vowel-button").disabled = !enabled;
    document.getElementById("guess-answer-button").disabled = !enabled;
    document.getElementById("letter-input").disabled = !enabled;
    document.getElementById("answer-input").disabled = !enabled;
  }

  setStatus(message) {
    document.getElementById("status-message").textContent = message;
  }

  renderPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";

    this.players.forEach((player, index) => {
      const item = document.createElement("div");
      item.className = `player-item ${index === this.currentPlayerIndex ? "active" : ""}`;
      item.innerHTML = `
        <div class="name">${player.nome}</div>
        <div class="score">${player.total}</div>
        <div class="player-meta">
          <span>Rodada: ${player.rodada}</span>
          <span>Vez: ${index === this.currentPlayerIndex ? "Sim" : "Não"}</span>
        </div>
      `;
      playersList.appendChild(item);
    });
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.renderPlayers();
  }

  getRandomPuzzle() {
    const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
    return WORD_BANK[randomIndex];
  }

  getWinningPlayer() {
    return this.players.reduce((best, player) => (player.total > best.total ? player : best), this.players[0]);
  }

  showWinnerOverlay(champion) {
    const overlay = document.getElementById("winner-overlay");
    const nameEl = document.getElementById("winner-name");
    const summaryEl = document.getElementById("winner-summary");
    const totalEl = document.getElementById("winner-total");
    const roundsEl = document.getElementById("winner-rounds");
    const scoreEl = document.getElementById("winner-score");

    if (!overlay || !nameEl || !summaryEl || !totalEl || !roundsEl || !scoreEl) {
      return;
    }

    nameEl.textContent = champion.nome;
    summaryEl.textContent = `${champion.nome} venceu a partida com ${champion.total} pontos.`;
    totalEl.textContent = String(champion.total);
    roundsEl.textContent = String(this.round);
    scoreEl.textContent = String(champion.total);

    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
  }

  hideWinnerOverlay() {
    const overlay = document.getElementById("winner-overlay");
    if (!overlay) {
      return;
    }

    overlay.classList.remove("is-visible");
    setTimeout(() => overlay.classList.add("hidden"), 220);
  }

  finishRound(winnerPlayer) {
    if (this.finished) {
      return;
    }

    this.board.revealAll();
    const highScore = this.getWinningPlayer().total;
    const reachedMaxScore = highScore >= MAX_SCORE;
    const reachedMaxRounds = this.round >= MAX_ROUNDS;

    if (reachedMaxScore || reachedMaxRounds) {
      const champion = this.getWinningPlayer();
      this.finished = true;
      this.setControlsState(false);
      document.getElementById("new-round-button").textContent = "Nova partida";
      this.showWinnerOverlay(champion);
      audioEngine.playWin();
      this.setStatus(`${champion.nome} venceu a partida com ${champion.total} pontos!`);
      return;
    }

    this.round += 1;
    this.setStatus(`${winnerPlayer.nome} venceu a rodada! A resposta era ${this.puzzle.resposta}. Próxima rodada será ${this.round}.`);
    document.getElementById("round-label").textContent = `Rodada ${this.round}`;
    this.renderPlayers();
    audioEngine.playWin();
  }

  resetMatch() {
    this.hideWinnerOverlay();
    this.players.forEach((player) => {
      player.rodada = 0;
      player.total = 0;
    });

    this.currentPlayerIndex = 0;
    this.round = 1;
    this.finished = false;
    this.setControlsState(true);
    document.getElementById("new-round-button").textContent = "Próxima rodada";
    this.startRound();
  }

  startRound() {
    if (this.finished) {
      return;
    }

    const puzzle = this.getRandomPuzzle();
    this.puzzle = puzzle;
    this.currentSpinValue = null;

    this.players.forEach((player) => {
      player.rodada = 0;
    });

    document.getElementById("theme-name").textContent = `${puzzle.tema} — ${puzzle.dica}`;
    document.getElementById("round-label").textContent = `Rodada ${this.round}`;
    this.board.setAnswer(puzzle.resposta);
    this.setControlsState(true);
    this.setStatus(`${this.getCurrentPlayer().nome} começa a rodada. Gire a roleta.`);
    document.getElementById("answer-input").value = "";
    document.getElementById("letter-input").value = "";
    this.renderPlayers();
  }

  async spinWheel() {
    if (this.wheel.isSpinning || this.finished) {
      return;
    }

    audioEngine.playSpin();
    this.setStatus(`${this.getCurrentPlayer().nome} girando a roleta...`);
    const value = await this.wheel.spinRandom();
    this.currentSpinValue = value;

    if (typeof value === "number") {
      this.setStatus(`${this.getCurrentPlayer().nome} tirou ${value} pontos. Digite uma consoante ou compre uma vogal.`);
      return;
    }

    if (value === "PERDE") {
      audioEngine.playWrong();
      this.setStatus(`${this.getCurrentPlayer().nome} caiu em PERDE A VEZ. Vez passada.`);
      this.nextPlayer();
      this.currentSpinValue = null;
      return;
    }

    if (value === "ZERA") {
      const player = this.getCurrentPlayer();
      const roundPoints = player.rodada;
      player.rodada = 0;
      player.total = Math.max(0, player.total - roundPoints);
      audioEngine.playWrong();
      this.renderPlayers();
      this.setStatus(`${player.nome} caiu em ZERA. Sua pontuação da rodada foi resetada.`);
      this.nextPlayer();
      this.currentSpinValue = null;
      return;
    }

    if (value === "PASSA") {
      audioEngine.playWrong();
      this.setStatus(`${this.getCurrentPlayer().nome} caiu em PASSA A VEZ.`);
      this.nextPlayer();
      this.currentSpinValue = null;
    }
  }

  guessLetter() {
    if (this.finished) {
      return;
    }

    const input = document.getElementById("letter-input");
    const value = input.value.trim().toUpperCase();

    if (!value || !/^[A-Z]$/.test(value)) {
      this.setStatus("Digite uma letra válida em maiúsculas.");
      return;
    }

    if (typeof this.currentSpinValue !== "number") {
      this.setStatus("Primeiro, gire a roleta para obter um valor numérico.");
      return;
    }

    if ("AEIOU".includes(value)) {
      this.setStatus("Para vogais, use o botão de comprar vogal.");
      return;
    }

    if (this.board.isLetterUsed(value)) {
      this.setStatus(`A letra ${value} já foi usada neste tema.`);
      return;
    }

    const matches = [...this.puzzle.resposta].filter((char) => char === value).length;

    if (matches === 0) {
      audioEngine.playWrong();
      this.setStatus(`A letra ${value} não aparece na palavra. Vez do próximo jogador.`);
      this.nextPlayer();
      this.currentSpinValue = null;
      input.value = "";
      this.renderPlayers();
      return;
    }

    const player = this.getCurrentPlayer();
    const gain = this.currentSpinValue * matches;
    player.rodada += gain;
    player.total += gain;

    for (const char of this.puzzle.resposta) {
      if (char === value) {
        this.board.revealLetter(char);
      }
    }

    audioEngine.playCorrect();
    this.setStatus(`${player.nome} acertou ${matches} letra(s) e ganhou ${gain} pontos.`);
    input.value = "";
    this.currentSpinValue = null;
    this.renderPlayers();

    if (this.board.isSolved()) {
      this.finishRound(player);
    }
  }

  buyVowel() {
    if (this.finished) {
      return;
    }

    const input = document.getElementById("letter-input");
    const value = input.value.trim().toUpperCase();
    const player = this.getCurrentPlayer();

    if (!value || !/^[A-Z]$/.test(value)) {
      this.setStatus("Digite uma vogal válida antes de comprar.");
      return;
    }

    if (!"AEIOU".includes(value)) {
      this.setStatus("Esse botão só vale para vogais.");
      return;
    }

    if (player.total < 100) {
      this.setStatus(`${player.nome} não tem pontos suficientes para comprar a vogal.`);
      return;
    }

    if (this.board.isLetterUsed(value)) {
      this.setStatus(`A vogal ${value} já foi usada.`);
      this.renderPlayers();
      return;
    }

    player.total -= 100;
    player.rodada = Math.max(0, player.rodada - 100);

    const matches = [...this.puzzle.resposta].filter((char) => char === value).length;

    if (matches === 0) {
      audioEngine.playWrong();
      this.setStatus(`A vogal ${value} não aparece na palavra. Passa a vez.`);
      this.nextPlayer();
      input.value = "";
      this.renderPlayers();
      return;
    }

    for (const char of this.puzzle.resposta) {
      if (char === value) {
        this.board.revealLetter(char);
      }
    }

    audioEngine.playCorrect();
    this.setStatus(`${player.nome} revelou a vogal ${value} e manteve o turno.`);
    input.value = "";
    this.renderPlayers();

    if (this.board.isSolved()) {
      this.finishRound(player);
    }
  }

  guessAnswer() {
    if (this.finished) {
      return;
    }

    const input = document.getElementById("answer-input");
    const answer = input.value.trim().toUpperCase();

    if (!answer) {
      this.setStatus("Digite uma resposta antes de chutar.");
      return;
    }

    if (answer === this.puzzle.resposta) {
      const player = this.getCurrentPlayer();
      player.total += 500;
      player.rodada += 500;
      this.renderPlayers();
      this.finishRound(player);
      return;
    }

    audioEngine.playWrong();
    this.setStatus(`Resposta errada. ${this.getCurrentPlayer().nome} perdeu a vez.`);
    this.nextPlayer();
    input.value = "";
    this.renderPlayers();
  }
}

function serializeWordBank() {
  return JSON.stringify(WORD_BANK, null, 2);
}

function openAnswerManager() {
  const editor = document.getElementById("answer-bank-editor");
  if (!editor) {
    return;
  }

  editor.value = serializeWordBank();
  document.getElementById("admin-panel").classList.remove("hidden");
}

function closeAnswerManager() {
  const panel = document.getElementById("admin-panel");
  if (panel) {
    panel.classList.add("hidden");
  }
}

function saveWordBankFromEditor() {
  const editor = document.getElementById("answer-bank-editor");
  if (!editor) {
    return;
  }

  try {
    const parsed = JSON.parse(editor.value);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("O banco deve conter pelo menos uma pergunta.");
    }

    const sanitized = parsed
      .map((item) => ({
        tema: String(item.tema || "").trim(),
        resposta: String(item.resposta || "").trim().toUpperCase(),
        dica: String(item.dica || "").trim()
      }))
      .filter((item) => item.tema && item.resposta && item.dica);

    if (!sanitized.length) {
      throw new Error("Cada item precisa de tema, resposta e dica válidas.");
    }

    WORD_BANK = sanitized;
    closeAnswerManager();

    if (window.game && typeof window.game.setStatus === "function") {
      window.game.setStatus("Banco de respostas atualizado com sucesso.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Formato inválido.";
    if (window.game && typeof window.game.setStatus === "function") {
      window.game.setStatus(`Erro ao salvar banco: ${message}`);
    } else {
      window.alert(`Erro ao salvar banco: ${message}`);
    }
  }
}

function restoreDefaultWordBank() {
  WORD_BANK = DEFAULT_WORD_BANK.map((item) => ({
    ...item,
    resposta: String(item.resposta || "").toUpperCase(),
    tema: String(item.tema || "").trim(),
    dica: String(item.dica || "").trim()
  }));

  const editor = document.getElementById("answer-bank-editor");
  if (editor) {
    editor.value = serializeWordBank();
  }

  if (window.game && typeof window.game.setStatus === "function") {
    window.game.setStatus("Banco padrão restaurado.");
  }
}

function renderPlayerFields() {
  const countSelect = document.getElementById("player-count");
  const container = document.getElementById("player-name-fields");
  const playerCount = Number(countSelect.value || 2);

  container.innerHTML = "";

  for (let index = 0; index < playerCount; index += 1) {
    const row = document.createElement("div");
    row.className = "player-name-field";
    row.innerHTML = `
      <label for="player-name-${index + 1}">Jogador ${index + 1}</label>
      <input id="player-name-${index + 1}" type="text" maxlength="18" value="Jogador ${index + 1}" aria-label="Nome do jogador ${index + 1}" />
    `;
    container.appendChild(row);
  }
}

function getConfiguredPlayers() {
  const count = Number(document.getElementById("player-count").value || 2);
  const names = [];

  for (let index = 0; index < count; index += 1) {
    const input = document.getElementById(`player-name-${index + 1}`);
    names.push(input ? input.value : `Jogador ${index + 1}`);
  }

  return names;
}

function startGame() {
  const gameShell = document.getElementById("game-shell");
  const startScreen = document.getElementById("start-screen");

  startScreen.classList.add("hidden");
  gameShell.classList.remove("hidden");

  const players = getConfiguredPlayers();
  window.game = new GameController(players);
}

window.addEventListener("load", () => {
  renderPlayerFields();
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel) {
    adminPanel.classList.add("hidden");
  }

  document.getElementById("player-count").addEventListener("change", renderPlayerFields);
  document.getElementById("start-game-button").addEventListener("click", startGame);
  document.getElementById("admin-bank-button").addEventListener("click", openAnswerManager);
  document.getElementById("close-admin-panel").addEventListener("click", closeAnswerManager);
  document.getElementById("save-bank-button").addEventListener("click", saveWordBankFromEditor);
  document.getElementById("restore-bank-button").addEventListener("click", restoreDefaultWordBank);
  document.getElementById("winner-close-button").addEventListener("click", () => {
    if (window.game) {
      window.game.resetMatch();
    }
  });

  window.addEventListener("resize", () => {
    const wheelCanvas = document.getElementById("wheel-canvas");
    if (wheelCanvas && wheelCanvas.__wheel) {
      wheelCanvas.__wheel.resize();
    }
  });
});
