"use strict";

export class HistoryManager {
    constructor(state) {
        this.state = state;

        this.past   = [];
        this.future = [];
        this.curr   = {}
    }

    canUndo() { return this.past.length  > 0; }
    canRedo() { return this.future.length > 0; }

    pushState(newSnapshot) {
        const diff = this.diff(this.curr, newSnapshot);
        if (Object.keys(diff).length === 0) return;

        this.past.push(this.invert(diff));
        this.future.length = 0;
        this.curr = this.state.copyValue(newSnapshot);
    }

    undo() {
        if (!this.canUndo()) return;

        const inverse = this.past.pop();
        const redo = this.invert(inverse);
        this.future.push(redo);

        this.apply(inverse);
    }

    redo() {
        if (!this.canRedo()) return;

        const diff  = this.future.pop();
        const undo  = this.invert(diff);
        this.past.push(undo);

        this.apply(diff);
    }

    getState() { return this.curr; }

    diff(a, b) {
        const out = {};
        for (const key of Object.keys(b)) {
            if (!this.deepEqual(a[key], b[key])) {
                out[key] = { old: this.state.copyValue(a[key]), new: this.state.copyValue(b[key]) };
            }
        }
        return out;
    }

    invert(diff) {
        const inv = {};
        for (const [k, { old, new: nxt }] of Object.entries(diff)) {
            inv[k] = { old: this.state.copyValue(nxt), new: this.state.copyValue(old) };
        }
        return inv;
    }

    apply(diff) {
        for (const [k, { new: value }] of Object.entries(diff)) {
            this.state[k] = this.state.copyValue(value);
        }

        this.state.postLoadHousekeeping();
        this.curr = this.state.dumpDataForHistory();
    }

    deepEqual(a, b) {
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
