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

export type Settings = number | string | null | [Colors, Colors] | LoggersNameType;
export type SettingKeys = "dir" | "level" | "deletion_interval" | "colors" | "loggers";

export type Config = {
	[key: string]: Settings;

	dir: string;
	level: "info" | "warn" | "err";
	deletion_interval: number,
	colors: [Colors, Colors];
	loggers: LoggersNameType;
};
