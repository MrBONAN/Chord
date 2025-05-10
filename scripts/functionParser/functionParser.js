"use strict";

import {Tokenizer, TokenType} from "./Tokenizer.js";
import {validate} from "./validator.js";

const constantTokens = new Map ([
    ['PI', 'Math.PI'],
    ['E', 'Math.E']
]);

const functionTokens = new Map([
    ['sin', 'Math.sin'],
    ['cos', 'Math.cos'],
    ['tan', 'Math.tan'],

    ['atan', 'Math.atan'],
    ['asin', 'Math.asin'],
    ['acos', 'Math.acos'],

    ['abs', 'Math.abs'],
    ['sqrt', 'Math.sqrt'],
    ['exp', 'Math.exp'],
    ['ln', 'Math.log'],
    ['log', 'Math.log10'],

    ['ceil', 'Math.ceil'],
    ['floor', 'Math.floor'],
    ['round', 'Math.round'],
    ['max', 'Math.max'],
    ['min', 'Math.min'],
]);

for (const [token, value] of functionTokens) {
    Tokenizer.addTokenType('FUNCTION', RegExp('^' + token));
}

for (const [token, value] of constantTokens) {
    Tokenizer.addTokenType('CONSTANT', RegExp('^' + token));
}

/**
 * @param {string} func - Строковое представление функции
 **/
function parseFunction(func) {
    const tokens = Tokenizer.tokenize(func);
    if (tokens.some(token => token.value === 'UNKNOWN')) {
        return {func: undefined, success: false};
    }

    const result = validate(tokens);
    if (!result.status) {
        return {func: undefined, success: false};
    }

    let preprocessedFunction = result.func;

    for (const [token, value] of functionTokens) {
        preprocessedFunction = preprocessedFunction.replace(token, value);
    }

    for (const [token, value] of constantTokens) {
        preprocessedFunction = preprocessedFunction.replace(token, value);
    }

    return {func: new Function("x", `return ${preprocessedFunction};`), success: true};
}
