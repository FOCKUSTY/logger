import type { LoggersNameType } from "./loggers.types";
import { Colors } from "f-formatter/colors";
import Formatter from "f-formatter";

import path from "path";
import fs from "fs";

const formatter = new Formatter();

class LoggersNames {
	private readonly _standart = {
		Success: { name: "Success", colors: [Colors.red, Colors.green] },
		Fail: { name: "Fail", colors: [Colors.red, Colors.red] }
	};

	constructor() {
		try {
			fs.readFileSync(path.join("./loggers.json"));
		} catch {
			fs.writeFileSync(
				path.join("./loggers.json"),
				JSON.stringify(this._standart, undefined, 4),
				"utf-8"
			);
		}
	}

	public readonly SetNames = (names: LoggersNameType) => {
		const existingNames = this.GetNames();
		const output: LoggersNameType = {};

		for (const key in names) {
			output[key] = names[key];
		}

		for (const key in existingNames) {
			const existingValue = existingNames[key];
			const value = names[key];

			if (
				value &&
				value.colors.toString() != [Colors.reset, Colors.reset].toString()
			) {
				output[key] = value;
			} else {
				output[key] = existingValue;
			}
		}

		fs.writeFileSync("./loggers.json", JSON.stringify(output, undefined, 4), "utf-8");

		return names;
	};

	public readonly GetNames = () => {
		const file = formatter.FromJSONWithPath("./loggers.json");

		return file;
	};

	get standart() {
		return this._standart;
	}
}

export default LoggersNames;
