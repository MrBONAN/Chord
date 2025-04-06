"use strict";

import {getCanvasAndGl} from "./webGlHelper.js";
import {StringCalculator} from "./integrate.js";
import {GUI} from "./GUI.js";

const {canvas, gl} = getCanvasAndGl("glcanvas");
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

const shiftedStringFunction = StringCalculator.getMainStringFunction(positionFunction, speedFunction, left, right, a, dx);

GUI.initStringShaderProgram(gl);

function render(time) {
    const t = time * 0.0001;
    const stringFunctionSnapshot = (x) => shiftedStringFunction(t, x);

    GUI.clearCanvas(gl);
    GUI.drawString(gl, canvas, stringFunctionSnapshot, pointsCount, left, right,
        -10, 2, 2, -3.1, false);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
