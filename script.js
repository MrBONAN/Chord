"use strict";

import {StringCalculator} from "./integrate.js";
import {GUI} from "./GUI.js";
import {Drawer} from "./draw.js";

const PI = Math.PI;

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 2;

const toggleBtn = document.getElementById("toggleDraw");
const applyBtn = document.getElementById("applyParams");
const timeDisplay = document.getElementById("timeDisplay");

let p = 1;
let T0 = 9;
let left = 0;
let right = 1;
let a = Math.sqrt(T0 / p);

let dx = 0.0001;
let pointsCount = 200;
let modes = 100;
let timeScale = 1;
let startTime = 0;
let isFrozen = false;

let positionFunction = x => Math.sin(2 * PI * x);
let speedFunction = x => 0;

let stringVersion = 1;
let stringFunction = StringCalculator.getMainStringFunction(
    positionFunction, speedFunction, left, right, a, dx, modes
);


const dataBounds = {left: 0, right: 1, bottom: -1, top: 1};
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
        stringFunction = StringCalculator.getMainStringFunction(
            positionFunction, speedFunction, left, right, a, dx, modes
        );
        toggleBtn.textContent = "Начать рисование";
        stringVersion++;
    }
});

let timeOffset = 0;
const syncTimeOffset = () => timeOffset = performance.now() - timeOffset;
syncTimeOffset();

applyBtn.addEventListener("click", () => {
    p = +document.getElementById("density").value;
    T0 = +document.getElementById("tension").value;
    left = +document.getElementById("leftBound").value;
    right = +document.getElementById("rightBound").value;

    const posExpr = document.getElementById("posFunc").value;
    const speedExpr = document.getElementById("speedFunc").value;

    positionFunction = new Function("x", `return ${posExpr};`);
    speedFunction = new Function("x", `return ${speedExpr};`);

    a = Math.sqrt(T0 / p);

    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx, modes
    );
    dataBounds.left = left;
    dataBounds.right = right;
    stringVersion++;
    syncTimeOffset();
});

// Настройка для всех input-ов: сохраняем значение по умолчанию (чтобы к нему потом откатываться)
// Также добавляем ивент - после окончания анимации, удаляем свойство invalid (красная рамочка вокруг поля)
const inputs = document.querySelectorAll('#all-params input');
inputs.forEach(el => {
    el.dataset.prev = el.value;
    el.addEventListener('animationend', () => {
        el.classList.remove('invalid');
    });
});

function restartAnimation(el) {
    el.classList.remove('invalid');
    void el.offsetWidth;
    el.classList.add('invalid');
}

// Для всех параметров можно будет установить валидатор. Перед установкой значения будет проходить проверка на корректность
// В случае некорректности, появится рамочка и значение откатится к последнему корректному сохранённому
document.getElementById('all-params').addEventListener('change', e => {
    const el = e.target;
    if (el.validate === undefined) {
        return;
    }
    if (!el.validate(el.value)) {
        el.value = el.dataset.prev;
        restartAnimation(el);
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }
    el.dataset.prev = el.value;
}, true);

function isNumber(v) {
    if (String(v).trim() === '') return false;
    const n = Number(v);
    return Number.isFinite(n)
}

const dxInput = document.getElementById("dx");
dxInput.validate = (strValue) => {
    const value = +strValue;
    return isNumber(strValue) && value >= 1e-6 && value <= 0.1;
};

dxInput.addEventListener("change", () => {
    dx = +dxInput.value;
    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx, modes
    );
});

const pointsCountInput = document.getElementById("pointsCount");
pointsCountInput.validate = (strValue) => {
    const value = +strValue;
    return isNumber(strValue) && value >= 2 && value <= 1e4;
};

pointsCountInput.addEventListener("change", () => {
    pointsCount = +pointsCountInput.value;
});

const modesInput = document.getElementById("modes");
modesInput.validate = (strValue) => {
    const value = +strValue;
    return isNumber(strValue) && value > 0;

};
modesInput.addEventListener("change", () => {
    modes = +modesInput.value;
    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx, modes
    );
});

const timeScaleInput = document.getElementById("timeScale");
timeScaleInput.validate = (strValue) => {
    const value = +strValue;
    return isNumber(strValue) && value >= 1e-3;
};
timeScaleInput.addEventListener("change", () => {
    timeScale = +timeScaleInput.value;
});

const startTimeInput = document.getElementById("startTime");
startTimeInput.validate = (strValue) => {
    const value = +strValue;
    return isNumber(strValue) && value >= 0;
};
startTimeInput.addEventListener("change", () => {
    if (isFrozen) {
        timeOffset = 0;
    } else {
        timeOffset = performance.now();
    }
    startTime = +startTimeInput.value;
    frozenTime = startTime;
});

let currentT = 0;
let frozenTime = 0;
const freeze = document.getElementById("freeze");
freeze.addEventListener("change", () => {
    isFrozen = freeze.checked;
    if (isFrozen) {
        frozenTime = currentT;
    }
    syncTimeOffset();
});

let lastStringVersion = stringVersion;

function render(ms) {
    if (!drawer.isDrawingMode && lastStringVersion === stringVersion) {
        const rawT = (ms - timeOffset + startTime / 0.0001) * 0.0001 * timeScale;
        currentT = isFrozen ? frozenTime : rawT;

        GUI.clearCanvas(ctx);
        GUI.drawString(ctx, stringFunction, "rgba(100,100,100,0.5)",
            startTime, pointsCount, dataBounds, clipBounds, false);
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
