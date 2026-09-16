import { describe, expect, it } from "vitest";
import type { Card } from "../types";
import { initMultiplayerGame, placeCardMultiplayer } from "./multiplayerGame";

function card(id: string, yearValue: number): Card {
  return { id, era: "テスト", yearValue, yearLabel: String(yearValue), title: id, description: "", importance: 1 };
}

describe("initMultiplayerGame", () => {
  it("場に1枚、各プレイヤーにmin(6, 均等割り)枚、残りは山札になる", () => {
    const pool = Array.from({ length: 15 }, (_, i) => card(`c${i}`, i * 100));
    const state = initMultiplayerGame(pool);
    expect(state.field).toHaveLength(1);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].hand).toHaveLength(6);
    expect(state.players[1].hand).toHaveLength(6);
    expect(state.drawPile).toHaveLength(2); // 15 - 1 - 6*2
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.status).toBe("playing");
  });

  it("プールが少ない場合は均等に割った枚数の手札になる", () => {
    const pool = Array.from({ length: 5 }, (_, i) => card(`c${i}`, i * 100));
    const state = initMultiplayerGame(pool);
    expect(state.field).toHaveLength(1);
    expect(state.players[0].hand).toHaveLength(2);
    expect(state.players[1].hand).toHaveLength(2);
    expect(state.drawPile).toHaveLength(0);
  });
});

describe("placeCardMultiplayer", () => {
  it("正解時: 場が増え、手番プレイヤーの手札が1枚減り、手番が交代する", () => {
    const field = card("field", 1000);
    const p1Card = card("p1card", 500);
    const state = {
      field: [field],
      players: [
        { name: "プレイヤー1", hand: [p1Card] },
        { name: "プレイヤー2", hand: [card("p2card", 2000)] },
      ],
      drawPile: [],
      currentPlayerIndex: 0,
      turns: 0,
      status: "playing" as const,
      winnerIndex: null,
      lastResult: null,
    };
    const next = placeCardMultiplayer(state, "p1card", 0);
    expect(next.field.map((c) => c.id)).toEqual(["p1card", "field"]);
    expect(next.players[0].hand).toHaveLength(0);
    expect(next.currentPlayerIndex).toBe(0);
    expect(next.status).toBe("finished");
    expect(next.winnerIndex).toBe(0);
    expect(next.lastResult).toEqual({ correct: true, card: p1Card, playerIndex: 0 });
  });

  it("不正解時: カードが捨てられ山札から補充、ライフはなく手番だけ交代する", () => {
    const field = card("field", 1000);
    const p1Card = card("p1card", 2000); // 左端には入らない
    const drawn = card("drawn", 3000);
    const state = {
      field: [field],
      players: [
        { name: "プレイヤー1", hand: [p1Card] },
        { name: "プレイヤー2", hand: [card("p2card", 500)] },
      ],
      drawPile: [drawn],
      currentPlayerIndex: 0,
      turns: 0,
      status: "playing" as const,
      winnerIndex: null,
      lastResult: null,
    };
    const next = placeCardMultiplayer(state, "p1card", 0); // 左端に挿入 → 不正解
    expect(next.players[0].hand.map((c) => c.id)).toEqual(["drawn"]);
    expect(next.drawPile).toHaveLength(0);
    expect(next.currentPlayerIndex).toBe(1);
    expect(next.status).toBe("playing");
    expect(next.lastResult).toEqual({ correct: false, card: p1Card, playerIndex: 0 });
  });

  it("山札が尽きた状態で不正解が続き手札が0枚になったら、そのプレイヤーの勝ち扱いで終了する", () => {
    const field = card("field", 1000);
    const p1Card = card("p1card", 2000);
    const state = {
      field: [field],
      players: [
        { name: "プレイヤー1", hand: [p1Card] },
        { name: "プレイヤー2", hand: [card("p2card", 500)] },
      ],
      drawPile: [],
      currentPlayerIndex: 0,
      turns: 0,
      status: "playing" as const,
      winnerIndex: null,
      lastResult: null,
    };
    const next = placeCardMultiplayer(state, "p1card", 0);
    expect(next.players[0].hand).toHaveLength(0);
    expect(next.status).toBe("finished");
    expect(next.winnerIndex).toBe(0);
  });

  it("終了後はplaceCardMultiplayerを呼んでも状態が変わらない", () => {
    const field = card("field", 1000);
    const state = {
      field: [field],
      players: [
        { name: "プレイヤー1", hand: [] },
        { name: "プレイヤー2", hand: [card("p2card", 500)] },
      ],
      drawPile: [],
      currentPlayerIndex: 0,
      turns: 1,
      status: "finished" as const,
      winnerIndex: 0,
      lastResult: null,
    };
    const next = placeCardMultiplayer(state, "p2card", 0);
    expect(next).toBe(state);
  });
});
