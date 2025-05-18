"use strict";

import { StringCalculator } from "./integrate.js";
import { parseFunction } from "./functionParser/functionParser.js";
import { PeriodSlider } from "./periodSlider.js";

PeriodSlider.init();

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
    static getCurrentTime    () { return State.actualTime % State.getPeriod(); }
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
    static setStartTime   (newStartTime) {  State.startTime =  State.actualTime = newStartTime; }
    static setCurrentTime (newTime) { State.actualTime = newTime; }
    static toggleFrozen   (newState) {  State.isFrozen = newState; }
    static toggleDrawingMode () { State.isDrawingMode = !State.isDrawingMode; }

    static dumpData() {
        const dataToDump = [ "p",  "T0",  "dx",  "pointsCount",  "modes",  "timeScale",  "isFrozen",
            "actualTime",  "startTime",  "length",  "zoomX",  "zoomY",  "posFuncStr",  "speedFuncStr",  "clip"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = State[d];
        });

        return dump;
    }

    static loadData(data) {
        for (const [key, value] of Object.entries(data)) {
            if (key === "clip") {
                State[key] = structuredClone(value);
            } else {
                State[key] = value;
            }
        }
        State.setPositionFunction(parseFunction(data.posFuncStr).func, data.posFuncStr);
        State.setSpeedFunction(parseFunction(data.speedFuncStr).func, data.speedFuncStr);
        State.updateDocument(data)

        State.rebuild();
    }

    static dumpDataForHistory() {
        const dataToDump = [
            "p",  "T0",  "a", "dx", "length", "pointsCount",  "modes",
            "timeScale",  "isFrozen", "actualTime",  "startTime",
            "posFuncStr",  "speedFuncStr", "positionFunction", "speedFunction", "stringFunction",
            "clip",  "zoomX",  "zoomY"
        ];
        let dump = {};
        dataToDump.forEach((d) => {
            dump[d] = State[d];
        });

        return dump;
    }

    static loadDataForHistory(data) {
        for (const [key, value] of Object.entries(data)) {
            if (key === "clip") {
                State[key] = structuredClone(value);
            } else {
                State[key] = value;
            }
        }
        PeriodSlider.changePeriod(State.a, State.length);
        State.updateDocument(data);
    }

    static updateDocument(data){
        for (const [key, value] of Object.entries(data)) {
            const element = document.getElementById(key);
            if (element && value) {
                element.value = value;
            }
        }
    }
}

State.rebuild();