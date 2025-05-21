"use strict";

import {GUI} from "./GUI.js";
import {CanvasHandler} from "./canvasHandler.js";
import {State} from "./state.js";
import {parseFunction} from "./functionParser/functionParser.js";
import {addMetadataToPng, extractMetadataFromPng} from "./imageSaver.js";
import {updateHistoryButtons, dumpForHistory} from "./historyEventHandlers.js";
import {HistoryManager} from "./historyManager.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
const canvasHandler = new CanvasHandler(GUI, canvas, ctx);

const toggleBtn = document.getElementById("toggleDraw");
// const applyBtn = document.getElementById("applyParams");
const openBtn    = document.getElementById('openMenuBtn');
const closeBtn   = document.getElementById('closeMenuBtn');
const sidebar    = document.getElementById('sidebar');
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

// applyBtn.addEventListener("click", () => {
//     State.setDensity(+document.getElementById("p").value);
//     State.setTension(+document.getElementById("T0").value);
//     State.length = +document.getElementById("length").value;

//     State.rebuild();
//     State.resetTime();
//     dumpForHistory();
// });

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

openBtn.addEventListener('click', () => {
  sidebar.classList.add('open');
});

closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('open');
  openBtn.style.display  = 'block';
});

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
    pointsCount: v => isNum(v) && +v >= 2 && +v <= 1e4,
    modes: v => isNum(v) && +v > 0,
    timeScale: v => isNum(v) && +v >= 1e-3,
    startTime: v => isNum(v) && +v >= 0
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
        case "pointsCount":
            State.setPointsCount(+el.value);
            break;
        case "modes":
            State.setModes(+el.value);
            break;
        case "timeScale":
            State.setTimeScale(+el.value);
            break;
        case "startTime":
            State.setStartTime(+el.value);
            break;
    }
}, true);

document.getElementById("isFrozen")
    .addEventListener("change", e => State.toggleFrozen(e.target.checked));

const saveBtn = document.getElementById("saveImage");
saveBtn.addEventListener("click", () => {
    canvas.toBlob(async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();

        const metadata = State.dumpData();

        const finalBlob = addMetadataToPng(arrayBuffer, metadata);

        const a = document.createElement('a');
        a.href = URL.createObjectURL(finalBlob);
        a.download = 'image_with_metadata.png';
        a.click();
    });
});

const loadBtn = document.getElementById("loadImage");
const fileInput = document.getElementById("fileInput");

loadBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (file) {
        try {
            const metadata = await extractMetadataFromPng(file);
            State.loadData(metadata);
            HistoryManager.pushState(State.dumpDataForHistory());
            updateHistoryButtons();
        } catch (err) {
            console.error(err);
        }
    }
});

function applyParams() {
    State.setDensity(+document.getElementById("p").value);
    State.setTension(+document.getElementById("T0").value);
    State.length = +document.getElementById("length").value;

    State.rebuild();
    State.resetTime();
    dumpForHistory();
}

// Для плотности
// const pRange = document.getElementById('p');
// const pNumber = document.getElementById('p-number');
// pRange.addEventListener('input', () => {
//     pNumber.value = pRange.value;
//     applyParams();
// });
// pNumber.addEventListener('input', () => {
//     let v = Math.min(Math.max(+pNumber.value, 0.1), 5);
//     pNumber.value = v;
//     pRange.value = v;
//     applyParams();
// });

// Для натяжения
// const T0Range = document.getElementById('T0');
// const T0Number = document.getElementById('T0-number');
// T0Range.addEventListener('input', () => {
//     T0Number.value = T0Range.value;
//     applyParams();
// });
// T0Number.addEventListener('input', () => {
//     let v = Math.min(Math.max(+T0Number.value, 1), 10);
//     T0Number.value = v;
//     T0Range.value = v;
//     applyParams();
// });


// SLIDERS WEEEEEEEEEEEEEEEEEEEE

// Плотность
const pSlider = document.getElementById('p');
const pValue = document.getElementById('p-value');
pSlider.addEventListener('change', () => {
    pValue.textContent = (+pSlider.value).toFixed(2);
    applyParams();
});

// Натяжение
const T0Slider = document.getElementById('T0');
const T0Value = document.getElementById('T0-value');
T0Slider.addEventListener('change', () => {
    T0Value.textContent = (+T0Slider.value).toFixed(2);
    applyParams();
});
// Длина
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');

// Обновление текста в реальном времени
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = parseInt(lengthSlider.value, 10);
});

// Применять только когда отпустили слайдер
lengthSlider.addEventListener('change', () => {
    lengthValue.textContent = parseInt(lengthSlider.value, 10);
    applyParams();
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

export {canvasHandler};
