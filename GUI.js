"use strict";

import {StringCalculator} from "./integrate.js";

export class GUI {
    static getContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        return canvas.getContext('2d');
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
    static drawString(context, stringFunction, color, time, pointsCount, dataBounds, clipBounds, showOutsideBorders) {
        const funcSnapshot = (x) => stringFunction.func(time, x);
        const vertices = StringCalculator.createFunctionPoints(funcSnapshot, pointsCount,
            stringFunction.leftBorder, stringFunction.rightBorder, dataBounds, clipBounds, showOutsideBorders);

        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(vertices[0], vertices[1]);
        for (let i = 1; i < pointsCount; i++) {
            context.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
        }
        context.stroke();
    }

    static clearCanvas(context) {
        const canvas = context.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}