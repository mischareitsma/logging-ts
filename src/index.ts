import { ConsoleHandler } from "./handlers";
import { getLogger, Logger, LogLevel } from "./logging";

export * from "./ansi";
export * from "./logging";
export * from "./handlers";

const logger: Logger = getLogger();
logger.addLogHandler(new ConsoleHandler(LogLevel.TRACE, true, "consoleLogger"));

logger.trace("This is a trace message");
logger.debug("This is a debug message");
logger.info("This is a info message");
logger.warn("This is a warn message");
logger.error("This is a error message");
logger.fatal("This is a fatal message");

/*
This produces the following:
mreitsma@Mischas-MacBook-Pro logging-ts % node ./out/src/index.js 
2023-10-29T12:39:20.378Z - TRACE - 66354 - root - This is a trace message
2023-10-29T12:39:20.378Z - DEBUG - 66354 - root - This is a trace message
2023-10-29T12:39:20.378Z - INFO - 66354 - root - This is a trace message
2023-10-29T12:39:20.378Z - WARN - 66354 - root - This is a trace message
2023-10-29T12:39:20.378Z - ERROR - 66354 - root - This is a trace message
2023-10-29T12:39:20.378Z - FATAL - 66354 - root - This is a trace message

The messages are not correct.
*/
