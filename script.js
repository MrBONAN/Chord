"use strict";

import {getCanvasAndGl, initShaderProgram, createBuffer} from './webGlHelper.js';
import {
    calculateFunctionHeights,
    calculateDCoefficients,
    calculateECoefficients,
    getMainStringFunction,
    createFunctionPoints
} from "./integrate.js";

const stringLineColor = [1.0, 0.0, 0.0, 1.0];
const speedLineColor = [0.0, 0.0, 1.0, 1.0];
const {canvas, gl} = getCanvasAndGl("glcanvas");
const PI = Math.PI;


const vsSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fsSource = `
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
`;

const left = 0;
const right = 1;
const dx = 0.0001
const T0 = 9;
const p = 1;
const tempInitialPositionFunction = (x) => Math.sin(2 * PI * x);
const tempInitialSpeedFunction = (x) => 3*PI*Math.sin(PI*x) + 9*PI*Math.sin(3*PI*x) + 15*PI*Math.sin(5*PI*x);
// Количество слагаемых в разложении в ряд
const N = 100;

const a = Math.sqrt(T0 / p);
const L = right - left;
const pointsCount = Math.floor(L / dx) + 1;
var lambdas = new Array(N).fill(0).map((_, index) => Math.PI * (index + 1) / L);

const shiftedInitialPositionFunction = (x) => tempInitialPositionFunction(x - left);
const shiftedInitialSpeedFunction = (x) => tempInitialSpeedFunction(x - left);

const initialPositionHeights = calculateFunctionHeights(shiftedInitialPositionFunction, pointsCount, dx);
const initialSpeedHeights = calculateFunctionHeights(shiftedInitialSpeedFunction, pointsCount, dx);
const D = calculateDCoefficients(a, L, lambdas, initialSpeedHeights, dx);
const E = calculateECoefficients(a, L, lambdas, initialPositionHeights, dx);

const shiftedStringFunction = getMainStringFunction(D, E, lambdas, a);

///////////////// WEBGL НАСТРОЙКА
const drawLineProgram = initShaderProgram(gl, vsSource, fsSource);
gl.useProgram(drawLineProgram);

const positionLocation = gl.getAttribLocation(drawLineProgram, "aPosition");

const uColorLocation = gl.getUniformLocation(drawLineProgram, "uColor");
gl.uniform4fv(uColorLocation, stringLineColor);

const positionBuffer = createBuffer(gl, positionLocation, gl.ARRAY_BUFFER, 2, gl.FLOAT);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.clearColor(1.0, 1.0, 1.0, 1.0);

/////////////////
function render(time) {
    const t = time * 0.0001;
    const shiftedStringFunctionInCurrentMoment = (x) => shiftedStringFunction(t, x);
    const vertices = createFunctionPoints(shiftedStringFunctionInCurrentMoment, pointsCount, left, right,
        -10, 2, -3.1, 2, false);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
