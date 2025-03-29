"use strict";

export function getCanvasAndGl(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        console.error("Ваш браузер не поддерживает WebGL");
        alert("Ваш браузер не поддерживает WebGL");
    }

    return {canvas, gl};
}

export function loadShader(gl, type, source, ...args) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Ошибка компиляции шейдера: ${type}`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    console.info(`Успешно скопилирован шейдер: ${type}`);

    return shader;
}

export function initShaderProgram(gl, vsSource, fsSource, ...args) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Не удалось инициализировать шейдерную программу", gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    console.info("Успешно создана шейдерная программа");

    return shaderProgram;
}

export function createBuffer(gl, glAttribute, bufferType, size, elementsType, normalized = false, stride = 0, offset = 0, ...args) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(bufferType, buffer);
    gl.enableVertexAttribArray(glAttribute);
    gl.vertexAttribPointer(glAttribute, size, elementsType, normalized, stride, offset);
    console.info("Создан буфер")

    return buffer;
}
