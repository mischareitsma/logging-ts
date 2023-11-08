# EventEmitter Based Logging Module

This project contains a basic EventEmitter based logging module.

## Loggers and Handlers

Loggers and handlers work together to log events. Loggers capture log events
and dispatch it to the handlers associated to the logger.

## Usage

To get started:

```typescript
import { getLogger, Logger, ConsoleHandler } from "@mischareitsma/logging"

const logger: Logger = getLogger();
logger.addHandler(new ConsoleHandler(LogLevel.TRACE));
logger.trace("This is a trace message");
logger.debug("This is a debug message");
logger.info("This is an info message");
logger.warn("This is a warn message");
logger.error("This is an error message");
logger.fatal("This is a fatal message");
```

Output:

```text
2023-11-08T07:49:31.822Z - TRACE - 56696 - root - This is a trace message
2023-11-08T07:49:31.835Z - DEBUG - 56696 - root - This is a debug message
2023-11-08T07:49:31.835Z - INFO - 56696 - root - This is an info message
2023-11-08T07:49:31.835Z - WARN - 56696 - root - This is a warn message
2023-11-08T07:49:31.835Z - ERROR - 56696 - root - This is an error message
2023-11-08T07:49:31.835Z - FATAL - 56696 - root - This is a fatal message
```
