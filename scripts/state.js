"use strict";

const mod = (a, b) => ((a % b) + b) % b;

function deepCopy(val) {
    if (val === null || typeof val !== "object" && typeof val !== "function") return val;
    if (typeof val === "function" || Object.getPrototypeOf(val) !== Object.prototype) {
        return val;
    }
    if (Array.isArray(val)) return val.map(deepCopy);
    const out = {};
    for (const k in val) if (Object.hasOwn(val, k)) out[k] = deepCopy(val[k]);
    return out;
}

export class State {
    constructor(periodSlider, stringCalculator, parseFunction, canvasHandler) {
        this.periodSlider = periodSlider;
        this.stringCalculator = stringCalculator;
        this.parseFunction = parseFunction;
        this.canvasHandler = canvasHandler;
    }

    init(canvas) {
        this.p = 1;
        this.T0 = 9;
        this.dx = 0.0001;
        this.n = 10000;
        this.pointsCount = 200;
        this.modes = 100;
        this.timeScale = 0.1;
        this.isFrozen = false;
        this.actualTime = 0;
        this.startTime = 0;
        this.length = 1;

        this.isDrawingMode = false;
        this.drawnPoints = [];
        this.zoomX = 1;
        this.zoomY = 1;

        this.positionFunction = x => Math.sin(2 * Math.PI * x);
        this.speedFunction    = x => 0;
        this.posFuncStr = "sin(2*PI*x)";
        this.speedFuncStr = "0";

        this.stringFunction = undefined;
        this.a = 1;

        this.clip = {
            left: 0,
            right: canvas.width,
            top: 0,
            bottom: canvas.height
        };
    }

    rebuild() {
        this.updateInputs();
        this.a = Math.sqrt(this.T0 / this.p);
        this.stringFunction = this.stringCalculator.getMainStringFunction(this.positionFunction, this.speedFunction, this.length, this.a);
        this.periodSlider.changePeriod(this.a, this.length);
    }

    getStringFunction () { return this.stringFunction; }
    getPointsCount    () { return this.pointsCount; }
    getCurrentTime    () { return mod(this.actualTime - this.startTime, this.getPeriod()); }
    getPeriod         () { return 2 * this.length / this.a; }
    isFrozenState     () { return this.isFrozen; }

    advanceTime  (dt) { this.actualTime += dt * this.timeScale; }
    resetTime    () { this.actualTime = this.startTime; }


    setDensity          (newP)  {  this.p = newP; };
    setTension          (newT0) {  this.T0 = newT0; };
    setPositionFunction (f, stringF) { this.positionFunction = f; this.posFuncStr = stringF; };
    setSpeedFunction    (f, stringF) { this.speedFunction = f; this.speedFuncStr = stringF; };
    setModes    (newModes) {  this.modes = newModes;  this.rebuild(); }

    setLength   (newLength) { this.length = newLength; this.dx = this.length / this.n; }
    setDx       (newDx)     { this.dx = newDx; this.n = Math.round(this.length / this.dx); this.rebuild(); }
    setN        (newN)      { this.n = newN;  this.dx = this.length / this.n; this.rebuild(); }

    setPointsCount (newPointsCount) { this.pointsCount = newPointsCount; }
    setTimeScale   (newTimeScale) {  this.timeScale   = newTimeScale; }
    setStartTime   (newStartTime) { this.startTime = newStartTime; }
    setCurrentTime (newTime) { this.actualTime = newTime + this.startTime; }
    toggleFrozen   (newState) {  this.isFrozen = newState; }
    toggleDrawingMode () { this.isDrawingMode = !this.isDrawingMode; }

    resetClip() {
        const ctx = this.canvasHandler.context;
        this.clip = {
            left: 0,
            right: ctx.canvas.width,
            top: 0,
            bottom: ctx.canvas.height
        };
        this.zoomX = 1;
        this.zoomY = 1;
    }

    dumpData() {
        const dataToDump = ["p",  "T0",  "dx", "n",  "pointsCount",  "modes",
            "timeScale",  "isFrozen", "actualTime",  "startTime",
            "length",  "posFuncStr",  "speedFuncStr",
            "zoomX",  "zoomY",  "clip", "drawnPoints"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = this.copyValue(this[d]);
        });

        return dump;
    }

    loadData(data) {
        for (const [key, value] of Object.entries(data)) {
            this[key] = this.copyValue(value);
        }
        if (data.drawnPoints.length > 0) {
            this.setPositionFunction(this.canvasHandler.createLinearInterpolator(this.drawnPoints), "0");
        } else {
            this.setPositionFunction(this.parseFunction(data.posFuncStr).func, data.posFuncStr);
        }
        this.setSpeedFunction(this.parseFunction(data.speedFuncStr).func, data.speedFuncStr);
        this.updateDocument(data)

        this.rebuild();
    }

    dumpDataForHistory() {
        const dataToDump = [
            "p",  "T0",  "a", "dx", "n", "length", "pointsCount",  "modes",
            "timeScale",  "isFrozen", "actualTime",  "startTime",
            "posFuncStr",  "speedFuncStr", "positionFunction", "speedFunction", "stringFunction",
            "clip",  "zoomX",  "zoomY", "drawnPoints"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = this.copyValue(this[d]);
        });

        return dump;
    }

    loadDataForHistory(data) {
        for (const [key, value] of Object.entries(data)) {
            this[key] = this.copyValue(value);
        }
        this.periodSlider.changePeriod(this.a, this.length);
        this.updateDocument(data);
    }

    updateDocument(data){
        for (const [key, value] of Object.entries(data)) {
            const slider = document.getElementById(key);
            if (slider && value) {
                slider.value = value;
            }
            const sliderValue = document.getElementById(key + "-value");
            if (sliderValue && value) {
                sliderValue.value = value;
            }
        }
    }

    copyValue(value){
        return deepCopy(value);
    }

    postLoadHousekeeping() {
        this.updateDocument(this.dumpDataForHistory());
        this.rebuild();
    }

    updateInputs() {
        document.getElementById("dx-value").value = this.dx;
        document.getElementById("n-value").value = this.n;
    }
}