import { createLogger, transports, format } from "winston";

export const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: new Date().toLocaleString(),
                }),
                format.printf((info) => {
                    return `${info.timestamp} ${info.level}: ${info.message}`;
                })
            ),
        }),
    ],
});
