import { describe, expect, it } from "vitest";
import type { Card } from "../types";
import { initGame, placeCard } from "./game";

function card(id: string, yearValue: number): Card {
  return { id, era: "テスト", yearValue, yearLabel: String(yearValue), title: id, description: "", importance: 1 };
}

describe("initGame", () => {
  it("場に1枚、手札はmin(6, 残り)枚、残りは山札になる", () => {
    const pool = Array.from({ length: 10 }, (_, i) => card(`c${i}`, i * 100));
    const state = initGame(pool, 3);
    expect(state.field).toHaveLength(1);
    expect(state.hand).toHaveLength(6);
    expect(state.drawPile).toHaveLength(3);
    expect(state.life).toBe(3);
    expect(state.status).toBe("playing");
  });

  it("プールが7枚未満なら手札は残り枚数分になる", () => {
    const pool = Array.from({ length: 4 }, (_, i) => card(`c${i}`, i * 100));
    const state = initGame(pool, 3);
    expect(state.field).toHaveLength(1);
    expect(state.hand).toHaveLength(3);
    expect(state.drawPile).toHaveLength(0);
  });
});

describe("placeCard", () => {
  it("正解時: 場が増え、手札が1枚減る", () => {
    const field = card("field", 1000);
    const hand = card("hand", 500);
    const state = {
      field: [field],
      hand: [hand],
      drawPile: [],
      life: 3,
      mistakes: 0,
      turns: 0,
      status: "playing" as const,
      lastResult: null,
    };
    const next = placeCard(state, "hand", 0);
    expect(next.field.map((c) => c.id)).toEqual(["hand", "field"]);
    expect(next.hand).toHaveLength(0);
    expect(next.life).toBe(3);
    expect(next.status).toBe("cleared");
    expect(next.lastResult).toEqual({ correct: true, card: hand });
  });

  it("不正解時: カードが捨てられ、山札から補充、ライフが減る(手札枚数維持)", () => {
    const field = card("field", 1000);
    const hand = card("hand", 2000); // 左側(index0)には入らない
    const drawn = card("drawn", 3000);
    const state = {
      field: [field],
      hand: [hand],
      drawPile: [drawn],
      life: 3,
      mistakes: 0,
      turns: 0,
      status: "playing" as const,
      lastResult: null,
    };
    const next = placeCard(state, "hand", 0); // 左端に挿入 → 不正解
    expect(next.hand.map((c) => c.id)).toEqual(["drawn"]);
    expect(next.drawPile).toHaveLength(0);
    expect(next.life).toBe(2);
    expect(next.mistakes).toBe(1);
    expect(next.status).toBe("playing");
    expect(next.lastResult).toEqual({ correct: false, card: hand });
  });

  it("ライフが0になるとゲームオーバー", () => {
    const field = card("field", 1000);
    const hand = card("hand", 2000);
    const state = {
      field: [field],
      hand: [hand],
      drawPile: [card("drawn", 3000)],
      life: 1,
      mistakes: 0,
      turns: 0,
      status: "playing" as const,
      lastResult: null,
    };
    const next = placeCard(state, "hand", 0);
    expect(next.life).toBe(0);
    expect(next.status).toBe("game_over");
  });

  it("山札が尽きて補充できないとゲームオーバー", () => {
    const field = card("field", 1000);
    const hand = card("hand", 2000);
    const state = {
      field: [field],
      hand: [hand],
      drawPile: [],
      life: 3,
      mistakes: 0,
      turns: 0,
      status: "playing" as const,
      lastResult: null,
    };
    const next = placeCard(state, "hand", 0);
    expect(next.hand).toHaveLength(0);
    expect(next.status).toBe("game_over");
  });

  it("手札が0枚になったらクリア", () => {
    const field = card("field", 1000);
    const hand = card("hand", 500);
    const state = {
      field: [field],
      hand: [hand],
      drawPile: [],
      life: 3,
      mistakes: 0,
      turns: 0,
      status: "playing" as const,
      lastResult: null,
    };
    const next = placeCard(state, "hand", 0);
    expect(next.status).toBe("cleared");
  });
});
