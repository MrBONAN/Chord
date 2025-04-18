"use strict";

import {StringCalculator} from "./integrate.js";
import {GUI} from "./GUI.js";

let context = GUI.getContext("glcanvas");
const stringLineColor = "red";
context.lineWidth = 2;

const PI = Math.PI;

const left = 0;
const right = 1;
const dx = 0.0001
const pointsCount = Math.floor((right - left) / dx) + 1;
const T0 = 9;
const p = 1;
const a = Math.sqrt(T0 / p);
const positionFunction = (x) => Math.sin(2 * PI * x);
const speedFunction = (x) => 3 * PI * Math.sin(PI * x) + 9 * PI * Math.sin(3 * PI * x) + 15 * PI * Math.sin(5 * PI * x);

const stringFunction = StringCalculator.getMainStringFunction(positionFunction, speedFunction, left, right, a, dx);

const dataBounds = {
    left: -0.1, right: 1.1,
    bottom: -3, top: 3
};
const clipBounds = {
    left: 0, right: context.canvas.width,
    bottom: context.canvas.height, top: 0 // тут ошибки нет, просто в canvas отсчёт идёт сверху вниз
}

function render(milliseconds) {
    const time = milliseconds * 0.0001;

    GUI.clearCanvas(context)
    GUI.drawString(context, stringFunction, stringLineColor, time, pointsCount,
        dataBounds, clipBounds, false);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
