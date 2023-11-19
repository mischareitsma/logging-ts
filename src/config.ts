import { loadLoggingConfiguration } from "./configParser";
import { getNewLogHandler } from "./handlers";
import { LogHandler, LogLevel, Logger, addLogger } from "./logging";

/**
 * Environment variable that stores the location of the configuration file for loggers and handlers.
 */
export const LOGGING_CONFIG_VAR="LOGGING_CONFIGURATION_PATH";

interface _CommonHandlerConfiguration {
	type: string;
	logLevel: LogLevel;
	name: string;
}

export interface ConsoleHandlerConfiguration extends _CommonHandlerConfiguration {
	type: "ConsoleHandler";
	useColors?: boolean;
}

export interface FileHandlerConfiguration extends _CommonHandlerConfiguration {
	type: "FileHandler";
	logFile: string;
}

export type HandlerConfiguration = ConsoleHandlerConfiguration | FileHandlerConfiguration;

export interface LoggerConfiguration {
	name: string;
	handlers: string[];
}

export interface LoggingConfiguration {
	loggers: LoggerConfiguration[];
	handlers: HandlerConfiguration[];
	hasErrors: boolean;
}

/**
 * Load all the logging configuration and create loggers and their handlers.
 * 
 * @param configFile Configuration file with the configured loggers and handlers.
 */
export function loadLoggersAndHandlers(configFile?: string) {
	if (!configFile) configFile = process.env[LOGGING_CONFIG_VAR];

	const loggingConfig = loadLoggingConfiguration(configFile);

	const handlers: Map<string, LogHandler> = new Map();

	loggingConfig.handlers.forEach((handlerConfig) => {
		handlers.set(handlerConfig.name, getNewLogHandler(handlerConfig));
	});

	loggingConfig.loggers.forEach((loggerConfig) => {
		const logger: Logger = new Logger(loggerConfig.name);
		loggerConfig.handlers.forEach(
			(handlerName) => logger.addLogHandler(handlers.get(handlerName))
		);

		addLogger(logger);
	});
}
