"use strict";

const fs = require('fs');

class Logger {
    _outputFile = null;
    static _logDir = './logs/';

    setOutputFile(filePath) {
        if (!fs.existsSync(Logger._logDir)) {
            fs.mkdirSync(Logger._logDir);
        }

        this._outputFile = Logger._logDir + filePath;
        try {
            fs.writeFileSync(this._outputFile, '', 'utf8');
        } catch (err) {
            console.error('Не удалось установить выходной файл логов:', err);
        }
    }

    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level.toUpperCase()}] ${message} ${args.join(' ')}\n`;

        if (this._outputFile) {
            try {
                fs.appendFileSync(this._outputFile, logEntry, 'utf8');
            } catch (err) {
                console.error('Ошибка записи в файл логов:', err);
            }
        }

        switch (level) {
            case 'debug':
                console.debug(timestamp, message, ...args);
                break;
            case 'info':
                console.info(timestamp, message, ...args);
                break;
            case 'warn':
                console.warn(timestamp, message, ...args);
                break;
            case 'error':
                console.error(timestamp, message, ...args);
                break;
            default:
                console.log(timestamp, message, ...args);
        }
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }

    clear() {
        if (this._outputFile) {
            try {
                fs.writeFileSync(this._outputFile, '', 'utf8');
            } catch (err) {
                console.error('Ошибка очистки файла логов:', err);
            }
        }
    }
}

module.exports = Logger;
