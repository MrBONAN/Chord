"use strict";

import { ImageSaver } from "./imageSaver.js";
import { parseFunction } from "./functionParser/functionParser.js";

import { CanvasHandler } from "./canvasHandler.js";
import { StringCalculator } from "./integrate.js";
import { State } from "./state.js";
import { GUI } from "./GUI.js";
import { HistoryManager } from "./historyManager.js"; // Жопа
import { InputHandler } from "./inputHandler.js";

export class Container {
    constructor() {
        this.undoBtn = document.getElementById("undoButton");
        this.redoBtn = document.getElementById("redoButton");

        this.canvas = document.getElementById("glcanvas");
        this.ctx = this.canvas.getContext("2d");

        this.imageSaver = new ImageSaver(this.canvas);

        this.stringCalculator = new StringCalculator(  undefined  ); // krivo
        this.gui = new GUI(this.stringCalculator, this.ctx);
        this.canvasHandler = new CanvasHandler(  undefined  , this.gui, this.canvas, this.ctx);
        this.historyManager = new HistoryManager(  undefined  );

        this.inputHandler = new InputHandler(  undefined  , parseFunction, this.historyManager, this.gui, this.canvasHandler, this.canvas, this.imageSaver);

        this.state = new State(this.inputHandler, this.stringCalculator, parseFunction, this.canvasHandler);

        this.inputHandler.state = this.state;
        this.canvasHandler.state = this.state;
        this.stringCalculator.state = this.state;
        this.historyManager.state = this.state;
        
        this.canvasHandler.init();
        this.state.init(this.canvas);
        
        this.state.rebuild();
        this.historyManager.curr = this.state.dumpDataForHistory();
        this.inputHandler.init();
        this.renderer();
    }

    renderer() {
        this.state.resetClip();

        const canvasBoundRect = structuredClone(this.state.clip);

        let tPrev = performance.now();

        const state = this.state;
        const gui = this.gui;
        const inputHandler = this.inputHandler; // mega kostil
        const ctx = this.ctx;
        
        function frame(tMs) {
            const dt = tMs - tPrev;
            tPrev = tMs;

            if (!state.isDrawingMode) {
                if (!state.isFrozenState()) state.advanceTime(dt * 0.001);

                gui.clearCanvas(ctx);

                gui.drawCoords(ctx, canvasBoundRect, state.clip, state.zoomX, state.zoomY, state.length);

                gui.drawString(ctx, state.getStringFunction(), "rgba(100,100,100,0.5)",
                    state.startTime, state.getPointsCount(), state.length, state.clip);

                gui.drawString(ctx, state.getStringFunction(), "red",
                    state.getCurrentTime() + state.startTime, state.getPointsCount(), state.length, state.clip);

                inputHandler.setPeriodValue(state.getCurrentTime());
            } else {
                state.resetTime();
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
}