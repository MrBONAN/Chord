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

        this.periodSlider = new PeriodSlider(  undefined  );
        this.state = new State(this.periodSlider, this.stringCalculator, parseFunction, this.canvasHandler);

        this.canvasHandler.state = this.state;
        this.stringCalculator.state = this.state;
        this.historyManager.state = this.state;
        this.periodSlider.state = this.state;
        
        this.canvasHandler.init();
        this.state.init(this.canvas);
        this.periodSlider.init();
        this.state.rebuild();
        this.historyManager.curr = this.state.dumpDataForHistory();
        this.historyEventHandlers();
        this.eventHandlers();
        this.renderer();
    }

    renderer() {
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
        
        toggleBtn.addEventListener("click", () => {
            this.state.toggleDrawingMode();
        
            if (this.state.isDrawingMode) {
                this.gui.clearCanvas();
                this.canvasHandler.points = new Array(this.canvas.width).fill(0);
                this.canvasHandler.drawInput();
            } else {
                this.state.drawnPoints = this.canvasHandler.points.slice();
                this.state.setPositionFunction(this.canvasHandler.createLinearInterpolator(this.state.drawnPoints), "0");
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
        
        document.getElementById("isFrozen").addEventListener("change", e => {
            this.state.toggleFrozen(e.target.checked);
            this.syncUI();
        });
        
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
                this.syncUI();
            } catch (err) {
                console.error(err);
            } finally {
                fileInput.value = "";
            }
        });
        
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

        const mainParams = [
            ['p', v => this.state.setDensity(v)],
            ['T0', v => this.state.setTension(v)],
            ['length', v => this.state.setLength(v)],
        ];
        mainParams.forEach((params) => this.initInput(...params, true, true, true, false));
        const dopParams = [
            ['period', v => this.state.setCurrentTime(v), false, false, false, true],
            ['startTime', v => this.state.setStartTime(v), false, false, false, true],
            ['dx', v => this.state.setDx(v), true, false, false, true],
            ['n', v => this.state.setN(v), true, false, false, true],
            ['pointsCount', v => this.state.setPointsCount(v), false, false, false, true],
            ['modes', v => this.state.setModes(v), true, false, false, true],
            ['timeScale', v => this.state.setTimeScale(v), false, false, false, true],
        ];
        dopParams.forEach((params) => this.initInput(...params));
        document.getElementById('optionsForm').addEventListener('reset', () => {
            setTimeout(() => {
                dopParams.forEach(([rangeId, setter]) => {
                    const range = document.getElementById(rangeId);
                    if (!range) return;
                    setter(+range.value);
                    console.log(range.value);
                });
                this.state.rebuild();
            });
        });
    }

    initInput(rangeId, setter, isNeedToRebuild, isNeedToReset, isNeedToSave, isUpdateOnInput) {
        const range = document.getElementById(rangeId);
        const num = document.getElementById(rangeId + "-value");
        if (!range || !num) return;

        const onChange = (value) => {
            setter(+value);
            if (isNeedToRebuild)
                this.state.rebuild();
            if (isNeedToReset)
                this.state.resetTime();
            if (isNeedToSave)
                this.dumpForHistory();
        };

        range.addEventListener("input", () => {
            num.value = Number((+range.value).toFixed(4));
            if (isUpdateOnInput) onChange(range.value);
        });
        range.addEventListener('change', () => {
            num.value = parseFloat((+range.value).toFixed(4));
            onChange(range.value);
        });

        num.addEventListener('input', () => {
            let value = parseFloat(num.value);
            if (num.min && value <= num.min)
                num.value = parseFloat((+num.min).toFixed(4));
            if (num.max && value >= num.max)
                num.value = parseFloat((+num.max).toFixed(4));
            range.value = parseFloat((+num.value).toFixed(4));
            if (isUpdateOnInput) onChange(num.value);
        });
        num.addEventListener('change', () => {
            let value = parseFloat(num.value);
            if (num.min && value <= num.min)
                num.value = parseFloat((+num.min).toFixed(4));
            if (num.max && value >= num.max)
                num.value = parseFloat((+num.max).toFixed(4));
            range.value = parseFloat((+num.value).toFixed(4));
            onChange(num.value);
        });
    }

    syncUI() {
        this.undoBtn.disabled = !this.historyManager.canUndo();
        this.redoBtn.disabled = !this.historyManager.canRedo();

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

        document.getElementById("isFrozen").checked = this.state.isFrozen;
    }

    updateHistoryButtons() {
        this.undoBtn.disabled = !this.historyManager.canUndo();
        this.redoBtn.disabled = !this.historyManager.canRedo();
    }

    dumpForHistory() {
        this.historyManager.pushState(this.state.dumpDataForHistory());
        this.syncUI();
    }

    historyEventHandlers() {
        this.undoBtn.addEventListener("click", e => {
            if (this.historyManager.canUndo()) {
                this.historyManager.undo();
                this.state.loadDataForHistory(this.historyManager.getState());
                this.syncUI();
            }
        });

        this.redoBtn.addEventListener("click", e => {
            if (this.historyManager.canRedo) {
                this.historyManager.redo();
                this.state.loadDataForHistory(this.historyManager.getState());
                this.syncUI();
            }
        });

        this.syncUI();
    }

    applyParams() {
        this.state.rebuild();
        this.state.resetTime();
        this.dumpForHistory();
    }
}