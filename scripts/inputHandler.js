"use strict";

export class InputHandler {
    constructor(state, parseFunction, historyManager, gui, canvasHandler, canvas, imageSaver) {
        this.state = state;
        this.parseFunction = parseFunction;
        this.historyManager = historyManager;
        this.gui = gui;
        this.canvasHandler = canvasHandler;
        this.canvas = canvas;
        this.imageSaver = imageSaver;


        this.pSlider = document.getElementById('p');
        this.pValue = document.getElementById('p-value');
        this.T0Slider = document.getElementById('T0');
        this.T0Value = document.getElementById('T0-value');
        this.lenSlider = document.getElementById('length');
        this.lenValue = document.getElementById('length-value');
        this.periodSlider = document.getElementById("period");
        this.periodSliderValue = document.getElementById("period-value");

        this.savePosBtn = document.getElementById("savePosFunc");
        this.saveSpeedBtn = document.getElementById("saveSpeedFunc");
        this.savePosErrorDiv = document.getElementById("savePosError");
        this.saveSpeedErrorDiv = document.getElementById("saveSpeedError");

        this.startTimeSlider = document.getElementById("startTime");
        this.startTimeSliderValue = document.getElementById("startTime-value");

        this.zoomInBtn = document.getElementById("zoomInButton");
        this.zoomOutBtn = document.getElementById("zoomOutButton");
        this.resetViewBtn = document.getElementById("resetViewButton");

        this.isFrozenCheckbox = document.getElementById("isFrozen");
        this.undoBtn = document.getElementById("undoButton");
        this.redoBtn = document.getElementById("redoButton");

        this.drawBtn = document.getElementById("drawModeBtn");
        this.saveDrawBtn = document.getElementById("saveDrawBtn");
        this.saveBtn = document.getElementById("saveImage");
        this.loadBtn = document.getElementById("loadImage");
        this.fileInput = document.getElementById("fileInput");

        this.isFrozenBackup = false;
    }

    changePeriod(a, L) {
        if (this.periodSlider) {
            this.periodSlider.max = 1.9999 * L / a;
            this.startTimeSlider.max = 1.9999 * L / a;
            this.periodSliderValue.max = 1.9999 * L / a;
            this.startTimeSliderValue.max = 1.9999 * L / a;
        }
        this.periodSlider.step = L / (a * 100);
        this.startTimeSlider.step = L / (a * 100);
    }

    setPeriodValue(newVal) {
        if (this.periodSlider) {
            this.periodSlider.value = newVal;
            this.periodSliderValue.value = Number(newVal).toFixed(2);
        }
    }

    init() {
        this.initHistoryEventHandlers();
        this.initPeriodSlider();
        this.initStartTimeSlider();
        this.initDrawing();
        this.initFunctionInputs();
        this.initFrozenState();
        this.initImageHandling();
        this.initZoomControls();
        this.initParameterInputs();
    }

