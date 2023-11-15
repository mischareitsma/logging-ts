import { LogLevel } from "./logging";

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
}
