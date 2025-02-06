import { Colors } from "f-formatter";

import type { Config, ExtraneousConfig, SettingKeys } from "./loggers.types";
import { Types } from "./loggers.types";

export const types: Required<Record<SettingKeys, Types>> = {
	logging: new Types("boolean"),
	dir: new Types("string"),
	level: new Types("string"),
	date: new Types("boolean"),
	deletion_interval: new Types("number"),
	colors: new Types("array"),
	loggers: new Types("object")
};

export const numbers: Partial<Record<SettingKeys, [number, number]>> = {
	deletion_interval: [0, 31]
};

export const allowed: Partial<Record<SettingKeys, string[]>> = {
	level: ["info", "warn", "err"]
};

export const tutorials: Partial<Record<SettingKeys, string>> = {
	dir: "this value is a your root dir",
	level: "this values is level of logging",
	deletion_interval:
		"this value can be a rational number (0, 1, 2...) and this value is the number of days after which the file should be deleted",
	colors: "this value is a tuple of two colors, first - logger color, second - text color",
	loggers: "this a your loggers, you can don't have to touch it"
};

export const defaultColors: [Colors, Colors] = [Colors.reset, Colors.reset];

export const extraSettings: ExtraneousConfig = {
	create_file: false
};

export const settings: Config = {
	logging: false,
	dir: "./",
	level: "info",
	deletion_interval: 7,
	date: true,
	colors: defaultColors,
	loggers: {
		"Fail": {
			name: "Fail",
			colors: defaultColors
		},
		"Success": {
			name: "Success",
			colors: defaultColors
		}
	}
};
