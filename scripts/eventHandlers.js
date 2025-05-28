"use strict";

import {GUI} from "./GUI.js";
import {CanvasHandler} from "./canvasHandler.js";
import {State} from "./state.js";
import {parseFunction} from "./functionParser/functionParser.js";
import {updateHistoryButtons, dumpForHistory} from "./historyEventHandlers.js";
import {HistoryManager} from "./historyManager.js";
import {ImageSaver} from "./imageSaver.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
const canvasHandler = new CanvasHandler(GUI, canvas, ctx);

const toggleBtn = document.getElementById("toggleDraw");
// const openBtn = document.getElementById('openMenuBtn');
// const closeBtn = document.getElementById('closeMenuBtn');
// const sidebar = document.getElementById('sidebar');
const savePosBtn = document.getElementById("savePosFunc");
const saveSpeedBtn = document.getElementById("saveSpeedFunc");
const lengthInput = document.getElementById('length');

toggleBtn.addEventListener("click", () => {
    State.toggleDrawingMode();

    if (State.isDrawingMode) {
        GUI.clearCanvas(ctx);
        toggleBtn.textContent = "Закончить и сохранить";
        canvasHandler.points = new Array(canvas.width).fill(0);
        canvasHandler.drawInput();
    } else {
        State.drawnPoints = canvasHandler.points.slice();
        State.setPositionFunction(canvasHandler.createLinearInterpolator(State.drawnPoints), "0");
        toggleBtn.textContent = "Начать рисование";
        State.rebuild();
        dumpForHistory();
    }
    State.resetTime();
});

savePosBtn.addEventListener("click", () => {
    const strPosFunc = document.getElementById("posFuncStr").value
    const posFunction = parseFunction(strPosFunc);
    if (posFunction.success) {
        State.setPositionFunction(posFunction.func, strPosFunc);
        State.drawnPoints = [];
    } else {
        console.error(posFunction.message);
    }
    State.rebuild();
    State.resetTime();
    dumpForHistory();
});

saveSpeedBtn.addEventListener("click", () => {
    const strSpeedFunc = document.getElementById("speedFuncStr").value;
    const speedFunction = parseFunction(strSpeedFunc);
    if (speedFunction.success) {
        State.setSpeedFunction(speedFunction.func, strSpeedFunc);
    } else {
        console.error(speedFunction.message);
    }
    State.rebuild();
    State.resetTime();
    dumpForHistory();
});

// openBtn.addEventListener('click', () => {
//     sidebar.classList.add('open');
// });

// closeBtn.addEventListener('click', () => {
//     sidebar.classList.remove('open');
//     openBtn.style.display = 'block';
// });

const inputs = document.querySelectorAll('#all-params input');
inputs.forEach(el => {
    el.dataset.prev = el.value;
    el.addEventListener('animationend', () => el.classList.remove('invalid'));
});

function pulse(el) {
    el.classList.remove('invalid');
    void el.offsetWidth;
    el.classList.add('invalid');
}

const isNum = v => v.trim() !== "" && Number.isFinite(+v);

const validators = {
    dx: v => isNum(v) && +v >= 1e-6 && +v <= 0.1,
    n: v => isNum(v) && +v >= 10 && +v <= 1000000,
    pointsCount: v => isNum(v) && +v >= 2 && +v <= 1e4,
    modes: v => isNum(v) && +v > 0,
    timeScale: v => isNum(v) && +v > 0,
    startTime: v => isNum(v) && +v >= 0,
    "p-value": v => isNum(v) && +v > 0,
    "T0-value": v => isNum(v) && +v > 0,
    "length-value": v => isNum(v) && +v >= 0.1
};
document.getElementById("all-params").addEventListener("change", e => {
    const el = e.target;
    if (!validators[el.id]) return;

    if (!validators[el.id](el.value)) {
        el.value = el.dataset.prev;
        pulse(el);
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }
    el.dataset.prev = el.value;

    switch (el.id) {
        case "dx":
            State.setDx(+el.value);
            break;
        case "n":
            State.setN(+el.value);
            break;
        case "pointsCount":
            const newPointsCount = Math.round(+el.value);
            el.value = newPointsCount === 0? 1 : newPointsCount;
            State.setPointsCount(+el.value);
            break;
        case "modes":
            const newModes = Math.round(+el.value);
            el.value = newModes === 0? 1 : newModes;
            State.setModes(+el.value);
            break;
        case "timeScale":
            State.setTimeScale(+el.value);
            break;
    }
}, true);

