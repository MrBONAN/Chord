"use strict";

import {GUI} from "./GUI.js";
import {drawer} from "./eventHandlers.js";
import {State} from "./state.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx = canvas.getContext("2d");
const timeEl = document.getElementById("timeDisplay");

State.clip = {
    left: 0,
    right: ctx.canvas.width,
    top: 0,
    bottom: ctx.canvas.height
};

let tPrev = performance.now();

function frame(tMs) {
    const dt = tMs - tPrev;
    tPrev = tMs;

    if (!drawer.isDrawingMode) {
        if (!State.isFrozenState()) State.advanceTime(dt * 0.001);

        GUI.clearCanvas(ctx);

        GUI.drawString(ctx, State.getStringFunction(), "rgba(100,100,100,0.5)",
            State.getStartTime(), State.getPointsCount(), State.getBounds(), State.clip, false);

        GUI.drawString(ctx, State.getStringFunction(), "red",
            State.getCurrentTime(), State.getPointsCount(), State.getBounds(), State.clip, false);

        timeEl.textContent = State.getCurrentTime().toFixed(2);
    } else {
        State.resetTime();
    }
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
