import { Colors } from "f-formatter";

import type { SettingKeys, Settings } from "../data/loggers.types";

import {
  ALLOWED,
  LOGGER_CONFIG_FILE_NAME,
  NUMBERS,
  SETTINGS,
  TUTORIALS,
  TYPES,
} from "../data/data";

class Validator {
  private readonly _file: string;
  private readonly _key: SettingKeys;
  private readonly _value: Settings;
  private readonly _default: Settings;

  public constructor(key: SettingKeys, value: Settings, file: string) {
    this._file = file;

    this._key = key;
    this._value = value;
    this._default = SETTINGS[key] || null;
  }

  private readonly PrintErrorFixing = async () => {
    const { key, value: v } = { key: this._key, value: this._value };
    const value = JSON.stringify(v, undefined, 0);

    console.log("To fixing error:");
    console.log("Open " + LOGGER_CONFIG_FILE_NAME);

    if (ALLOWED[key])
      console.log(
        `Find key: "${key}" and replace your value (${value}) to ${ALLOWED[key][0]} (Or another, see above)`,
      );
    else
      console.log(
        `Find key: "${key}" and replace your value (${value}) (Or see above)`,
      );

    const start = this._file.indexOf(`"${key}"`);
    const end = this._file.indexOf(`${value}`) + `${value}`.length;
    const err = this._file.slice(start, end);

    console.log(
      Colors.bgMagenta +
        "The line with the error is highlighted in magenta" +
        Colors.reset,
    );

    console.log("See your file:");
    console.log(
      this._file.replace(err, Colors.bgBrightMagenta + err + Colors.reset),
    );

    console.log(
      Colors.bgMagenta +
        "The line with the error is highlighted in magenta" +
        Colors.reset,
    );
  };

  private readonly ErrorNotArray = () => {
    const { key, value } = { key: this._key, value: this._value };

    this.PrintErrorFixing().then(() => {
      throw new Error(
        `your value ${JSON.stringify(value)} at key ${key} is must be array`,
      );
    });

    return this._default;
  };

  private readonly ErrorNotObject = () => {
    const { key, value } = { key: this._key, value: this._value };

    this.PrintErrorFixing().then(() => {
      throw new Error(
        `your value ${JSON.stringify(value)} at key ${key} is must be object`,
      );
    });

    return this._default;
  };

  private readonly ColorsValidator = () => {
    const { value } = { value: this._value };

    if (!Array.isArray(value)) return this._default;

    const values = value.map((v) => v);

    if (value.length !== 2) {
      this.PrintErrorFixing().then(() => {
        throw new Error("colors must have two element");
      });
    }

    for (const i in values) {
      if (!Object.values(Colors).includes(values[i] as any)) {
        this.PrintErrorFixing().then(() => {
          throw new Error(`${values[i]} in enum Colors is not defined`);
        });

        return this._default;
      }
    }

    return value;
  };

  private readonly ArrayValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (!Array.isArray(value)) return this.ErrorNotArray();

