import "./style.css";
import type { AppContext, AppState } from "./ui/types";
import { renderSubjectScreen } from "./ui/subjectScreen";
import { renderStartScreen } from "./ui/startScreen";
import { renderGameScreen } from "./ui/gameScreen";
import { renderDuoGameScreen } from "./ui/duoGameScreen";
import { renderResultScreen } from "./ui/resultScreen";

const root = document.getElementById("app");
if (!root) {
  throw new Error("#app が見つかりません");
}

let state: AppState = {
  screen: "subject",
  subjectId: null,
  deck: null,
  startEra: null,
  endEra: null,
  difficulty: "normal",
  mode: "solo",
  pool: [],
  game: null,
  multiplayerGame: null,
  selectedHandCardId: null,
  expandedFieldCardId: null,
};

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  render();
}

const ctx: AppContext = {
  get state() {
    return state;
  },
  setState,
};

function render() {
  root!.innerHTML = "";
  switch (state.screen) {
    case "subject":
      renderSubjectScreen(root!, ctx);
      break;
    case "start":
      renderStartScreen(root!, ctx);
      break;
    case "game":
      if (state.mode === "duo") {
        renderDuoGameScreen(root!, ctx);
      } else {
        renderGameScreen(root!, ctx);
      }
      break;
    case "result":
      renderResultScreen(root!, ctx);
      break;
  }
}

render();
