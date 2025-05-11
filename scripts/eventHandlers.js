"use strict";

import {GUI} from "./GUI.js";
import {CanvasHandler} from "./canvasHandler.js";
import {State} from "./state.js";
import {parseFunction} from "./functionParser/functionParser.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
const canvasHandler = new CanvasHandler(GUI, canvas, ctx);

const toggleBtn = document.getElementById("toggleDraw");
const applyBtn = document.getElementById("applyParams");


toggleBtn.addEventListener("click", () => {
    State.toggleDrawingMode();

    if (State.isDrawingMode) {
        GUI.clearCanvas(ctx);
        toggleBtn.textContent = "Закончить и сохранить";
        canvasHandler.points = new Array(canvas.width).fill(0);
        canvasHandler.drawInput();
    } else {
        State.setPositionFunction(
            canvasHandler.createLinearInterpolator(canvasHandler.points)
        );
        toggleBtn.textContent = "Начать рисование";
        State.rebuild();
    }
    State.resetTime();
});


applyBtn.addEventListener("click", () => {
    State.setDensity(+document.getElementById("density").value);
    State.setTension(+document.getElementById("tension").value);
    State.length = +document.getElementById("length").value;

    const posFunction = parseFunction(document.getElementById("posFunc").value);
    const speedFunction = parseFunction(document.getElementById("speedFunc").value);

    if (posFunction.success) {
        State.setPositionFunction(posFunction.func);
    } else {
        console.error(posFunction.message);
    }

    if (speedFunction.success) {
        State.setSpeedFunction(speedFunction.func);
    } else {
        console.error(speedFunction.message);
    }

    State.rebuild();
    State.resetTime();
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
document.getElementById("all-params")
    .addEventListener("change", e => {
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
document.getElementById("freeze").addEventListener("change", e => State.toggleFrozen(e.target.checked));