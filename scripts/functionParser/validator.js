"use strict";

import {Tokenizer, TokenType} from "./Tokenizer.js";

export function validate(tokens) {
    const parenStack = [];
    let expectingOperand = true;

    const err = (i, msg) => {
        const near = tokens[i] ? `'${tokens[i].value}'` : 'конец ввода';
        return `${msg} возле ${near} (index ${i})`;
    };

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        switch (t.type) {
            case TokenType.NUMBER:
            case TokenType.CONSTANT:
            case TokenType.IDENT:
                if (!expectingOperand) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, 'Ожидался оператор')
                    };
                }
                expectingOperand = false;
                break;

            case TokenType.FUNCTION:
                if (!expectingOperand) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, 'Ожидался оператор перед функцией')
                    };
                }
                if (tokens[i + 1]?.type !== TokenType.LPAREN) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, `Функция '${t.value}' должна сопровождаться '('`)
                    };
                }
                expectingOperand = true;
                break;

            case TokenType.LPAREN:
                if (!expectingOperand) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, "Ожидался оператор перед '('")
                    };
                }
                parenStack.push('(');
                expectingOperand = true;
                break;

            case TokenType.RPAREN:
                if (expectingOperand) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, "Перед ')' отсутствует операнд")
                    };
                }
                if (parenStack.length === 0) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, "Лишняя ')'")
                    };
                }
                parenStack.pop();
                expectingOperand = false;
                break;

            case TokenType.UNAR:
                if (!expectingOperand) {
                    expectingOperand = true;
                }
                break;

            case TokenType.OPERATOR:
                if (expectingOperand) {
                    return {
                        func: undefined,
                        status: false,
                        message: err(i, 'Перед оператором отсутствует левый операнд')
                    };
                }
                expectingOperand = true;
                break;

            default:
                return {
                    func: undefined,
                    status: false,
                    message: err(i, `Неизвестный тип токена '${t.type}'`)
                };

        }
    }

    if (parenStack.length > 0) {
        return {
            func: undefined,
            status: false,
            message: 'Отсутствует закрывающая скобка'
        };
    }
    if (expectingOperand) {
        return {
            func: undefined,
            status: false,
            message: 'Выражение заканчивается оператором'
        };
    }

    return {
        func: "",
        status: true,
        message: 'Функция прошла валидацию'
    }
}

const tokens = Tokenizer.tokenize('2 * sin(PI/4) - x^2');
console.log(tokens);
console.log(validate(tokens)); // true