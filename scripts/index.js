import { State } from "./state.js";
import "./eventHandlers.js";
import "./renderer.js";
import { PeriodSlider } from "./periodSlider.js";
PeriodSlider.init();
PeriodSlider.changePeriod(State.a, State.length);