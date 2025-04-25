"use strict";

import { StringCalculator } from "./integrate.js";
import { GUI } from "./GUI.js";
import { Drawer } from "./draw.js";

const PI = Math.PI;

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 2;

const toggleBtn = document.getElementById("toggleDraw");
const applyBtn  = document.getElementById("applyParams");


let p       = 1;
let T0      = 9;
let left    = 0;
let right   = 1;
let dx      = 0.0001;
let pointsCount = Math.floor((right - left) / dx) + 1;
let a       = Math.sqrt(T0 / p);

let positionFunction = x => Math.sin(2 * PI * x);
let speedFunction    = x => 0;

let stringFunction = StringCalculator.getMainStringFunction(
    positionFunction, speedFunction, left, right, a, dx
);


const dataBounds = { left: 0, right: 1, bottom: -1, top: 1 };
const clipBounds = {
    left: 0,
    right: ctx.canvas.width,
    bottom: ctx.canvas.height, // в Canvas отсчёт идёт сверху вниз
    top: 0
};

const drawer = new Drawer(GUI, canvas, ctx);

toggleBtn.addEventListener("click", () => {
    drawer.isDrawingMode = !drawer.isDrawingMode;

    if (drawer.isDrawingMode) {
        GUI.clearCanvas(ctx);
        toggleBtn.textContent = "Закончить и сохранить";
        drawer.points = new Array(canvas.width).fill(0);
    } else {
        positionFunction = drawer.createLinearInterpolator(drawer.points);
        stringFunction   = StringCalculator.getMainStringFunction(
            positionFunction, speedFunction, left, right, a, dx
        );
        toggleBtn.textContent = "Начать рисование";
    }
});


applyBtn.addEventListener("click", () => {
    p           = +document.getElementById("density").value;
    T0          = +document.getElementById("tension").value;
    left        = +document.getElementById("leftBound").value;
    right       = +document.getElementById("rightBound").value;
    dx          = +document.getElementById("dx").value;
    pointsCount = +document.getElementById("pointsCount").value;

    const posExpr   = document.getElementById("posFunc").value;
    const speedExpr = document.getElementById("speedFunc").value;

    positionFunction = new Function("x", `return ${posExpr};`);
    speedFunction    = new Function("x", `return ${speedExpr};`);

    a = Math.sqrt(T0 / p);

    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx
    );
    dataBounds.left = left;
    dataBounds.right = right;
});


let offset = 0;
function render(ms) {
    if (!drawer.isDrawingMode) {
        const t = (ms - offset) * 0.0001;

        GUI.clearCanvas(ctx);
        GUI.drawString(
            ctx,
            stringFunction,
            "red",
            t,
            pointsCount,
            dataBounds,
            clipBounds,
            false
        );

        document.getElementById("timeDisplay").textContent = t.toFixed(2);
    } else {
        offset = ms;
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
