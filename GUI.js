"use strict";

import {initShaderProgram, createBuffer} from './webGlHelper.js';
import {StringCalculator} from "./integrate.js";

export class GUI {
    static vsSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

    static fsSource = `
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
`;

    static initStringShaderProgram(gl) {
        GUI.drawLineProgram = initShaderProgram(gl, GUI.vsSource, GUI.fsSource);
        gl.useProgram(GUI.drawLineProgram);
        const positionLocation = gl.getAttribLocation(GUI.drawLineProgram, "aPosition");
        GUI.uColorLocation = gl.getUniformLocation(GUI.drawLineProgram, "uColor");
        GUI.positionBuffer = createBuffer(gl, positionLocation, gl.ARRAY_BUFFER, 2, gl.FLOAT);
    }

    static drawString(gl, canvas, stringFunction, color, time, pointsCount, left, right, top, bottom, showOutsideBorders) {
        const funcSnapshot = (x) => stringFunction.func(time, x);
        const vertices = StringCalculator.createFunctionPoints(funcSnapshot, pointsCount,
            stringFunction.leftBorder, stringFunction.rightBorder, left, right, bottom, top, showOutsideBorders);

        gl.useProgram(GUI.drawLineProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, GUI.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.uniform4fv(GUI.uColorLocation, color);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
    }

    static clearCanvas(gl, clearColor = [1.0, 1.0, 1.0, 1.0]) {
        gl.clearColor(...clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}