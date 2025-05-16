"use strict";

import {StringCalculator} from "./integrate.js";
import {parseFunction} from "./functionParser/functionParser.js";

export class State {
    // # - это приватное поле. Костыльный язык xD
    static #p = 1;
    static #T0 = 9;
    static #left = 0;
    static #right = 1;
    static #dx = 0.0001;
    static #pointsCount = 200;
    static #modes = 100;
    static #timeScale = 0.1;
    static #isFrozen = false;
    static #actualTime = 0;
    static #startTime = 0;

    static #positionFunction = x => Math.sin(2 * Math.PI * x);
    static #speedFunction = x => 0;
    static #posFuncStr = "sin(2*PI*x)";
    static #speedFuncStr = "0";

    static #stringFunction = undefined;
    static #a = 1;

    static rebuild() {
        State.#a = Math.sqrt(State.#T0 / State.#p);
        State.#stringFunction = StringCalculator.getMainStringFunction(
            State.#positionFunction, State.#speedFunction, State.#left, State.#right, State.#a, State.#dx, State.#modes
        );
    }

    static getStringFunction () { return State.#stringFunction; }
    static getBounds         () { return { left: State.#left, right: State.#right, bottom: -13, top: 13 }; }
    static getPointsCount    () { return State.#pointsCount; }
    static getStartTime      () { return State.#startTime; }
    static getCurrentTime    () { return State.#actualTime; }
    static isFrozenState     () { return State.#isFrozen; }

    static advanceTime  (dt) { State.#actualTime += dt * State.#timeScale; }
    static resetTime    () { State.#actualTime = State.#startTime; }


    static setDensity          (newP)  {  State.#p = newP; };
    static setTension          (newT0) {  State.#T0 = newT0; };
    static setBounds           (l, r) {  State.#left = l;  State.#right = r; };
    static setPositionFunction (f, stringF) { State.#positionFunction = f; State.#posFuncStr = stringF; };
    static setSpeedFunction    (f, stringF) { State.#speedFunction = f; State.#speedFuncStr = stringF; };
    static setDx       (newDx) {  State.#dx = newDx;  State.rebuild(); }
    static setModes    (newModes) {  State.#modes = newModes;  State.rebuild(); }

    static setPointsCount (newPointsCount) { State.#pointsCount = newPointsCount; }
    static setTimeScale   (newTimeScale) {  State.#timeScale   = newTimeScale; }
    static setStartTime   (newStartTime) {  State.#startTime =  State.#actualTime = newStartTime; }
    static toggleFrozen   (newState) {  State.#isFrozen = newState; }

    static dumpData() {
        return {
            posFunc: State.#posFuncStr,
            speedFunc: State.#speedFuncStr,
            density: State.#p,
            tension: State.#T0,
            leftBound: State.#left,
            rightBound: State.#right,
            dx: State.#dx,
            pointsCount: State.#pointsCount,
            modes: State.#modes
        };
    }

    static loadData(data) {
        const strPosFunc = data.posFunc;
        const strSpeedFunc = data.speedFunc;
        State.setPositionFunction(parseFunction(strPosFunc).func, strPosFunc);
        State.setSpeedFunction(parseFunction(strSpeedFunc).func, strSpeedFunc);
        State.#p = data.density;
        State.#T0 = data.tension;
        State.#left = data.leftBound;
        State.#right = data.rightBound;
        State.#dx = data.dx;
        State.#pointsCount = data.pointsCount;
        State.#modes = data.modes;

        for (const [key, value] of Object.entries(data)) {
            document.getElementById(key).value = value;
        }

        State.rebuild();
        State.resetTime();
    }
}

State.rebuild();
