import Test from "./test.class";

import Logger, { Colors as c } from "../index";

const logger = new Logger("Tester");
new Logger("Commands", { colors: [c.brightYellow, c.magenta] });

describe("Logger", () => {
	(() => {
		const tests: [string, string][] = [
			[c.reset + "Привет, Мир !" + c.reset, logger.execute("Привет, Мир !")[0][0]],
			[c.reset + "Hello, World !" + c.reset, logger.execute("Hello, World !")[0][0]],
			[
				c.magenta + "Hello, World !" + c.reset,
				new Logger("Commands").execute("Hello, World !")[0][0]
			],
			[
				c.magenta + "Saving..." + c.reset,
				new Logger("Saver", { colors: [c.magenta, c.magenta] }).execute("Saving...")[0][0]
			]
		];

		new Test("nocolor", tests).execute();
	})();
	(() => {
		const tests: [string, string][] = [
			[c.magenta + "Маджента" + c.reset, logger.execute("Маджента", { color: c.magenta })[0][0]],
			[c.bgGreen + "ГринСкрин" + c.reset, logger.execute("ГринСкрин", { color: c.bgGreen })[0][0]],
			[c.black + "Тоталблэк" + c.reset, logger.execute("Тоталблэк", { color: c.black })[0][0]],
			[c.magenta + "Loading..." + c.reset, new Logger("Saver").execute("Loading...")[0][0]]
		];

		new Test("colors", tests).execute();
	})();
});
