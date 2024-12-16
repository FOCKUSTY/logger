import Test from "./test.class";

import Logger, { Colors as c } from "../index";

const logger = new Logger("Tester");
new Logger("Commands", { colors: [c.brightYellow, c.magenta] });

describe("Logger", () => {
	(() => {
		const tests: [string, string|any[]][] = [
			[c.reset + "Привет, Мир !" + c.reset, logger.execute("Привет, Мир !")],
			[c.reset + "Hello, World !" + c.reset, logger.execute("Hello, World !")],
			[
				c.magenta + "Hello, World !" + c.reset,
				new Logger("Commands").execute("Hello, World !")
			],
			[
				c.magenta + "Saving..." + c.reset,
				new Logger("Saver", { colors: [c.magenta, c.magenta] }).execute(
					"Saving..."
				)
			]
		];

		new Test("nocolor", tests).execute();
	})();
	(() => {
		const tests: [string, string|any[]][] = [
			[
				c.magenta + "Маджента" + c.reset,
				logger.execute("Маджента", { color: c.magenta })
			],
			[
				c.bgGreen + "ГринСкрин" + c.reset,
				logger.execute("ГринСкрин", { color: c.bgGreen })
			],
			[
				c.black + "Тоталблэк" + c.reset,
				logger.execute("Тоталблэк", { color: c.black })
			],
			[
				c.magenta + "Loading..." + c.reset,
				new Logger("Saver").execute("Loading...")
			]
		];

		new Test("colors", tests).execute();
	})();
	(() => {
		/* Writing file */
		// Working:
		// const fileLog = new FileLog("./", undefined, undefined, false);
		// fileLog.writeFile("Hello!");
		// Working:
		// const log = new Logger("Tester1", { dir: "./", write: true, level: "info" });
		// log.execute("Hello1");
		// log.execute("Hello2");
		// log.execute("Hello3");
	})();
});
