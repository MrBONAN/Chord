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
const freeze  = document.getElementById("freeze");
const timeDisplay  = document.getElementById("timeDisplay");

let p       = 1;
let T0      = 9;
let left    = 0;
let right   = 1;
let a       = Math.sqrt(T0 / p);

let dx      = 0.0001;
let pointsCount = 200;
let modes       = 100;
let timeScale   = 1;
let startTime   = 0;
let isFrozen    = false;

let positionFunction = x => Math.sin(2 * PI * x);
let speedFunction    = x => 0;

let stringVersion = 1;
let stringFunction = StringCalculator.getMainStringFunction(
    positionFunction, speedFunction, left, right, a, dx, modes
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
            positionFunction, speedFunction, left, right, a, dx, modes
        );
        toggleBtn.textContent = "Начать рисование";
        stringVersion++;
    }
});

let timeOffset = 0;
const syncTimeOffset = () =>
    timeOffset = performance.now() - startTime / (0.0001 * timeScale);
syncTimeOffset();

applyBtn.addEventListener("click", () => {
    p        =  +document.getElementById("density").value;
    T0       =  +document.getElementById("tension").value;
    left     =  +document.getElementById("leftBound").value;
    right    =  +document.getElementById("rightBound").value;
    dx       =  +document.getElementById("dx").value;
    pointsCount = +document.getElementById("pointsCount").value;
    modes    =  +document.getElementById("modes").value;
    timeScale = +document.getElementById("timeScale").value || 1;
    startTime = +document.getElementById("startTime").value   || 0;
    isFrozen  = +document.getElementById("freeze").checked;

    const posExpr   = document.getElementById("posFunc").value;
    const speedExpr = document.getElementById("speedFunc").value;

    positionFunction = new Function("x", `return ${posExpr};`);
    speedFunction    = new Function("x", `return ${speedExpr};`);

    a = Math.sqrt(T0 / p);

    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx, modes
    );
    dataBounds.left  = left;
    dataBounds.right = right;
    stringVersion++;
    syncTimeOffset();
});

let currentT = 0;
freeze.addEventListener("change", () => {
    isFrozen  = freeze.checked;
    if (isFrozen) {
        startTime = currentT;
    }
    syncTimeOffset();
});

let lastStringVersion = stringVersion;
function render(ms) {
    if (!drawer.isDrawingMode && lastStringVersion === stringVersion) {
        const rawT = (ms - timeOffset) * 0.0001 * timeScale;
        currentT   = isFrozen ? startTime : rawT;

        GUI.clearCanvas(ctx);
        GUI.drawString(ctx, stringFunction, "rgba(100,100,100,0.5)",
            0, pointsCount, dataBounds, clipBounds, false);
        GUI.drawString(ctx, stringFunction, "red",
            currentT, pointsCount, dataBounds, clipBounds, false);

        timeDisplay.textContent = currentT.toFixed(2);
    } else {
        timeOffset = ms;
        lastStringVersion = stringVersion;
    }
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
