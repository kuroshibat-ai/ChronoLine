import type { Card } from "../types";

/**
 * 場に並んだカード(yearValue昇順)に対して、位置indexへの新カード挿入が
 * 正しいかどうかを判定する。
 * index は左から数えた隙間の番号: 0 <= index <= field.length
 */
export function isCorrectInsertion(field: Card[], newCard: Card, index: number): boolean {
  if (index < 0 || index > field.length) {
    throw new RangeError(`index is out of range: ${index}`);
  }
  const left = index > 0 ? field[index - 1] : undefined;
  const right = index < field.length ? field[index] : undefined;

  if (left && newCard.yearValue < left.yearValue) return false;
  if (right && newCard.yearValue > right.yearValue) return false;
  return true;
}

/**
 * newCardを挿入できる全ての正しい位置(隙間index)を返す。
 * 同年カードが隣接する場合はどちら側に挿入しても正解になりうるため複数返ることがある。
 */
export function correctInsertionIndexes(field: Card[], newCard: Card): number[] {
  const result: number[] = [];
  for (let i = 0; i <= field.length; i++) {
    if (isCorrectInsertion(field, newCard, i)) {
      result.push(i);
    }
  }
  return result;
}
