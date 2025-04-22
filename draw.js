"use strict";

export class Drawer {
    constructor(gui, canvas, context) {
        this.gui = gui;
        this.canvas = canvas;
        this.context = context;

        this.isDrawingMode = false;
        this.isDrawing = false;
        this.points = new Array(canvas.width).fill(0);
        this.lastPos = null;

        canvas.addEventListener('mousedown', (e) => {
            if (!this.isDrawingMode) return;
            this.isDrawing = true;
            const pos = this.getCanvasCoordinates(e);
            this.addPoint(pos.x, pos.y);
            this.lastPos = pos;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawingMode || !this.isDrawing) return;
            const pos = this.getCanvasCoordinates(e);
            
            if (this.lastPos) {
                this.interpolatePoints(this.lastPos, pos);
            } else {
                this.addPoint(pos.x, pos.y);
            }
            
            this.lastPos = pos;
        });

        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            this.lastPos = null;
        });
        canvas.addEventListener('mouseout', () => {
            this.isDrawing = false;
            this.lastPos = null;
        });
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: Math.min(this.canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX))),
            y: Math.min(this.canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)))
        };
    }

    toNumY(y) {
        return y / this.canvas.height - 0.5;
    }

    toWindowY(y) {
        return Math.round((y + 0.5) * this.canvas.height);
    }

    addPoint(x, y) {
        this.context.clearRect(x, 0, 1, this.canvas.height);
        this.points[x] = this.toNumY(y);
    }

    interpolatePoints(start, end) {
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const steps = Math.max(dx, dy);
        for (let i = 1; i <= steps; i++) {
            const t = steps === 0 ? 0 : i / steps;
            const x = Math.round(start.x + t * (end.x - start.x));
            const y = Math.round(start.y + t * (end.y - start.y));
            this.addPoint(x, y);
        }
        this.drawLine(start.x, start.y, end.x, end.y);
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