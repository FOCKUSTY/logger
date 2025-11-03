import { Colors } from "../utils/colors";

import type { Config, ExtraneousConfig, SettingKeys } from "./loggers.types";
import { Types } from "./loggers.types";

export const TYPES: Required<Record<SettingKeys, Types>> = {
  logging: new Types("boolean"),
  dir: new Types("string"),
  level: new Types("string"),
  defaultLevel: new Types("string"),
  levels: new Types("object"),
  date: new Types("boolean"),
  deletion_interval: new Types("number"),
  colors: new Types("array"),
  loggers: new Types("object"),
};

export const NUMBERS: Partial<Record<SettingKeys, [number, number]>> = {
  deletion_interval: [0, 31],
};

export const ALLOWED: Partial<Record<SettingKeys, string[]>> &
  Pick<Required<Record<SettingKeys, string[]>>, "level"> = {
  level: ["info", "warn", "error"],
};

export const TUTORIALS: Partial<Record<SettingKeys, string>> = {
  dir: "this value is a your root dir",
  level: "this value is level of logging",
  levels: "this value shows the possible logging options",
  deletion_interval:
    "this value can be a rational number (0, 1, 2...) and this value is the number of days after which the file should be deleted",
  colors:
    "this value is a tuple of two colors, first - logger name color, second - text color",
  loggers: "this a your loggers, you can don't have to touch it",
};

export const DEFAULT_COLORS: [Colors, Colors] = [Colors.white, Colors.white];

export const EXTRA_SETTINGS: ExtraneousConfig = {
  create_file: false,
  overwrite_file: false,
};

export const SETTINGS: Config = {
  logging: true,
  dir: "./",
  level: "info",
  defaultLevel: "info",
  levels: {
    info: 1,
    warn: 2,
    error: 3,
  },
  deletion_interval: 7,
  date: true,
  colors: DEFAULT_COLORS,
  loggers: {
    Fail: {
      name: "Fail",
      colors: DEFAULT_COLORS,
    },
    Success: {
      name: "Success",
      colors: DEFAULT_COLORS,
    },
  },
};

export const DAY = 60 * 60 * 24;
export const FORMAT: any = "*&0000.00.00" as const;
export const FILTER = new RegExp(
  FORMAT.replace("*", "[a-zA-Z]?")
    .replace("&", "[!@#$%^&*()-+]?")
    .replaceAll("0", "[0-9]"),
  "gi",
);
export const LOG_DIR_NAME = "log" as const;
export const LOG_FILE_EXTENSION = ".log" as const;
export const LOGGER_CONFIG_FILE_NAME = ".loggercfg" as const;
export const LOGGER_LOGGERS_FILE_NAME = "loggers.json" as const;
export const ROOT_DIR = "./" as const;
