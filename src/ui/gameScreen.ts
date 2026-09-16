import { placeCard } from "../logic/game";
import { makeDraggableCard, makeDropTarget } from "./dragDrop";
import type { AppContext } from "./types";

const FEEDBACK_AUTO_CLOSE_MS = 1800;
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

export function renderGameScreen(root: HTMLElement, ctx: AppContext) {
  const { state } = ctx;
  const game = state.game;
  const deck = state.deck;
  if (!game || !deck) return;

  const screen = document.createElement("div");
  screen.className = "screen";

  const title = document.createElement("h1");
  title.textContent = deck.subjectLabel;
  screen.appendChild(title);

  // ステータスバー
  const statusBar = document.createElement("div");
  statusBar.className = "status-bar";
  const life = document.createElement("span");
  life.textContent = `ライフ: ${"❤".repeat(Math.max(game.life, 0))}${game.life <= 0 ? "0" : ""}`;
  const handCount = document.createElement("span");
  handCount.textContent = `残り手札: ${game.hand.length}枚`;
  statusBar.append(life, handCount);
  screen.appendChild(statusBar);

  // 場
  const fieldLabel = document.createElement("h2");
  fieldLabel.textContent = "場(古い ← → 新しい)";
  screen.appendChild(fieldLabel);

  const fieldPanel = document.createElement("div");
  fieldPanel.className = "field-panel";

  const fieldRow = document.createElement("div");
  fieldRow.className = "field-row";
  fieldRow.setAttribute("role", "group");
  fieldRow.setAttribute("aria-label", "場に並んだカード");

  const canPlace = state.selectedHandCardId !== null;

  const addGapButton = (index: number) => {
    const gapBtn = document.createElement("button");
    gapBtn.type = "button";
    gapBtn.className = "gap-button" + (canPlace ? " active" : "");
    gapBtn.setAttribute("aria-label", `${index + 1}番目の隙間に挿入`);
    gapBtn.addEventListener("click", () => {
      if (!state.selectedHandCardId) return;
      const nextGame = placeCard(game, state.selectedHandCardId, index);
      ctx.setState({ game: nextGame, selectedHandCardId: null });
    });
    makeDropTarget(gapBtn, (cardId) => {
      const nextGame = placeCard(game, cardId, index);
      ctx.setState({ game: nextGame, selectedHandCardId: null });
    });
    fieldRow.appendChild(gapBtn);
  };

  addGapButton(0);
  for (let i = 0; i < game.field.length; i++) {
    const card = game.field[i];
    const cardBtn = document.createElement("button");
    cardBtn.type = "button";
    cardBtn.className = "field-card";

    const expanded = state.expandedFieldCardId === card.id;
    cardBtn.textContent = expanded ? `${card.title}\n(${card.yearLabel})` : card.title;
    cardBtn.style.whiteSpace = "pre-line";
    cardBtn.setAttribute("aria-label", expanded ? `${card.title} ${card.yearLabel} ${card.description}` : card.title);

    cardBtn.addEventListener("click", () => {
      ctx.setState({ expandedFieldCardId: expanded ? null : card.id });
    });
    fieldRow.appendChild(cardBtn);
    addGapButton(i + 1);
  }

  fieldPanel.appendChild(fieldRow);
  screen.appendChild(fieldPanel);

  // 手札
  const handLabel = document.createElement("h2");
  handLabel.textContent = "手札(1枚選んで場の隙間をタップ、またはドラッグ&ドロップ)";
  screen.appendChild(handLabel);

  const handPanel = document.createElement("div");
  handPanel.className = "hand-panel";

  const handRow = document.createElement("ul");
  handRow.className = "hand-row";
  handRow.setAttribute("aria-label", "手札");

  for (const card of game.hand) {
    const item = document.createElement("li");

    const cardBtn = document.createElement("button");
    cardBtn.type = "button";
    cardBtn.className = "hand-card";
    cardBtn.textContent = card.title;
    const selected = state.selectedHandCardId === card.id;
    cardBtn.setAttribute("aria-pressed", String(selected));
    cardBtn.addEventListener("click", () => {
      ctx.setState({ selectedHandCardId: selected ? null : card.id });
    });
    makeDraggableCard(cardBtn, card.id);
    item.appendChild(cardBtn);
    handRow.appendChild(item);
  }
  handPanel.appendChild(handRow);
  screen.appendChild(handPanel);

  const quitBtn = document.createElement("button");
  quitBtn.type = "button";
  quitBtn.className = "secondary quit-button";
  quitBtn.textContent = "やめて選びなおす";
  quitBtn.addEventListener("click", () => {
    ctx.setState({ screen: "start", game: null, selectedHandCardId: null, expandedFieldCardId: null });
  });
  screen.appendChild(quitBtn);

  root.appendChild(screen);

  // 正誤フィードバック(一時表示)
  if (game.lastResult) {
    const overlay = document.createElement("div");
    overlay.className = "feedback-modal";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");

    const card = document.createElement("div");
    card.className = `feedback-card ${game.lastResult.correct ? "correct" : "wrong"}`;

    const heading = document.createElement("div");
    heading.className = `feedback-title ${game.lastResult.correct ? "correct" : "wrong"}`;
    heading.textContent = game.lastResult.correct ? "正解!" : "不正解…";
    card.appendChild(heading);

    const cardTitle = document.createElement("div");
    cardTitle.textContent = game.lastResult.card.title;
    card.appendChild(cardTitle);

    const yearLine = document.createElement("div");
    yearLine.textContent = game.lastResult.card.yearLabel;
    card.appendChild(yearLine);

    const desc = document.createElement("div");
    desc.textContent = game.lastResult.card.description;
    card.appendChild(desc);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "secondary";
    closeBtn.textContent = "閉じる";
    const dismiss = () => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
        feedbackTimer = null;
      }
      ctx.setState({ game: { ...game, lastResult: null } });
    };
    closeBtn.addEventListener("click", dismiss);
    card.appendChild(closeBtn);

    overlay.appendChild(card);
    root.appendChild(overlay);

    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(dismiss, FEEDBACK_AUTO_CLOSE_MS);
  } else if (game.status !== "playing") {
    ctx.setState({ screen: "result" });
  }
}
