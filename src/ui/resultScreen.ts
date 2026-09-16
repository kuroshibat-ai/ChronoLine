import { loadScore, makeScoreKey, saveScore } from "../logic/score";
import { initGame } from "../logic/game";
import type { AppContext } from "./types";

export function renderResultScreen(root: HTMLElement, ctx: AppContext) {
  const { state } = ctx;
  const game = state.game;
  const deck = state.deck;
  if (!game || !deck || !state.startEra || !state.endEra) return;

  const cleared = game.status === "cleared";

  const scoreKey = makeScoreKey({
    subjectId: deck.subjectId,
    startEra: state.startEra,
    endEra: state.endEra,
    difficulty: state.difficulty,
  });

  if (cleared) {
    saveScore(scoreKey, { mistakes: game.mistakes, turns: game.turns });
  }
  const best = loadScore(scoreKey);

  const screen = document.createElement("div");
  screen.className = "screen";

  const title = document.createElement("h1");
  title.textContent = cleared ? "クリア!" : "ゲームオーバー";
  screen.appendChild(title);

  const summary = document.createElement("div");
  summary.className = "result-summary";

  const mistakesLine = document.createElement("div");
  mistakesLine.textContent = `誤答数: ${game.mistakes}`;
  summary.appendChild(mistakesLine);

  const turnsLine = document.createElement("div");
  turnsLine.textContent = `かかったターン数: ${game.turns}`;
  summary.appendChild(turnsLine);

  const bestLine = document.createElement("div");
  bestLine.textContent = best
    ? `ベストスコア: 誤答${best.mistakes} / ${best.turns}ターン`
    : "ベストスコア: まだありません";
  summary.appendChild(bestLine);

  screen.appendChild(summary);

  const retryBtn = document.createElement("button");
  retryBtn.type = "button";
  retryBtn.className = "primary";
  retryBtn.textContent = "もう一度あそぶ(同条件)";
  retryBtn.addEventListener("click", () => {
    const newGame = initGame(state.pool);
    ctx.setState({ game: newGame, screen: "game", selectedHandCardId: null, expandedFieldCardId: null });
  });
  screen.appendChild(retryBtn);

  const reconfigureBtn = document.createElement("button");
  reconfigureBtn.type = "button";
  reconfigureBtn.className = "secondary";
  reconfigureBtn.textContent = "時代・難易度を選びなおす";
  reconfigureBtn.addEventListener("click", () => {
    ctx.setState({ screen: "start", game: null, selectedHandCardId: null, expandedFieldCardId: null });
  });
  screen.appendChild(reconfigureBtn);

  const subjectBtn = document.createElement("button");
  subjectBtn.type = "button";
  subjectBtn.className = "secondary";
  subjectBtn.textContent = "科目を選びなおす";
  subjectBtn.addEventListener("click", () => {
    ctx.setState({
      screen: "subject",
      subjectId: null,
      deck: null,
      game: null,
      selectedHandCardId: null,
      expandedFieldCardId: null,
    });
  });
  screen.appendChild(subjectBtn);

  root.appendChild(screen);
}
