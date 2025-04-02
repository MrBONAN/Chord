"use strict";

import {getCanvasAndGl, initShaderProgram, createBuffer} from './webGlHelper.js';
import {calculateFunctionHeights, calculateDCoefficients, calculateECoefficients} from "./integrate";

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
const tempInitialPositionFunction = (x) => x * (1 - x);
const tempInitialSpeedFunction = (x) => 0;
// Количество слагаемых в разложении в ряд
const N = 100;

const a = Math.sqrt(T0 / p);
const L = right - left;
const pointsCount = Math.floor(L / dx);
// Рассматриваем функции на отрезке от 0 до L
// const initialPositionFunction = (x) => tempInitialPositionFunction(x + left);
// const initialSpeedFunction = (x) => tempInitialSpeedFunction(x + left);
var lambdas = new Array(N).map((_, index) => Math.PI * (index + 1) / L);

const initialPositionHeights = calculateFunctionHeights(tempInitialPositionFunction, pointsCount, dx, left);
const initialSpeedHeights = calculateFunctionHeights(tempInitialPositionFunction, pointsCount, dx, left);
const D = calculateDCoefficients(a, L, lambdas, initialPositionHeights, dx, left);
const E = calculateECoefficients(a, L, lambdas, initialSpeedHeights, dx, left);


const drawLineProgram = initShaderProgram(gl, vsSource, fsSource);
gl.useProgram(drawLineProgram);

const positionLocation = gl.getAttribLocation(drawLineProgram, "aPosition");

const uColorLocation = gl.getUniformLocation(drawLineProgram, "uColor");
gl.uniform4fv(uColorLocation, stringLineColor);


const positionBuffer = createBuffer(gl, positionLocation, gl.ARRAY_BUFFER, 2, gl.FLOAT);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Параметры синусоиды
const amplitude = 0.5;
const frequency = 4.0;
const pointCount = 200;
const speed = 1.0;

// Функция для генерации точек синусоиды с учётом сдвига фазы
function generateSineWaveVertices(phase) {
    const vertices = [];
    for (let i = 0; i <= pointCount; i++) {
        const x = -1 + (2 * i) / pointCount;
        const y = amplitude * Math.sin(frequency * Math.PI * (x + phase));
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

// Устанавливаем цвет для очистки
gl.clearColor(1.0, 1.0, 1.0, 1.0);

function render(time) {
    // Время приходит в миллисекундах; переводим в секунды
    const t = time * 0.001;
    const phase = t * speed; // сдвиг фазы изменяется со временем

    // Генерируем новые вершины синусоиды
    const vertices = generateSineWaveVertices(phase);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Устанавливаем viewport и очищаем canvas. viewport - область canvas, в которой рисуем
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Рисуем синусоиду как непрерывную линию
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);

    // Запрашиваем следующий кадр
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
