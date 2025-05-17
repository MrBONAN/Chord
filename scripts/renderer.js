"use strict";

import {GUI} from "./GUI.js";
import {State} from "./state.js";
import { PeriodSlider } from "./periodSlider.js";

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

    if (!State.isDrawingMode) {
        if (!State.isFrozenState()) State.advanceTime(dt * 0.001);

        GUI.clearCanvas(ctx);

        GUI.drawString(ctx, State.getStringFunction(), "rgba(100,100,100,0.5)",
            0, State.getPointsCount(), State.length, State.clip);

        GUI.drawString(ctx, State.getStringFunction(), "red",
            State.getCurrentTime(), State.getPointsCount(), State.length, State.clip);

        timeEl.textContent = State.getCurrentTime().toFixed(2);
        PeriodSlider.setValue(State.getCurrentTime());
    } else {
        State.resetTime();
    }
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
