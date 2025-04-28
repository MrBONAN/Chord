"use strict";

import { GUI }   from "./GUI.js";
import { drawer } from "./eventHandlers.js";
import * as state    from "./state.js";

const canvas = GUI.getCanvas("glcanvas");
const ctx    = canvas.getContext("2d");
const timeEl = document.getElementById("timeDisplay");

const clip = {
    left:   0,
    right:  ctx.canvas.width,
    top:    0,
    bottom: ctx.canvas.height
};

let tPrev = performance.now();

function frame(tMs) {
    const dt = tMs - tPrev;
    tPrev = tMs;

    if (!drawer.isDrawingMode) {
        if (!state.isFrozenState()) state.advanceTime(dt * 0.001);

        GUI.clearCanvas(ctx);

        GUI.drawString(ctx, state.getStringFunction(), "rgba(100,100,100,0.5)",
            state.getStartTime(), state.getPointsCount(), state.getBounds(), clip, false);

        GUI.drawString(ctx, state.getStringFunction(), "red",
            state.getCurrentTime(), state.getPointsCount(), state.getBounds(), clip, false);

        timeEl.textContent = state.getCurrentTime().toFixed(2);
    } else {
        state.resetTime();
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
