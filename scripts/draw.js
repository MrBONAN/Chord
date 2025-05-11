"use strict";

import {State} from "./state.js";

export class Drawer {
    constructor(gui, canvas, context) {
        this.gui = gui;
        this.context = context;
        this.canvas = canvas;
        this.rect = canvas.getBoundingClientRect();

        this.isDrawingMode = false;
        this.isDrawing = false;
        this.isPanning = false;

        this.points = new Array(canvas.width).fill(0);
        this.lastPos = null;
        this.panLast = null;

        const scaleFactor = 1.1;
        this.zoom = 1;

        window.addEventListener('resize', () => this.rect = canvas.getBoundingClientRect());

        canvas.addEventListener('mousedown', (e) => {
            if (!this.isDrawingMode) {
                this.isPanning = true;
                this.panLast = { x: e.clientX, y: e.clientY };
            } else {
                this.isDrawing = true;
                const pos = this.getCanvasCoordinates(e);
                this.addPoint(pos.x, pos.y);
                this.lastPos = pos;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawingMode && this.isDrawing) {
                const pos = this.getCanvasCoordinates(e);
                if (this.lastPos) {
                    this.addPoints(this.lastPos, pos);
                } else {
                    this.addPoint(pos.x, pos.y);
                }
                this.lastPos = pos;
            } else if (this.isPanning) {
                const dx = e.clientX - this.panLast.x;
                const dy = e.clientY - this.panLast.y;

                const scaleX = (State.clip.right - State.clip.left) / this.rect.width;
                const scaleY = (State.clip.bottom - State.clip.top) / this.rect.height;

                const factor = this.zoom;

                State.clip.left   += dx * scaleX * factor;
                State.clip.right  += dx * scaleX * factor;
                State.clip.top    += dy * scaleY * factor;
                State.clip.bottom += dy * scaleY * factor;

                this.panLast = { x: e.clientX, y: e.clientY };
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            this.isPanning = false;
            this.lastPos = null;
        });

        canvas.addEventListener('mouseout', () => {
            this.isDrawing = false;
            this.isPanning = false;
            this.lastPos = null;
        });

        canvas.addEventListener('wheel', (e) => {
            if (this.isDrawingMode) return;

            e.preventDefault();

            const zoomDelta = e.deltaY < 0 ? 1 / scaleFactor : scaleFactor;

            this.zoom *= zoomDelta;

            const cursorX = (e.clientX - this.rect.left) / this.rect.width;
            const cursorY = (e.clientY - this.rect.top) / this.rect.height;

            const clip = State.clip;

            const width = clip.right - clip.left;
            const height = clip.bottom - clip.top;

            const newWidth = width / zoomDelta;
            const newHeight = height / zoomDelta;

            const dx = width - newWidth;
            const dy = height - newHeight;

            clip.left   += dx * cursorX;
            clip.right  -= dx * (1 - cursorX);
            clip.top    += dy * cursorY;
            clip.bottom -= dy * (1 - cursorY);
        });
    }

    getCanvasCoordinates(e) {
        const scaleX = this.canvas.width / this.rect.width;
        const scaleY = this.canvas.height / this.rect.height;
        return {
            x: Math.min(this.canvas.width - 1, Math.max(0, Math.floor((e.clientX - this.rect.left) * scaleX))),
            y: Math.min(this.canvas.height - 1, Math.max(0, Math.floor((e.clientY - this.rect.top) * scaleY)))
        };
    }

    drawInput() {
        this.gui.clearCanvas(this.context);
        for (let i = 0; i < this.points.length - 1; i++) {
            this.drawLine(i, this.toWindowY(this.points[i]), i + 1, this.toWindowY(this.points[i + 1]));
        }
    }

    toNumY(y) {
        return 2 * y / this.canvas.height - 1;
    }

    toWindowY(y) {
        return Math.round((y + 1) * this.canvas.height / 2);
    }

    addPoint(x, y) {
        this.points[x] = this.toNumY(y);
        this.drawInput();
    }

    addPoints(start, end) {
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const steps = Math.max(dx, dy);
        for (let i = 1; i <= steps; i++) {
            const t = steps === 0 ? 0 : i / steps;
            const x = Math.round(start.x + t * (end.x - start.x));
            const y = Math.round(start.y + t * (end.y - start.y));
            this.points[x] = this.toNumY(y);
        }
        this.drawInput();
    }

    drawLine(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    createLinearInterpolator(points) {
        let a = this.canvas.width;
        return function(x) {
            x = Math.max(0, Math.min(points.length - 1, x)) * a;
            const x1 = Math.floor(x);
            const x2 = Math.floor(x);
            
            const y1 = points[x1];
            const y2 = points[x2];
            return - y1 - (y2 - y1) * (x - x1);
        };
    }
}