import type { BaseLoggerContext, Std, UserInputSettings } from "../types";
import {
  DefaultFormatter,
  ErrorFormatter,
  FormatterHandler,
  NullableFormatter,
} from "../formatter";

import { stdin, stdout } from "process";

/**
 * Стандартные потоки ввода/вывода для логгера.
 * Используются глобальные потоки Node.js: stdout и stdin.
 *
 * @type {Std}
 * @example
 * // Подстановка пользовательских потоков (например, для тестов)
 * const customStd: Std = { output: mockStdout, input: mockStdin };
 * @category Константы
 * @group Фундамент
 */
export const DEFAULT_STD: Std = {
  output: stdout,
  input: stdin,
};

/**
 * Базовый контекст логирования, используемый по умолчанию.
 * Все поля обязательны, так как они определяют поведение при отсутствии переопределения.
 *
 * @property {string} separator – разделитель между частями сообщения (по умолчанию перевод строки).
 * @property {boolean} writeFile – по умолчанию не записывать в файл (false).
 * @property {boolean} log – по умолчанию выводить в консоль (true).
 *
 * @example
 * // Переопределение в вызове execute
 * logger.execute('Hello', { context: { ...BASE_CONTEXT, log: false } });
 * @category Константы
 * @group Логгер
 */
export const BASE_CONTEXT: Required<BaseLoggerContext> = {
  separator: "\n",
  writeFile: false,
  log: true,
};

/**
 * Регулярное выражение для удаления символов перевода строки (\r, \n) из пользовательского ввода.
 * Используется в методе read для очистки строки перед сохранением.
 * @category Константы
 * @group Утилиты
 */
export const USER_INPUT_REGEX = /\r?\n$/;

/**
 * Настройки форматирования пользовательского ввода по умолчанию.
 * При записи в файл в методе read добавляется префикс "User:" и пробел.
 * @category Константы
 * @group Утилиты
 */
export const USER_INPUT_SETTINGS: UserInputSettings = {
  prefix: "User:",
  separator: " ",
};

/**
 * Стандартный обработчик форматтеров, используемый в логгере по умолчанию.
 * Последовательно применяет три форматтера:
 *
 * 1. **ErrorFormatter** – преобразует ошибки в детализированные строки с именем, сообщением, причиной и стеком.
 * 2. **NullableFormatter** – преобразует null и undefined в строки "null" и "undefined".
 * 3. **DefaultFormatter** – вызывает метод toString() у всех остальных объектов.
 *
 * Все данные, не обработанные ни одним из этих форматтеров, будут преобразованы через toString()
 * (внутри FormatterHandler есть fallback-обработка).
 *
 * @type {FormatterHandler}
 * @example
 * // Использование в пользовательском логгере
 * const logger = new Logger({
 *   fileService,
 *   baseLevels,
 *   formatterHandler: DEFAULT_FORMATTER_HANDLER,
 * });
 * @category Константы
 * @group Форматтер
 */
export const DEFAULT_FORMATTER_HANDLER: FormatterHandler = new FormatterHandler(
  [new ErrorFormatter(), new NullableFormatter(), new DefaultFormatter()],
);
