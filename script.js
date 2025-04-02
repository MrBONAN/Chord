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
const dx = 0.01
const T0 = 20;
const p = 2.5;
// const tempInitialPositionFunction = (x) => x * (1 - x);
// const tempInitialSpeedFunction = (x) => 0;
// Функция повеселее (это типа та, которую мы делали на лекции, но я её домножил на 1/31, чтобы влезало в экран)
const tempInitialPositionFunction = (x) => (31 * Math.sin(2 * Math.PI * x) + 2 * Math.sin(5 * Math.PI * x)) / 31;
const tempInitialSpeedFunction = (x) => (Math.sin(Math.PI * x) + 12 * Math.sin(3 * Math.PI * x) + 2 * Math.sin(5 * Math.PI * x)) / 31;
// Количество слагаемых в разложении в ряд
const N = 100;

const a = Math.sqrt(T0 / p);
const L = right - left;
const pointsCount = Math.floor(L / dx);
var lambdas = new Array(N).fill(0).map((_, index) => Math.PI * (index + 1) / L);

const initialPositionHeights = calculateFunctionHeights(tempInitialPositionFunction, pointsCount, dx, left);
const initialSpeedHeights = calculateFunctionHeights(tempInitialSpeedFunction, pointsCount, dx, left);
const D = calculateDCoefficients(a, L, lambdas, initialPositionHeights, dx, left);
const E = calculateECoefficients(a, L, lambdas, initialSpeedHeights, dx, left);

const stringFunction = getMainStringFunction(D, E, lambdas, a);


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
    // Время приходит в миллисекундах; переводим в секунды
    const t = time * 0.001;
    const stringFunctionInCurrentMoment = (x) => stringFunction(t, x);

    const heights = calculateFunctionHeights(stringFunctionInCurrentMoment, pointsCount, dx, left);
    const vertices = createFunctionPoints(heights, dx, left);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
