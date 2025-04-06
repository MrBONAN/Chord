"use strict";

export function integrate(heights, dx) {
    return heights.reduce((sum, height) => sum + height * dx, 0);
}

export function multiplyFunctionHeights(heights1, heights2) {
    if (heights1.length !== heights2.length) {
        console.error(`Количество точек, в которых вычислены значения функций, должны совпадать: ${heights1.length} != ${heights2.length}`);
    }

    const minLength = Math.min(heights1.length, heights2.length);
    return heights1
        .slice(0, minLength)
        .map((h1, i) => h1 * heights2[i]);
}

export function calculateFunctionHeights(func, count, dx) {
    let x = 0;
    const heights = [];
    for (let i = 0; i < count; i++) {
        heights.push(func(x));
        x += dx;
    }
    return heights;
}

export function calculateMainIntegral(heights, dx, lambda) {
    const sinFunc = (x) => Math.sin(x * lambda);
    const sinHeights = calculateFunctionHeights(sinFunc, heights.length, dx, 0);
    const functionsCompositionHeights = multiplyFunctionHeights(heights, sinHeights);
    return integrate(functionsCompositionHeights, dx);
}

export function calculateDCoefficients(a, L, lambdas, initialPositionHeights, dx) {
    const D = [];
    for (const lambda of lambdas) {
        const integral = calculateMainIntegral(initialPositionHeights, dx, lambda);
        D.push(2 / (a * lambda * L) * integral);
    }
    return D;
}

export function calculateECoefficients(a, L, lambdas, heights, dx) {
    const E = [];
    for (const lambda of lambdas) {
        const integral = calculateMainIntegral(heights, dx, lambda);
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
    lambdas = lambdas.slice(0, count);
    return (t, x) => lambdas.reduce((sum, lambda, i) =>
        sum + (D[i] * Math.sin(a * lambda * t) + E[i] * Math.cos(a * lambda * t)) * Math.sin(lambda * x), 0);
}

export function createFunctionPoints(func, pointsCount, leftFuncBorder, rightFuncBorder, left, right, bottom, top, showOutsideBorders) {
    const dx = (right - left) / (pointsCount - 1);
    const points = [];
    const width = right - left;
    const height = top - bottom;
    const eps = 1e-5
    for (let i = 0, x = 0; i < pointsCount; i++, x += dx) {
        if (!showOutsideBorders && !(-eps <= x - leftFuncBorder + left && x + left < rightFuncBorder + eps)) {
            continue;
        }
        points.push(x / width * 2 - 1);
        points.push((func(x - leftFuncBorder + left) - bottom) / height * 2 - 1);
    }
    return new Float32Array(points);
}