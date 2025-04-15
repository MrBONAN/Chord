"use strict";

import { getCanvasAndGl } from "./webGlHelper.js";
import { StringCalculator } from "./integrate.js";
import { GUI } from "./GUI.js";

// Глобальные переменные: холст, контекст и параметры симуляции
const { canvas, gl } = getCanvasAndGl("glcanvas");

let params = {
  T0: 9,
  p: 1,
  dx: 0.001
};

const left = 0;
const right = 1;
let a = Math.sqrt(params.T0 / params.p);
let fundamentalPeriod = 2 / a;
let period = fundamentalPeriod * 10;
let pointsCount = Math.floor((right - left) / params.dx) + 1;
const PI = Math.PI;

const positionFunction = (x) => Math.sin(2 * PI * x);
const speedFunction = (x) =>
  3 * PI * Math.sin(PI * x) +
  9 * PI * Math.sin(3 * PI * x) +
  15 * PI * Math.sin(5 * PI * x);

let stringFunction = StringCalculator.getMainStringFunction(
  positionFunction,
  speedFunction,
  left,
  right,
  a,
  params.dx
);

GUI.initStringShaderProgram(gl);

// Функция обновления зависимых параметров симуляции
function updateSimulationParameters() {
  a = Math.sqrt(params.T0 / params.p);
  fundamentalPeriod = 2 / a;
  period = fundamentalPeriod * 10;
  pointsCount = Math.floor((right - left) / params.dx) + 1;
  stringFunction = StringCalculator.getMainStringFunction(
    positionFunction,
    speedFunction,
    left,
    right,
    a,
    params.dx
  );
  renderParamsUI();
}

// Функция генерации HTML для блока параметров
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

// Функция навешивания событий для inline-редактирования параметров
function attachEditableListeners() {
  const editables = document.querySelectorAll(".editable");
  editables.forEach((span) => {
    span.addEventListener("click", function () {
      if (this.querySelector("input")) return;
      const currentValue = this.textContent;
      const dataKey = this.getAttribute("data-key");
      const input = document.createElement("input");
      input.type = "number";
      input.value = currentValue;
      input.style.width = "60px";
      this.textContent = "";
      this.appendChild(input);
      input.focus();
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

// Функция фиксации изменения параметра
function commitEdit(inputElement, key) {
  const newValue = parseFloat(inputElement.value);
  if (!isNaN(newValue)) {
    params[key] = newValue;
    updateSimulationParameters();
  } else {
    updateSimulationParameters();
  }
}

renderParamsUI();

const stringLineColor = [1.0, 0.0, 0.0, 1.0];
const staticGraphColor = [0.5, 0.5, 0.5, 1.0];

// Функция отрисовки анимации
function render(milliseconds) {
  const elapsed = milliseconds / 1000;
  const slowTime = elapsed / 10;
  const timeModulo = (elapsed % period).toFixed(2);
  const timeDisplayEl = document.getElementById("timeDisplay");
  if (timeDisplayEl) {
    timeDisplayEl.textContent = timeModulo;
  }
  GUI.clearCanvas(gl);
  GUI.drawString(gl, canvas, stringFunction, staticGraphColor, 0, pointsCount, left, right, -2, 2, true);
  GUI.drawString(gl, canvas, stringFunction, stringLineColor, slowTime, pointsCount, left, right, -2, 2, false);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
