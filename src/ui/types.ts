import type { Card, Deck, Difficulty } from "../types";
import type { GameState } from "../logic/game";

export type Screen = "subject" | "start" | "game" | "result";

export interface AppState {
  screen: Screen;
  subjectId: string | null;
  deck: Deck | null;
  startEra: string | null;
  endEra: string | null;
  difficulty: Difficulty;
  pool: Card[];
  game: GameState | null;
  selectedHandCardId: string | null;
  expandedFieldCardId: string | null;
}

export interface AppContext {
  state: AppState;
  setState: (patch: Partial<AppState>) => void;
}
