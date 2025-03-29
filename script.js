"use strict";

import {getCanvasAndGl, initShaderProgram, createBuffer} from './webGlHelper.js';

const {canvas, gl} = getCanvasAndGl("glcanvas");

const vsSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fsSource = `
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
`;

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
// Шейдерные программы объединяют в себе 2 вида шейдеров: вершинные и фрагментные
// 1) Вершинный обрабатывает позицию. На вход подаётся в каком-то виде координата, на выходе четырёхмерный обработанный вектор
// 2) Фрагментный нужен для обработки цвета (можно всякие штуки там мутить)
// Сама программа нужна, чтобы в коде создавать несколько пресетов. Допустим есть 2 окна и рисоваться линии должны по-разном
// Да даже можно в том же самом окне рисовать 2 разные линии (красная и синяя, например) при помощи разных shaderProgram
// Перед этим надо сначала её подключить
gl.useProgram(shaderProgram);

// Атрибут, через который мы будем передавать данные в шейдер (в данном случае вершинный, т.к. переменная из него)
const positionLocation = gl.getAttribLocation(shaderProgram, "aPosition");

// Пример работы с uniform uColor (в тупую задаём переменную цвета)
const uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
gl.uniform4fv(uColorLocation, [0.0, 0.0, 1.0, 1.0]);

// Создаём буфер и присоединяем его (он нужен для передачи данных в шейдер)
// Далее всегда перед передачей данных в атрибут positionLocation, надо сначала привязать
// данный буфер к ТОМУ ЖЕ ТИПУ gl буфера, в данном случае gl.ARRAY_BUFFER
const positionBuffer = createBuffer(gl, positionLocation, gl.ARRAY_BUFFER, 2, gl.FLOAT);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Параметры синусоиды
const amplitude = 0.5;
const frequency = 4.0;
const pointCount = 200;
const speed = 1.0;

// Функция для генерации точек синусоиды с учётом сдвига фазы
function generateSineWaveVertices(phase) {
    const vertices = [];
    for (let i = 0; i <= pointCount; i++) {
        const x = -1 + (2 * i) / pointCount;
        const y = amplitude * Math.sin(frequency * Math.PI * (x + phase));
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

// Устанавливаем цвет для очистки
gl.clearColor(1.0, 1.0, 1.0, 1.0);

function render(time) {
    // Время приходит в миллисекундах; переводим в секунды
    const t = time * 0.001;
    const phase = t * speed; // сдвиг фазы изменяется со временем

    // Генерируем новые вершины синусоиды
    const vertices = generateSineWaveVertices(phase);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Устанавливаем viewport и очищаем canvas. viewport - область canvas, в которой рисуем
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Рисуем синусоиду как непрерывную линию
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);

    // Запрашиваем следующий кадр
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
