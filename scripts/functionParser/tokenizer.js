"use strict";

const tokenSpecs = [
    {type: 'WHITESPACE', regex: /^[ \t\n\r]+/},
    {type: 'NUMBER', regex: /^\d+(?:\.\d+)?/},
    {type: 'IDENT', regex: /^[a-zA-Z_]\w*/},

    {type: 'PLUS', regex: /^\+/},
    {type: 'MINUS', regex: /^\-/},
    {type: 'MUL', regex: /^\*/},
    {type: 'DIV', regex: /^\//},
    {type: 'POW', regex: /^\^/},

    {type: 'LPAREN', regex: /^\(/},
    {type: 'RPAREN', regex: /^\)/},
];

export class Tokenizer {
    static addTokenType(type, regex) {
        tokenSpecs.unshift({type, regex: new RegExp('^(' + regex.source + ')')});
    }

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
