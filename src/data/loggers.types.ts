import { Colors } from "../utils/colors";

export type LoggerName<T extends string> = "Fail" | "Success" | T;

export type LoggerNameType = { name: string; colors: [Colors, Colors] };
export type LoggersNameType = { [key: LoggerName<string>]: LoggerNameType };
export type LevelKeys<T extends string = "info"> =
  | "info"
  | "warn"
  | "error"
  | T;
export type LevelType = {
  [key: string]: number;

  info: 1;
  warn: 2;
  error: 3;
};

export enum Levels {
  info = 1,
  warn = 2,
  error = 3,
}

export type ExtraneousKeys = "create_file";
export type ExtraneousSettings<Settings = null> = boolean | Settings;
export type ExtraneousConfig<Settings = null> = {
  [key: string]: ExtraneousSettings<Settings>;
  create_file: boolean;
  overwrite_file: boolean;
};

export type Settings =
  | number
  | string
  | boolean
  | null
  | { [key: string]: number }
  | [Colors, Colors]
  | LoggersNameType;
export type SettingKeys =
  | "dir"
  | "deletion_interval"
  | "colors"
  | "date"
  | "level"
  | "defaultLevel"
  | "levels"
  | "loggers"
  | "logging";

export type Config<T extends string = string> = {
  [key: string]: Settings;

  logging: boolean;
  dir: string;
  date: boolean;

  level: LevelKeys<T>;
  defaultLevel: LevelKeys<T>;
  levels: { [key: string]: number };
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
  | "boolean"
  | "bigint"
  | "symbol";

export class Types {
  private readonly _required: RequiredType;

  public constructor(required: RequiredType) {
    this._required = required;
  }

  public execute(arg: any): [boolean, RequiredType, RequiredType] {
    const argtype = typeof arg;

    if (Array.isArray(arg) && this._required !== "array") {
      return [false, "array", this._required];
    }

    if (this._required === "array") {
      return [Array.isArray(arg), argtype, this._required];
    } else {
      return [argtype === this._required, argtype, this._required];
    }
  }
}
