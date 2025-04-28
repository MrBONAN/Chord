"use strict";

import {GUI} from "./GUI.js";
import {Drawer} from "./draw.js";
import * as state from "./state.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
const drawer = new Drawer(GUI, canvas, ctx);

const toggleBtn = document.getElementById("toggleDraw");
const applyBtn = document.getElementById("applyParams");


toggleBtn.addEventListener("click", () => {
    drawer.isDrawingMode = !drawer.isDrawingMode;

    if (drawer.isDrawingMode) {
        GUI.clearCanvas(ctx);
        toggleBtn.textContent = "Закончить и сохранить";
        drawer.points = new Array(canvas.width).fill(0);
        state.resetTime();
    } else {
        state.setPositionFunction(
            drawer.createLinearInterpolator(drawer.points)
        );
        toggleBtn.textContent = "Начать рисование";
        state.resetTime();
    }
});


applyBtn.addEventListener("click", () => {
    state.setDensity(+document.getElementById("density").value);
    state.setTension(+document.getElementById("tension").value);
    state.setBounds(+document.getElementById("leftBound").value,
        +document.getElementById("rightBound").value
    );

    state.setPositionFunction(new Function("x", `return ${document.getElementById("posFunc").value};`));
    state.setSpeedFunction(new Function("x", `return ${document.getElementById("speedFunc").value};`));

    state.resetTime();
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
                state.setDx(+el.value);
                break;
            case "pointsCount":
                state.setPointsCount(+el.value);
                break;
            case "modes":
                state.setModes(+el.value);
                break;
            case "timeScale":
                state.setTimeScale(+el.value);
                break;
            case "startTime":
                state.setStartTime(+el.value);
                break;
        }
    }, true);
document.getElementById("freeze")
    .addEventListener("change", e => state.toggleFrozen(e.target.checked));

export {drawer};
