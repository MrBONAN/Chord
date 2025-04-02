"use strict";

export function integrate(heights, dx) {
    return heights.reduce((sum, height) => sum + height * dx, 0);
}

export function multiplyFunctionHeights(heights1, heights2) {
    if (heights1.length !== heights2.length) {
        console.error("Количество точек, в которых вычислены значения функций, должны совпадать")
    }

    const minLength = Math.min(heights1.length, heights2.length);
    return heights1
        .slice(0, minLength)
        .map((h1, i) => h1 * heights2[i]);
}

export function calculateFunctionHeights(func, count, dx, startX) {
    let x = startX;
    const heights = [];
    for (let i = 0; i < count; i++) {
        heights.push(func(x));
        x += dx;
    }
    return heights;
}

export function calculateMainIntegral(heights, dx, lambda, startX) {
    const sinFunc = (x) => Math.sin((x + startX) * lambda);
    const sinHeights = calculateFunctionHeights(sinFunc, heights.length, dx, 0);
    const functionsCompositionHeights = multiplyFunctionHeights(heights, sinHeights);
    return integrate(functionsCompositionHeights, dx);
}

export function calculateDCoefficients(a, L, lambdas, initialPositionHeights, dx, startX) {
    const D = [];
    for (const lambda of lambdas) {
        const integral = calculateMainIntegral(initialPositionHeights, dx, lambda, startX);
        D.push(2 / (a * lambda * L) * integral);
    }
    return D;
}

export function calculateECoefficients(a, L, lambdas, heights, dx, startX) {
    const E = [];
    for (const lambda of lambdas) {
        const integral = calculateMainIntegral(heights, dx, lambda, startX);
        E.push(2 / L * integral);
    }
    return E;
}

export function getMainStringFunction(D, E, lambdas, a) {
    let count = lambdas.length;
    if (D.length !== E.length || E.length !== lambdas.length) {
        console.error("Неправильное соотношение между количеством коэффициентов для итоговой функции");
        count = Math.min(D.length, E.length, lambdas.length);
    }
    return (t, x) => {
        let y = 0;
        for (let i = 0; i < count; i++) {
            y += (D[i] * Math.sin(a * lambdas[i] * t) + E[i] * Math.cos(a * lambdas[i] * t)) * Math.sin(lambdas[i] * x)
        }
        return y;
    };
    // В этой строчке был косяк. Мб можно как-то её переписать, чтобы заработало, но в падлу
    // return (t, x) => lambdas.reduce((sum, lambda, i) =>
    //     (D[i] * Math.sin(a * lambda * t) + E[i] * Math.cos(a * lambda * t)) * Math.sin(lambda * x), 0);
}

export function createFunctionPoints(heights, dx, startX) {
    const points = new Float32Array(heights.length * 2);
    let x = startX;
    for (let i = 0; i < heights.length; i += 1) {
        points[i * 2] = x;
        points[i * 2 + 1] = heights[i];
        x += dx;
    }

    return points;
}