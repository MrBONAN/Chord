"use strict";

import { State } from "./state.js";

export class PeriodSlider {
    static periodSlider = document.getElementById("periodSlider");
    static isFrozenBackup = false;

    static init() {
        if (!this.periodSlider) return;

        this.periodSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = State.isFrozen;
            State.toggleFrozen(true);
        });

        this.periodSlider.addEventListener("input", () => {
            State.setCurrentTime(this.getValue());
        });

        this.periodSlider.addEventListener("mouseup", () => {
            State.toggleFrozen(this.isFrozenBackup);
        });
    }

    static changePeriod(a, L) {
        if (this.periodSlider) {
            this.periodSlider.max = 1.9999 * L / a; // TODO крива
        }
        this.periodSlider.step = L / (a * 100);
    }

    static getValue() {
        return parseFloat(this.periodSlider.value ?? 0);
    }

    static setValue(newVal) {
        if (this.periodSlider) {
            this.periodSlider.value = newVal;
        }
    }
}