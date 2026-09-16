import { describe, expect, it } from "vitest";
import type { Card } from "../types";
import { correctInsertionIndexes, isCorrectInsertion } from "./judge";

function card(id: string, yearValue: number): Card {
  return { id, era: "テスト", yearValue, yearLabel: String(yearValue), title: id, description: "", importance: 1 };
}

describe("isCorrectInsertion", () => {
  it("空の場にはどこに挿入しても正解になる", () => {
    expect(isCorrectInsertion([], card("a", 100), 0)).toBe(true);
  });

  it("最も古いカードより前(左端)に正しく挿入できる", () => {
    const field = [card("a", 500), card("b", 1000)];
    expect(isCorrectInsertion(field, card("new", 100), 0)).toBe(true);
  });

  it("最も新しいカードより後(右端)に正しく挿入できる", () => {
    const field = [card("a", 500), card("b", 1000)];
    expect(isCorrectInsertion(field, card("new", 2000), 2)).toBe(true);
  });

  it("中間の正しい位置に挿入できる", () => {
    const field = [card("a", 500), card("b", 1000), card("c", 1500)];
    expect(isCorrectInsertion(field, card("new", 800), 1)).toBe(true);
  });

  it("左隣より古い年代を右側に差し込むと不正解", () => {
    const field = [card("a", 500), card("b", 1000)];
    expect(isCorrectInsertion(field, card("new", 300), 1)).toBe(false);
  });

  it("右隣より新しい年代を左側に差し込むと不正解", () => {
    const field = [card("a", 500), card("b", 1000)];
    expect(isCorrectInsertion(field, card("new", 1200), 0)).toBe(false);
  });

  it("同年カード: 左隣と同年なら等号で正解になる(境界値)", () => {
    const field = [card("a", 1000), card("b", 2000)];
    expect(isCorrectInsertion(field, card("new", 1000), 1)).toBe(true);
  });

  it("同年カード: 右隣と同年なら等号で正解になる(境界値)", () => {
    const field = [card("a", 1000), card("b", 2000)];
    expect(isCorrectInsertion(field, card("new", 2000), 1)).toBe(true);
  });

  it("同年カードが隣接する場合、どちら側に挿入しても正解(境界値)", () => {
    const field = [card("a", 1000), card("b", 1000), card("c", 2000)];
    expect(isCorrectInsertion(field, card("new", 1000), 1)).toBe(true);
    expect(isCorrectInsertion(field, card("new", 1000), 2)).toBe(true);
  });

  it("両端への挿入(境界値): 単一カードの場の前後", () => {
    const field = [card("a", 1000)];
    expect(isCorrectInsertion(field, card("older", 500), 0)).toBe(true);
    expect(isCorrectInsertion(field, card("older", 500), 1)).toBe(false);
    expect(isCorrectInsertion(field, card("newer", 1500), 1)).toBe(true);
    expect(isCorrectInsertion(field, card("newer", 1500), 0)).toBe(false);
  });

  it("範囲外のindexはエラーになる", () => {
    const field = [card("a", 1000)];
    expect(() => isCorrectInsertion(field, card("x", 1), -1)).toThrow(RangeError);
    expect(() => isCorrectInsertion(field, card("x", 1), 2)).toThrow(RangeError);
  });
});

describe("correctInsertionIndexes", () => {
  it("同年カードが複数ある場合は正解位置が複数返る(境界値)", () => {
    const field = [card("a", 1000), card("b", 1000), card("c", 2000)];
    expect(correctInsertionIndexes(field, card("new", 1000))).toEqual([0, 1, 2]);
  });

  it("一意に定まる場合は正解位置が1つだけ返る", () => {
    const field = [card("a", 500), card("b", 1500)];
    expect(correctInsertionIndexes(field, card("new", 1000))).toEqual([1]);
  });
});
