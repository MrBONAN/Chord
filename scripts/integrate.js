"use strict";

export class StringCalculator {
    constructor(state) {
        this.state = state;
    }

    integrate(func, pointsCount) {
        const dx = this.state.dx;
        let heightsSum = 0;
        let x = 0;
        for (let i = 0; i < pointsCount; i++){
            x = Math.min(this.state.length, x);
            heightsSum += func(x);
            x += dx
        }
        return heightsSum * dx;
    }

    calculateMainIntegral(func, lambda, pointsCount) {
        const functionsComposition = (x) => func(x) * Math.sin(x * lambda);
        return this.integrate(functionsComposition, pointsCount);
    }

    calculateDCoefficients(a, L, lambdas, speedFunc, pointsCount) {
        const D = [];
        for (const lambda of lambdas) {
            const integral = this.calculateMainIntegral(speedFunc, lambda, pointsCount);
            D.push(2 / (a * lambda * L) * integral);
        }
        return D;
    }

    calculateECoefficients(a, L, lambdas, posFunc, pointsCount) {
        const E = [];
        for (const lambda of lambdas) {
            const integral = this.calculateMainIntegral(posFunc, lambda, pointsCount);
            E.push(2 / L * integral);
        }
        return E;
    }

    calculateFunction(D, E, lambdas, a) {
        let count = lambdas.length;
        if (D.length !== E.length || E.length !== lambdas.length) {
            console.error("Неправильное соотношение между количеством коэффициентов для итоговой функции");
            count = Math.min(D.length, E.length, lambdas.length);
        }
        const nonZeroCoefficients = [];
        const eps = 1e-9;
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

    getMainStringFunction(positionFunction, speedFunction, length, a) {
        const pointsCount = Math.floor(length / this.state.dx) + 1;
        const lambdas = new Array(this.state.modes).fill(0).map((_, index) => Math.PI * (index + 1) / length);

        const D = this.calculateDCoefficients(a, length, lambdas, speedFunction, pointsCount);
        const E = this.calculateECoefficients(a, length, lambdas, positionFunction, pointsCount);

        return this.calculateFunction(D, E, lambdas, a);
    }

    createFunctionPoints(func, pointsCount, length, clipBounds) {
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