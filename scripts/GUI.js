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
        const BASE_STEP = 50;
        const MIN_PX    = 50;
        const MAX_PX    = 130;

        const { left, right, top, bottom} = canvasRect;
        const originX = clipBounds.left;
        const originY = (clipBounds.top + clipBounds.bottom) / 2;

        const pickStep = (zoom) => {
            let step = BASE_STEP;
            while (step / zoom < MIN_PX) { /* редеем при отдалении */
                step *= 2;
            }
            while (step / zoom > MAX_PX) { /* уплотняем при приближении */
                step /= 2;
            }
            return step / zoom;
        };

        const fmt = (n) => +n.toFixed(5);

        context.save();
        context.beginPath();
        context.rect(left, top, right - left, bottom - top);
        context.clip();

        context.lineWidth   = 1;
        context.strokeStyle = '#c3c3c3';
        context.font        = '16px sans-serif';
        context.fillStyle   = '#000';
        context.textAlign   = 'center';
        context.textBaseline = 'top';

        const stepX = pickStep(zoomX);
        let x0 = originX - Math.ceil((originX - left) / stepX) * stepX;

        for (let x = x0; x <= right; x += stepX) {
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, bottom);
            context.stroke();

            const graphX = fmt((x - originX) * zoomX);
            if (graphX !== 0) context.fillText(graphX, x, originY + 4);
        }

        const stepY = pickStep(zoomY);
        let y0 = originY - Math.ceil((originY - top) / stepY) * stepY;

        for (let y = y0; y <= bottom; y += stepY) {
            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(right, y);
            context.stroke();

            const graphY = fmt((originY - y) * zoomY);
            if (Math.abs(graphY) > 0.001) {
                context.fillText(graphY, originX + 20, y);
            }
        }

        context.lineWidth = 1;
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