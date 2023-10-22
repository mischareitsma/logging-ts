import * as fs from "node:fs";

export enum LogSeverity {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	ERROR = 4,
	FATAL = 5,
}

export enum LogHandler {
	CONSOLE,
	FILE
}

function severityAsString(severity: LogSeverity): string {
	switch (severity) {
		case LogSeverity.TRACE:
			return "TRACE";
		case LogSeverity.DEBUG:
			return "DEBUG";
		case LogSeverity.INFO:
			return "INFO";
		case LogSeverity.WARN:
			return "WARN";
		case LogSeverity.ERROR:
			return "ERROR";
		case LogSeverity.FATAL:
			return "FATAL";
	}
}

function severityFromString(severity: string): LogSeverity {
	switch (severity) {
		case "TRACE":
			return LogSeverity.TRACE;
		case "DEBUG":
			return LogSeverity.DEBUG;
		case "INFO":
			return LogSeverity.INFO;
		case "WARN":
			return LogSeverity.WARN;
		case "ERROR":
			return LogSeverity.ERROR;
		case "FATAL":
			return LogSeverity.FATAL;
		default:
			return LogSeverity.INFO;
	}
}

interface LogSettings {
	severity: LogSeverity;
	handler: LogHandler;
	filePath?: string
}

// TODO: Need to be changed with config later.
const settings: LogSettings = {
	severity: LogSeverity.TRACE,
	handler: LogHandler.CONSOLE,
};

export function setLogSeverity(severity: string) {
	settings.severity = severityFromString(severity);
}

export function getLogSeverity(): LogSeverity {
	return settings.severity;
}

if (process.env.LIBPUCKJS_LOG_LEVEL) {
	setLogSeverity(process.env.LIBPUCKJS_LOG_LEVEL);
}

if (process.env.LIBPUCKJS_LOG_FILE) {
	settings.handler = LogHandler.FILE;
	settings.filePath = process.env.LIBPUCKJS_LOG_FILE;
}

function getFormattedMessage(severity: LogSeverity, message: string) {
	// return `[${new Date().toISOString()}][${severityAsString(severity)}] ${message}`
	return `${new Date().toISOString()} - ${severityAsString(severity)} - ${process.pid} - ` +
		message;
}

function _log_to_console(severity: LogSeverity, message: string) {
	const logMessage: string = getFormattedMessage(severity, message);
	if (severity < LogSeverity.ERROR) {
		console.log(logMessage);
	}
	else {
		console.error(logMessage);
	}
}

function _log_to_file(severity: LogSeverity, message: string) {
	fs.appendFile(settings.filePath, getFormattedMessage(severity, message) + "\n", () => {});
}

export function log(severity: LogSeverity, message: string) {
	if (severity < settings.severity) return;

	switch (settings.handler) {
		case LogHandler.CONSOLE:
			_log_to_console(severity, message);
			break;
		case LogHandler.FILE:
			_log_to_file(severity, message);
	}
}

export function trace(message: string) {
	log(LogSeverity.TRACE, message);
}

export function debug(message: string) {
	log(LogSeverity.DEBUG, message);
}

export function info(message: string) {
	log(LogSeverity.INFO, message);
}

export function warn(message: string) {
	log(LogSeverity.WARN, message);
}

export function error(message: string) {
	log(LogSeverity.ERROR, message);
}

export function fatal(message: string) {
	log(LogSeverity.FATAL, message);
}
