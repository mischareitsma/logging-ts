// import { loadLoggingConfiguration } from "./configParser";
import {
	ConfigElement,
	ConfigElementBuilder,
	ConfigParser,
	ObjectElement
} from "@mischareitsma/config-parser";
import { ConsoleHandler, FileHandler } from "./handlers";
import { LogHandler, LogLevel, Logger, addLogger, logLevelName } from "./logging";

import * as fs from "node:fs";

/**
 * Environment variable that stores the location of the configuration file for loggers and handlers.
 */
const LOGGING_CONFIG_VAR="LOGGING_CONFIGURATION_PATH";

interface _CommonHandlerConfiguration {
	type: string;
	logLevel: logLevelName;
	name: string;
}

interface ConsoleHandlerConfiguration extends _CommonHandlerConfiguration {
	type: "ConsoleHandler";
	useColors?: boolean;
}

interface FileHandlerConfiguration extends _CommonHandlerConfiguration {
	type: "FileHandler";
	logFile: string;
}

type HandlerConfiguration = ConsoleHandlerConfiguration | FileHandlerConfiguration;

interface LoggerConfiguration {
	name: string;
	handlers: string[];
}

interface LoggingConfiguration {
	loggers: LoggerConfiguration[];
	handlers: HandlerConfiguration[];
}

const handlerConfigElement: ObjectElement = new ConfigElementBuilder()
	.ofTypeObject()
	.withChildElements(
		new ConfigElementBuilder().ofTypeString().withName("type").build(),
		new ConfigElementBuilder().ofTypeString().withName("logLevel").build(),
		new ConfigElementBuilder().ofTypeString().withName("name").build(),
		new ConfigElementBuilder().ofTypeBoolean().withName("useColors").isOptional()
			.build(),
		new ConfigElementBuilder().ofTypeString().withName("logFile").isOptional().build()
	)
	.withValidators(
		{validate: (ce: ConfigElement, val: {type: string, logFile?: string}) => {
			if (val.type === "FileHandler")
				return "logFile" in val;
			return true;
		}}
	)
	.build() as ObjectElement;

const loggerConfigElement: ObjectElement = new ConfigElementBuilder()
	.ofTypeObject()
	.withChildElements(
		new ConfigElementBuilder().ofTypeString().withName("name").build(),
		new ConfigElementBuilder().ofTypeArray().withName("handlers")
			.withStringArrayElements().build()
	).build() as ObjectElement;

const configParser: ConfigParser = new ConfigParser(
	new ConfigElementBuilder().ofTypeObject().withChildElements(
		new ConfigElementBuilder()
			.ofTypeArray()
			.withName("loggers")
			.withObjectArrayElements(loggerConfigElement)
			.build(),
		new ConfigElementBuilder()
			.ofTypeArray()
			.withName("handlers")
			.withObjectArrayElements(handlerConfigElement)
			.build()
	).build()
);

/**
 * Load all the logging configuration and create loggers and their handlers.
 * 
 * @param configFile Configuration file with the configured loggers and handlers.
 */
export function loadLoggersAndHandlers(configFile?: string) {
	if (!configFile) configFile = process.env[LOGGING_CONFIG_VAR];

	// const loggingConfig = loadLoggingConfiguration(configFile);

	let loggingConfig: LoggingConfiguration;

	try {
		loggingConfig = configParser.parse(
			fs.readFileSync(configFile, "utf-8")
		) as LoggingConfiguration;
	}
	catch (e) {
		console.error(`Failed to load logging configuration: ${e}`);
		return;
	}

	const handlers: Map<string, LogHandler> = new Map();

	loggingConfig.handlers.forEach((handlerConfig) => {
		handlers.set(handlerConfig.name, createHandlerFromConfig(handlerConfig));
	});

	loggingConfig.loggers.forEach((loggerConfig) => {
		const logger: Logger = new Logger(loggerConfig.name);
		loggerConfig.handlers.forEach(
			(handlerName) => logger.addLogHandler(handlers.get(handlerName))
		);

		addLogger(logger);
	});
}

function createHandlerFromConfig(handlerConfiguration: HandlerConfiguration): LogHandler {
	switch (handlerConfiguration.type) {
		case "FileHandler":
			return new FileHandler(
				LogLevel.getLogLevelFromName(handlerConfiguration.logLevel),
				handlerConfiguration.logFile,
				handlerConfiguration.name
			);
		case "ConsoleHandler":
			return new ConsoleHandler(
				LogLevel.getLogLevelFromName(handlerConfiguration.logLevel),
				handlerConfiguration.useColors,
				handlerConfiguration.name
			);
	}
}
