"use strict";

export class HistoryManager {
    static stack = [];
    static position = -1;
    static maxIndex = -1;
    static maxSize = 50;

    static pushState(state) {
        this.position++;
        if (this.position <= this.maxIndex) {
            this.stack[this.position] = state;
        } else {
            this.stack.push(state);
        }
        if (this.stack.length > this.maxSize) {
            this.stack.shift();
            this.position--;
        }
        this.maxIndex = this.position;
    }

    static undo() {
        if (!this.canUndo) return null;
        this.position--;
        return this.getState();
    }

    static redo() {
        if (!this.canRedo) return null;
        this.position++;
        return this.getState();
    }

    static getState() {
        if (this.position < 0 || this.position > this.maxIndex) {
            return null;
        }
        return this.stack[this.position];
    }

    static get canUndo() {
        return this.position > 0; // "нулевое" состояние нельзя убрать
    }

    static get canRedo() {
        return this.position < this.maxIndex;
    }
}
