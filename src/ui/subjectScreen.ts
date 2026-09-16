import { SUBJECTS, loadDeck } from "../data/subjects";
import type { AppContext } from "./types";

export function renderSubjectScreen(root: HTMLElement, ctx: AppContext) {
  const screen = document.createElement("div");
  screen.className = "screen";

  const title = document.createElement("h1");
  title.textContent = "ChronoLine ― 教科を選ぶ";
  screen.appendChild(title);

  const list = document.createElement("ul");
  list.className = "subject-list";

  for (const subject of SUBJECTS) {
    const item = document.createElement("li");

    const btn = document.createElement("button");
    btn.className = "subject-button";
    btn.disabled = subject.status !== "available";

    const label = document.createElement("span");
    label.textContent = subject.subjectLabel;
    btn.appendChild(label);

    if (subject.status === "coming_soon") {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "準備中";
      btn.appendChild(badge);
    }

    btn.addEventListener("click", async () => {
      if (subject.status !== "available") return;
      const deck = await loadDeck(subject.subjectId);
      ctx.setState({
        subjectId: subject.subjectId,
        deck,
        startEra: deck.eraList[0],
        endEra: deck.eraList[deck.eraList.length - 1],
        screen: "start",
      });
    });

    item.appendChild(btn);
    list.appendChild(item);
  }

  screen.appendChild(list);
  root.appendChild(screen);
}
