"use strict";

import { StringCalculator } from "./integrate.js";
import { parseFunction } from "./functionParser/functionParser.js";
import { PeriodSlider } from "./periodSlider.js";
import { canvasHandler } from "./eventHandlers.js";
import { HistoryManager } from "./historyManager.js";

const mod = (a, b) => ((a % b) + b) % b;

PeriodSlider.init();
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
    static p = 1;
    static T0 = 9;
    static dx = 0.0001;
    static pointsCount = 200;
    static modes = 100;
    static timeScale = 0.1;
    static isFrozen = false;
    static actualTime = 0;
    static startTime = 0;
    static length = 1;

    static isDrawingMode = false;
    static drawnPoints = [];
    static zoomX = 1;
    static zoomY = 1;

    static positionFunction = x => Math.sin(2 * Math.PI * x);
    static speedFunction    = x => 0;
    static posFuncStr = "sin(2*PI*x)";
    static speedFuncStr = "0";

    static stringFunction = undefined;
    static a = 1;

    static clip = {
        left: 0,
        right: 800,
        top: 0,
        bottom: 600
    };

    static rebuild() {
        State.a = Math.sqrt(State.T0 / State.p);
        State.stringFunction = StringCalculator.getMainStringFunction(State.positionFunction, State.speedFunction, State.length, State.a);
        PeriodSlider.changePeriod(State.a, State.length);
    }

    static getStringFunction () { return State.stringFunction; }
    static getPointsCount    () { return State.pointsCount; }
    static getCurrentTime    () { return mod(State.actualTime - State.startTime, State.getPeriod()); }
    static getPeriod         () { return 2 * State.length / State.a; }
    static isFrozenState     () { return State.isFrozen; }

    static advanceTime  (dt) { State.actualTime += dt * State.timeScale; }
    static resetTime    () { State.actualTime = State.startTime; }


    static setDensity          (newP)  {  State.p = newP; };
    static setTension          (newT0) {  State.T0 = newT0; };
    static setPositionFunction (f, stringF) { State.positionFunction = f; State.posFuncStr = stringF; };
    static setSpeedFunction    (f, stringF) { State.speedFunction = f; State.speedFuncStr = stringF; };
    static setDx       (newDx) {  State.dx = newDx;  State.rebuild(); }
    static setModes    (newModes) {  State.modes = newModes;  State.rebuild(); }

    static setPointsCount (newPointsCount) { State.pointsCount = newPointsCount; }
    static setTimeScale   (newTimeScale) {  State.timeScale   = newTimeScale; }
    static setStartTime   (newStartTime) { State.startTime = newStartTime; }
    static setCurrentTime (newTime) { State.actualTime = newTime + State.startTime; }
    static toggleFrozen   (newState) {  State.isFrozen = newState; }
    static toggleDrawingMode () { State.isDrawingMode = !State.isDrawingMode; }

    static resetClip() {
        const ctx = canvasHandler.context;
        State.clip = {
            left: 0,
            right: ctx.canvas.width,
            top: 0,
            bottom: ctx.canvas.height
        };
        State.zoomX = 1;
        State.zoomY = 1;
    }

    static dumpData() {
        const dataToDump = [ "p",  "T0",  "dx",  "pointsCount",  "modes",
            "timeScale",  "isFrozen", "actualTime",  "startTime",
            "length",  "posFuncStr",  "speedFuncStr",
            "zoomX",  "zoomY",  "clip", "drawnPoints"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = State.copyValue(State[d]);
        });

        return dump;
    }

    static loadData(data) {
        for (const [key, value] of Object.entries(data)) {
            State[key] = State.copyValue(value);
        }
        if (data.drawnPoints.length > 0) {
            State.setPositionFunction(canvasHandler.createLinearInterpolator(State.drawnPoints), "0");
        } else {
            State.setPositionFunction(parseFunction(data.posFuncStr).func, data.posFuncStr);
        }
        State.setSpeedFunction(parseFunction(data.speedFuncStr).func, data.speedFuncStr);
        State.updateDocument(data)

        State.rebuild();
    }

    static dumpDataForHistory() {
        const dataToDump = [
            "p",  "T0",  "a", "dx", "length", "pointsCount",  "modes",
            "timeScale",  "isFrozen", "actualTime",  "startTime",
            "posFuncStr",  "speedFuncStr", "positionFunction", "speedFunction", "stringFunction",
            "clip",  "zoomX",  "zoomY", "drawnPoints"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = State.copyValue(State[d]);
        });

        return dump;
    }

    static loadDataForHistory(data) {
        for (const [key, value] of Object.entries(data)) {
            State[key] = State.copyValue(value);
        }
        PeriodSlider.changePeriod(State.a, State.length);
        State.updateDocument(data);
    }

    static updateDocument(data){
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

    static copyValue(value){
        return deepCopy(value);
    }

    static postLoadHousekeeping() {
        State.updateDocument(State.dumpDataForHistory());
        State.rebuild();
    }
}

State.rebuild();
HistoryManager.curr = State.dumpDataForHistory()