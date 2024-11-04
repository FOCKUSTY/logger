import { Colors } from "f-formatter/colors";

export type LoggerName<T extends string> = "Fail" | "Success" | T;

export type LoggerNameType = { name: string; colors: [Colors, Colors] };
export type LoggersNameType = { [key: LoggerName<string>]: LoggerNameType };
export type LevelType = "info" | "warn" | "err";
export enum Levels {
	"info" = 1,
	"warn" = 2,
	"err" = 3
}

export type Settings = string | null | [Colors, Colors] | LoggersNameType;

export type Config = {
	[key: string]: Settings;

	dir: string;
	level: "info" | "warn" | "err";
	colors: [Colors, Colors];
	loggers: LoggersNameType
};
