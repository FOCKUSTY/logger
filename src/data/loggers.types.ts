import { Colors } from "f-formatter";

export type LoggerName<T extends string> = "Fail" | "Success" | T;

export type LoggerNameType = { name: string; colors: [Colors, Colors] };
export type LoggersNameType = { [key: LoggerName<string>]: LoggerNameType };
export type LevelType = "info" | "warn" | "err";
export enum Levels {
	"info" = 1,
	"warn" = 2,
	"err" = 3
}

export type ExtraneousKeys = "create_file";
export type ExtraneousSettings<Settings = null> = boolean | Settings;
export type ExtraneousConfig<Settings = null> = {
	[key: string]: ExtraneousSettings<Settings>;
	create_file: boolean;
};

export type Settings =
	| number
	| string
	| boolean
	| null
	| [Colors, Colors]
	| LoggersNameType;
export type SettingKeys =
	| "dir"
	| "level"
	| "deletion_interval"
	| "colors"
	| "date"
	| "loggers"
	| "logging";

export type Config = {
	[key: string]: Settings;

	logging: boolean;
	dir: string;
	date: boolean;
	level: "info" | "warn" | "err";
	deletion_interval: number;
	colors: [Colors, Colors];
	loggers: LoggersNameType;
};

export type RequiredType =
	| "function"
	| "array"
	| "object"
	| "number"
	| "string"
	| "undefined"
	| "boolean";

export class Types {
	private readonly _required: RequiredType;

	public constructor(required: RequiredType) {
		this._required = required;
	}

	public execute(arg: any): [boolean, string, string] {
		const argtype = typeof arg;

		if (this._required === "array") {
			return [Array.isArray(arg), argtype, this._required];
		} else {
			return [argtype === this._required, argtype, this._required];
		}
	}
}
