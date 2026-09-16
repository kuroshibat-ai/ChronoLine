import type { Card, Deck, Difficulty } from "../types";
import { DIFFICULTY_MAX_IMPORTANCE, MIN_POOL_SIZE } from "../types";

export interface EraRange {
  startEra: string;
  endEra: string;
}

/**
 * deck.eraList上でstartEra〜endEraの範囲(両端含む)に入るera名の集合を返す。
 * startEraがendEraより後ろにある(開始>終了)場合は呼び出し側で禁止する想定だが、
 * ここでは空集合を返す安全側の実装にしておく。
 */
export function erasInRange(deck: Deck, range: EraRange): Set<string> {
  const startIndex = deck.eraList.indexOf(range.startEra);
  const endIndex = deck.eraList.indexOf(range.endEra);
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return new Set();
  }
  return new Set(deck.eraList.slice(startIndex, endIndex + 1));
}

export function filterPool(deck: Deck, range: EraRange, difficulty: Difficulty): Card[] {
  const eras = erasInRange(deck, range);
  const maxImportance = DIFFICULTY_MAX_IMPORTANCE[difficulty];
  return deck.cards.filter((c) => eras.has(c.era) && c.importance <= maxImportance);
}

export function isPoolStartable(pool: Card[]): boolean {
  return pool.length >= MIN_POOL_SIZE;
}

export function isValidEraRange(deck: Deck, range: EraRange): boolean {
  const startIndex = deck.eraList.indexOf(range.startEra);
  const endIndex = deck.eraList.indexOf(range.endEra);
  return startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex;
}
