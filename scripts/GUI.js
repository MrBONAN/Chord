"use strict";

import {StringCalculator} from "./integrate.js";

export class GUI {
    static getCanvas(canvasId) {
        return document.getElementById(canvasId);
    }

    /**
     * Рисует ломаную, заданную точками функции, на 2D‑контексте Canvas.
     *
     * @param {CanvasRenderingContext2D} context – 2D‑контекст Canvas.
     * @param {StringFunction} stringFunction – объект с методом func(time, x) и полями leftBorder, rightBorder.
     * @param {string} color – цвет обводки в формате CSS (например, '#ff0000' или 'rgba(255,0,0,1)').
     * @param {number} time – параметр времени для анимации.
     * @param {number} pointsCount – количество точек для отрисовки.
     * @param {number} length
     * @param {{left: number, right: number, bottom: number, top: number}} clipBounds – границы области вывода (проекция).
     * @param {boolean} showOutsideBorders – отображать ли точки за пределами leftBorder..rightBorder.
     * @returns {void}
     */
    static drawString(context, stringFunction, color, time, pointsCount, length, clipBounds) {
        const funcSnapshot = (x) => stringFunction(time, x);
        const vertices = StringCalculator.createFunctionPoints(funcSnapshot, pointsCount, length, clipBounds);

        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(vertices[0], vertices[1]);
        for (let i = 1; i < pointsCount; i++) {
            context.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
        }
        context.stroke();
    }

    static drawCoords(context, canvasRect, clipBounds, zoomX, zoomY) {
        const { left, right, top, bottom } = clipBounds;

        const width = right - left;
        const height = bottom - top;
        const originX = left;
        const originY = (top + bottom) / 2;

        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();

        context.clearRect(left, top, width, height);

        context.lineWidth = 1;
        context.strokeStyle = '#e0e0e0';
        context.font = '10px sans-serif';
        context.fillStyle = '#666';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        const stepX = 50 / zoomX;
        for (let x = left; x <= right; x += stepX) {
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, bottom);
            context.stroke();

            const graphX = ((x - originX) * zoomX).toFixed(1);
            context.fillText(graphX, x, originY + 4);
        }

        const stepY = 50 / zoomY;
        for (let y = originY - stepY * 10 /*вот тут надо поменять маленько*/; y <= bottom; y += stepY) {
            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(right, y);
            context.stroke();

            const graphY = ((originY - y) * zoomY).toFixed(1);
            if (Math.abs(graphY) > 0.001) {
                context.fillText(graphY, originX + 20, y);
            }
        }

        context.lineWidth = 3;
        context.strokeStyle = '#000';

        context.beginPath();
        context.moveTo(left, originY);
        context.lineTo(right, originY);
        context.stroke();

        context.beginPath();
        context.moveTo(originX, top);
        context.lineTo(originX, bottom);
        context.stroke();

        context.restore();
    }

    static clearCanvas(context) {
        const canvas = context.canvas;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}