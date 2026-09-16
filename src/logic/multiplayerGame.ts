import type { Card } from "../types";
import { INITIAL_HAND_SIZE } from "../types";
import { isCorrectInsertion } from "./judge";
import { shuffle } from "./random";

export type MultiplayerStatus = "playing" | "finished";

export interface PlayerState {
  name: string;
  hand: Card[];
}

export interface MultiplayerLastResult {
  correct: boolean;
  card: Card;
  playerIndex: number;
}

export interface MultiplayerGameState {
  field: Card[]; // yearValue昇順
  players: PlayerState[];
  drawPile: Card[];
  currentPlayerIndex: number;
  turns: number;
  status: MultiplayerStatus;
  winnerIndex: number | null;
  lastResult: MultiplayerLastResult | null;
}

const DEFAULT_PLAYER_NAMES = ["プレイヤー1", "プレイヤー2"];

/**
 * 同一端末で交互にカードを置く2人対戦用の初期状態を作る。
 * 本家Timelineと同様、不正解でもライフは減らず、そのカードは捨てて山札から補充し、手番が相手に移るだけ。
 * 先に手札が0枚になったプレイヤーの勝ち。
 */
export function initMultiplayerGame(
  pool: Card[],
  playerNames: string[] = DEFAULT_PLAYER_NAMES,
): MultiplayerGameState {
  const playerCount = playerNames.length;
  const shuffled = shuffle(pool);
  const [firstCard, ...rest] = shuffled;
  const handSize = Math.max(0, Math.min(INITIAL_HAND_SIZE, Math.floor(rest.length / playerCount)));

  const players: PlayerState[] = playerNames.map((name, i) => ({
    name,
    hand: rest.slice(i * handSize, (i + 1) * handSize),
  }));
  const drawPile = rest.slice(playerCount * handSize);

  return {
    field: firstCard ? [firstCard] : [],
    players,
    drawPile,
    currentPlayerIndex: 0,
    turns: 0,
    status: "playing",
    winnerIndex: null,
    lastResult: null,
  };
}

/**
 * 現在の手番プレイヤーが手札のcardIdを場のinsertIndexに差し込む。
 * 正解なら場に残って手番が相手に移り、不正解ならそのカードは捨てて山札から1枚補充し手番が相手に移る
 * (山札が尽きていれば補充なしで手札が1枚減るだけ)。どちらの場合も手札が0枚になった時点でそのプレイヤーの勝利。
 */
export function placeCardMultiplayer(
  state: MultiplayerGameState,
  cardId: string,
  insertIndex: number,
): MultiplayerGameState {
  if (state.status !== "playing") return state;

  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const handIndex = player.hand.findIndex((c) => c.id === cardId);
  if (handIndex === -1) return state;
  const card = player.hand[handIndex];
  const handWithoutCard = player.hand.filter((_, i) => i !== handIndex);

  const correct = isCorrectInsertion(state.field, card, insertIndex);
  const turns = state.turns + 1;
  const nextPlayerIndex = (playerIndex + 1) % state.players.length;

  let field = state.field;
  let drawPile = state.drawPile;
  let hand = handWithoutCard;

  if (correct) {
    field = [...state.field.slice(0, insertIndex), card, ...state.field.slice(insertIndex)];
  } else {
    drawPile = [...state.drawPile];
    const drawn = drawPile.shift();
    hand = drawn ? [...handWithoutCard, drawn] : handWithoutCard;
  }

  const players = state.players.map((p, i) => (i === playerIndex ? { ...p, hand } : p));
  const finished = hand.length === 0;

  return {
    ...state,
    field,
    players,
    drawPile,
    turns,
    currentPlayerIndex: finished ? playerIndex : nextPlayerIndex,
    status: finished ? "finished" : "playing",
    winnerIndex: finished ? playerIndex : null,
    lastResult: { correct, card, playerIndex },
  };
}
