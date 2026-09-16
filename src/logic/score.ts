import type { Difficulty } from "../types";

export interface ScoreResult {
  mistakes: number;
  turns: number;
}

export interface ScoreKeyParts {
  subjectId: string;
  startEra: string;
  endEra: string;
  difficulty: Difficulty;
}

const STORAGE_PREFIX = "chronoline:best-score:";

export function makeScoreKey(parts: ScoreKeyParts): string {
  return `${STORAGE_PREFIX}${parts.subjectId}:${parts.startEra}:${parts.endEra}:${parts.difficulty}`;
}

function isBetter(candidate: ScoreResult, current: ScoreResult): boolean {
  if (candidate.mistakes !== current.mistakes) return candidate.mistakes < current.mistakes;
  return candidate.turns < current.turns;
}

/**
 * ベストスコアをローカルストレージに保存する。既存のベストより良い場合のみ更新する。
 * 将来サーバー保存に切り替える際は、この関数の中身を差し替えるだけでよい。
 */
export function saveScore(key: string, result: ScoreResult): void {
  const current = loadScore(key);
  if (!current || isBetter(result, current)) {
    localStorage.setItem(key, JSON.stringify(result));
  }
}

export function loadScore(key: string): ScoreResult | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.mistakes === "number" && typeof parsed.turns === "number") {
      return parsed as ScoreResult;
    }
    return null;
  } catch {
    return null;
  }
}
