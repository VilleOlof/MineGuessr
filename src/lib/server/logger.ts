import { createLogger, format, transports } from "winston";
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
        new transports.File({
            filename: `${format_log_filename(new Date())}.log`,
            dirname: './logs',
            maxFiles: 10,
            format: file_format,
            handleExceptions: true
        })
    ]
});

function format_log_filename(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}