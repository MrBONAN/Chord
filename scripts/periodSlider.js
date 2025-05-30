"use strict";

export class PeriodSlider {
    constructor(state) {
        this.state = state;
        this.periodSlider = document.getElementById("period");
        this.periodSliderValue = document.getElementById("period-value");
        this.startTimeSlider = document.getElementById("startTime");
        this.startTimeSliderValue = document.getElementById("startTime-value");
        this.isFrozenBackup = false;
    }

    init() {
        if (!this.periodSlider && !this.startTimeSlider) return;

        this.periodSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = this.state.isFrozen;
            this.state.toggleFrozen(true);
        });

        this.periodSlider.addEventListener("mouseup", () => {
            this.state.toggleFrozen(this.isFrozenBackup);
        });


        this.startTimeSlider.addEventListener("mousedown", () => {
            this.isFrozenBackup = this.state.isFrozen;
            this.state.toggleFrozen(true);
        });

        this.startTimeSlider.addEventListener("mouseup", () => {
            this.state.toggleFrozen(this.isFrozenBackup);
        });
    }

    changePeriod(a, L) {
        if (this.periodSlider) {
            this.periodSlider.max = 1.9999 * L / a;
            this.startTimeSlider.max = 1.9999 * L / a;
            this.periodSliderValue.max = 1.9999 * L / a;
            this.startTimeSliderValue.max = 1.9999 * L / a;
        }
        this.periodSlider.step = L / (a * 100);
        this.startTimeSlider.step = L / (a * 100);
    }

    setPeriodValue(newVal) {
        if (this.periodSlider) {
            this.periodSlider.value = newVal;
            this.periodSliderValue.value = Number(newVal).toFixed(2);
        }
    }
}