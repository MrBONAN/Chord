"use strict";

import {StringCalculator} from "./integrate.js";

export class GUI {
    static getContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        return canvas.getContext('2d');
    }

    static drawString(context, stringFunction, color, time, pointsCount, left, right, top, bottom, showOutsideBorders) {
        const funcSnapshot = (x) => stringFunction.func(time, x);
        const vertices = StringCalculator.createFunctionPoints(funcSnapshot, pointsCount,
            stringFunction.leftBorder, stringFunction.rightBorder, left, right, bottom, top, showOutsideBorders);

        context.strokeStyle = color;
        const width = context.canvas.width;
        const height = context.canvas.height;
        context.beginPath();
        context.moveTo((vertices[0] + 1) / 2 * width, (-vertices[1] + 1) / 2 * height);
        for (let i = 1; i < pointsCount; i++) {
            context.lineTo((vertices[i * 2] + 1) / 2 * width, (-vertices[i * 2 + 1] + 1) / 2 * height);
        }
        context.stroke();
    }

    static clearCanvas(context) {
        const canvas = context.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}