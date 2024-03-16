import { createLogger, transports, format } from "winston";

if (process.env.NODE_ENV === "development") {
    process.env.LOG_LEVEL = "debug";
}


export const logger = createLogger({
    transports: [
        new transports.Console({
            level: process.env.LOG_LEVEL,
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.printf((info) => {
                    return `${info.timestamp} ${info.level}: ${info.message}`;
                })
            ),
        }),
    ],
});
