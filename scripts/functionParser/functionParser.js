"use strict";

import {Tokenizer, TokenType} from "./Tokenizer.js";
import {validate} from "./validator.js";

const constantTokens = new Map([
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

export function parseFunction(func) {
    const tokens = Tokenizer.tokenize(func);
    for (const token of tokens) {
        if (token.value === 'UNKNOWN') {
            return {success: false, message: `Найден неожиданный символ: ${token.value}`};
        }
        if (token.type === TokenType.IDENT && token.value !== 'x') {
            return {success: false, message: `В функции присутствует переменная кроме X: ${token.value}`};
        }
    }

    const result = validate(tokens);
    if (!result.status) {
        return {success: false, message: result.message};
    }

    let preprocessedFunction = result.func;

    for (const [token, value] of functionTokens) {
        preprocessedFunction = preprocessedFunction.replaceAll(token, value);
    }

    for (const [token, value] of constantTokens) {
        preprocessedFunction = preprocessedFunction.replaceAll(token, value);
    }

    return {func: new Function("x", `return ${preprocessedFunction};`), success: true};
}