document.getElementById("isFrozen").addEventListener("change", e => State.toggleFrozen(e.target.checked));

const imageSaver = new ImageSaver(canvas);

const saveBtn = document.getElementById("saveImage");
saveBtn.addEventListener("click", async () => {
    try {
        const metadata = State.dumpData();
        const finalBlob = await imageSaver.saveImage(metadata);
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(finalBlob);
        a.download = 'image_with_metadata.png';
        a.click();
    } catch (err) {
        console.error('Error saving image:', err);
    }
});

const loadBtn = document.getElementById("loadImage");
const fileInput = document.getElementById("fileInput");

loadBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    try {
        const metadata = await imageSaver.loadImage(file);
        State.loadData(metadata);
        HistoryManager.pushState(State.dumpDataForHistory());
        updateHistoryButtons();
    } catch (err) {
        console.error(err);
    } finally {
        fileInput.value = "";
    }
});

function applyParams() {
    State.setDensity(+document.getElementById("p-value").value);
    State.setTension(+document.getElementById("T0-value").value);
    State.setLength(+document.getElementById("length-value").value);

    State.rebuild();
    State.resetTime();
    dumpForHistory();
}

// SLIDERS WEEEEEEEEEEEEEEEEEEEE

const slidersNames = ["p", "T0", "length"];
slidersNames.forEach(name => {
    const slider = document.getElementById(name);
    const value = document.getElementById(name + "-value");
    if (!slider || !value) {
        return;
    }
    slider.addEventListener("input", () => {
        value.value = Number((+slider.value).toFixed(2));
    });
    slider.addEventListener('change', () => {
        value.value = Number((+slider.value).toFixed(2));
        applyParams();
    });
    value.addEventListener('change', () => {
        slider.value = value.value;
        applyParams();
    });
});


export function syncSliderDisplaysFromState() {
    const pSlider = document.getElementById('p');
    const pValue = document.getElementById('p-value');
    pSlider.value = State.p;
    pValue.textContent = (+State.p).toFixed(2);
    const T0Slider = document.getElementById('T0');
    const T0Value = document.getElementById('T0-value');
    T0Slider.value = State.T0;
    T0Value.textContent = (+State.T0).toFixed(2);

    const lenSlider = document.getElementById('length');
    const lenValue = document.getElementById('length-value');
    lenSlider.value = State.length;
    lenValue.textContent = (+State.length).toFixed(0);

}


lengthInput.addEventListener('change', () => applyParams());

// Настройки зума
const zoomInBtn = document.getElementById("zoomInButton");
const zoomOutBtn = document.getElementById("zoomOutButton");
const resetViewBtn = document.getElementById("resetViewButton");
const zoomDelta = 1.2;

zoomInBtn.addEventListener("click", (e) => {
    if (State.isDrawingMode) return;
    canvasHandler.zoomToCenterByY(zoomDelta);
    if (!e.shiftKey) {
        canvasHandler.zoomToCenterByX(zoomDelta);
    }
});

zoomOutBtn.addEventListener("click", (e) => {
    if (State.isDrawingMode) return;
    canvasHandler.zoomToCenterByY(1 / zoomDelta);
    if (!e.shiftKey) {
        canvasHandler.zoomToCenterByX(1 / zoomDelta);
    }
});

resetViewBtn.addEventListener("click", (e) => {
    if (State.isDrawingMode) return;
    State.resetClip();
});


export {canvasHandler};
