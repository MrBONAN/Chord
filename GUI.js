"use strict";

import { initShaderProgram, createBuffer } from './webGlHelper.js';
import { StringCalculator } from "./integrate.js";

export class GUI {
    static vsSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

    static fsSource = `
precision mediump float;
uniform vec4 uColor;
void main() {
    gl_FragColor = uColor;
}
`;

    static initStringShaderProgram(gl) {
        GUI.drawLineProgram = initShaderProgram(gl, GUI.vsSource, GUI.fsSource);
        gl.useProgram(GUI.drawLineProgram);
        const positionLocation = gl.getAttribLocation(GUI.drawLineProgram, "aPosition");
        GUI.uColorLocation = gl.getUniformLocation(GUI.drawLineProgram, "uColor");
        GUI.positionBuffer = createBuffer(gl, positionLocation, gl.ARRAY_BUFFER, 2, gl.FLOAT);
    }

    /**
     * Отрисовка функции.
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {HTMLCanvasElement} canvas 
     * @param {StringFunction} stringFunction – объект, содержащий функцию и границы по x
     * @param {Array} color – массив RGBA, например [1.0, 0.0, 0.0, 1.0]
     * @param {number} time – текущее время для анимации
     * @param {number} pointsCount – сколько точек вычислять
     * @param {number} xMinToDraw – физический минимум по x для отображения (например, 0)
     * @param {number} xMaxToDraw – физический максимум по x для отображения (например, 1)
     * @param {number} yMinToDraw – физический минимум по y (например, -2)
     * @param {number} yMaxToDraw – физический максимум по y (например, 2)
     * @param {boolean} showOutsideBorders – показывать ли точки вне указанных границ
     */
    static drawString(gl, canvas, stringFunction, color, time, pointsCount,
                      xMinToDraw, xMaxToDraw, yMinToDraw, yMaxToDraw, showOutsideBorders) {
        const funcSnapshot = (x) => stringFunction.func(time, x);
        const vertices = StringCalculator.createFunctionPoints(
            funcSnapshot,
            pointsCount,
            stringFunction.leftBorder,   // физический x-min (например, 0)
            stringFunction.rightBorder,  // физический x-max (например, 1)
            xMinToDraw,
            xMaxToDraw,
            yMinToDraw,
            yMaxToDraw,
            showOutsideBorders
        );

        gl.useProgram(GUI.drawLineProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, GUI.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.uniform4fv(GUI.uColorLocation, color);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
    }

    static clearCanvas(gl, clearColor = [1.0, 1.0, 1.0, 1.0]) {
        gl.clearColor(...clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}
