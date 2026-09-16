/**
 * PC(マウス)向けのネイティブHTML5ドラッグ&ドロップ配線。
 * iOS Safari等タッチ環境ではdragイベントが発火しないため、
 * 呼び出し側は必ずタップ選択(クリック)操作と併用できるようにすること。
 */
export function makeDraggableCard(el: HTMLElement, cardId: string): void {
  el.draggable = true;
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("text/plain", cardId);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
  });
}

export function makeDropTarget(el: HTMLElement, onDrop: (cardId: string) => void): void {
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => {
    el.classList.remove("drag-over");
  });
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    const cardId = e.dataTransfer?.getData("text/plain");
    if (cardId) onDrop(cardId);
  });
}
