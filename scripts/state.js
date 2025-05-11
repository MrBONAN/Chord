"use strict";

import { StringCalculator } from "./integrate.js";

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
    }

    static getStringFunction () { return State.stringFunction; }
    static getPointsCount    () { return State.pointsCount; }
    static getStartTime      () { return State.startTime; }
    static getCurrentTime    () { return State.actualTime % State.getPeriod(); }
    static getPeriod         () { return 2 * State.length / State.a; }
    static isFrozenState     () { return State.isFrozen; }

    static advanceTime  (dt) { State.actualTime += dt * State.timeScale; }
    static resetTime    () { State.actualTime = State.startTime; }


    static setDensity          (newP)  {  State.p = newP; };
    static setTension          (newT0) {  State.T0 = newT0; };
    static setPositionFunction (f) {  State.positionFunction = f; }
    static setSpeedFunction    (f) {  State.speedFunction  = f; }
    static setDx       (newDx) {  State.dx = newDx;  State.rebuild(); }
    static setModes    (newModes) {  State.modes = newModes;  State.rebuild(); }

    static setPointsCount (newPointsCount) { State.pointsCount = newPointsCount; }
    static setTimeScale   (newTimeScale) {  State.timeScale   = newTimeScale; }
    static setStartTime   (newStartTime) {  State.startTime =  State.actualTime = newStartTime; }
    static toggleFrozen   (newState) {  State.isFrozen = newState; }
    static toggleDrawingMode () { State.isDrawingMode = !State.isDrawingMode; }
}

State.rebuild();