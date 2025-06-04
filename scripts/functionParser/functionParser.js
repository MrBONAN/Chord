"use strict";

import {Tokenizer, TokenType} from "./tokenizer.js";
import {validate} from "./validator.js";

const constantTokens = new Map([
    ['PI', 'Math.PI'],
    ['E', 'Math.E']
]);

const functionTokens = new Map([
    ['asin', 'Math.asin'],
    ['acos', 'Math.acos'],
    ['atan', 'Math.atan'],

    ['sin', 'Math.sin'],
    ['cos', 'Math.cos'],
    ['tan', 'Math.tan'],

    ['abs', 'Math.abs'],
    ['sqrt', 'Math.sqrt'],
    ['exp', 'Math.exp'],
    ['log', 'Math.log10'],
    ['ln', 'Math.log'],

    ['ceil', 'Math.ceil'],
    ['floor', 'Math.floor'],
    ['round', 'Math.round']
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
            return {success: false, message: `В функции присутствует переменная кроме 'x': ${token.value}`};
        }
    }

    const result = validate(tokens);
    if (!result.status) {
        return {success: false, message: result.message};
    }

    let preprocessedFunction = result.func;

    const arcFunctions = ["asin", "acos", "atan"];
    for (const [token, value] of functionTokens) {
        if (arcFunctions.includes(token)) {
            preprocessedFunction = preprocessedFunction.replaceAll(token, token.toUpperCase());
        } else {
            preprocessedFunction = preprocessedFunction.replaceAll(token, value);
        }
    }

    for (const token of arcFunctions) {
        preprocessedFunction = preprocessedFunction.replaceAll(token.toUpperCase()  , "Math." + token);
    }

    for (const [token, value] of constantTokens) {
        preprocessedFunction = preprocessedFunction.replaceAll(token, value);
    }

    return {func: new Function("x", `return ${preprocessedFunction};`), success: true};
}
