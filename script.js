"use strict";

import { StringCalculator } from "./integrate.js";
import { GUI } from "./GUI.js";
import { Drawer } from "./draw.js";

let canvas = GUI.getCanvas("glcanvas");
let context = canvas.getContext('2d');
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
// const speedFunction = (x) => 3 * PI * Math.sin(PI * x) + 9 * PI * Math.sin(3 * PI * x) + 15 * PI * Math.sin(5 * PI * x);
const speedFunction = (x) => 0;

let stringFunction = StringCalculator.getMainStringFunction(positionFunction, speedFunction, left, right, a, dx);

const dataBounds = {
    left: 0, right: 1,
    bottom: -1, top: 1
};
const clipBounds = {
    left: 0, right: context.canvas.width,
    bottom: context.canvas.height, top: 0 // тут ошибки нет, просто в canvas отсчёт идёт сверху вниз
}

const drawer = new Drawer(GUI, canvas, context);
const toggleBtn = document.getElementById('toggleDraw');
toggleBtn.addEventListener('click', () => {
    drawer.isDrawingMode = !drawer.isDrawingMode;
    if (drawer.isDrawingMode) {
        GUI.clearCanvas(context);
        toggleBtn.textContent = 'Закончить и сохранить';
        drawer.points = new Array(canvas.width).fill(0);
    } else {
        stringFunction = StringCalculator.getMainStringFunction(drawer.createLinearInterpolator(drawer.points), speedFunction, left, right, a, dx);
        toggleBtn.textContent = 'Начать рисование';
    }
});

let offset = 0;
function render(milliseconds) {
    if (!drawer.isDrawingMode) {
        const time = (milliseconds - offset) * 0.0001;
        GUI.clearCanvas(context);
        GUI.drawString(context, stringFunction, stringLineColor, time, pointsCount, dataBounds, clipBounds, false);
    } else {
        offset = milliseconds;
    }
    requestAnimationFrame(render);
}

requestAnimationFrame(render);