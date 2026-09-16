import type { SubjectMeta } from "../types";

export const SUBJECTS: SubjectMeta[] = [
  { subjectId: "juken-rekishi", subjectLabel: "中学受験歴史", status: "coming_soon", deckFile: "decks/juken-rekishi.json" },
  { subjectId: "chugaku-rekishi", subjectLabel: "中学歴史", status: "available", deckFile: "decks/chugaku-rekishi.json" },
  { subjectId: "koko-nihonshi", subjectLabel: "高校日本史", status: "coming_soon", deckFile: "decks/koko-nihonshi.json" },
  { subjectId: "koko-sekaishi", subjectLabel: "高校世界史", status: "coming_soon", deckFile: "decks/koko-sekaishi.json" },
];

const DECK_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  "chugaku-rekishi": () => import("./decks/chugaku-rekishi.json"),
};

export async function loadDeck(subjectId: string) {
  const loader = DECK_LOADERS[subjectId];
  if (!loader) {
    throw new Error(`デッキが見つかりません: ${subjectId}`);
  }
  const mod = await loader();
  return mod.default as import("../types").Deck;
}