    initPeriodSlider() {
        if (!this.periodSlider) return;

        this.periodSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = this.state.isFrozen;
            this.state.toggleFrozen(true);
        });

        this.periodSlider.addEventListener("mouseup", () => {
            this.state.toggleFrozen(this.isFrozenBackup);
        });
    }

    initStartTimeSlider() {
        if (!this.startTimeSlider) return;

        this.startTimeSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = this.state.isFrozen;
            this.state.toggleFrozen(true);
        });

        this.startTimeSlider.addEventListener("mouseup", () => {
            this.state.toggleFrozen(this.isFrozenBackup);
        });
    }

    initDrawing() {
        this.drawBtn.addEventListener("click", () => {
            this.state.toggleDrawingMode();
            if (!this.state.isDrawingMode) {
                this.saveDrawBtn.disabled = true;
            } else {
                this.gui.clearCanvas();
                this.canvasHandler.points = new Array(this.canvas.width).fill(0);
                this.canvasHandler.drawInput();
                this.saveDrawBtn.disabled = false;
            }
        });

        this.saveDrawBtn.addEventListener("click", () => {
            if (!this.state.isDrawingMode) return;
            this.state.drawnPoints = this.canvasHandler.points.slice();
            this.state.setPositionFunction(this.canvasHandler.createLinearInterpolator(this.state.drawnPoints, this.state.length), "0");
            this.state.rebuild();
            this.dumpForHistory();
            this.state.toggleDrawingMode();
            this.saveDrawBtn.disabled = true;
            this.state.resetTime();
        });
    }

    initFunctionInputs() {
        const errorShowTime = 2000;

        const funcListener = (funcName, errorDiv, successAction) => {
            const strFunc = document.getElementById(funcName).value
            const parsedFunc = this.parseFunction(strFunc);
            if (!parsedFunc.success) {
                errorDiv.textContent =
                    parsedFunc.message.replace("Неизвестный тип токена 'UNKNOWN' возле", "Неизвестный символ");
                errorDiv.classList.add("visible");
                setTimeout(() => {
                    errorDiv.classList.remove("visible");
                    setTimeout(() => {
                        errorDiv.textContent = "";
                    }, 500);
                }, errorShowTime);
                console.error(parsedFunc.message);
                return;
            }
            successAction(parsedFunc, strFunc);
            this.state.rebuild();
            this.state.resetTime();
            this.dumpForHistory();
        };

        this.savePosBtn.addEventListener("click", () => {
            funcListener("posFuncStr", this.savePosErrorDiv, (posFunction, strPosFunc) => {
                this.state.setPositionFunction(posFunction.func, strPosFunc);
                this.state.drawnPoints = [];
            });
        });

        this.saveSpeedBtn.addEventListener("click", () => {
            funcListener("speedFuncStr", this.saveSpeedErrorDiv, (speedFunction, strSpeedFunc) => {
                this.state.setSpeedFunction(speedFunction.func, strSpeedFunc);
            });
        });
    }

    initFrozenState() {
        this.isFrozenCheckbox.addEventListener("change", e => {
            this.state.toggleFrozen(e.target.checked);
            this.syncUI();
        });
    }

    initImageHandling() {
        this.saveBtn.addEventListener("click", async () => {
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

        this.loadBtn.addEventListener("click", () => {
            fileInput.click();
        });

        this.fileInput.addEventListener("change", async () => {
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
    }

    initZoomControls() {
        const zoomDelta = 1.1;

        this.zoomInBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            if (e.shiftKey) {
                this.canvasHandler.zoomToCenterByY(zoomDelta);
            } else {
                this.canvasHandler.zoomToMouse(this.canvasHandler.rect.width / 2, this.canvasHandler.rect.height / 2, zoomDelta);
            }
        });

        this.zoomOutBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            if (e.shiftKey) {
                this.canvasHandler.zoomToCenterByY(1 / zoomDelta);
            } else {
                this.canvasHandler.zoomToMouse(this.canvasHandler.rect.width / 2, this.canvasHandler.rect.height / 2, 1 / zoomDelta);
            }
        });

        this.resetViewBtn.addEventListener("click", (e) => {
            if (this.state.isDrawingMode) return;
            this.state.resetClip();
        });
    }

    initParameterInputs() {
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
                });
                this.state.rebuild();
            });
        });
    }

    setDxN(dx, n) {
        document.getElementById('dx').value = dx;
        document.getElementById('n').value = n;
        document.getElementById('dx-value').value = dx;
        document.getElementById('n-value').value = n;
    }

    syncUI() {
        this.undoBtn.disabled = !this.historyManager.canUndo();
        this.redoBtn.disabled = !this.historyManager.canRedo();

        this.pSlider.value = this.state.p;
        this.pValue.textContent = (+this.state.p).toFixed(2);
        this.T0Slider.value = this.state.T0;
        this.T0Value.textContent = (+this.state.T0).toFixed(2);
        this.lenSlider.value = this.state.length;
        this.lenValue.textContent = (+this.state.length).toFixed(0);

        this.isFrozenCheckbox.checked = this.state.isFrozen;
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

        range.addEventListener('input', () => {
            num.value = parseFloat((+range.value).toFixed(4));
            if (isUpdateOnInput) onChange(range.value);
        });

        range.addEventListener('change', () => {
            num.value = parseFloat((+range.value).toFixed(4));
            onChange(range.value);
        });

        num.prev = num.value;
        num.addEventListener('animationend', () => num.classList.remove('invalid'));
        num.addEventListener('change', () => {
            if (num.value === "") {
                num.value = num.prev;
                num.classList.remove('invalid');
                void num.offsetWidth;
                num.classList.add('invalid');
                return;
            }
            num.prev = num.value;
            const value = parseFloat(num.value);
            if (num.min && value <= num.min)
                num.value = num.min;
            if (num.max && value >= num.max)
                num.value = num.max;
            range.value = parseFloat((+num.value).toFixed(4));
            onChange(num.value);
        });
    }

    dumpForHistory() {
        this.historyManager.pushState(this.state.dumpDataForHistory());
        this.syncUI();
    }

    initHistoryEventHandlers() {
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
}