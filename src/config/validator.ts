import { Colors } from "f-formatter";

import type { SettingKeys, Settings } from "../data/loggers.types";

import { allowed, numbers, settings, tutorials, types } from "../data/data";

class Validator {
	private readonly _file: string;
	private readonly _key: SettingKeys;
	private readonly _value: Settings;
	private readonly _default: Settings;

	public constructor(key: SettingKeys, value: Settings, file: string) {
		this._file = file;

		this._key = key;
		this._value = value;
		this._default = settings[key] || null;
	}

	private readonly PrintErrorFixing = async () => {
		const { key, value: v } = { key: this._key, value: this._value };
		const value = JSON.stringify(v, undefined, 0);

		console.log("To fixing error:");
		console.log("Open .loggercfg");

		if (allowed[key])
			console.log(
				`Find key: "${key}" and replace your value (${value}) to ${allowed[key][0]} (Or another, see above)`
			);
		else
			console.log(
				`Find key: "${key}" and replace your value (${value}) (Or see above)`
			);

		const start = this._file.indexOf(`"${key}"`);
		const end = this._file.indexOf(`${value}`) + `${value}`.length;
		const err = this._file.slice(start, end);

		console.log(
			Colors.bgMagenta +
				"The line with the error is highlighted in magenta" +
				Colors.reset
		);

		console.log("See your file:");
		console.log(this._file.replace(err, Colors.bgBrightMagenta + err + Colors.reset));

		console.log(
			Colors.bgMagenta +
				"The line with the error is highlighted in magenta" +
				Colors.reset
		);
	};

	private readonly ArrayValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!Array.isArray(value)) return this._default;

		switch (key) {
			case "colors":
				const values = value.map((v) => v);

				if (value.length !== 2) {
					this.PrintErrorFixing().then(() => {
						throw new Error("colors must have two element");
					});
				}

				for (const i in values) {
					if (!Object.values(Colors).includes(values[i])) {
						this.PrintErrorFixing().then(() => {
							throw new Error(`${values[i]} in enum Colors is not defined`);
						});
					}
				}

				return value;

			default:
				return this._default;
		}
	};

	private readonly ObjectValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (Array.isArray(value) || typeof value !== "object" || !value)
			return this._default;

		switch (key) {
			case "loggers":
				const output = value;

				Object.keys(value).forEach((k) => {
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

			default:
				return this._default;
		}
	};

	private readonly NumberValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!value) return this._default;

		if (Array.isArray(value)) return this.ArrayValidator();
		if (typeof value === "object") return this.ObjectValidator();

		if (!numbers[key])
			throw new Error(`"${key}" in number settings is not defind (Library error)`);

		if (Number.isNaN(Number(value)))
			throw new Error(`Value at "${key}" is not a number`);

		if (Number(value) < numbers[key][0])
			throw new Error(
				`Value at "${key}" must be more than ${numbers[key][0]} (Your: ${value})`
			);

		if (Number(value) > numbers[key][1])
			throw new Error(
				`Value at "${key}" must be less than ${numbers[key][1]} (Your: ${value})`
			);

		return value;
	};

	private readonly AllowedValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!value) return this._default;
		if (!allowed[key])
			throw new Error(`${key} in allowed settings is not defined (Library error)`);

		if (Array.isArray(value)) return this.ArrayValidator();
		if (typeof value === "object") return this.ObjectValidator();
		if (typeof value === "number") return this.NumberValidator();

		if (!allowed[key].includes(value.toString())) {
			console.log(
				Colors.red +
					`Value at key: "${key}" is not allowed, you can use:\r\n` +
					Colors.cyan +
					allowed[key].join(Colors.reset + " or" + Colors.cyan + "\r\n") +
					Colors.reset
			);

			this.PrintErrorFixing();

			throw new Error(`Value at key: "${key}" is not allowed`);
		}

		return value;
	};

	public readonly init = (): Settings => {
		const { key, value } = { key: this._key, value: this._value };

		if (!value && value !== false) {
			console.log(
				Colors.brightYellow +
					`Value at key: "${key}" is not defined\r\nThis value can be:\r\n` +
					JSON.stringify(settings[key], undefined, 2)
			);
			if (Object.keys(allowed).includes(key))
				console.log(
					"Or other allowed values:\r\n" +
						JSON.stringify(allowed[key], undefined, 2)
				);

			if (tutorials[key]) console.log("\r" + tutorials[key]);
			console.log(Colors.reset + "(Do not worry, we paste a default value)🤍\r\n");

			return this._default;
		}

		const valueType = types[key].execute(value);

		if (!valueType[0])
			throw new Error(
				`Type error at key "${key}", value is a ${valueType[1]}, but must be ${valueType[2]}\r\nValue: ${JSON.stringify(value)}`
			);

		if (Object.keys(allowed).includes(key)) return this.AllowedValidator();

		if (Array.isArray(value)) return this.ArrayValidator();
		if (typeof value === "object") return this.ObjectValidator();
		if (typeof value === "number") return this.NumberValidator();

		return value;
	};
}

export default Validator;
