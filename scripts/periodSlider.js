"use strict";

import { State } from "./state.js";

export class PeriodSlider {
    static periodSlider = document.getElementById("periodSlider");
    static startTimeSlider = document.getElementById("startTimeSlider");
    static isFrozenBackup = false;

    static init() {
        if (!this.periodSlider && !this.startTimeSlider) return;

        this.periodSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = State.isFrozen;
            State.toggleFrozen(true);
        });

        this.periodSlider.addEventListener("input", () => {
            State.setCurrentTime(this.getPeriodValue());
        });

        this.periodSlider.addEventListener("mouseup", () => {
            State.toggleFrozen(this.isFrozenBackup);
        });


        this.startTimeSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = State.isFrozen;
            State.toggleFrozen(true);
        });

        this.startTimeSlider.addEventListener("input", () => {
            State.setStartTime(this.getStartTimeValue());
        });

        this.startTimeSlider.addEventListener("mouseup", () => {
            State.toggleFrozen(this.isFrozenBackup);
        });
    }

    static changePeriod(a, L) {
        if (this.periodSlider) {
            this.periodSlider.max = 1.9999 * L / a;
            this.startTimeSlider.max = 1.9999 * L / a;
        }
        this.periodSlider.step = L / (a * 100);
        this.startTimeSlider.step = L / (a * 100);
    }

    static getPeriodValue() {
        return parseFloat(this.periodSlider.value ?? 0);
    }

    static getStartTimeValue() {
        return parseFloat(this.startTimeSlider.value ?? 0);
    }

    static setPeriodValue(newVal) {
        if (this.periodSlider) {
            this.periodSlider.value = newVal;
        }
    }
}