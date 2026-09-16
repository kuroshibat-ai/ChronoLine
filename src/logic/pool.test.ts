import { describe, expect, it } from "vitest";
import type { Card, Deck } from "../types";
import { erasInRange, filterPool, isPoolStartable, isValidEraRange } from "./pool";

function card(id: string, era: string, importance: 1 | 2 | 3): Card {
  return { id, era, yearValue: 0, yearLabel: "", title: id, description: "", importance };
}

function makeDeck(): Deck {
  return {
    subjectId: "test",
    subjectLabel: "テスト",
    eraList: ["A", "B", "C", "D"],
    cards: [
      card("a1", "A", 1),
      card("a2", "A", 2),
      card("b1", "B", 1),
      card("b2", "B", 2),
      card("c1", "C", 1),
      card("c2", "C", 2),
      card("d1", "D", 1),
      card("d2", "D", 2),
    ],
  };
}

describe("erasInRange", () => {
  it("開始〜終了に含まれる時代のみ返す", () => {
    const deck = makeDeck();
    expect(erasInRange(deck, { startEra: "B", endEra: "C" })).toEqual(new Set(["B", "C"]));
  });

  it("開始と終了が同じ時代の場合はその1つだけ", () => {
    const deck = makeDeck();
    expect(erasInRange(deck, { startEra: "B", endEra: "B" })).toEqual(new Set(["B"]));
  });

  it("開始が終了より後(逆転)の場合は空集合(境界値)", () => {
    const deck = makeDeck();
    expect(erasInRange(deck, { startEra: "C", endEra: "A" })).toEqual(new Set());
  });

  it("両端(先頭〜末尾)を範囲にできる(境界値)", () => {
    const deck = makeDeck();
    expect(erasInRange(deck, { startEra: "A", endEra: "D" })).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("存在しない時代を指定した場合は空集合", () => {
    const deck = makeDeck();
    expect(erasInRange(deck, { startEra: "X", endEra: "D" })).toEqual(new Set());
  });
});

describe("isValidEraRange", () => {
  it("開始<=終了なら有効", () => {
    const deck = makeDeck();
    expect(isValidEraRange(deck, { startEra: "A", endEra: "C" })).toBe(true);
    expect(isValidEraRange(deck, { startEra: "B", endEra: "B" })).toBe(true);
  });

  it("開始>終了なら無効(境界値)", () => {
    const deck = makeDeck();
    expect(isValidEraRange(deck, { startEra: "C", endEra: "A" })).toBe(false);
  });
});

describe("filterPool", () => {
  it("時代範囲と重要度で絞り込む", () => {
    const deck = makeDeck();
    const pool = filterPool(deck, { startEra: "A", endEra: "B" }, "easy");
    expect(pool.map((c) => c.id).sort()).toEqual(["a1", "b1"]);
  });

  it("難易度ふつうは重要度1〜2を含む", () => {
    const deck = makeDeck();
    const pool = filterPool(deck, { startEra: "A", endEra: "B" }, "normal");
    expect(pool.map((c) => c.id).sort()).toEqual(["a1", "a2", "b1", "b2"]);
  });
});

describe("isPoolStartable (4枚未満の境界値)", () => {
  it("3枚は開始不可", () => {
    const pool = [card("1", "A", 1), card("2", "A", 1), card("3", "A", 1)];
    expect(isPoolStartable(pool)).toBe(false);
  });

  it("4枚ちょうどは開始可(境界値)", () => {
    const pool = [card("1", "A", 1), card("2", "A", 1), card("3", "A", 1), card("4", "A", 1)];
    expect(isPoolStartable(pool)).toBe(true);
  });

  it("5枚は開始可", () => {
    const pool = [card("1", "A", 1), card("2", "A", 1), card("3", "A", 1), card("4", "A", 1), card("5", "A", 1)];
    expect(isPoolStartable(pool)).toBe(true);
  });
});
