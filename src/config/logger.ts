import winston from "winston";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json() // Logs will be in JSON format
);

// Create Winston logger
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Logs to console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Errors to file
    new winston.transports.File({ filename: "logs/combined.log" }), // All logs to file
  ],
}); 

// If not in production, log to console in a readable format
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export default logger;
