import { DIFFICULTY_LABEL, MIN_POOL_SIZE } from "../types";
import type { Difficulty, GameMode } from "../types";
import { filterPool, isPoolStartable, isValidEraRange } from "../logic/pool";
import { initGame } from "../logic/game";
import { initMultiplayerGame } from "../logic/multiplayerGame";
import type { AppContext } from "./types";

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];
const MODES: { mode: GameMode; label: string }[] = [
  { mode: "solo", label: "1人用" },
  { mode: "duo", label: "2人対戦(交代プレイ)" },
];

export function renderStartScreen(root: HTMLElement, ctx: AppContext) {
  const { state } = ctx;
  const deck = state.deck;
  if (!deck) return;

  const screen = document.createElement("div");
  screen.className = "screen";

  const title = document.createElement("h1");
  title.textContent = `${deck.subjectLabel} ― 範囲・難易度を選ぶ`;
  screen.appendChild(title);

  const startEra = state.startEra ?? deck.eraList[0];
  const endEra = state.endEra ?? deck.eraList[deck.eraList.length - 1];

  // 開始時代
  const startGroup = document.createElement("div");
  startGroup.className = "field-group";
  const startLabel = document.createElement("label");
  startLabel.textContent = "開始時代";
  startLabel.htmlFor = "start-era";
  const startSelect = document.createElement("select");
  startSelect.id = "start-era";
  for (const era of deck.eraList) {
    const opt = document.createElement("option");
    opt.value = era;
    opt.textContent = era;
    opt.selected = era === startEra;
    startSelect.appendChild(opt);
  }
  startSelect.addEventListener("change", () => {
    ctx.setState({ startEra: startSelect.value });
  });
  startGroup.append(startLabel, startSelect);

  // 終了時代
  const endGroup = document.createElement("div");
  endGroup.className = "field-group";
  const endLabel = document.createElement("label");
  endLabel.textContent = "終了時代";
  endLabel.htmlFor = "end-era";
  const endSelect = document.createElement("select");
  endSelect.id = "end-era";
  for (const era of deck.eraList) {
    const opt = document.createElement("option");
    opt.value = era;
    opt.textContent = era;
    opt.selected = era === endEra;
    endSelect.appendChild(opt);
  }
  endSelect.addEventListener("change", () => {
    ctx.setState({ endEra: endSelect.value });
  });
  endGroup.append(endLabel, endSelect);

  screen.append(startGroup, endGroup);

  const rangeValid = isValidEraRange(deck, { startEra, endEra });
  if (!rangeValid) {
    const warn = document.createElement("p");
    warn.className = "pool-info warn";
    warn.textContent = "開始時代は終了時代より前(または同じ)にしてください";
    screen.appendChild(warn);
  }

  // 人数モード
  const modeGroup = document.createElement("div");
  modeGroup.className = "field-group";
  const modeLabel = document.createElement("label");
  modeLabel.textContent = "人数";
  modeGroup.appendChild(modeLabel);

  const modeRow = document.createElement("div");
  modeRow.className = "difficulty-group";
  modeRow.setAttribute("role", "radiogroup");
  modeRow.setAttribute("aria-label", "人数");

  for (const { mode, label } of MODES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "difficulty-option";
    btn.textContent = label;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-pressed", String(mode === state.mode));
    btn.setAttribute("aria-checked", String(mode === state.mode));
    btn.addEventListener("click", () => {
      ctx.setState({ mode });
    });
    modeRow.appendChild(btn);
  }
  modeGroup.appendChild(modeRow);
  screen.appendChild(modeGroup);

  // 難易度
  const diffGroup = document.createElement("div");
  diffGroup.className = "field-group";
  const diffLabel = document.createElement("label");
  diffLabel.textContent = "難易度";
  diffGroup.appendChild(diffLabel);

  const diffRow = document.createElement("div");
  diffRow.className = "difficulty-group";
  diffRow.setAttribute("role", "radiogroup");
  diffRow.setAttribute("aria-label", "難易度");

  for (const diff of DIFFICULTIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "difficulty-option";
    btn.textContent = DIFFICULTY_LABEL[diff];
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-pressed", String(diff === state.difficulty));
    btn.setAttribute("aria-checked", String(diff === state.difficulty));
    btn.addEventListener("click", () => {
      ctx.setState({ difficulty: diff });
    });
    diffRow.appendChild(btn);
  }
  diffGroup.appendChild(diffRow);
  screen.appendChild(diffGroup);

  // プール検証
  const pool = rangeValid ? filterPool(deck, { startEra, endEra }, state.difficulty) : [];
  const startable = isPoolStartable(pool);

  const poolInfo = document.createElement("p");
  poolInfo.className = startable ? "pool-info" : "pool-info warn";
  poolInfo.textContent = startable
    ? `出題プール: ${pool.length}枚`
    : `選べる用語が少なすぎます(現在${pool.length}枚)。範囲を広げるか難易度を上げてください`;
  screen.appendChild(poolInfo);

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "primary";
  startBtn.textContent = "開始";
  startBtn.disabled = !rangeValid || pool.length < MIN_POOL_SIZE;
  startBtn.addEventListener("click", () => {
    if (state.mode === "duo") {
      const multiplayerGame = initMultiplayerGame(pool);
      ctx.setState({ pool, multiplayerGame, game: null, screen: "game", selectedHandCardId: null });
    } else {
      const game = initGame(pool);
      ctx.setState({ pool, game, multiplayerGame: null, screen: "game", selectedHandCardId: null });
    }
  });
  screen.appendChild(startBtn);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "secondary";
  backBtn.textContent = "教科を選びなおす";
  backBtn.addEventListener("click", () => {
    ctx.setState({ screen: "subject", subjectId: null, deck: null, game: null, multiplayerGame: null });
  });
  screen.appendChild(backBtn);

  root.appendChild(screen);
}
