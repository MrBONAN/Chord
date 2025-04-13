"use strict";

import { getCanvasAndGl } from "./webGlHelper.js";
import { StringCalculator } from "./integrate.js";
import { GUI } from "./GUI.js";

// Получаем холст и контекст WebGL
const { canvas, gl } = getCanvasAndGl("glcanvas");

// Начальные параметры модели
let params = {
  T0: 9,
  p: 1,
  dx: 0.001
};

// Фиксированные физические границы по x (0 до 1)
const left = 0;
const right = 1;

// Глобальные переменные, зависящие от параметров
let a = Math.sqrt(params.T0 / params.p);
let fundamentalPeriod = 2 / a;         // для первой гармоники (при L = 1 и λ₁ = π)
let period = fundamentalPeriod * 10;     // замедляем анимацию: время делится на 10
let pointsCount = Math.floor((right - left) / params.dx) + 1;

// Постоянная PI
const PI = Math.PI;

// Функции начального положения и скорости струны (фиксированные)
const positionFunction = (x) => Math.sin(2 * PI * x);
const speedFunction = (x) =>
  3 * PI * Math.sin(PI * x) +
  9 * PI * Math.sin(3 * PI * x) +
  15 * PI * Math.sin(5 * PI * x);

// Получаем основную функцию струны (решение волнового уравнения)
let stringFunction = StringCalculator.getMainStringFunction(
  positionFunction,
  speedFunction,
  left,
  right,
  a,
  params.dx
);

// Инициализируем шейдерную программу
GUI.initStringShaderProgram(gl);

/* Функция обновления модели по новым параметрам */
function updateSimulationParameters() {
  // Пересчитываем зависимые параметры
  a = Math.sqrt(params.T0 / params.p);
  fundamentalPeriod = 2 / a;
  period = fundamentalPeriod * 10;
  pointsCount = Math.floor((right - left) / params.dx) + 1;
  // Пересоздаём функцию струны с новыми параметрами
  stringFunction = StringCalculator.getMainStringFunction(
    positionFunction,
    speedFunction,
    left,
    right,
    a,
    params.dx
  );
  // Обновляем отображение параметров в боковом блоке
  renderParamsUI();
}

/* Функция для генерации HTML содержимого блока параметров с inline-редактированием */
function renderParamsUI() {
  const paramsBlock = document.getElementById("params");
  if (paramsBlock) {
    paramsBlock.innerHTML = `
      <p><strong>Параметры струны:</strong></p>
      <p>T₀: <span class="editable" data-key="T0">${params.T0}</span></p>
      <p>p: <span class="editable" data-key="p">${params.p}</span></p>
      <p>dx: <span class="editable" data-key="dx">${params.dx}</span></p>
      <p>a: <span id="aDisplay">${a.toFixed(2)}</span></p>
      <p>pointsCount: <span id="pointsCountDisplay">${pointsCount}</span></p>
      <p>Период T: <span id="fundamentalPeriodDisplay">${fundamentalPeriod.toFixed(2)}</span> сек</p>
      <p>Замедленный период: <span id="periodDisplay">${period.toFixed(2)}</span> сек</p>
    `;
    attachEditableListeners();
  }
}

/* Функция навешивания событий для inline-редактирования параметров */
function attachEditableListeners() {
  const editables = document.querySelectorAll(".editable");
  editables.forEach((span) => {
    span.addEventListener("click", function () {
      // Если уже есть input, выходим
      if (this.querySelector("input")) return;
      const currentValue = this.textContent;
      const dataKey = this.getAttribute("data-key");
      const input = document.createElement("input");
      input.type = "number";
      input.value = currentValue;
      // Задаём небольшой стиль для инпута
      input.style.width = "60px";
      // Очищаем содержимое span и добавляем input
      this.textContent = "";
      this.appendChild(input);
      input.focus();
      // При потере фокуса или нажатии Enter фиксируем изменение
      input.addEventListener("blur", function () {
        commitEdit(this, dataKey);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          this.blur();
        }
      });
    });
  });
}

/* Функция фиксации изменения значения параметра */
function commitEdit(inputElement, key) {
  const newValue = parseFloat(inputElement.value);
  if (!isNaN(newValue)) {
    params[key] = newValue;
    updateSimulationParameters();
  } else {
    updateSimulationParameters();
  }
}

// Первоначальный вызов для генерации блока с параметрами
renderParamsUI();

/* Цвета графиков */
const stringLineColor = [1.0, 0.0, 0.0, 1.0];   // Красный — текущее положение
const staticGraphColor = [0.5, 0.5, 0.5, 1.0];    // Серый — начальное положение

/* Функция отрисовки анимации. 
   Здесь время для динамического графика замедляется: значение секунд делится на 10. */
function render(milliseconds) {
  // Перевод миллисекунд в секунды и замедление
  const elapsed = milliseconds / 1000;
  const slowTime = elapsed / 10;
  
  // Вычисляем время по модулю замедленного периода для легенды
  const timeModulo = (elapsed % period).toFixed(2);
  const timeDisplayEl = document.getElementById("timeDisplay");
  if (timeDisplayEl) {
    timeDisplayEl.textContent = timeModulo;
  }
  
  // Очищаем холст
  GUI.clearCanvas(gl);
  
  // Рисуем статичный график (начальное положение при t = 0) серым цветом
  GUI.drawString(
    gl,
    canvas,
    stringFunction,
    staticGraphColor,
    0,         // t = 0
    pointsCount,
    left,      // xMinToDraw
    right,     // xMaxToDraw
    -2,        // yMinToDraw
    2,         // yMaxToDraw
    true      // не отображать точки вне указанных границ
  );
  
  // Рисуем динамический график (текущее положение) красным цветом с замедленным временем
  GUI.drawString(
    gl,
    canvas,
    stringFunction,
    stringLineColor,
    slowTime,
    pointsCount,
    left,
    right,
    -2,
    2,
    false
  );
  
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
