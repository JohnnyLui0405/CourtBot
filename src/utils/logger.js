import { createLogger, transports, format } from "winston";

export const logger = createLogger({
    transports: [
        new transports.Console({
            handleExceptions: true,
            level: process.env.LOG_LEVEL || "info",
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",
                }),
                format.printf((info) => {
                    return `${info.timestamp} ${info.level}: ${info.message}`;
                })
            ),
        }),
    ],
    exitOnError: false,
});
