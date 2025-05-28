"use strict";

import {State} from "./state.js";

export class CanvasHandler {
    constructor(state, gui, canvas, context) {
        this.state = state;
        this.gui = gui;
        this.context = context;
        this.canvas = canvas;

        this.rect = canvas.getBoundingClientRect();
        this.isDrawing = false;
        this.isPanning = false;

        this.points = new Array(canvas.width).fill(0);
        this.lastPos = null;
        this.panStart = null;
        this.initialClip = null;

        const scaleFactor = 1.1;

        window.addEventListener('resize', () => this.rect = canvas.getBoundingClientRect());
        window.addEventListener('scroll', () => this.rect = canvas.getBoundingClientRect());

        canvas.addEventListener('mousedown', (e) => {
            if (!this.state.isDrawingMode) {
                this.isPanning = true;
                this.panStart = { x: e.clientX, y: e.clientY };
                this.initialClip = { ...this.state.clip };
            } else {
                this.isDrawing = true;
                const pos = this.getCanvasCoordinates(e);
                this.addPoint(pos.x, pos.y);
                this.lastPos = pos;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.state.isDrawingMode && this.isDrawing) {
                const pos = this.getCanvasCoordinates(e);
                if (this.lastPos) {
                    this.addPoints(this.lastPos, pos);
                } else {
                    this.addPoint(pos.x, pos.y);
                }
                this.lastPos = pos;
            } else if (this.isPanning) {
                const scaleX = (e.clientX - this.panStart.x) * (this.state.clip.right - this.state.clip.left) / this.rect.width;
                const scaleY = (e.clientY - this.panStart.y) * (this.state.clip.bottom - this.state.clip.top) / this.rect.height;

                this.state.clip.left = this.initialClip.left + scaleX * this.state.zoomX;
                this.state.clip.right = this.initialClip.right + scaleX * this.state.zoomX;
                this.state.clip.top = this.initialClip.top + scaleY * this.state.zoomY;
                this.state.clip.bottom = this.initialClip.bottom + scaleY * this.state.zoomY;
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
            if (this.state.isDrawingMode) return;
            e.preventDefault();

            const zoomDelta = e.deltaY < 0 ? scaleFactor : 1 / scaleFactor;
            if (e.shiftKey) {
                this.zoomToCenterByY(zoomDelta);
            } else {
                const clip = this.state.clip;
                this.state.zoomX /= zoomDelta;
                this.state.zoomY /= zoomDelta;
                clip.top -= (zoomDelta - 1) * (e.clientY - this.rect.top - clip.top);
                clip.bottom -= (zoomDelta - 1) * (e.clientY - this.rect.top - clip.bottom);
                clip.left -= (zoomDelta - 1) * (e.clientX - this.rect.left - clip.left);
                clip.right -= (zoomDelta - 1) * (e.clientX - this.rect.left - clip.right);
            }
        });
    }

    zoomToCenterByY(zoomDelta){
        const clip = this.state.clip;
        this.state.zoomY /= zoomDelta;
        const midY = (clip.top + clip.bottom) / 2;
        clip.top = midY - (midY - clip.top) * zoomDelta;
        clip.bottom = midY + (clip.bottom - midY) * zoomDelta;
    }

    zoomToCenterByX(zoomDelta){
        const clip = this.state.clip;
        this.state.zoomX /= zoomDelta;
        const midX = (clip.left + clip.right) / 2;
        clip.left = midX - (midX - clip.left) * zoomDelta;
        clip.right = midX + (clip.right - midX) * zoomDelta;
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