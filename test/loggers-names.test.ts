import type { LoggersNameType } from "loggers.types";
import { Colors } from "f-formatter/colors";
import LoggersNames from "loggers.names";

const loggersNames = new LoggersNames(true);

describe("Loggers names", () => {
	(() => {
		const tests: LoggersNameType = {
			test: { name: "Test", colors: [Colors.red, Colors.bgGreen] }
		};

		loggersNames.SetNames(tests);
	})();
});
