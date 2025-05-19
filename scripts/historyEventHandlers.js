"use strict";

import {HistoryManager} from "./historyManager.js";
import {State} from "./state.js";
import {syncSliderDisplaysFromState} from "./eventHandlers.js";

const undoBtn = document.getElementById("undoButton");
const redoBtn = document.getElementById("redoButton");

export function updateHistoryButtons() { // похожий функционал есть ещё в eventHandlers
    undoBtn.disabled = !HistoryManager.canUndo;
    redoBtn.disabled = !HistoryManager.canRedo;
}

export function dumpForHistory() {
    const snap = State.dumpDataForHistory();
    HistoryManager.pushState(snap);
    updateHistoryButtons();
}

undoBtn.addEventListener("click", e => {
    if (HistoryManager.canUndo) {
        HistoryManager.undo();
        State.loadDataForHistory(HistoryManager.getState());
        updateHistoryButtons();
        syncSliderDisplaysFromState();
    }
});

redoBtn.addEventListener("click", e => {
    if (HistoryManager.canRedo) {
        HistoryManager.redo();
        State.loadDataForHistory(HistoryManager.getState());
        updateHistoryButtons();
        syncSliderDisplaysFromState();
    }
});

// HistoryManager.pushState(State.dumpDataForHistory());
updateHistoryButtons();