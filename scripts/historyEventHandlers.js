"use strict";

import {HistoryManager} from "./historyManager.js";
import {State} from "./state.js";

const undoBtn = document.getElementById("undoButton");
const redoBtn = document.getElementById("redoButton");

export function updateHistoryButtons() { // похожий функционал есть ещё в eventHandlers
    undoBtn.disabled = !HistoryManager.canUndo;
    redoBtn.disabled = !HistoryManager.canRedo;
}

function equalityCheck(data1, data2) {
    for (const key of Object.keys(data1)) {
        if (data1[key] !== data2[key] &&
            key !== "positionFunction" && key !== "speedFunction" && key !== "stringFunction") {
            return false;
        }
    }

    return true;
}

export function dumpForHistory() {
    const dump = State.dumpDataForHistory();
    if (equalityCheck(dump, HistoryManager.getState())) {
        return;
    }
    HistoryManager.pushState(dump);
    updateHistoryButtons();
}

undoBtn.addEventListener("click", e => {
    if (HistoryManager.canUndo) {
        HistoryManager.undo();
        State.loadDataForHistory(HistoryManager.getState());
        updateHistoryButtons();
    }
});

redoBtn.addEventListener("click", e => {
    if (HistoryManager.canRedo) {
        HistoryManager.redo();
        State.loadDataForHistory(HistoryManager.getState());
        updateHistoryButtons();
    }
});

HistoryManager.pushState(State.dumpDataForHistory());
updateHistoryButtons();