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

    static positionFunction = x => Math.sin(2 * Math.PI * x);
    static speedFunction    = x => 0;
    static posFuncStr = "sin(2*PI*x)";
    static speedFuncStr = "0";

    static stringFunction = undefined;
    static a = 1;

    static clip = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
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
        return {
            posFunc: State.posFuncStr,
            speedFunc: State.speedFuncStr,
            density: State.p,
            tension: State.T0,
            length: State.length,
            dx: State.dx,
            pointsCount: State.pointsCount,
            modes: State.modes,
            clip: State.clip,

            timeScale: State.timeScale,
            isFrozen: State.isFrozen,
            actualTime: State.actualTime,
            startTime: State.startTime
        };
    }

    static loadData(data) {
        const strPosFunc = data.posFunc;
        const strSpeedFunc = data.speedFunc;
        State.setPositionFunction(parseFunction(strPosFunc).func, strPosFunc);
        State.setSpeedFunction(parseFunction(strSpeedFunc).func, strSpeedFunc);
        State.p = data.density;
        State.T0 = data.tension;
        State.length = data.length;
        State.dx = data.dx;
        State.pointsCount = data.pointsCount;
        State.modes = data.modes;
        State.clip = data.clip
        State.timeScale = data.timeScale;
        State.isFrozen = data.isFrozen;
        State.actualTime = data.actualTime;
        State.startTime = data.startTime;

        for (const [key, value] of Object.entries(data)) {
            const element = document.getElementById(key);
            if (element && value) {
                element.value = value;
            }
        }

        State.rebuild();
    }
}

State.rebuild();