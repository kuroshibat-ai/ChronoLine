import type { Card } from "../types";
import { INITIAL_HAND_SIZE, INITIAL_LIFE } from "../types";
import { isCorrectInsertion } from "./judge";
import { shuffle } from "./random";

export type GameStatus = "playing" | "cleared" | "game_over";

export interface LastResult {
  correct: boolean;
  card: Card;
}

export interface GameState {
  field: Card[]; // yearValue昇順
  hand: Card[];
  drawPile: Card[];
  life: number;
  mistakes: number;
  turns: number;
  status: GameStatus;
  lastResult: LastResult | null;
}

export function initGame(pool: Card[], initialLife: number = INITIAL_LIFE): GameState {
  const shuffled = shuffle(pool);
  const [firstCard, ...rest] = shuffled;
  const handSize = Math.min(INITIAL_HAND_SIZE, rest.length);
  const hand = rest.slice(0, handSize);
  const drawPile = rest.slice(handSize);

  return {
    field: firstCard ? [firstCard] : [],
    hand,
    drawPile,
    life: initialLife,
    mistakes: 0,
    turns: 0,
    status: "playing",
    lastResult: null,
  };
}

/**
 * 手札の cardId を場の insertIndex(隙間番号)に差し込む。
 * 正誤判定・場/手札/山札/ライフ/ターン数/終了判定をまとめて更新した新しいGameStateを返す。
 */
export function placeCard(state: GameState, cardId: string, insertIndex: number): GameState {
  if (state.status !== "playing") return state;

  const handIndex = state.hand.findIndex((c) => c.id === cardId);
  if (handIndex === -1) return state;
  const card = state.hand[handIndex];
  const handWithoutCard = state.hand.filter((_, i) => i !== handIndex);

  const correct = isCorrectInsertion(state.field, card, insertIndex);
  const turns = state.turns + 1;

  if (correct) {
    const field = [...state.field.slice(0, insertIndex), card, ...state.field.slice(insertIndex)];
    const hand = handWithoutCard;
    const status: GameStatus = hand.length === 0 ? "cleared" : "playing";
    return {
      ...state,
      field,
      hand,
      turns,
      status,
      lastResult: { correct: true, card },
    };
  }

  const life = state.life - 1;
  const mistakes = state.mistakes + 1;
  const drawPile = [...state.drawPile];
  const drawn = drawPile.shift();
  const hand = drawn ? [...handWithoutCard, drawn] : handWithoutCard;

  let status: GameStatus = "playing";
  if (life <= 0) {
    status = "game_over";
  } else if (!drawn && hand.length < state.hand.length) {
    // 山札が尽きて手札を補充できなかった
    status = "game_over";
  }

  return {
    ...state,
    life,
    mistakes,
    drawPile,
    hand,
    turns,
    status,
    lastResult: { correct: false, card },
  };
}
