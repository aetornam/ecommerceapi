import morgan from "morgan";
import logger from "../config/logger";

// Define Morgan logging format
const stream = {
  write: (message: string) => logger.info(message.trim()), // Send logs to Winston
};

// Morgan middleware for logging HTTP requests
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export default morganMiddleware;
