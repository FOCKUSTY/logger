import type { LoggersNameType } from "src/data/loggers.types";
import { Colors } from "f-formatter/colors";
import LoggersNames from "../src/data/loggers.names";

const loggersNames = new LoggersNames(false);

describe("Loggers names", () => {
	(() => {
		const tests: LoggersNameType = {
			test: { name: "Test", colors: [Colors.red, Colors.bgGreen] }
		};

		loggersNames.SetNames(tests);
	})();
});
