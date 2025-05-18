"use strict";

import {HistoryManager} from "./historyManager.js";
import {State} from "./state.js";
import {drawer} from "./eventHandlers.js";

const undoBtn = document.getElementById("undoButton");
const redoBtn = document.getElementById("redoButton");

// МБ потом понадобится
const allowedKeys = ['density', 'tension', 'leftBound', 'rightBound', 'posFunc', 'speedFunc'];

function filterParams(data) {
    return Object.fromEntries(
        Object.entries(data)
            .filter(([key]) => allowedKeys.includes(key))
    );
}

function updateHistoryButtons() {
    undoBtn.disabled = !HistoryManager.canUndo;
    redoBtn.disabled = !HistoryManager.canRedo;
}

function equalityCheck(data1, data2) {
    for (const key of Object.keys(data1)) {
        if (key !== "stringFunction" && data1[key] !== data2[key] || // TODO костыль. В новой версии нет функции как класса
            key === "stringFunction" && data1[key].func === data2[key].func) {
            return false;
        }
    }

    return true;
}

document.querySelectorAll('.paramsChanger')
    .forEach(el => {
        el.addEventListener('click', (e) => {
            const dump = State.dumpDataForHistory();
            if (equalityCheck(dump, HistoryManager.getState())) {
                return;
            }
            HistoryManager.pushState(dump);
            updateHistoryButtons();
        });
    });

document.getElementById('toggleDraw')
    .addEventListener('click', () => {
        if (!drawer.isDrawingMode) {
            const dump = State.dumpDataForHistory();
            if (equalityCheck(dump, HistoryManager.getState())) {
                return;
            }
            HistoryManager.pushState(dump);
            updateHistoryButtons();
        }
    });

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