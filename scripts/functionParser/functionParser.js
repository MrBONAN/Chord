"use strict";

import {Tokenizer, TokenType} from "./Tokenizer.js";

const constantTokens = {
    PI: 'Math.PI',
    E: 'Math.E',
};

const functionTokens = {
    sin: 'Math.sin',
    cos: 'Math.cos',
    tan: 'Math.tan',

    atan: 'Math.atan',
    atan2: 'Math.atan2',
    asin: 'Math.asin',
    acos: 'Math.acos',

    abs: 'Math.abs',
    sqrt: 'Math.sqrt',
    exp: 'Math.exp',
    ln: 'Math.log',
    log: 'Math.log10',

    ceil: 'Math.ceil',
    floor: 'Math.floor',
    round: 'Math.round',
    max: 'Math.max',
    min: 'Math.min',
};

for (const token in functionTokens) {
    Tokenizer.addTokenType('FUNCTION', RegExp('^' + token));
}

for (const token in constantTokens) {
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
    console.log(tokens);

}


parseFunction('2*PI + sin(x) - 3.14 *x');
