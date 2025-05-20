"use strict";

import { State } from "./state.js";

export class HistoryManager {
    static past   = [];
    static future = [];
    static curr   = {} //Вообще надо бы вызвать State.dumpDataForHistory();
    // но State ещё не создан, поэтому curr задаём в файле state.js в самом низу

    static get canUndo() { return this.past.length  > 0; }
    static get canRedo() { return this.future.length > 0; }

    static pushState(newSnapshot) {
        const diff = this.diff(this.curr, newSnapshot);
        if (Object.keys(diff).length === 0) return;

        this.past.push(this.invert(diff));
        this.future.length = 0;
        this.curr = State.copyValue(newSnapshot);
    }

    static undo() {
        if (!this.canUndo) return;

        const inverse = this.past.pop();
        const redo = this.invert(inverse);
        this.future.push(redo);

        this.apply(inverse);
    }

    static redo() {
        if (!this.canRedo) return;

        const diff  = this.future.pop();
        const undo  = this.invert(diff);
        this.past.push(undo);

        this.apply(diff);
    }

    static getState() { return this.curr; }

    static diff(a, b) {
        const out = {};
        for (const key of Object.keys(b)) {
            if (!this.deepEqual(a[key], b[key])) {
                out[key] = { old: State.copyValue(a[key]), new: State.copyValue(b[key]) };
            }
        }
        return out;
    }

    static invert(diff) {
        const inv = {};
        for (const [k, { old, new: nxt }] of Object.entries(diff)) {
            inv[k] = { old: State.copyValue(nxt), new: State.copyValue(old) };
        }
        return inv;
    }

    static apply(diff) {
        for (const [k, { new: value }] of Object.entries(diff)) {
            State[k] = State.copyValue(value);
        }

        State.postLoadHousekeeping();
        this.curr = State.dumpDataForHistory();
    }

    static deepEqual(a, b) {
        const prim = v => (typeof v !== "object" || v === null) && typeof v !== "function";
        if (prim(a) || prim(b)) return a === b;

        if (typeof a === "function" && typeof b === "function") {
            return a === b || a.toString() === b.toString();
        }
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((v, i) => this.deepEqual(v, b[i]));
        }
        const ka = Object.keys(a);
        const kb = Object.keys(b);
        if (ka.length !== kb.length) return false;

        return ka.every(k => this.deepEqual(a[k], b[k]));
    }
}
