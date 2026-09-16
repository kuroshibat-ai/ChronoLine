import type { Card, Deck, Difficulty, GameMode } from "../types";
import type { GameState } from "../logic/game";
import type { MultiplayerGameState } from "../logic/multiplayerGame";

export type Screen = "subject" | "start" | "game" | "result";

export interface AppState {
  screen: Screen;
  subjectId: string | null;
  deck: Deck | null;
  startEra: string | null;
  endEra: string | null;
  difficulty: Difficulty;
  mode: GameMode;
  pool: Card[];
  game: GameState | null;
  multiplayerGame: MultiplayerGameState | null;
  selectedHandCardId: string | null;
  expandedFieldCardId: string | null;
}

export interface AppContext {
  state: AppState;
  setState: (patch: Partial<AppState>) => void;
}
