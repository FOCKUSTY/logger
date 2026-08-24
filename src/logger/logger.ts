import type {
  InputParameter,
  LoggerBaseConfigurationParameter,
  LoggerReadConfigurationParameter,
  LoggerServiceType,
} from "../types";

import { BaseLogger } from "./base-logger";

/**
 * Основной класс логгера.
 * Реализует методы execute и read, используя форматтеры и файловый сервис.
 *
 * @example
 * const logger = new Logger({
 *   fileService: new FileService({ filePath: './log.txt' }),
 *   baseLevels: { levels: { info: 0, error: 1 }, level: 'info' },
 * });
 * await logger.execute('Hello world', { context: { level: 'info' } });
 * @category Классы
 * @group Логгер
 */
export class Logger<
  const Levels extends Record<string, number> = Record<string, number>,
  BaseInput = never,
>
  extends BaseLogger<Levels, BaseInput>
  implements LoggerServiceType<Levels, BaseInput>
{
  /**
   * Записывает лог-сообщение.
   * Выполняет форматирование, проверку уровня, запись в файл (если включено) и вывод в stdout.
   *
   * @param {InputParameter<BaseInput>} input данные для логирования.
   * @param {LoggerBaseConfigurationParameter<Levels>} configuration контекст (уровень, флаги).
   * @returns {Promise<string>} Отформатированная строка.
   */
  public async execute(
    input: InputParameter<BaseInput>,
    { context }: LoggerBaseConfigurationParameter<Levels>,
  ): Promise<string> {
    const { separator, writeFile, log, level } = this.applyContext(context);

    const data = Array.isArray(input) ? input : [input];
    const text = this.format(data) + separator;

    if (this.shouldLog(log, level)) this._standard.output.write(text);
    if (writeFile) await this._file_service?.write(text);

    return text;
  }

  /**
   * Выводит приглашение (через execute), затем ожидает ввод пользователя.
   * Использует стандартный поток ввода (stdin) с обработкой событий.
   *
   * @param {InputParameter<BaseInput>} input данные для вывода перед запросом.
   * @param {LoggerReadConfigurationParameter<Levels>} configuration контекст и слушатели.
   * @returns {Promise<string>} Введённая пользователем строка (без символа перевода строки).
   * @throws {Error} Если поток завершился без данных или произошла ошибка.
   */
  public async read(
    input: InputParameter<BaseInput>,
    {
      context,
      listeners: listenersConfiguration,
    }: LoggerReadConfigurationParameter<Levels>,
  ): Promise<string> {
    this.validateRead();

    return new Promise<string>(async (resolve, reject) => {
      const stdin = this._standard.input;
      stdin.resume();
      stdin.setEncoding("utf-8");

      const listeners = listenersConfiguration?.(stdin);
      listeners?.onStart?.();

      await this.execute(input, { context });

      const { onReadable, onError, onEnd, onData } = this.applyReadListeners(
        listeners,
        { resolve, reject },
      );

      stdin.on("readable", onReadable);
      stdin.on("error", onError);
      stdin.on("data", onData);
      stdin.on("end", onEnd);
    });
  }
}
