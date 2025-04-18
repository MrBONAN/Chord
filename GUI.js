"use strict";

import {StringCalculator} from "./integrate.js";

export class GUI {
    static getContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        return canvas.getContext('2d');
    }

    /**
     * Рисует ломаную, заданную точками функции, на 2D‑контексте Canvas.
     *
     * @param {CanvasRenderingContext2D} context – 2D‑контекст Canvas.
     * @param {StringFunction} stringFunction – объект с методом func(time, x) и полями leftBorder, rightBorder.
     * @param {string} color – цвет обводки в формате CSS (например, '#ff0000' или 'rgba(255,0,0,1)').
     * @param {number} time – параметр времени для анимации.
     * @param {number} pointsCount – количество точек для отрисовки.
     * @param {{left: number, right: number, bottom: number, top: number}} dataBounds – границы области данных для вычисления точек.
     * @param {{left: number, right: number, bottom: number, top: number}} clipBounds – границы области вывода (проекция).
     * @param {boolean} showOutsideBorders – отображать ли точки за пределами leftBorder..rightBorder.
     * @returns {void}
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