    switch (key) {
      case "colors":
        return this.ColorsValidator();

      default:
        return this._default;
    }
  };

  private readonly LevelsValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (Array.isArray(value) || typeof value !== "object" || !value)
      return this.ErrorNotObject();

    const keys = Object.keys(value);

    if (
      keys.length < 3 ||
      !ALLOWED.level.every((level) => keys.includes(level))
    ) {
      this.PrintErrorFixing().then(() => {
        throw new Error(
          `your value at key ${key} must includes 3 options: ` +
            ALLOWED.level.join(", "),
        );
      });

      return this._default;
    }

    Object.keys(value).forEach((k) => {
      if (typeof k !== "string") {
        this.PrintErrorFixing().then(() => {
          throw new Error(
            `in your value at key ${key} all values must be a string`,
          );
        });

        return this._default;
      }

      if (typeof value[k] !== "number") {
        this.PrintErrorFixing().then(() => {
          throw new Error(
            `your value at key ${key} in object at key ${k} must be a number`,
          );
        });

        return this._default;
      }
    });

    return value;
  };

  private readonly LoggersValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (Array.isArray(value) || typeof value !== "object" || !value)
      return this.ErrorNotObject();

    const output = value;

    Object.keys(value).forEach((k) => {
      if (typeof value[k] === "number" || typeof output[k] === "number") {
        this.PrintErrorFixing().then(() => {
          throw new Error(
            `your value at key ${key} in object at key ${k} must be a LoggersNameType`,
          );
        });

        return this._default;
      }

      const colors = value[k].colors;

      if (colors.length !== 2)
        throw new Error(`A logger "${k}" must have two colors`);

      for (const i in colors) {
        if (!Object.values(Colors).includes(colors[i])) {
          throw new Error(`${colors[i]} in enum Colors is not defined`);
        } else {
          output[k].colors = colors;
        }
      }
    });

    return output;
  };

  private readonly ObjectValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (Array.isArray(value) || typeof value !== "object" || !value)
      return this.ErrorNotObject();

    switch (key) {
      case "loggers":
        return this.LoggersValidator();

      case "levels":
        return this.LevelsValidator();

      default:
        return this._default;
    }
  };

  private readonly NumberValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (!value) return this._default;

    if (Array.isArray(value)) return this.ArrayValidator();
    if (typeof value === "object") return this.ObjectValidator();

    if (!NUMBERS[key])
      throw new Error(
        `"${key}" in number SETTINGS is not defind (Library error)`,
      );

    if (Number.isNaN(Number(value)))
      throw new Error(`Value at "${key}" is not a number`);

    if (Number(value) < NUMBERS[key][0])
      throw new Error(
        `Value at "${key}" must be more than ${NUMBERS[key][0]} (Your: ${value})`,
      );

    if (Number(value) > NUMBERS[key][1])
      throw new Error(
        `Value at "${key}" must be less than ${NUMBERS[key][1]} (Your: ${value})`,
      );

    return value;
  };

  private readonly AllowedValidator = () => {
    const { key, value } = { key: this._key, value: this._value };

    if (!value) return this._default;
    if (!ALLOWED[key])
      throw new Error(
        `${key} in ALLOWED SETTINGS is not defined (Library error)`,
      );

    if (Array.isArray(value)) return this.ArrayValidator();
    if (typeof value === "object") return this.ObjectValidator();
    if (typeof value === "number") return this.NumberValidator();

    if (!ALLOWED[key].includes(value.toString())) {
      console.log(
        Colors.red +
          `Value at key: "${key}" is not ALLOWED, you can use:\r\n` +
          Colors.cyan +
          ALLOWED[key].join(Colors.reset + " or" + Colors.cyan + "\r\n") +
          Colors.reset,
      );

      this.PrintErrorFixing();

      throw new Error(`Value at key: "${key}" is not ALLOWED`);
    }

    return value;
  };

  public readonly init = (): Settings => {
    const { key, value } = { key: this._key, value: this._value };

    if (!value && value !== false) {
      console.log(
        Colors.brightYellow +
          `Value at key: "${key}" is not defined\r\nThis value can be:\r\n` +
          JSON.stringify(SETTINGS[key], undefined, 2),
      );
      if (Object.keys(ALLOWED).includes(key))
        console.log(
          "Or other ALLOWED values:\r\n" +
            JSON.stringify(ALLOWED[key], undefined, 2),
        );

      if (TUTORIALS[key]) console.log("\r" + TUTORIALS[key]);
      console.log(
        Colors.reset + "(Do not worry, we paste a default value)🤍\r\n",
      );

      return this._default;
    }

    const valueType = TYPES[key].execute(value);

    if (!valueType[0])
      throw new Error(
        `Type error at key "${key}", value is a ${valueType[1]}, but must be ${valueType[2]}\r\nValue: ${JSON.stringify(value)}`,
      );

    if (Object.keys(ALLOWED).includes(key)) return this.AllowedValidator();

    if (Array.isArray(value)) return this.ArrayValidator();
    if (typeof value === "object") return this.ObjectValidator();
    if (typeof value === "number") return this.NumberValidator();

    return value;
  };
}

export default Validator;
