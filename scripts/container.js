"use strict";

import { ImageSaver } from "./imageSaver.js";
import { parseFunction } from "./functionParser/functionParser.js";

import { CanvasHandler } from "./canvasHandler.js";
import { StringCalculator } from "./integrate.js";
import { State } from "./state.js";
import { PeriodSlider } from "./periodSlider.js";
import { GUI } from "./GUI.js";
import { HistoryManager } from "./historyManager.js"; // Жопа

export class Container {
    constructor() {
        this.undoBtn = document.getElementById("undoButton");
        this.redoBtn = document.getElementById("redoButton");

        this.canvas = document.getElementById("glcanvas");
        this.ctx = this.canvas.getContext("2d");

        this.imageSaver = new ImageSaver(this.canvas);

        this.stringCalculator = new StringCalculator(  undefined  ); // krivo
        this.gui = new GUI(this.stringCalculator, this.ctx);
        this.canvasHandler = new CanvasHandler(  undefined  , this.gui, this.canvas, this.ctx);
        this.historyManager = new HistoryManager(  undefined  );

        this.periodSlider = new PeriodSlider(  undefined  , document.getElementById("periodSlider"), document.getElementById("startTimeSlider"));
        this.state = new State(this.periodSlider, this.stringCalculator, parseFunction, this.canvasHandler);

        this.canvasHandler.state = this.state;
        this.stringCalculator.state = this.state;
        this.historyManager.state = this.state;
        this.periodSlider.state = this.state;
        
        this.canvasHandler.init();
        this.state.init();
        this.periodSlider.init();
        this.state.rebuild();
        this.historyManager.curr = this.state.dumpDataForHistory();
        this.historyEventHandlers();
        this.eventHandlers();
        this.renderer();
    }

    renderer() {
        // const timeEl = document.getElementById("timeDisplay");

        this.state.resetClip();

        const canvasBoundRect = structuredClone(this.state.clip);

        let tPrev = performance.now();

        const state = this.state;
        const gui = this.gui;
        const periodSlider = this.periodSlider; // mega kostil
        const ctx = this.ctx;
        
        function frame(tMs) {
            const dt = tMs - tPrev;
            tPrev = tMs;

            if (!state.isDrawingMode) {
                if (!state.isFrozenState()) state.advanceTime(dt * 0.001);

                gui.clearCanvas(ctx);

                gui.drawCoords(ctx, canvasBoundRect, state.clip, state.zoomX, state.zoomY, state.length);

                gui.drawString(ctx, state.getStringFunction(), "rgba(100,100,100,0.5)",
                    state.startTime, state.getPointsCount(), state.length, state.clip);

                gui.drawString(ctx, state.getStringFunction(), "red",
                    state.getCurrentTime() + state.startTime, state.getPointsCount(), state.length, state.clip);

                // timeEl.textContent = state.getCurrentTime().toFixed(2);
                periodSlider.setPeriodValue(state.getCurrentTime());
            } else {
                state.resetTime();
            }
            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);

    }

