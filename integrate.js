"use strict";

export class StringCalculator {
    constructor(a, L, dx, startX) {
        this.a = a; // скорость волны
        this.L = L; // длина струны
        this.dx = dx; // шаг по x
        this.startX = startX; // начальная точка
    }

    integrate(heights) {
        return heights.reduce((sum, height) => sum + height * this.dx, 0);
    }

    multiplyFunctionHeights(heights1, heights2) {
        if (heights1.length !== heights2.length) {
            console.error("Количество точек, в которых вычислены значения функций, должны совпадать")
        }

        const minLength = Math.min(heights1.length, heights2.length);
        return heights1
            .slice(0, minLength)
            .map((h1, i) => h1 * heights2[i]);
    }

    calculateFunctionHeights(func, count) {
        let x = this.startX;
        const heights = [];
        for (let i = 0; i < count; i++) {
            heights.push(func(x));
            x += this.dx;
        }
        return heights;
    }

    calculateMainIntegral(heights, lambda) {
        const sinFunc = (x) => Math.sin((x + this.startX) * lambda);
        const sinHeights = this.calculateFunctionHeights(sinFunc, heights.length);
        const functionsCompositionHeights = this.multiplyFunctionHeights(heights, sinHeights);
        return this.integrate(functionsCompositionHeights);
    }

    calculateDCoefficients(lambdas, initialPositionHeights) {
        const D = [];
        for (const lambda of lambdas) {
            const integral = this.calculateMainIntegral(initialPositionHeights, lambda);
            D.push(2 / (this.a * lambda * this.L) * integral);
        }
        return D;
    }

    calculateECoefficients(lambdas, heights) {
        const E = [];
        for (const lambda of lambdas) {
            const integral = this.calculateMainIntegral(heights, lambda);
            E.push(2 / this.L * integral);
        }
        return E;
    }

    getMainStringFunction(D, E, lambdas) {
        let count = lambdas.length;
        if (D.length !== E.length || E.length !== lambdas.length) {
            console.error("Неправильное соотношение между количеством коэффициентов для итоговой функции");
            count = Math.min(D.length, E.length, lambdas.length);
        }
        return (t, x) => {
            let y = 0;
            for (let i = 0; i < count; i++) {
                y += (D[i] * Math.sin(this.a * lambdas[i] * t) + E[i] * Math.cos(this.a * lambdas[i] * t)) * Math.sin(lambdas[i] * x)
            }
            return y;
        };
    }

    createFunctionPoints(heights) {
        const points = new Float32Array(heights.length * 2);
        let x = this.startX;
        for (let i = 0; i < heights.length; i += 1) {
            points[i * 2] = 2 * x - 1;
            points[i * 2 + 1] = heights[i];
            x += this.dx;
        }
        return points;
    }
}