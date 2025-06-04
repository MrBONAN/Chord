"use strict";

export class GUI {
    constructor(stringCalculator, context) {
        this.stringCalculator = stringCalculator;
        this.context = context;
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
    drawString(context, stringFunction, color, time, pointsCount, length, clipBounds) {
        const funcSnapshot = (x) => stringFunction(time, x);
        const vertices = this.stringCalculator.createFunctionPoints(funcSnapshot, pointsCount, length, clipBounds);

        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(vertices[0], vertices[1]);
        for (let i = 1; i < pointsCount; i++) {
            context.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
        }
        context.stroke();
    }

    drawCoords(context, canvasRect, clipBounds, zoomX, zoomY, length) {
        const MIN_PX    = 70;
        const MAX_PX    = 130;

        const { left, right, top, bottom } = canvasRect;
        const originX = clipBounds.left;
        const originY = (clipBounds.top + clipBounds.bottom) / 2;
        const width = right - left;
        const height = bottom - top;

        const ff = function(n, px, len) {
            let absn = Math.abs(n);
            let base = ((absn % 3) ** 2 + 1) * 10 ** Math.floor(absn / 3);
            return (n < 0 ? base : 1 / base) * px / len;
        }

        const pickStep = (zoom, px, len) => {
            let step = 6;
            while (ff(step, px, len) / zoom < MIN_PX) { /* редеем при отдалении */
                step -= 1;
            }
            while (ff(step, px, len) / zoom > MAX_PX) { /* уплотняем при приближении */
                step += 1;
            }
            return ff(step, px, len) / zoom;
        };

        const fmt = (n) => +n.toFixed(6);

        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();

        context.lineWidth   = 1;
        context.strokeStyle = '#c3c3c3';
        context.font        = '16px sans-serif';
        context.fillStyle   = '#000';
        context.textAlign   = 'center';
        context.textBaseline = 'top';

        const stepX = pickStep(zoomX, width, length);
        let x0 = originX - Math.ceil((originX - left) / stepX) * stepX;

        for (let x = x0; x <= right; x += stepX) {
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, bottom);
            context.stroke();

            const graphX = fmt((x - originX) * length * zoomX / width);
            if (graphX !== 0) {
                context.fillText(graphX, x, Math.max(Math.min(originY, height - 20), 0) + 4);
            }
        }

        const stepY = pickStep(zoomY, height / 2, 1);
        let y0 = originY - Math.ceil((originY - top) / stepY) * stepY;

        for (let y = y0; y <= bottom; y += stepY) {
            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(right, y);
            context.stroke();

            const graphY = fmt(2 * (originY - y) * zoomY / height);
            if (graphY !== 0) {
                context.fillText(graphY, Math.max(Math.min(originX, width - 40), 0) + 20, y);
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

    clearCanvas() {
        const canvas = this.context.canvas;
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, canvas.width, canvas.height);
    }
}