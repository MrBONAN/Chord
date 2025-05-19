"use strict";

import {HistoryManager} from "./historyManager.js";
import {State} from "./state.js";

const undoBtn = document.getElementById("undoButton");
const redoBtn = document.getElementById("redoButton");

export function updateHistoryButtons() { // похожий функционал есть ещё в eventHandlers
    undoBtn.disabled = !HistoryManager.canUndo;
    redoBtn.disabled = !HistoryManager.canRedo;
}

function deepEqual(a, b) {
    const isComplex = v => (typeof v === 'object' && v !== null) || typeof v === 'function';
    if (!isComplex(a) && !isComplex(b)) return a === b;
    if (typeof a === 'function' && typeof b === 'function')
        return a.toString() === b.toString();

    if (a === undefined || b === undefined) return a === b;
    if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (['positionFunction','speedFunction','stringFunction'].includes(key)) continue;
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
}

export function dumpForHistory() {
    const dump = State.dumpDataForHistory();
    if (deepEqual(dump, HistoryManager.getState())) {
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