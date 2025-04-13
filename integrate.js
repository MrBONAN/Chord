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

        // Здесь не нужно смещать, если функция уже определена на [leftBorder, rightBorder]
        const initialPositionHeights = StringCalculator.calculateFunctionHeights(initialPositionFunction, pointsCount, dx);
        const initialSpeedHeights = StringCalculator.calculateFunctionHeights(initialSpeedFunction, pointsCount, dx);
        const D = StringCalculator.calculateDCoefficients(a, L, lambdas, initialSpeedHeights, dx);
        const E = StringCalculator.calculateECoefficients(a, L, lambdas, initialPositionHeights, dx);

        const func = StringCalculator.calculateFunction(D, E, lambdas, a);
        return new StringFunction(func, leftBorder, rightBorder);
    }

    /**
     * Создаёт массив координат для функции с преобразованием из физического пространства в координаты [-1,1]
     * для WebGL.
     *
     * @param {function} func – функция от x, возвращающая y (физические координаты)
     * @param {number} pointsCount – количество точек для вычисления
     * @param {number} leftFuncBorder – физический минимум по x, где функция определена (например, 0)
     * @param {number} rightFuncBorder – физический максимум по x (например, 1)
     * @param {number} xMinToDraw – физический минимум по x для отображения (например, 0)
     * @param {number} xMaxToDraw – физический максимум по x для отображения (например, 1)
     * @param {number} yMinToDraw – физический минимум по y для отображения (например, -2)
     * @param {number} yMaxToDraw – физический максимум по y для отображения (например, 2)
     * @param {boolean} showOutsideBorders – показывать ли точки вне [xMinToDraw, xMaxToDraw]
     * @returns {Float32Array} – массив координат в пространстве [-1,1]
     */
    static createFunctionPoints(
        func,
        pointsCount,
        leftFuncBorder,
        rightFuncBorder,
        xMinToDraw,
        xMaxToDraw,
        yMinToDraw,
        yMaxToDraw,
        showOutsideBorders = false
    ) {
        // Шаг по физическим x
        const physicalDx = (rightFuncBorder - leftFuncBorder) / (pointsCount - 1);
        const coords = [];
        for (let i = 0; i < pointsCount; i++) {
            const xVal = leftFuncBorder + i * physicalDx;
            if (!showOutsideBorders && (xVal < xMinToDraw || xVal > xMaxToDraw)) {
                continue;
            }
            const yVal = func(xVal);
            // Преобразуем в NDC: x и y от [xMinToDraw, xMaxToDraw] и [yMinToDraw, yMaxToDraw] в диапазон [-1,1]
            const ndcX = (xVal - xMinToDraw) / (xMaxToDraw - xMinToDraw) * 2 - 1;
            const ndcY = (yVal - yMinToDraw) / (yMaxToDraw - yMinToDraw) * 2 - 1;
            coords.push(ndcX, ndcY);
        }
        return new Float32Array(coords);
    }
}
