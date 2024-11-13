import Formatter, { Colors } from "f-formatter";

import type {
	Config,
	SettingKeys,
	Settings
} from "loggers.types";

import path from "path";
import fs from "fs";

const defaultColors: [Colors, Colors] = [Colors.reset, Colors.reset];

const allowed: Partial<Record<SettingKeys, string[]>> = {
	level: ["info", "warn", "err"]
};

const tutorials: Partial<Record<SettingKeys, string>> = {
	dir: "this value is a your root dir",
	level: "",
	deletion_interval: "this value can be a rational number (0, 1, 2...) and this value is the number of days after which the file should be deleted",
	colors: "this value is a tuple of two colors, first - logger color, second - text color",
	loggers: "this a your loggers, you can don't have to touch it"
};

const settings: Config = {
	dir: "./",
	level: "info",
	deletion_interval: 7,
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

	private readonly AllowedValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!value) return this._default;
		if (!allowed[key])
			throw new Error(`${key} in allowed settings is not defined (Library error)`);

		if (Array.isArray(value)) return this.ArrayValidator();
		if (typeof value === "object") return this.ObjectValidator();

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

		if (!value) {
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

				if(tutorials[key])
					console.log("\r" + tutorials[key]);
				console.log(Colors.reset + "(Do not worry, we paste a default value)🤍\r\n");

			return this._default;
		}

		if (Object.keys(allowed).includes(key)) return this.AllowedValidator();

		if (Array.isArray(value)) return this.ArrayValidator();
		if (typeof value === "object") return this.ObjectValidator();

		return value;
	};
}

class Configurator {
	private readonly _dir: string = path.join("./");
	private readonly _config: Config = settings;
	private readonly _path: string;
	private readonly _create_file;

	public constructor(createFile: boolean = false) {
		this._path = path.join(this._dir, ".loggercfg");
		this._create_file = createFile;

		this.init();
	}

	private Create() {
		try {
			const file = JSON.stringify(settings, undefined, 4);
			fs.writeFileSync(this._path, file, "utf-8");

			return settings;
		} catch (err: any) {
			throw new Error(err);
		}
	}

	private Validator(key: SettingKeys, value: Settings): Settings {
		return new Validator(
			key,
			value,
			JSON.stringify(JSON.parse(fs.readFileSync(this._path, "utf-8")), undefined, 0)
		).init();
	}

	private Validate(config: Config) {
		for (const key in settings) {
			const value = this.Validator(key as SettingKeys, config[key]);

			this._config[key] = value;
		}
	}

	private Read() {
		if (!fs.existsSync(this._path) && this._create_file) this.Create();

		if (
			fs.existsSync(this._path) &&
			Object.keys(JSON.parse(fs.readFileSync(this._path, "utf-8") || "{}"))
				.length === 0
		) {
			console.log(
				Colors.brightYellow +
					"Your config is empty, returning to default" +
					Colors.reset
			);

			fs.unlinkSync(this._path);
			this.Create();
		}

		try {
			const config: Config = new Formatter().FromJSONWithPath(this._path);

			this.Validate(config);
		} catch (err: any) {
			if (!fs.existsSync(this._path)) return;

			throw new Error(err);
		}
	}

	private readonly init = () => {
		this.Read();
	};

	get config(): Config {
		return this._config;
	}
}

(() => {
	new Configurator();
})();

export default Configurator;
