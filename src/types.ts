export type Importance = 1 | 2 | 3; // 1=必修 2=標準 3=発展

export interface Card {
  id: string;
  era: string; // このデッキのeraList内のいずれか
  yearValue: number; // 判定用。紀元前は負数
  yearLabel: string; // 表示用の年代文字列
  title: string; // 出来事名(場に表示されるのはこれだけ)
  description: string; // 一言解説(正誤判定後に表示)
  importance: Importance;
}

export interface Deck {
  subjectId: string;
  subjectLabel: string;
  eraList: string[]; // 時代範囲選択に使う順序付きリスト
  cards: Card[];
}

export type SubjectStatus = "available" | "coming_soon";

export interface SubjectMeta {
  subjectId: string;
  subjectLabel: string;
  status: SubjectStatus;
  deckFile: string; // 対応するDeckのJSONファイルパス(availableのときのみ実在)
}

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTY_MAX_IMPORTANCE: Record<Difficulty, Importance> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

export const MIN_POOL_SIZE = 4;
export const INITIAL_HAND_SIZE = 6;
export const INITIAL_LIFE = 3;

export type GameMode = "solo" | "duo";
