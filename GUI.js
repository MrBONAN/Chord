"use strict";

import {StringCalculator} from "./integrate.js";

export class GUI {
    static getContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        return canvas.getContext('2d');
    }

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