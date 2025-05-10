"use strict";

export const TokenType = {
    NUMBER:     'NUMBER',
    IDENT:      'IDENT',
    CONSTANT:   'CONSTANT',
    FUNCTION:   'FUNCTION',
    UNAR:       'UNAR',  // Нужен, так как может быть унарным
    OPERATOR:   'OPERATOR',
    LPAREN:     'LPAREN',
    RPAREN:     'RPAREN',
};

const tokenSpecs = [
    {type: 'WHITESPACE', regex: /^[ \t\n\r]+/},
    {type: 'NUMBER', regex: /^\d+(?:\.\d+)?/},
    {type: 'IDENT', regex: /^[a-zA-Z_]\w*/},

    {type: 'UNAR', regex: /^\+/},
    {type: 'UNAR', regex: /^\-/},
    {type: 'OPERATOR', regex: /^\*/},
    {type: 'OPERATOR', regex: /^\//},
    {type: 'OPERATOR', regex: /^\^/},

    {type: 'LPAREN', regex: /^\(/},
    {type: 'RPAREN', regex: /^\)/},
];

export class Tokenizer {
    /**
     * @param {string} type - Тип токена.
     * @param {RegExp} regex - Регулярное выражение для поиска токена.
     */
    static addTokenType(type, regex) {
        tokenSpecs.unshift({ type, regex: new RegExp('^(' + regex.source + ')') });
    }

    /**
     * @param {string} input - Входная строка для токенизации.
     * @returns {{type: string, value: string}[]} Массив токенов.
     */
    static tokenize(input) {
        const tokens = [];

        while (input.length > 0) {
            let matched = false;

            for (const spec of tokenSpecs) {
                const match = spec.regex.exec(input);
                if (!match) {
                    continue;
                }
                matched = true;
                const [text] = match;

                if (spec.type !== 'WHITESPACE') {
                    tokens.push({type: spec.type, value: text});
                }

                input = input.slice(text.length);
                break;
            }

            if (!matched) {
                console.warn(`Неожиданный символ: "${input[0]}"`);
                tokens.push({type: 'UNKNOWN', value: input[0]});
                input = input.slice(1);
            }
        }

        return tokens;
    }
}

Tokenizer.addTokenType('PI', /PI/);
Tokenizer.addTokenType('e', /e/);
