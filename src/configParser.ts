/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from "node:fs";

import { LOGGING_CONFIG_VAR, LoggingConfiguration } from "./config";
import { allLogLevels } from "./logging";

/**
 * The **loadLoggingConfiguration** function loads and returns the logging configuration from
 * a configuration file.
 * 
 * If the **configLocation** parameter is not passed the logging configuration environment variable
 * is used. The name of the environment variable is stored in the {@link LOGGING_CONFIG_VAR}
 * variable. If both are undefined or the logging configuration file does not exist the function
 * returns an LoggingConfiguration with empty arrays for both loggers and handlers.
 * 
 * The function itself should be called when starting an application. This function will attempt to
 * generate the configuration as good as possible and do it synchronously. All file system
 * operations are synchronous to make sure all the loggers and handlers can be initialized before an
 * application starts. If some configuration is broken, it is not loaded. This will make sure that
 * an application does not crash when started and the logging configuration is incorrect. Incorrect
 * configuration will directly generate a message to **console.error** and set the **hasErrors**
 * property on the logging configuration to true;
 * 
 * @param configLocation Location of the logging configuration file.
 * @returns LoggingConfiguration with loggers and handlers loaded from a configuration file, or
 *          with empty loggers and handlers arrays.
 */
export function loadLoggingConfiguration(configLocation?: string): LoggingConfiguration {
	if (!configLocation) configLocation = process.env[LOGGING_CONFIG_VAR];

	const configuration: LoggingConfiguration = {loggers: [], handlers: [], hasErrors: false};

	if (!configLocation || !fs.statSync(configLocation).isFile())
		return configuration;

	try {
		const json: any = JSON.parse(fs.readFileSync(configLocation, {encoding: "utf-8"}));
	
		if (typeof json !== "object") return configuration;
	
		const invalidHandlers: string[] = [];
		const invalidLoggers: string[] = [];

		const validHandlers: string[] = [];

		if ("handlers" in json) {
			for (const handlerName in json.handlers) {
				if (isValidHandlerConfig(json.handlers[handlerName])) {
					configuration.handlers.push({
						...json.handlers[handlerName],
						name: handlerName
					});
					validHandlers.push(handlerName);
				}
				else {
					invalidHandlers.push(handlerName);
				}
			}
		}

		if ("loggers" in json) {
			for (const loggerName in json.loggers) {
				if (isValidLoggerConfig(json.loggers[loggerName])) {
					const handlers: string[] = [];

					// TODO: Too much nesting. Ignore max line length because this is a monster of a module anyway for now. Should have solid test coverage to make sure all this shady and ugly code works
					if ("handlers" in json.loggers[loggerName]) {
						json.loggers[loggerName].handlers.forEach((handlerName: string) => {
							if (validHandlers.includes(handlerName)) {
								handlers.push(handlerName);
							}
							else {
								if (!invalidHandlers.includes(handlerName))
									invalidHandlers.push(handlerName);
							}
						});
					}
					configuration.loggers.push({
						name: loggerName,
						handlers: handlers
					});
				}
				else {
					invalidLoggers.push(loggerName);
				}
			}
		}

		if (invalidHandlers.length + invalidLoggers.length > 0)
			throw new Error(
				`Invalid config for handlers: [${invalidHandlers.toString()}], ` +
				`invalid config for loggers: [${invalidLoggers.toString()}]`
			);

	} catch (e) {
		console.error(`Could not parse entire configuration: ${e}`);
		configuration.hasErrors = true;
	}
	
	return configuration;
}

interface FieldInfo {
	name: string;
	type: string;
	required: boolean;
	validValues?: string[]
}

interface HandlerConfigurationFields {
	all: FieldInfo[]
	console: FieldInfo[]
	file: FieldInfo[]
}

const handlerConfigFields: HandlerConfigurationFields = {
	all: [
		{
			name: "type",
			type: "string",
			required: true,
			validValues: ["ConsoleHandler", "FileHandler"]
		},
		{
			name: "logLevel",
			type: "string",
			required: true,
			validValues: allLogLevels.map((logLevel) => logLevel.toString())
		},
		{
			name: "name",
			type: "string",
			required: false
		}
	],
	console: [
		{
			name: "useColors",
			type: "boolean",
			required: false
		}
	],
	file: [
		{
			name: "logFile",
			type: "string",
			required: true
		}
	]
};

function isValidHandlerConfig(config: any): boolean {

	if (!allFieldsAreValid(config))
		return false;

	if (config.type === "ConsoleHandler" && !consoleHandlerFieldsAreValid(config))
		return false;

	else if (config.type === "FileHandler" && !fileHandlerFieldsAreValid(config))
		return false;

	return true;
}

// TODO: If we make the validator an object it is easier to inject extra handlers and validations on those handlers
function allFieldsAreValid(config: any): boolean {
	return fieldsAreValid(config, handlerConfigFields.all);
}

function consoleHandlerFieldsAreValid(config: any): boolean {
	return fieldsAreValid(config, handlerConfigFields.console);
}

function fileHandlerFieldsAreValid(config: any): boolean {
	return fieldsAreValid(config, handlerConfigFields.file);
}

function fieldsAreValid(config: any, fields: FieldInfo[]) {
	for (const fieldInfo of fields) {
		if (!isValidField(config, fieldInfo)) return false;
	}

	return true;
}

function isValidField(config: any, fieldInfo: FieldInfo): boolean {
	/*interface FieldInfo {
		name: string;
		type: string;
		required: boolean;
		validValues?: string[]
	}*/

	if (!config[fieldInfo.name])
		return !fieldInfo.required;

	if (typeof config[fieldInfo.name] !== fieldInfo.type) return false;

	if (fieldInfo.validValues && !fieldInfo.validValues.includes(config[fieldInfo.name]))
		return false;

	return true;
}

function isValidLoggerConfig(config: any): boolean {
	if ("handlers" in config) {
		if (!Array.isArray(config.handlers)) return false;
		
		for (const obj of config.handlers) {
			if (typeof obj !== "string") return false;
		}
	}

	return true;
}
