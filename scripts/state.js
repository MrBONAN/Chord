"use strict";

import { StringCalculator } from "./integrate.js";

let p = 1, T0 = 9;
let left = 0, right = 1;
let dx = 0.0001, pointsCount = 200, modes = 100;
let timeScale = 0.1, isFrozen = false;
let actualTime = 0, startTime = 0;

let positionFunction = x => Math.sin(2 * Math.PI * x);
let speedFunction    = x => 0;

let stringFunction, a;

function rebuild() {
    a = Math.sqrt(T0 / p);
    stringFunction = StringCalculator.getMainStringFunction(
        positionFunction, speedFunction, left, right, a, dx, modes
    );
}
rebuild();


export const getStringFunction = () => stringFunction;
export const getBounds         = () => ({ left, right, bottom: -1, top: 1 });
export const getPointsCount    = () => pointsCount;
export const getStartTime      = () => startTime;
export const getCurrentTime    = () => actualTime;
export const isFrozenState     = () => isFrozen;

export const advanceTime  = dt => actualTime += dt * timeScale;
export const resetTime    = () => (actualTime = startTime);


export const setDensity          = newP => { p = newP; rebuild(); };
export const setTension          = newT0 => { T0 = newT0; rebuild(); };
export const setBounds           = (l, r) => { left = l; right = r; rebuild(); };
export const setPositionFunction = f => { positionFunction = f; rebuild(); };
export const setSpeedFunction    = f => { speedFunction  = f; rebuild(); };
export const setDx       = newDx => { dx = newDx; rebuild(); };
export const setModes    = newModes => { modes = newModes; rebuild(); };

export const setPointsCount = newPointsCount => { pointsCount = newPointsCount; };
export const setTimeScale   = newTimeScale => { timeScale   = newTimeScale; };
export const setStartTime   = newStartTime => { startTime = actualTime = newStartTime; };
export const toggleFrozen   = newState => { isFrozen = newState; };