    eventHandlers() {
        const toggleBtn = document.getElementById("drawModeBtn");
        const savePosBtn = document.getElementById("savePosFunc");
        const saveSpeedBtn = document.getElementById("saveSpeedFunc");
        const lengthInput = document.getElementById('length');
        
        toggleBtn.addEventListener("click", () => {
            this.state.toggleDrawingMode();
        
            if (this.state.isDrawingMode) {
                this.gui.clearCanvas();
                // toggleBtn.textContent = "Закончить и сохранить";
                this.canvasHandler.points = new Array(this.canvas.width).fill(0);
                this.canvasHandler.drawInput();
            } else {
                this.state.drawnPoints = this.canvasHandler.points.slice();
                this.state.setPositionFunction(this.canvasHandler.createLinearInterpolator(this.state.drawnPoints), "0");
                // toggleBtn.textContent = "Начать рисование";
                this.state.rebuild();
                this.dumpForHistory();
            }
            this.state.resetTime();
        });
        
        savePosBtn.addEventListener("click", () => {
            const strPosFunc = document.getElementById("posFuncStr").value
            const posFunction = parseFunction(strPosFunc);
            if (posFunction.success) {
                this.state.setPositionFunction(posFunction.func, strPosFunc);
                this.state.drawnPoints = [];
            } else {
                console.error(posFunction.message);
            }
            this.state.rebuild();
            this.state.resetTime();
            this.dumpForHistory();
        });
        
        saveSpeedBtn.addEventListener("click", () => {
            const strSpeedFunc = document.getElementById("speedFuncStr").value;
            const speedFunction = parseFunction(strSpeedFunc);
            if (speedFunction.success) {
                this.state.setSpeedFunction(speedFunction.func, strSpeedFunc);
            } else {
                console.error(speedFunction.message);
            }
            this.state.rebuild();
            this.state.resetTime();
            this.dumpForHistory();
        });
        
        const inputs = document.querySelectorAll('#all-params input');
        inputs.forEach(el => {
            el.dataset.prev = el.value;
            el.addEventListener('animationend', () => el.classList.remove('invalid'));
        });
        
        const isNum = v => v.trim() !== "" && Number.isFinite(+v);
        
        const validators = {
            dx: v => isNum(v) && +v >= 1e-6 && +v <= 0.1,
            n: v => isNum(v) && +v >= 10 && +v <= 1000000,
            pointsCount: v => isNum(v) && +v >= 2 && +v <= 1e4,
            modes: v => isNum(v) && +v > 0,
            timeScale: v => isNum(v) && +v > 0,
            startTime: v => isNum(v) && +v >= 0,
            "p-value": v => isNum(v) && +v > 0,
            "T0-value": v => isNum(v) && +v > 0,
            "length-value": v => isNum(v) && +v >= 0.1
        };
        document.getElementById("all-params").addEventListener("change", e => {
            const el = e.target;
            if (!validators[el.id]) return;
        
            if (!validators[el.id](el.value)) {
                el.value = el.dataset.prev;
                this.pulse(el);
                e.stopImmediatePropagation();
                e.preventDefault();
                return;
            }
            el.dataset.prev = el.value;
        
            switch (el.id) {
                case "dx":
                    this.state.setDx(+el.value);
                    break;
                case "n":
                    this.state.setN(+el.value);
                    break;
                case "pointsCount":
                    const newPointsCount = Math.round(+el.value);
                    el.value = newPointsCount === 0? 1 : newPointsCount;
                    this.state.setPointsCount(+el.value);
                    break;
                case "modes":
                    const newModes = Math.round(+el.value);
                    el.value = newModes === 0? 1 : newModes;
                    this.state.setModes(+el.value);
                    break;
                case "timeScale":
                    this.state.setTimeScale(+el.value);
                    break;
            }
        }, true);
        
        document.getElementById("isFrozen").addEventListener("change", e => this.state.toggleFrozen(e.target.checked));
        
        const saveBtn = document.getElementById("saveImage");
        saveBtn.addEventListener("click", async () => {
            try {
                const metadata = this.state.dumpData();
                const finalBlob = await this.imageSaver.saveImage(metadata);
                
                const a = document.createElement('a');
                a.href = URL.createObjectURL(finalBlob);
                a.download = 'image_with_metadata.png';
                a.click();
            } catch (err) {
                console.error('Error saving image:', err);
            }
        });
        
        const loadBtn = document.getElementById("loadImage");
        const fileInput = document.getElementById("fileInput");
        
        loadBtn.addEventListener("click", () => {
            fileInput.click();
        });
        
        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            try {
                const metadata = await this.imageSaver.loadImage(file);
                this.state.loadData(metadata);
                this.historyManager.pushState(this.state.dumpDataForHistory());
                this.updateHistoryButtons();
            } catch (err) {
                console.error(err);
            } finally {
                fileInput.value = "";
            }
        });
        
        // SLIDERS WEEEEEEEEEEEEEEEEEEEE
        
        const slidersNames = ["p", "T0", "length"];
        slidersNames.forEach(name => {
            const slider = document.getElementById(name);
            const value = document.getElementById(name + "-value");
            if (!slider || !value) {
                return;
            }
            slider.addEventListener("input", () => {
                value.value = Number((+slider.value).toFixed(2));
            });
            slider.addEventListener('change', () => {
                value.value = Number((+slider.value).toFixed(2));
                this.applyParams();
            });
            value.addEventListener('change', () => {
                slider.value = value.value;
                this.applyParams();
            });
        });
        
        lengthInput.addEventListener('change', () => this.applyParams());
        
        // Настройки зума
        const zoomInBtn = document.getElementById("zoomInButton");
        const zoomOutBtn = document.getElementById("zoomOutButton");
        const resetViewBtn = document.getElementById("resetViewButton");
        const zoomDelta = 1.2;
        
        zoomInBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            if (e.shiftKey) {
                this.canvasHandler.zoomToCenterByY(zoomDelta);
            } else {
                this.canvasHandler.zoomToMouse(this.canvasHandler.rect.width / 2, this.canvasHandler.rect.height / 2, zoomDelta);
            }
        });
        
        zoomOutBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            if (e.shiftKey) {
                this.canvasHandler.zoomToCenterByY(1 / zoomDelta);
            } else {
                this.canvasHandler.zoomToMouse(this.canvasHandler.rect.width / 2, this.canvasHandler.rect.height / 2, 1 / zoomDelta);
            }
        });
        
        resetViewBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            this.state.resetClip();
        });
    }

    pulse(el) {
        el.classList.remove('invalid');
        void el.offsetWidth;
        el.classList.add('invalid');
    }

    applyParams() {
        this.state.setDensity(+document.getElementById("p-value").value);
        this.state.setTension(+document.getElementById("T0-value").value);
        this.state.setLength(+document.getElementById("length-value").value);
    
        this.state.rebuild();
        this.state.resetTime();
        this.dumpForHistory();
    }

    syncSliderDisplaysFromState() {
        const pSlider = document.getElementById('p');
        const pValue = document.getElementById('p-value');
        pSlider.value = this.state.p;
        pValue.textContent = (+this.state.p).toFixed(2);
        const T0Slider = document.getElementById('T0');
        const T0Value = document.getElementById('T0-value');
        T0Slider.value = this.state.T0;
        T0Value.textContent = (+this.state.T0).toFixed(2);

        const lenSlider = document.getElementById('length');
        const lenValue = document.getElementById('length-value');
        lenSlider.value = this.state.length;
        lenValue.textContent = (+this.state.length).toFixed(0);
    }

    updateHistoryButtons() {
        this.undoBtn.disabled = !this.historyManager.canUndo();
        this.redoBtn.disabled = !this.historyManager.canRedo();
    }

    dumpForHistory() {
        const snap = this.state.dumpDataForHistory();
        this.historyManager.pushState(snap);
        this.updateHistoryButtons();
    }

    historyEventHandlers() {
        this.undoBtn.addEventListener("click", e => {
            if (this.historyManager.canUndo()) {
                this.historyManager.undo();
                this.state.loadDataForHistory(this.historyManager.getState());
                this.updateHistoryButtons();
                this.syncSliderDisplaysFromState();
            }
        });

        this.redoBtn.addEventListener("click", e => {
            if (this.historyManager.canRedo) {
                this.historyManager.redo();
                this.state.loadDataForHistory(this.historyManager.getState());
                this.updateHistoryButtons();
                this.syncSliderDisplaysFromState();
            }
        });

        this.updateHistoryButtons();
    }
}