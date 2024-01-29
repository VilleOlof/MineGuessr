import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, printf } = format;

const log_format = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
}));
const cli_format = combine(log_format, format.colorize({ all: true }));
const file_format = combine(log_format, format.errors({ stack: true }));

export const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({ format: cli_format }),
        new DailyRotateFile({
            dirname: './logs',
            datePattern: "YYYY-MM-DD-HH-MM-SS",
            maxFiles: '1d',
            format: file_format,
            handleExceptions: true
        })
    ]
});