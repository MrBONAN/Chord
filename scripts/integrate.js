"use strict";

import {State} from "./state.js";

export class StringCalculator {
    static integrate(heights) {
        return heights.reduce((sum, height) => sum + height, 0) * State.dx;
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

    static calculateFunctionHeights(func, count) {
        let x = 0;
        const heights = [];
        for (let i = 0; i < count; i++) {
            heights.push(func(x));
            x += State.dx;
        }
        return heights;
    }

    static calculateMainIntegral(heights, lambda) {
        const sinFunc = (x) => Math.sin(x * lambda);
        const sinHeights = StringCalculator.calculateFunctionHeights(sinFunc, heights.length);
        const functionsCompositionHeights = StringCalculator.multiplyFunctionHeights(heights, sinHeights);
        return StringCalculator.integrate(functionsCompositionHeights);
    }

    static calculateDCoefficients(a, L, lambdas, initialSpeedHeights) {
        const D = [];
        for (const lambda of lambdas) {
            const integral = StringCalculator.calculateMainIntegral(initialSpeedHeights, lambda);
            D.push(2 / (a * lambda * L) * integral);
        }
        return D;
    }

    static calculateECoefficients(a, L, lambdas, initialPositionHeights) {
        const E = [];
        for (const lambda of lambdas) {
            const integral = StringCalculator.calculateMainIntegral(initialPositionHeights, lambda);
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
        const nonZeroCoefficients = [];
        const eps = 1e-7;
        for (let i = 0; i < count; i++) {
            if (Math.abs(D[i]) > eps || Math.abs(E[i]) > eps) {
                nonZeroCoefficients.push({D: D[i], E: E[i], lambda: lambdas[i]});
            }
        }
        return (t, x) => {
            let result = 0;
            for (let {D, E, lambda} of nonZeroCoefficients) {
                result += (D * Math.sin(a * lambda * t) + E * Math.cos(a * lambda * t)) * Math.sin(lambda * x);
            }
            return result;
        };
    }

    static getMainStringFunction(positionFunction, speedFunction, length, a) {
        const pointsCount = Math.floor(length / State.dx) + 1;
        const lambdas = new Array(State.modes).fill(0).map((_, index) => Math.PI * (index + 1) / length);

        const initialPositionHeights = StringCalculator.calculateFunctionHeights(positionFunction, pointsCount);
        const initialSpeedHeights = StringCalculator.calculateFunctionHeights(speedFunction, pointsCount);
        const D = StringCalculator.calculateDCoefficients(a, length, lambdas, initialSpeedHeights);
        const E = StringCalculator.calculateECoefficients(a, length, lambdas, initialPositionHeights);

        return StringCalculator.calculateFunction(D, E, lambdas, a);
    }

    /**
     * Создаёт массив координат [x, y, …] для функции с нормированием из области данных в область клиппирования.
     *
     * @param {function(number): number} func – функция от x (физические координаты), возвращающая y.
     * @param {number} pointsCount – количество точек для выборки.
     * @param {number} length
     * @param {{left: number, right: number, bottom: number, top: number}} clipBounds – границы области клиппирования, в которую проецируются координаты.
     * @returns {number[]} – плоский массив координат [x1, y1, x2, y2, …] в пределах clipBounds.
     */
    static createFunctionPoints(func, pointsCount, length, clipBounds) {
        const {left: xClipMin, right: xClipMax, bottom: yClipMin, top: yClipMax} = clipBounds;
        const physicalDx = length / (pointsCount - 1);
        const coords = [];

        for (let i = 0; i < pointsCount; i++) {
            const x = physicalDx * i;
            const xClipped = x * (xClipMax - xClipMin) / length + xClipMin;
            const yClipped = (func(x) + 1) * (yClipMax - yClipMin) / 2 + yClipMin; // перевод в мужицкие пиксели
            coords.push(xClipped, yClipped);
        }

        return coords;
    }
}