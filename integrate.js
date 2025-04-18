"use strict";

import { StringFunction } from "./StringFunction.js";

export class StringCalculator {
    static integrate(heights, dx) {
        return heights.reduce((sum, height) => sum + height * dx, 0);
    }

    static multiplyFunctionHeights(heights1, heights2) {
        if (heights1.length !== heights2.length) {
            console.error(`Количество точек, в которых вычислены значения функций, должны совпадать: ${heights1.length} != ${heights2.length}`);
        }
        const minLength = Math.min(heights1.length, heights2.length);
        return heights1
            .slice(0, minLength)
            .map((h1, i) => h1 * heights2[i]);
    }

    static calculateFunctionHeights(func, count, dx) {
        let x = 0;
        const heights = [];
        for (let i = 0; i < count; i++) {
            heights.push(func(x));
            x += dx;
        }
        return heights;
    }

    static calculateMainIntegral(heights, dx, lambda) {
        const sinFunc = (x) => Math.sin(x * lambda);
        const sinHeights = StringCalculator.calculateFunctionHeights(sinFunc, heights.length, dx);
        const functionsCompositionHeights = StringCalculator.multiplyFunctionHeights(heights, sinHeights);
        return StringCalculator.integrate(functionsCompositionHeights, dx);
    }

    static calculateDCoefficients(a, L, lambdas, initialSpeedHeights, dx) {
        const D = [];
        for (const lambda of lambdas) {
            const integral = StringCalculator.calculateMainIntegral(initialSpeedHeights, dx, lambda);
            D.push(2 / (a * lambda * L) * integral);
        }
        return D;
    }

    static calculateECoefficients(a, L, lambdas, initialPositionHeights, dx) {
        const E = [];
        for (const lambda of lambdas) {
            const integral = StringCalculator.calculateMainIntegral(initialPositionHeights, dx, lambda);
            E.push(2 / L * integral);
        }
        return E;
    }

    static calculateFunction(D, E, lambdas, a) {
        let count = lambdas.length;
        if (D.length !== E.length || E.length !== lambdas.length) {
            console.error("Неправильное соотношение между количеством коэффициентов для итоговой функции");
            count = Math.min(D.length, E.length, lambdas.length);
        }
        lambdas = lambdas.slice(0, count);
        return (t, x) => lambdas.reduce((sum, lambda, i) =>
            sum + (D[i] * Math.sin(a * lambda * t) + E[i] * Math.cos(a * lambda * t)) * Math.sin(lambda * x), 0);
    }

    static getMainStringFunction(initialPositionFunction, initialSpeedFunction, leftBorder, rightBorder, a, dx) {
        const N = 100;
        const L = rightBorder - leftBorder;
        const pointsCount = Math.floor(L / dx) + 1;
        const lambdas = new Array(N).fill(0).map((_, index) => Math.PI * (index + 1) / L);

        const shiftedInitialPositionFunction = (x) => initialPositionFunction(x - leftBorder);
        const shiftedInitialSpeedFunction = (x) => initialSpeedFunction(x - leftBorder);

        const initialPositionHeights = StringCalculator.calculateFunctionHeights(shiftedInitialPositionFunction, pointsCount, dx);
        const initialSpeedHeights = StringCalculator.calculateFunctionHeights(shiftedInitialSpeedFunction, pointsCount, dx);
        const D = StringCalculator.calculateDCoefficients(a, L, lambdas, initialSpeedHeights, dx);
        const E = StringCalculator.calculateECoefficients(a, L, lambdas, initialPositionHeights, dx);

        const func = StringCalculator.calculateFunction(D, E, lambdas, a);
        return new StringFunction(func, leftBorder, rightBorder);
    }

    /**
     * Создаёт массив координат [x, y, …] для функции с нормированием из области данных в область клиппирования.
     *
     * @param {function(number): number} func – функция от x (физические координаты), возвращающая y.
     * @param {number} pointsCount – количество точек для выборки.
     * @param {number} xFuncMin – физический минимум по x, где функция определена.
     * @param {number} xFuncMax – физический максимум по x, где функция определена.
     * @param {{left: number, right: number, bottom: number, top: number}} dataBounds – границы области данных (мин/макс по x и y).
     * @param {{left: number, right: number, bottom: number, top: number}} clipBounds – границы области клиппирования, в которую проецируются координаты.
     * @param {boolean} showOutsideBorders – включать ли точки вне диапазона [xFuncMin, xFuncMax].
     * @returns {number[]} – плоский массив координат [x1, y1, x2, y2, …] в пределах clipBounds.
     */
    static createFunctionPoints(
        func,
        pointsCount,
        xFuncMin, xFuncMax,
        dataBounds,
        clipBounds,
        showOutsideBorders
    ) {
        const {left: xDataMin, right: xDataMax, bottom: yDataMin, top: yDataMax} = dataBounds;
        const {left: xClipMin, right: xClipMax, bottom: yClipMin, top: yClipMax} = clipBounds;

        const physicalDx = (xDataMax - xDataMin) / (pointsCount - 1);
        const dataWidth = xDataMax - xDataMin;
        const dataHeight = yDataMax - yDataMin;
        const clipWidth = xClipMax - xClipMin;
        const clipHeight = yClipMax - yClipMin;
        const eps = 1e-5;

        const coords = [];

        for (let i = 0; i < pointsCount; i++) {
            const x = xDataMin + physicalDx * i;

            if (!showOutsideBorders && (x < xFuncMin - eps || x > xFuncMax + eps)) {
                continue;
            }
            // Нормировка x из [xDataMin..xDataMax] в [xClipMin..xClipMax]
            const xClipped = ((x - xDataMin) / dataWidth) * clipWidth + xClipMin;
            // Нормировка y из [yDataMin..yDataMax] в [yClipMin..yClipMax]
            const yClipped = ((func(x) - yDataMin) / dataHeight) * clipHeight + yClipMin;

            coords.push(xClipped, yClipped);
        }

        return coords;
    }
}